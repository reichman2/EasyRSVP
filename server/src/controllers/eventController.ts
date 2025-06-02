import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { serverErrorMessage } from '../utils/constants';
import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';


const prisma = new PrismaClient();

// POST /api/events
export const createEvent = async (req: AuthRequest, res: Response) => {
    const { title, description, startDate, location } = req.body;
    const userId = req.userId;

    try {
        const newEvent = await prisma.event.create({
            data: {
                title: title as string,
                description: description as string,
                startDate: new Date(startDate),
                location: location as string,
                
                creatorId: userId as string,

                slug: v4()
            }
        });

        console.log("userId", userId);
        console.log("Event data", {
            title, description, startDate, location
        });

        res.status(201).json({ message: "Event created successfully", newEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// GET /api/events
export const getEvents = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { limit = -1, offset = -1 } = req.body;

    try {
        const events = await prisma.event.findMany({
            take: limit === -1 ? undefined : Number(limit),
            skip: offset === -1 ? undefined : Number(offset),
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                creatorId: userId
            }
        });
        res.status(200).json({ length: events.length, events, });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// GET /api/events/:id
export const getEventById = async (req: Request, res: Response) => {
    const { id: eventId } = req.params;
    const { rsvpToken } = req.query;

    // Get the userId from the request
    const token = req.headers['authorization']?.split(' ')[1];
    const userId = token? (jwt.verify(token, process.env.JWT_SECRET as string) as { userID: string }).userID : undefined;

    console.log("eventId", eventId);
    
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

// POST /api/events/rsvp
export const rsvp = async (req: Request, res: Response) => {
    const { eventId, rsvpToken } = req.body;
    const { name, email, status } = req.body;

    if (!rsvpToken) {
        res.status(400).json({ message: "Invalid RSVP token." });
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

        const rsvp = await prisma.rSVP.create({
            data: {
                eventId,

                name,
                email,
                status: status,
            }
        });

        res.status(200).json({ message: "RSVP created successfully", rsvp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// PUT /api/events/:id
export const modifyEvent = async (req: AuthRequest, res: Response) => {
    const { eventId, title, description, startDate, location } = req.body;

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
                location: location || undefined
            }
        });

        if (!event) {
            res.status(404).json({ message: "Event not found or invalid userId." });
            return;
        }

        // TODO -- send email to all users who have RSVP'd to the event.

        if (startDate) {
            console.log("new start date, we should remove all RSVPs");

            // Remove all RSVPs for the event
            await prisma.rSVP.deleteMany({
                where: {
                    eventId
                }
            });
        }

        res.status(200).json({ message: "Event updated successfully.", event });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: serverErrorMessage });
    }
}

// DELETE /api/events/:id
export const deleteEvent = async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;

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
            }
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