import { Router } from 'express';
import {ItineraryController} from "../controllers/itinerary.controller";


const router = Router();

// Generate itinerary route - create controller instance for each request
router.post('/generate-itinerary', (req, res) => {
    const controller = new ItineraryController();
    controller.generateItinerary(req, res);
});

export default router;
