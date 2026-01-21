import { Router } from 'express';
import { ItineraryController } from '../controllers/itinerary.controller';

const router = Router();

// 生成行程路由 - 每次请求时创建controller实例
router.post('/generate-itinerary', (req, res) => {
    const controller = new ItineraryController();
    controller.generateItinerary(req, res);
});

export default router;
