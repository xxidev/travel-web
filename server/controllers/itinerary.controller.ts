import { Request, Response } from 'express';
import { createItineraryService } from '../services/itinerary.service';
import { createGooglePlacesService } from '../services/googlePlaces.service';

export async function generateItinerary(req: Request, res: Response): Promise<void> {
    try {
        const { destination, startDate, endDate, budget, currency, preferences } = req.body;

        if (!destination || !startDate || !endDate || !budget) {
            res.status(400).json({ error: 'Please provide complete travel information' });
            return;
        }

        // Calculate number of days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days < 1) {
            res.status(400).json({ error: 'End date must be after start date' });
            return;
        }

        // Generate itinerary
        const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
        const googlePlacesService = createGooglePlacesService(apiKey);
        const itineraryService = createItineraryService(googlePlacesService);

        const itinerary = await itineraryService.generateItinerary({
            destination,
            days,
            budget: parseInt(budget),
            currency: currency || 'USD',
            preferences
        });

        res.json({ itinerary });
    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({
            error: 'Sorry, an error occurred: ' + (error as Error).message
        });
    }
}
