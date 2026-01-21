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
                res.status(400).json({ error: '请提供完整的旅行信息' });
                return;
            }

            // 计算天数
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            if (days < 1) {
                res.status(400).json({ error: '结束日期必须晚于开始日期' });
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
            console.error('生成行程时出错:', error);
            res.status(500).json({
                error: '抱歉，生成行程时出现错误：' + (error as Error).message
            });
        }
    }
}
