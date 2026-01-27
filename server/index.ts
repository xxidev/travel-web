import express from 'express';
import type { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import itineraryRoutes from './routes/itinerary.routes';

// Load environment variables from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Verify API Key is loaded
console.log('Google API Key loaded:', process.env.GOOGLE_PLACES_API_KEY ? 'Yes' : 'No');

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', itineraryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api`);
});
