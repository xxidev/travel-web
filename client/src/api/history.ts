import { TravelFormData } from '../types';

const BASE = '/api/history';

export interface DBHistoryEntry {
    id: number;
    destination: string;
    start_date: string;
    end_date: string;
    budget: string;
    currency: string;
    preferences: string;
    itinerary: string;
    created_at: string;
}

function authHeaders(token: string) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function apiGetHistory(token: string): Promise<DBHistoryEntry[]> {
    const res = await fetch(BASE, { headers: authHeaders(token) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
    return data.entries;
}

export async function apiAddHistory(token: string, formData: TravelFormData, itinerary: string): Promise<DBHistoryEntry> {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ ...formData, itinerary }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save history');
    return data.entry;
}

export async function apiDeleteHistory(token: string, id: number): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete history');
    }
}

export async function apiClearHistory(token: string): Promise<void> {
    const res = await fetch(`${BASE}/clear`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to clear history');
    }
}
