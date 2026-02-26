import prisma from '../prisma';

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

function toHistoryEntry(h: {
    id: number;
    userId: number;
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    currency: string;
    preferences: string;
    itinerary: string;
    createdAt: Date;
}): HistoryEntry {
    return {
        id: h.id,
        user_id: h.userId,
        destination: h.destination,
        start_date: h.startDate,
        end_date: h.endDate,
        budget: h.budget,
        currency: h.currency,
        preferences: h.preferences,
        itinerary: h.itinerary,
        created_at: h.createdAt,
    };
}

export async function getHistory(userId: number): Promise<HistoryEntry[]> {
    const results = await prisma.itineraryHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
    });
    return results.map(toHistoryEntry);
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
    const result = await prisma.itineraryHistory.create({
        data: {
            userId,
            destination: data.destination,
            startDate: data.startDate,
            endDate: data.endDate,
            budget: data.budget,
            currency: data.currency,
            preferences: data.preferences,
            itinerary: data.itinerary,
        },
    });
    return toHistoryEntry(result);
}

export async function deleteHistory(userId: number, historyId: number): Promise<boolean> {
    try {
        await prisma.itineraryHistory.delete({
            where: { id: historyId, userId },
        });
        return true;
    } catch {
        return false;
    }
}

export async function clearHistory(userId: number): Promise<void> {
    await prisma.itineraryHistory.deleteMany({
        where: { userId },
    });
}
