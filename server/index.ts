import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import config from './config';
import itineraryRoutes from './itinerary/itinerary.routes';
import authRoutes from './auth/auth.routes';
import historyRoutes from './history/history.routes';

console.log('Google API Key loaded:', config.googlePlaces.apiKey ? 'Yes' : 'No');

const app: Express = express();

app.use(cors({
    origin: config.server.clientOrigin,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', itineraryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(config.server.port, () => {
    console.log(`Server running on port ${config.server.port}`);
});
