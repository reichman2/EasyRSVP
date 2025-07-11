import { Router } from 'express';
import { createEvent, deleteEvent, getEventById, getEvents, getRsvpsForUser, modifyEvent, rsvp } from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';


const router = Router();

router.post('/', authMiddleware, createEvent);
router.get('/', authMiddleware, getEvents);

// Routes for /:id, /:id/rsvps, /:id/rsvps
router.get('/rsvps', authMiddleware, getRsvpsForUser);
router.put('/rsvp', rsvp); 
router.get('/:eventId', getEventById);
router.delete('/', authMiddleware, deleteEvent);
router.put('/', authMiddleware, modifyEvent);

export default router;