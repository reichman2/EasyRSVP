import API from "./axios";
import ajv from "ajv";
import addFormats from "ajv-formats";

import * as loginResponseSchema from "../../schemas/LoginResponse.json";
import * as registerResponseSchema from "../../schemas/RegisterResponse.json";
import * as createEventResponse from "../../schemas/CreateEventResponse.json";
import * as getDetailedEventResposneSchema from "../../schemas/GetDetailedEventResponse.json";
import * as getEventsResponseSchema from "../../schemas/GetEventsResponse.json";
import * as rsvpResponseSchema from "../../schemas/RSVPResponse.json";
import * as deleteEventResponseSchema from "../../schemas/DeleteEventResponse.json";
import * as modifyEventResponseSchema from "../../schemas/ModifyEventResponse.json";
import * as getRSVPsResponseSchema from "../../schemas/GetRSVPsResponse.json";

import * as eventObjectSchema from "../../schemas/objects/Event.json";
import * as rsvpObjectSchema from "../../schemas/objects/RSVP.json";

import { Event, RSVP } from "../utils/types";


type UserLoginRequestParameters = {
    email: string;
    password: string;
};

type UserRegisterRequestParameters = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

type CreateEventRequestParameters = {
    title: string;
    description: string;
    startDate: Date | string;
    endDate: Date | string;
    location: string;
};

type getEventsRequestParameters = {
    // gets all events belonging to the logged in user.
    limit?: number;
    offset?: number;
};

type GetDetailedEventRequestParameters = {
    eventId: string;
};

type ModifyEventRequestParameters = {
    eventId: string;
    title?: string;
    description?: string;
    startDate?: Date | string;
    location?: string;
};

type DeleteEventRequestParameters = {
    eventId: string;
};

type RSVPRequestParameters = {
    eventId: string;
    rsvpToken: string;
    name: string;
    email: string;
    status: "ACCEPTED" | "DECLINED" | "MAYBE";
}


const SCHEMAS = {
    login: loginResponseSchema,
    register: registerResponseSchema,
    createEvent: createEventResponse,
    modifyEvent: modifyEventResponseSchema,
    deleteEvent: deleteEventResponseSchema,
    getDetailedEvent: getDetailedEventResposneSchema,
    getEvents: getEventsResponseSchema,
    rsvp: rsvpResponseSchema,
    getRsvps: getRSVPsResponseSchema
};

const OBJECT_SCHEMAS = [
    eventObjectSchema,
    rsvpObjectSchema
]

export const validateResponse = (obj: any, schema: keyof typeof SCHEMAS) => {
    if (obj && schema) {
        const validator = new ajv({ schemas: OBJECT_SCHEMAS, coerceTypes: true });
        addFormats(validator, ["date-time", "email", "uuid"]);
        const validate = validator.compile(SCHEMAS[schema]);

        const isValid = validate(obj);

        if (!isValid) {
            console.error("Validation errors:", validate.errors);
            return false;
        }

        return true;
    }

    console.log("Object to validate is undefined or null.");
    return false;
};


export const loginUser = async ({ email, password }: UserLoginRequestParameters) => {
    let token: string | null = null;
    let message: string | null = null;

    try {
        const res = await API.post("/auth/login", { email, password });
        const isValid = validateResponse(res.data, "login");

        if (!isValid) {
            throw new Error(`Response for \"POST /auth/login\" did not pass validation.\n ${res.data.message}`);
        }

        token = res.data.token;
        message = res.data.message;
    } catch (err: any) {
        message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    if (!token) {
        throw new Error("Token missing from response.");
    }

    return { token, message };
};

export const registerUser = async ({ firstName, lastName, email, password }: UserRegisterRequestParameters) => {
    let token: string | null = null;
    let message: string | null = null;

    try {        
        const res = await API.post("/auth/register", { firstName, lastName, email, password });
        const isValid = validateResponse(res.data, "register");

        if (!isValid) {
            throw new Error("Response for \"POST /auth/register\" did not pass validation.");
        }

        token = res.data.token
        message = res.data.message;
    } catch (err: any) {
        message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }
        
    if (!token) {
        throw new Error("Token missing from response.");
    }

    return { token, message };
};

export const createEvent = async ({ title, description, startDate, endDate, location }: CreateEventRequestParameters): Promise<{ message: string, newEvent: Event }> => {
    let res;
    try {
        res = await API.post("/events", { title, description, startDate, endDate, location });
        const isValid = validateResponse(res.data, "createEvent");

        if (!isValid) {
            throw new Error("Response did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const getEvents = async ({ limit, offset }: getEventsRequestParameters): Promise<{ length: number, events: Event[], message?: string }> => {
    let res;
    try {
        res = await API.get("/events", { params: { limit, offset } });
        const isValid = validateResponse(res.data, "getEvents");

        if (!isValid) {
            throw new Error("Response for \"GET /api/events\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const getDetailedEvent = async ({ eventId }: GetDetailedEventRequestParameters): Promise<{ event: Event, message?: string }> => {
    let res;
    try {
        res = await API.get(`/events/${eventId}`);
        const isValid = validateResponse(res.data, "getDetailedEvent");

        if (!isValid) {
            throw new Error("Response for \"GET /api/events/:id\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const modifyEvent = async ({ eventId, title, description, startDate, location }: ModifyEventRequestParameters): Promise<{ event: Event, message?: string }> => {
    let res;
    try {
        res = await API.put(`/events/${eventId}`, { eventId, title, description, startDate, location});
        const isValid = validateResponse(res.data, "createEvent");

        if (isValid) {
            throw new Error("Response for \"PUT /api/events/:id\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const deleteEvent = async ({ eventId }: DeleteEventRequestParameters): Promise<{ event: Event, message?: string }> => {
    let res;
    try {
        res = await API.delete(`/events/`, { data: { eventId } });
        const isValid = validateResponse(res.data, "deleteEvent");

        if (!isValid) {
            throw new Error("Response for \"DELETE /api/events/:id\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const rsvp = async ({ eventId, rsvpToken, name, email, status }: RSVPRequestParameters): Promise<{ rsvp: RSVP, message?: string }> => {
    let res;
    try {
        res = await API.post("/events/rsvp", { eventId, rsvpToken, name, email, status });
        const isValid = validateResponse(res.data, "rsvp");

        if (!isValid) {
            throw new Error("Response for \"POST /api/events/rsvp\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};

export const getRsvps = async (): Promise<{ rsvps: RSVP[], message?: string }> => {
    let res;
    try {
        res = await API.get("/events/rsvps");
        const isValid = validateResponse(res.data, "getRsvps");

        if (!isValid) {
            throw new Error("Response for \"GET /api/events/rsvps\" did not pass validation.");
        }
    } catch (err: any) {
        const message = err.response?.data?.message;
        if (message) {
            throw new Error(message);
        }

        throw err;
    }

    return res.data;
};