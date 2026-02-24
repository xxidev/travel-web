import { useState, useCallback, useEffect } from 'react';
import { TravelFormData } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiGetHistory, apiAddHistory, apiDeleteHistory, apiClearHistory, DBHistoryEntry } from '../api/history';

export interface HistoryEntry {
    id: string
    destination: string
    startDate: string
    endDate: string
    budget: string
    currency: string
    preferences: string
    itinerary: string
    createdAt: number
}

// localStorage fallback for guests
const STORAGE_KEY = 'travel-history';
const MAX_ENTRIES = 20;

function loadLocal(): HistoryEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLocal(entries: HistoryEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function dbEntryToLocal(e: DBHistoryEntry): HistoryEntry {
    return {
        id: String(e.id),
        destination: e.destination,
        startDate: e.start_date,
        endDate: e.end_date,
        budget: e.budget,
        currency: e.currency,
        preferences: e.preferences,
        itinerary: e.itinerary,
        createdAt: new Date(e.created_at).getTime(),
    };
}

export function useHistory() {
    const { user, token } = useAuth();
    const isLoggedIn = !!user && !!token;

    const [entries, setEntries] = useState<HistoryEntry[]>(() => isLoggedIn ? [] : loadLocal());

    // 登录后从数据库加载历史
    useEffect(() => {
        if (!isLoggedIn) {
            setEntries(loadLocal());
            return;
        }
        apiGetHistory(token!).then(rows => {
            setEntries(rows.map(dbEntryToLocal));
        }).catch(console.error);
    }, [isLoggedIn, token]);

    const addEntry = useCallback(async (formData: TravelFormData, itinerary: string) => {
        if (isLoggedIn) {
            try {
                const entry = await apiAddHistory(token!, formData, itinerary);
                setEntries(prev => [dbEntryToLocal(entry), ...prev].slice(0, MAX_ENTRIES));
            } catch (err) {
                console.error('Failed to save history to DB:', err);
            }
        } else {
            const entry: HistoryEntry = {
                id: Date.now().toString(),
                ...formData,
                itinerary,
                createdAt: Date.now(),
            };
            setEntries(prev => {
                const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
                saveLocal(updated);
                return updated;
            });
        }
    }, [isLoggedIn, token]);

    const removeEntry = useCallback(async (id: string) => {
        if (isLoggedIn) {
            try {
                await apiDeleteHistory(token!, Number(id));
            } catch (err) {
                console.error('Failed to delete from DB:', err);
            }
        }
        setEntries(prev => {
            const updated = prev.filter(e => e.id !== id);
            if (!isLoggedIn) saveLocal(updated);
            return updated;
        });
    }, [isLoggedIn, token]);

    const clearAll = useCallback(async () => {
        if (isLoggedIn) {
            try {
                await apiClearHistory(token!);
            } catch (err) {
                console.error('Failed to clear DB history:', err);
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        setEntries([]);
    }, [isLoggedIn, token]);

    return { entries, addEntry, removeEntry, clearAll };
}
