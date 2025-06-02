export type User = {
    id: string;
    firstNme: string;
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
    createdAt: Date;
    creatorId: string;
    slug: string;
    rsvpToken: string;
    rsvps?: RSVP[];
};