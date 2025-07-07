export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    role: "user" | "admin";
};

export type RSVP = {
    id: string;
    name: string;
    email: string;
    status: "ACCEPTED" | "DECLINED" | "MAYBE";
    createdAt: Date;
    eventId: string;

    event?: Event;
};

export type Event = {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate?: Date;
    createdAt: Date;
    creatorId: string;
    creator?: User;
    slug: string;
    rsvpToken: string;
    rsvps?: RSVP[];

    status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
    creationStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};