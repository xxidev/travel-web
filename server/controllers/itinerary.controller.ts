import { Request, Response } from 'express';
import { ItineraryService } from '../services/itinerary.service';
import { GooglePlacesService } from '../services/googlePlaces.service';

export class ItineraryController {
    private itineraryService: ItineraryService;

    constructor() {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
        const googlePlacesService = new GooglePlacesService(apiKey);
        this.itineraryService = new ItineraryService(googlePlacesService);
    }

    async generateItinerary(req: Request, res: Response): Promise<void> {
        try {
            const { destination, startDate, endDate, budget, currency, preferences } = req.body;

            if (!destination || !startDate || !endDate || !budget) {
                res.status(400).json({ error: 'Please provide complete travel information' });
                return;
            }

            // 计算天数
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (days < 1) {
                res.status(400).json({ error: 'End date must be after start date' });
                return;
            }

            // 生成行程
            const itinerary = await this.itineraryService.generateItinerary({
                destination,
                days,
                budget: parseInt(budget),
                currency: currency || 'CNY',
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
}
