import Ajv from 'ajv';
import addFormats from "ajv-formats";

import * as loginRequestSchema from '../../schemas/LoginRequest.json';
import * as registerRequestSchema from '../../schemas/RegisterRequest.json';
import * as getEventsRequestSchema from '../../schemas/GetEventsRequest.json';
import * as getDetailedEventRequestSchema from '../../schemas/GetDetailedEventRequest.json';
import * as createEventRequestSchema from '../../schemas/CreateEventRequest.json';
import * as modifyEventRequestSchema from '../../schemas/ModifyEventRequest.json';
import * as deleteEventRequestSchema from '../../schemas/DeleteEventRequest.json';
import * as rsvpRequestSchema from '../../schemas/RSVPRequest.json';


const SCHEMAS = {
    login: loginRequestSchema,
    register: registerRequestSchema,
    getEvents: getEventsRequestSchema,
    getDetailedEvent: getDetailedEventRequestSchema,
    createEvent: createEventRequestSchema,
    modifyEvent: modifyEventRequestSchema,
    deleteEvent: deleteEventRequestSchema,
    rsvp: rsvpRequestSchema
};


const validateSchema = (obj: object, schema: keyof typeof SCHEMAS | object) => {
    if (typeof schema === "string" && schema in SCHEMAS) {
        schema = SCHEMAS[schema];
    } else if (!schema || typeof schema !== "object") {
        throw new Error("Invalid schema type. Must be a string key of SCHEMAS or an object (schema literal).");
    }

    if (obj) {
        const ajv = new Ajv();
        addFormats(ajv, ["date-time", "email"]);
        const validate = ajv.compile(schema);
        return validate(obj);
    }

    return false;
}

export default validateSchema;