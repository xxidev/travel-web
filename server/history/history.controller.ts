import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getHistory, addHistory, deleteHistory, clearHistory } from './history.service';

export async function listHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
        const entries = await getHistory(req.userId!);
        res.json({ entries });
    } catch (err) {
        console.error('List history error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}

export async function createHistory(req: AuthRequest, res: Response): Promise<void> {
    const { destination, startDate, endDate, budget, currency, preferences, itinerary } = req.body;
    if (!destination || !startDate || !endDate || !budget || !itinerary) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const entry = await addHistory(req.userId!, {
            destination, startDate, endDate, budget,
            currency: currency || 'USD',
            preferences: preferences || '',
            itinerary
        });
        res.status(201).json({ entry });
    } catch (err) {
        console.error('Create history error:', err);
        res.status(500).json({ error: 'Failed to save history' });
    }
}

export async function removeHistory(req: AuthRequest, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid history ID' });
        return;
    }

    try {
        const deleted = await deleteHistory(req.userId!, id);
        if (!deleted) {
            res.status(404).json({ error: 'Record not found' });
            return;
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Remove history error:', err);
        res.status(500).json({ error: 'Failed to delete history' });
    }
}

export async function clearHistoryAll(req: AuthRequest, res: Response): Promise<void> {
    try {
        await clearHistory(req.userId!);
        res.json({ success: true });
    } catch (err) {
        console.error('Clear history error:', err);
        res.status(500).json({ error: 'Failed to clear history' });
    }
}
