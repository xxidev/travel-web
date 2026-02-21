import { GooglePlacesService } from './googlePlaces.service';

interface ItineraryRequest {
    destination: string;
    days: number;
    budget: number;
    currency?: string;
    preferences?: string;
}

interface PlaceWithLocation {
    name: string;
    address: string;
    rating: string;
    area: string;
    lat?: number;
    lng?: number;
    priceLevel?: number;
}

interface PlacesData {
    hotels: PlaceWithLocation[];
    attractions: PlaceWithLocation[];
    restaurants: PlaceWithLocation[];
}

interface DayPlan {
    attractions: PlaceWithLocation[];
    restaurants: PlaceWithLocation[];
    centerLat: number;
    centerLng: number;
}

const exchangeRates: { [key: string]: number } = {
    'CNY': 1,
    'USD': 7.2,
    'EUR': 7.8,
    'GBP': 9.1,
    'JPY': 0.05,
    'KRW': 0.0055,
    'SGD': 5.3,
    'AUD': 4.7,
    'CAD': 5.2
};

const currencySymbols: { [key: string]: string } = {
    'CNY': '¥',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'KRW': '₩',
    'SGD': 'S$',
    'AUD': 'A$',
    'CAD': 'C$'
};

function convertToCNY(amount: number, currency: string): number {
    const rate = exchangeRates[currency] || 1;
    return Math.floor(amount * rate);
}

function convertFromCNY(amountCNY: number, currency: string): number {
    const rate = exchangeRates[currency] || 1;
    return Math.floor(amountCNY / rate);
}

function getCurrencySymbol(currency: string): string {
    return currencySymbols[currency] || '$';
}

// Calculate distance between two points using Haversine formula (in km)
function calculateDistance(lat1?: number, lng1?: number, lat2?: number, lng2?: number): number {
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Simple day distribution when no coordinates available
function simpleDayDistribution(attractions: PlaceWithLocation[], days: number): DayPlan[] {
    const dayPlans: DayPlan[] = [];
    const attractionsPerDay = Math.max(2, Math.ceil(attractions.length / Math.max(1, days - 1)));
    let index = 0;

    for (let day = 0; day < days; day++) {
        if (day === 0 || day === days - 1) {
            dayPlans.push({ attractions: [], restaurants: [], centerLat: 0, centerLng: 0 });
            continue;
        }

        const dayAttractions = attractions.slice(index, index + attractionsPerDay);
        index += attractionsPerDay;

        dayPlans.push({
            attractions: dayAttractions,
            restaurants: [],
            centerLat: 0,
            centerLng: 0
        });
    }

    return dayPlans;
}

// Cluster attractions by geographic proximity for each day
function clusterAttractionsByDay(attractions: PlaceWithLocation[], days: number): DayPlan[] {
    const validAttractions = attractions.filter(a => a.lat && a.lng);

    if (validAttractions.length === 0) {
        // No coordinates available, fall back to simple distribution
        return simpleDayDistribution(attractions, days);
    }

    const dayPlans: DayPlan[] = [];
    const used = new Set<number>();
    const attractionsPerDay = Math.max(2, Math.ceil(validAttractions.length / Math.max(1, days - 1)));

    for (let day = 0; day < days; day++) {
        if (day === 0 || day === days - 1) {
            // First and last day have fewer attractions (arrival/departure)
            dayPlans.push({ attractions: [], restaurants: [], centerLat: 0, centerLng: 0 });
            continue;
        }

        // Find an unused attraction as the starting point (seed)
        let seedIndex = -1;
        for (let i = 0; i < validAttractions.length; i++) {
            if (!used.has(i)) {
                seedIndex = i;
                break;
            }
        }

        if (seedIndex === -1) break;

        const dayAttractions: PlaceWithLocation[] = [validAttractions[seedIndex]];
        used.add(seedIndex);

        // Find nearby attractions for this day
        while (dayAttractions.length < attractionsPerDay) {
            let nearestIndex = -1;
            let nearestDistance = Infinity;

            // Calculate center of current day's attractions
            const centerLat = dayAttractions.reduce((sum, a) => sum + (a.lat || 0), 0) / dayAttractions.length;
            const centerLng = dayAttractions.reduce((sum, a) => sum + (a.lng || 0), 0) / dayAttractions.length;

            // Find the nearest unused attraction
            for (let i = 0; i < validAttractions.length; i++) {
                if (used.has(i)) continue;
                const dist = calculateDistance(centerLat, centerLng, validAttractions[i].lat, validAttractions[i].lng);
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestIndex = i;
                }
            }

            if (nearestIndex === -1 || nearestDistance > 10) break; // Stop if no nearby attractions (>10km)

            dayAttractions.push(validAttractions[nearestIndex]);
            used.add(nearestIndex);
        }

        // Calculate final center for restaurant matching
        const finalCenterLat = dayAttractions.reduce((sum, a) => sum + (a.lat || 0), 0) / dayAttractions.length;
        const finalCenterLng = dayAttractions.reduce((sum, a) => sum + (a.lng || 0), 0) / dayAttractions.length;

        dayPlans.push({
            attractions: dayAttractions,
            restaurants: [],
            centerLat: finalCenterLat,
            centerLng: finalCenterLng
        });
    }

    return dayPlans;
}

// Find restaurants near the day's attractions
function assignRestaurantsToDays(dayPlans: DayPlan[], restaurants: PlaceWithLocation[]): void {
    const usedRestaurants = new Set<number>();

    for (const dayPlan of dayPlans) {
        if (dayPlan.attractions.length === 0) continue;

        // Find 2 restaurants near this day's center
        const nearbyRestaurants: { index: number; distance: number }[] = [];

        for (let i = 0; i < restaurants.length; i++) {
            if (usedRestaurants.has(i)) continue;
            const dist = calculateDistance(
                dayPlan.centerLat, dayPlan.centerLng,
                restaurants[i].lat, restaurants[i].lng
            );
            nearbyRestaurants.push({ index: i, distance: dist });
        }

        // Sort by distance and pick the closest ones
        nearbyRestaurants.sort((a, b) => a.distance - b.distance);

        for (let i = 0; i < Math.min(2, nearbyRestaurants.length); i++) {
            const restIndex = nearbyRestaurants[i].index;
            dayPlan.restaurants.push(restaurants[restIndex]);
            usedRestaurants.add(restIndex);
        }
    }
}

function getPriceLevelText(priceLevel: number): string {
    const levels: { [key: number]: string } = {
        0: 'Free',
        1: 'Budget ($)',
        2: 'Moderate ($$)',
        3: 'Expensive ($$$)',
        4: 'Luxury ($$$$)'
    };
    return levels[priceLevel] || 'Unknown';
}

function generateBudgetSection(
    budget: number,
    dailyBudget: number,
    budgetInCNY: number,
    currency: string,
    currencySymbol: string
): string {
    let section = `## Budget Overview\n\n`;
    section += `**Total Budget**: ${currencySymbol}${budget}\n`;
    section += `**Daily Budget**: ${currencySymbol}${dailyBudget}\n\n`;

    const accommodationBudget = convertFromCNY(Math.floor(budgetInCNY * 0.35), currency);
    const foodBudget = convertFromCNY(Math.floor(budgetInCNY * 0.25), currency);
    const transportBudget = convertFromCNY(Math.floor(budgetInCNY * 0.20), currency);
    const activityBudget = convertFromCNY(Math.floor(budgetInCNY * 0.15), currency);
    const otherBudget = convertFromCNY(Math.floor(budgetInCNY * 0.05), currency);

    section += `**Suggested Budget Allocation**:\n`;
    section += `- Accommodation: ${currencySymbol}${accommodationBudget} (35%)\n`;
    section += `- Food & Dining: ${currencySymbol}${foodBudget} (25%)\n`;
    section += `- Transportation: ${currencySymbol}${transportBudget} (20%)\n`;
    section += `- Activities & Tickets: ${currencySymbol}${activityBudget} (15%)\n`;
    section += `- Miscellaneous: ${currencySymbol}${otherBudget} (5%)\n\n`;
    return section;
}

function generateAccommodationSection(
    realData: PlacesData,
    days: number,
    totalBudgetCNY: number,
    currency: string,
    currencySymbol: string,
    destination: string
): string {
    let section = `## Accommodation Recommendations\n\n`;
    const totalNights = days - 1;

    const accommodationBudgetCNY = Math.floor(totalBudgetCNY * 0.35);
    const budgetPerNightCNY = totalNights > 0 ? Math.floor(accommodationBudgetCNY / totalNights) : 0;
    const accommodationBudget = convertFromCNY(accommodationBudgetCNY, currency);
    const budgetPerNight = convertFromCNY(budgetPerNightCNY, currency);

    section += `**Accommodation Budget**: ~${currencySymbol}${accommodationBudget} total, ~${currencySymbol}${budgetPerNight}/night\n\n`;

    if (realData.hotels.length > 0) {
        section += `**Recommended Hotels**:\n\n`;

        const hotelsToShow = Math.min(3, realData.hotels.length);
        for (let i = 0; i < hotelsToShow; i++) {
            const hotel = realData.hotels[i];
            section += `**${i + 1}. ${hotel.name}**\n`;
            section += `- Address: ${hotel.address}\n`;
            section += `- Rating: ${hotel.rating}\n`;
            section += `- Price Level: ${getPriceLevelText(hotel.priceLevel ?? 2)}\n\n`;
        }
    } else {
        section += `**Booking Tips**:\n`;
        section += `- Look for hotels in ${destination} city center or near main attractions\n`;
        section += `- Use Booking.com, Agoda, Airbnb, or Hotels.com to compare prices\n`;
        section += `- Book 1-2 weeks in advance for better rates\n\n`;
    }

    const priceRangeLow = convertFromCNY(Math.floor(budgetPerNightCNY * 0.8), currency);
    const priceRangeHigh = convertFromCNY(Math.floor(budgetPerNightCNY * 1.2), currency);

    section += `**Booking Tips**:\n`;
    section += `- Suggested price range: ${currencySymbol}${priceRangeLow}-${currencySymbol}${priceRangeHigh}/night\n`;
    section += `- ${totalNights} nights, estimated total: ${currencySymbol}${budgetPerNight * totalNights}\n\n`;

    return section;
}

function generateDayOneOptimized(
    destination: string,
    hotels: PlaceWithLocation[],
    attractions: PlaceWithLocation[],
    nearbyRestaurants: PlaceWithLocation[]
): string {
    let section = '';

    section += `**Morning 9:00-12:00**: Arrive in ${destination}\n`;
    if (hotels.length > 0) {
        section += `- Check in at: ${hotels[0].name}\n`;
        section += `- Address: ${hotels[0].address}\n`;
    } else {
        section += `- Check in at your hotel\n`;
    }
    section += `- Rest and freshen up\n\n`;

    section += `**Lunch 12:00-13:30**\n`;
    if (nearbyRestaurants.length > 0) {
        section += `- Recommended: ${nearbyRestaurants[0].name}\n`;
        section += `- Address: ${nearbyRestaurants[0].address}\n`;
        section += `- Rating: ${nearbyRestaurants[0].rating}\n`;
    } else {
        section += `- Find a local restaurant near your hotel\n`;
        section += `- Try local specialties\n`;
    }
    section += `\n`;

    section += `**Afternoon 14:00-17:30**: Sightseeing\n`;
    if (attractions.length > 0) {
        section += `- ${attractions[0].name}\n`;
        section += `- Address: ${attractions[0].address}\n`;
        section += `- Rating: ${attractions[0].rating}\n`;
    } else {
        section += `- Visit ${destination}'s iconic landmarks\n`;
        section += `- Book tickets online in advance\n`;
    }
    section += `\n`;

    section += `**Evening 18:30-20:30**: Dinner & Night Walk\n`;
    if (nearbyRestaurants.length > 1) {
        section += `- Recommended: ${nearbyRestaurants[1].name}\n`;
        section += `- Address: ${nearbyRestaurants[1].address}\n`;
    } else {
        section += `- Enjoy local cuisine\n`;
    }
    section += `- Explore the nightlife of ${destination}\n\n`;

    return section;
}

function generateLastDay(destination: string): string {
    let section = '';

    section += `**Morning 8:00-10:00**: Breakfast & Shopping\n`;
    section += `- Have breakfast near the hotel\n`;
    section += `- Buy souvenirs and local products\n\n`;

    section += `**Morning 10:00-11:30**: Check Out\n`;
    section += `- Pack your luggage\n`;
    section += `- Complete check-out\n\n`;

    section += `**Afternoon**: Departure\n`;
    section += `- Head to airport/station\n`;
    section += `- End of your wonderful trip to ${destination}!\n\n`;

    return section;
}

function generateMiddleDayOptimized(
    day: number,
    destination: string,
    dayPlan: DayPlan
): string {
    let section = '';
    const { attractions, restaurants } = dayPlan;

    // Show area info
    if (attractions.length > 0 && attractions[0].area) {
        section += `**Area**: ${attractions[0].area} (all locations within walking distance)\n\n`;
    }

    section += `**Morning 9:00-12:00**: Sightseeing\n`;
    if (attractions.length > 0) {
        section += `- ${attractions[0].name}\n`;
        section += `- Address: ${attractions[0].address}\n`;
        section += `- Rating: ${attractions[0].rating}\n`;
    } else {
        section += `- Explore popular attractions in ${destination}\n`;
    }
    section += `\n`;

    section += `**Lunch 12:30-14:00**\n`;
    if (restaurants.length > 0) {
        section += `- Recommended: ${restaurants[0].name} (nearby)\n`;
        section += `- Address: ${restaurants[0].address}\n`;
        section += `- Rating: ${restaurants[0].rating}\n`;
    } else {
        section += `- Find local food near the attractions\n`;
    }
    section += `\n`;

    section += `**Afternoon 14:30-18:00**: Continue Exploring\n`;
    if (attractions.length > 1) {
        for (let i = 1; i < attractions.length; i++) {
            section += `- ${attractions[i].name}\n`;
            section += `  - Address: ${attractions[i].address}\n`;
            section += `  - Rating: ${attractions[i].rating}\n`;
        }
    } else {
        section += `- Visit museums, historic districts, or unique neighborhoods\n`;
        section += `- Experience local culture\n`;
    }
    section += `\n`;

    section += `**Evening 19:00-21:00**: Dinner & Leisure\n`;
    if (restaurants.length > 1) {
        section += `- Recommended: ${restaurants[1].name} (nearby)\n`;
        section += `- Address: ${restaurants[1].address}\n`;
    } else {
        section += `- Enjoy local cuisine\n`;
    }
    section += `- Explore night markets or enjoy the night view\n\n`;

    return section;
}

function generateMiddleDay(
    day: number,
    destination: string,
    attractions: PlaceWithLocation[],
    restaurants: PlaceWithLocation[],
    hasData: boolean
): string {
    let section = '';

    const attrIndex = (day - 1) * 2;
    const restIndex = day;

    section += `**Morning 9:00-12:00**: Sightseeing\n`;
    if (hasData && attractions[attrIndex % attractions.length]) {
        const attr = attractions[attrIndex % attractions.length];
        section += `- ${attr.name}\n`;
        section += `- Address: ${attr.address}\n`;
        section += `- Rating: ${attr.rating}\n`;
    } else {
        section += `- Explore popular attractions in ${destination}\n`;
        section += `- Plan your route in advance\n`;
    }
    section += `\n`;

    section += `**Lunch 12:30-14:00**\n`;
    if (hasData && restaurants[restIndex % restaurants.length]) {
        const rest = restaurants[restIndex % restaurants.length];
        section += `- Recommended: ${rest.name}\n`;
        section += `- Address: ${rest.address}\n`;
    } else {
        section += `- Find local food near the attractions\n`;
    }
    section += `\n`;

    section += `**Afternoon 14:30-18:00**: Continue Exploring\n`;
    if (hasData && attractions[(attrIndex + 1) % attractions.length]) {
        const attr = attractions[(attrIndex + 1) % attractions.length];
        section += `- ${attr.name}\n`;
        section += `- Address: ${attr.address}\n`;
        section += `- Rating: ${attr.rating}\n`;
    } else {
        section += `- Visit museums, historic districts, or unique neighborhoods\n`;
        section += `- Experience local culture\n`;
    }
    section += `\n`;

    section += `**Evening 19:00-21:00**: Dinner & Leisure\n`;
    section += `- Enjoy local cuisine\n`;
    section += `- Explore night markets or enjoy the night view\n\n`;

    return section;
}

function generateDetailedItinerary(
    realData: PlacesData,
    days: number,
    destination: string
): string {
    let section = `## Detailed Itinerary\n\n`;
    section += `> Route optimized by geographic proximity - attractions and restaurants are clustered by area to minimize travel time.\n\n`;

    const { attractions, restaurants, hotels } = realData;

    // Cluster attractions by day based on geographic proximity
    const dayPlans = clusterAttractionsByDay(attractions, days);

    // Assign nearby restaurants to each day
    assignRestaurantsToDays(dayPlans, restaurants);

    for (let day = 1; day <= days; day++) {
        section += `### Day ${day}\n\n`;

        if (day === 1) {
            const dayPlan = dayPlans[0] || { attractions: [], restaurants: [] };
            // First day: use first cluster's restaurant if available, or first restaurant
            const firstDayRestaurants = dayPlan.restaurants.length > 0 ? dayPlan.restaurants :
                (dayPlans[1]?.restaurants.length > 0 ? dayPlans[1].restaurants : restaurants);
            section += generateDayOneOptimized(destination, hotels, attractions, firstDayRestaurants);
        } else if (day === days) {
            section += generateLastDay(destination);
        } else {
            const dayPlan = dayPlans[day - 1];
            if (dayPlan && dayPlan.attractions.length > 0) {
                section += generateMiddleDayOptimized(day, destination, dayPlan);
            } else {
                section += generateMiddleDay(day, destination, attractions, restaurants, attractions.length > 0);
            }
        }
    }

    return section;
}

function generateTipsSection(destination: string, preferences?: string): string {
    let section = `## Travel Tips\n\n`;
    section += `- **Essentials**: ID/Passport, power bank, medicine, comfortable shoes\n`;
    section += `- **Booking**: Book popular attractions in advance to avoid long queues\n`;
    section += `- **Transportation**: Use public transit or ride-sharing apps\n`;
    section += `- **Save Money**: Get transit passes, combo tickets, and check for discount days\n`;

    if (preferences) {
        section += `- **Your Interests**: ${preferences}\n`;
    }

    section += `\n**Have a wonderful trip to ${destination}!**\n`;
    return section;
}

export function createItineraryService(googlePlacesService: GooglePlacesService) {
    async function generateItinerary(request: ItineraryRequest): Promise<string> {
        const { destination, days, budget, preferences, currency = 'USD' } = request;

        const budgetInCNY = convertToCNY(budget, currency);
        const dailyBudgetCNY = Math.floor(budgetInCNY / days);

        let budgetLevel: string;
        if (dailyBudgetCNY < 300) budgetLevel = 'budget';
        else if (dailyBudgetCNY < 600) budgetLevel = 'mid';
        else budgetLevel = 'luxury';

        const accommodationBudgetCNY = Math.floor(budgetInCNY * 0.35);
        const budgetPerNightCNY = days > 1 ? Math.floor(accommodationBudgetCNY / (days - 1)) : accommodationBudgetCNY;

        let realData: PlacesData = { hotels: [], attractions: [], restaurants: [] };
        try {
            console.log(`Fetching data for ${destination} (budget level: ${budgetLevel}, per night: ¥${budgetPerNightCNY})...`);
            realData = await googlePlacesService.getRealPlacesData(destination, budgetLevel, budgetPerNightCNY);
            console.log(`Found: ${realData.hotels.length} hotels, ${realData.attractions.length} attractions, ${realData.restaurants.length} restaurants`);
        } catch (error) {
            console.error('Google API call failed:', (error as Error).message);
        }

        const currencySymbol = getCurrencySymbol(currency);

        let itinerary = `# ${destination} ${days}-Day Travel Plan\n\n`;

        itinerary += generateBudgetSection(budget, Math.floor(budget / days), budgetInCNY, currency, currencySymbol);
        itinerary += generateAccommodationSection(realData, days, budgetInCNY, currency, currencySymbol, destination);
        itinerary += generateDetailedItinerary(realData, days, destination);
        itinerary += generateTipsSection(destination, preferences);

        return itinerary;
    }

    return { generateItinerary };
}

export type ItineraryService = ReturnType<typeof createItineraryService>;
