import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';


const transporter = nodemailer.createTransport({
    host: process.env.DEV_EMAIL_HOST,
    port: Number(process.env.DEV_EMAIL_PORT),
    secure: process.env.DEV_EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.DEV_EMAIL_USER,
        pass: process.env.DEV_EMAIL_PASSWORD,
    },
});

/**
 * Sends an email inviting a person to the specified event.
 * @param event the event to invite the recipient to.
 * @param recipient the recipient of the email / the person being invited to the event.
 * @param customMessage a custom message to send to the recipient in the email from the event creator.
 * @returns 
 */
export const sendInviteEmail = async (event: object, recipient: { email: string, name: string }, customMessage?: string) => {
    const mailOptions = {
        from: process.env.DEV_EMAIL_USER,
        to: recipient.email,
    }

    // Build email from template...
    const email = new Email({
        message: {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: "You're Invited!",
        },
        transport: transporter,
        views: {
            root: path.join(__dirname, '../../templates'),
            options: {
                extension: 'ejs'
            }
        },
        preview: false,
        send: true
    });

    // and supply template variables, render, and send.
    const emailSendResult = await email.send({
        template: "invite",
        message: {
            to: {
                address: recipient.email,
                name: recipient.name
            },

            sender: {
                address: mailOptions.from || "example@example.com",
                name: "The Sender"
            }
        },
        locals: {
            event,
            recipient,

            startDate: formatDate(new Date((event as any).startDate)),
            endDate: ((event as any).startDate) ? formatDate(new Date((event as any).endDate)) : undefined,
            customMessage: customMessage || "You have been invited to an event. Please check the details below."
        }
    });

    if (emailSendResult) {
        console.log(`Email sent to ${recipient.email}`);
    } else {
        console.error(`Failed to send email to ${recipient.email}`);
    }

    return emailSendResult;
};

/**
 * Sends an email using the changedEvent template.  This email should be sent when the details of an event change.
 * If an event is modified, it is important to notify those who have already RSVP'd to the event.
 * @param event 
 * @param recipient 
 */
export const sendEventChangeEmail = async (event: object, recipient: { email: string, name: string }, customMessage: string | undefined) => {
    const mailOptions = {
        from: process.env.DEV_EMAIL_USER,
        to: recipient.email
    };

    // Build email from template
    const email = new Email({
        message: {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: "Event Details Changed",
        },
        transport: transporter,
        views: {
            root: path.join(__dirname, '../../templates'),
            options: {
                extension: 'ejs'
            }
        },
        preview: false,
        send: true
    });

    // supply template variables, render, and send.
    const emailSendResult = await email.send({
        template: "changedEvent",
        message: {
            to: {
                address: recipient.email,
                name: recipient.name
            },

            sender: {
                address: mailOptions.from || "example@example.com",
                name: "The Sender"
            }
        },
        locals: {
            event,
            recipient,
            startDate: formatDate(new Date((event as any).startDate)),
            endDate: ((event as any).startDate) ? formatDate(new Date((event as any).endDate)) : undefined,
            customMessage: customMessage || "The event details have been updated. Please check the changes below."
        }
    });

    if (emailSendResult) {
        console.log(`Email sent to ${recipient.email}`);
    } else {
        console.error(`Failed to send email to ${recipient.email}`);
    }

    return emailSendResult;
};

const sendEventChangeRsvpNoEmail = async (event: object, recipient: { email: string, name: string }, customMessage?: string) => {

};

const sendEventReminderEmail = async (event: object, recipient: string) => {

};

const sendRsvpConfirmationEmail = async (event: object, recipient: string) => {

};


const formatDate = (date: Date) => {
    // TODO should this be a utility function? (moved to utils dir)
    const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    return formatter.format(date);
}