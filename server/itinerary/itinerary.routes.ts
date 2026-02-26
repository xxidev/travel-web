import { Router } from 'express';
import { generateItinerary } from './itinerary.controller';

const router = Router();

router.post('/generate-itinerary', generateItinerary);

export default router;
