import express from 'express';
import type { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import itineraryRoutes from './routes/itinerary.routes';

// 加载环境变量 - 从项目根目录加载
dotenv.config({ path: path.join(process.cwd(), '.env') });

// 验证API Key是否加载
console.log('Google API Key loaded:', process.env.GOOGLE_PLACES_API_KEY ? 'Yes' : 'No');

const app: Express = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API路由
app.use('/api', itineraryRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
});
