import pool from '../db';

export interface HistoryEntry {
    id: number;
    user_id: number;
    destination: string;
    start_date: string;
    end_date: string;
    budget: string;
    currency: string;
    preferences: string;
    itinerary: string;
    created_at: Date;
}

export async function getHistory(userId: number): Promise<HistoryEntry[]> {
    const result = await pool.query<HistoryEntry>(
        `SELECT id, destination, start_date, end_date, budget, currency, preferences, itinerary, created_at
         FROM itinerary_history
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [userId]
    );
    return result.rows;
}

export async function addHistory(
    userId: number,
    data: {
        destination: string;
        startDate: string;
        endDate: string;
        budget: string;
        currency: string;
        preferences: string;
        itinerary: string;
    }
): Promise<HistoryEntry> {
    const result = await pool.query<HistoryEntry>(
        `INSERT INTO itinerary_history (user_id, destination, start_date, end_date, budget, currency, preferences, itinerary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, destination, start_date, end_date, budget, currency, preferences, itinerary, created_at`,
        [userId, data.destination, data.startDate, data.endDate, data.budget, data.currency, data.preferences, data.itinerary]
    );
    return result.rows[0];
}

export async function deleteHistory(userId: number, historyId: number): Promise<boolean> {
    const result = await pool.query(
        'DELETE FROM itinerary_history WHERE id = $1 AND user_id = $2',
        [historyId, userId]
    );
    return (result.rowCount ?? 0) > 0;
}

export async function clearHistory(userId: number): Promise<void> {
    await pool.query('DELETE FROM itinerary_history WHERE user_id = $1', [userId]);
}
