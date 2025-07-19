import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { serverErrorMessage } from '../utils/constants';
import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import validateSchema from '../utils/validateSchema';
import { sendEventChangeEmail, sendInviteEmail } from '../utils/mailer';


const prisma = new PrismaClient();


// POST /api/events
export const createEvent = async (req: AuthRequest, res: Response) => {
    // Validate request body
    const [requestIsValid, validationErrors] = validateSchema(req.body, 'createEvent');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request body.", validationErrors });
        return;
    }

    const { title, description, startDate, endDate, location } = req.body;
    const userId = req.userId;

    try {
        const newEvent = await prisma.event.create({
            data: {
                title: title as string,
                description: description as string,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined, // endDate is optional
                location: location as string,
                
                creatorId: userId as string,

                slug: v4()
            }
        });

        // console.log("userId", userId);
        // console.log("Event data", {
        //     title, description, startDate, location
        // });

        res.status(201).json({ message: "Event created successfully", newEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// GET /api/events
export const getEvents = async (req: AuthRequest, res: Response) => {
    // Validate request body
    const [requestIsValid, validationErrors] = validateSchema(req.query, 'getEvents');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request parameters." });
        return;
    }

    const userId = req.userId;
    const { limit = -1, offset = -1 } = req.query;

    try {
        const events = await prisma.event.findMany({
            take: limit === -1 ? undefined : Number(limit),
            skip: offset === -1 ? undefined : Number(offset),
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                creatorId: userId
            },
            include: {
                rsvps: true,
                creator: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
        res.status(200).json({ length: events.length, events });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// GET /api/events/:id
export const getEventById = async (req: Request, res: Response) => {
    // Validate request body
    // console.log("params:", req.params)
    const [requestIsValid, validationErrors] = validateSchema(req.params, 'getDetailedEvent');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request parameters." });
        return;
    }

    const { eventId } = req.params;
    const { rsvpToken } = req.query;

    // Get the userId from the request
    const token = req.headers['authorization']?.split(' ')[1];
    const userId = token? (jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string }).userID : undefined;

    // console.log("eventId", eventId);
    
    // TODO -- privacy check?  Maybe users should be issued a special one-time token to view the event.
    //   or if the user who clicks the token in the email has an account, add the token to the account
    //   and allow the user to view the event.

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            },
            include: {
                rsvps: true,
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        // If the user is the creator of the event, we can include
        // detailed information about the event including RSVPs.
        if (userId && userId === event.creatorId) {
            res.status(200).json(event);
            return;
        }

        // If the user is not the creator of the event, but includes an RSVP token,
        // we can include the event information without the RSVPs.
        if (rsvpToken && rsvpToken === event.rsvpToken) {
            res.status(200).json({ ...event, rsvps: undefined });
            return;
        }

        res.status(403).json({ message: "You are not authorized to view this event." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// PUT /api/events/rsvp
export const rsvp = async (req: Request, res: Response) => {
    // Validate request body
    const [requestIsValid, validationErrors] = validateSchema(req.body, 'rsvp');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request body." });
        return;
    }

    const { eventId, rsvpToken, name, email, status } = req.body;

    const token = req.headers['authorization']?.split(' ')[1];
    let userId: string | undefined;
    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string };
        userId = decoded.userID;
    }

    try {
        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }

        if (!event.rsvpToken || event.rsvpToken !== rsvpToken) {
            res.status(400).json({ message: "Invalid RSVP token." });
            return;
        }

        if (status !== "ACCEPTED" && status !== "DECLINED" && status !== "MAYBE") {
            res.status(400).json({ message: "Invalid RSVP status. Must be ACCEPTED, DECLINED, or MAYBE." });
            return;
        }

        const loggedInUser = await prisma.user.findUnique({
            where: {
                id: userId || ""
            }
        });

        const existingRsvp = await prisma.rSVP.findFirst({
            where: {
                eventId: eventId,
                userId: userId, // If the user is logged in, we can associate the RSVP with their userId
                email: loggedInUser? loggedInUser.email : email // If the user is not logged in, we can associate the RSVP with their email
            }
        });


        // console.log("existingRsvp", existingRsvp);
        // console.log("loggedInUser", loggedInUser);

        if (existingRsvp) {
            // If the user is logged in, we can modify the existing RSVP.
            const updatedRsvp = await prisma.rSVP.update({
                where: {
                    id: existingRsvp.id
                },
                data: {
                    // Should we update the name and email if the user is logged in?  For now, we will.
                    name: loggedInUser? loggedInUser.firstName + " " + loggedInUser.lastName : name,
                    email: loggedInUser? loggedInUser.email : email,

                    status: status
                }
            });

            res.status(200).json({ message: "RSVP updated successfully.", rsvp: updatedRsvp });
        } else {
            const rsvp = await prisma.rSVP.create({
                data: {
                    eventId,

                    name: loggedInUser? loggedInUser.firstName + " " + loggedInUser.lastName : name, // If the user is logged in, we can use their name, otherwise use the provided name
                    email: loggedInUser? loggedInUser.email : email, // If the user is logged in, we can use their email, otherwise use the provided email
                    status: status,
                    userId: loggedInUser? userId : undefined, // If the user is logged in, we can associate the RSVP with their userId
                }
            });

            res.status(200).json({ message: "RSVP created successfully", rsvp });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

export const getRsvpsForUser = async (req: AuthRequest, res: Response) => {
    // Validate request body
    const [requestIsValid, validationErrors] = validateSchema(req.params, 'getUserRSVPs');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request parameters." });
        return;
    }

    const userId = req.userId;

    try {
        const rsvps = await prisma.rSVP.findMany({
            where: {
                userId: userId
            },
            include: {
                event: true,
            }
        });
        
        res.status(200).json({ length: rsvps.length, rsvps });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
};

// PUT /api/events/:id
export const modifyEvent = async (req: AuthRequest, res: Response) => {
    // Validate request body
    const requestIsValid = validateSchema(req.body, 'modifyEvent');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request body." });
        return;
    }

    const { eventId, title, description, startDate, endDate, location } = req.body;

    try {
        const event = await prisma.event.update({
            where: {
                id: eventId,
                creatorId: req.userId
            },

            data: {
                title: title || undefined,
                description: description || undefined,
                startDate: startDate? new Date(startDate) : undefined,
                endDate: endDate? new Date(endDate) : undefined,
                location: location || undefined
            },
            include: {
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        if (!event) {
            res.status(404).json({ message: "Event not found or invalid userId." });
            return;
        }

        // TODO -- send email to all users who have RSVP'd to the event.
        const rsvps = await prisma.rSVP.findMany({
            where: {
                eventId: event.id,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        for (const rsvp of rsvps) {
            // Build the recipient object
            let recipient;
            if (rsvp.user) {
                recipient = {
                    email: rsvp.user.email,
                    name: rsvp.user.firstName + " " + rsvp.user.lastName
                }
            } else {
                recipient = {
                    email: rsvp.email,
                    name: rsvp.name
                }
            }

            // Send the email
            try {
                console.log("Sending modify event email to", recipient.email);
                // DON'T await here, we want to send the emails in parallel so the response is not delayed.
                // we may have to handle some issues here later.
                sendEventChangeEmail(event, recipient, "The event details have been changed.");
            } catch (err) {
                console.error("Error sending email to", recipient.email, err);
                // TODO -- handle email sending failure (we should let the user know that some emails failed to send)
            }
        }

        res.status(200).json({ message: "Event updated successfully.", event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// DELETE /api/events/:id
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    // Validate request body
    const [requestIsValid, validationErrors] = validateSchema(req.body, 'deleteEvent');
    if (!requestIsValid) {
        res.status(400).json({ message: "Invalid request parameters.", validationErrors });
        return;
    }

    const { eventId } = req.body;

    try {
        const event = await prisma.event.delete({
            where: {
                id: eventId,
                creatorId: req.userId
            },
            include: {
                rsvps: true,
                creator: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
        });

        if (!event) {
            res.status(404).json({ message: "Event not found or invalid userId." });
            return;
        }

        // TODO -- send email to all users who have RSVP'd to the event.

        // Remove all RSVPs for the event
        await prisma.rSVP.deleteMany({
            where: {
                eventId: event.id
            }
        });

        res.status(200).json({ message: "Event deleted successfully.", event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

export const invite = async (req: AuthRequest, res: Response) => {
    // Validate request body
    // (todo)

    const { eventId, recipients } = req.body as { eventId: string, recipients: { email: string, name: string}[] };
    const userId = req.userId;

    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
            creatorId: userId
        },
        include: {
            creator: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }
    });

    if (!event) {
        res.status(404).json({ message: "Invalid user or event id." });
        return;
    }

    let failed = false;
    
    for (const recipient of recipients) {
        try {
            console.log("Sending invite email to", recipient.email);
            await sendInviteEmail(event, recipient);
        } catch (err) {
            failed = true;
            console.error("Error sending invite email to", recipient.email, err);
            console.log("continuing...");
        }
    }

    if (failed) {
        res.status(500).json({ message: "Some invite emails failed to send. Check server logs for details." });
        return;
    }

    res.status(200).json({ message: "Invite email sent successfully." });
};