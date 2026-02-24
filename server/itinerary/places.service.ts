import axios from 'axios';

interface PlaceResult {
    name: string;
    formatted_address?: string;
    vicinity?: string;
    rating?: number;
    price_level?: number;
    geometry?: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

interface PlacesData {
    hotels: Array<{
        name: string;
        address: string;
        rating: string;
        priceLevel: number;
        area: string;
        lat?: number;
        lng?: number;
    }>;
    attractions: Array<{
        name: string;
        address: string;
        rating: string;
        area: string;
        lat?: number;
        lng?: number;
    }>;
    restaurants: Array<{
        name: string;
        address: string;
        rating: string;
        priceLevel: number;
        area: string;
        lat?: number;
        lng?: number;
    }>;
}

// Extract area name from full address
function extractArea(address?: string): string {
    if (!address) return 'Unknown area';

    const parts = address.split(',');
    if (parts.length >= 2) return parts[1].trim();

    return parts[0] || 'Unknown area';
}

// Search for places
async function searchPlaces(apiKey: string, query: string, location: string, type: string = 'tourist_attraction'): Promise<PlaceResult[]> {
    try {
        const searchQuery = location ? `${query} in ${location}` : query;

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                query: searchQuery,
                type: type,
                key: apiKey
            }
        });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error(`Google API error: ${response.data.status}`, response.data.error_message);
        }

        return response.data.results || [];
    } catch (error) {
        console.error('Error searching places:', (error as Error).message);
        return [];
    }
}

// Get real hotel, attraction, and restaurant data
async function getRealPlacesData(apiKey: string, destination: string, budgetLevel: string, budgetPerNight?: number): Promise<PlacesData> {
    const placesData: PlacesData = {
        hotels: [],
        attractions: [],
        restaurants: []
    };

    try {
        // Determine search terms and price level range based on budget
        let hotelQuery: string;
        let targetPriceLevels: number[];

        if (budgetPerNight) {
            // Determine price level based on nightly budget
            if (budgetPerNight < 200) {
                hotelQuery = 'budget hotel hostel';
                targetPriceLevels = [0, 1];
            } else if (budgetPerNight < 400) {
                hotelQuery = 'hotel affordable';
                targetPriceLevels = [1, 2];
            } else if (budgetPerNight < 800) {
                hotelQuery = 'hotel';
                targetPriceLevels = [2, 3];
            } else {
                hotelQuery = 'luxury hotel';
                targetPriceLevels = [3, 4];
            }
        } else {
            // Use budget level
            hotelQuery = budgetLevel === 'budget' ? 'budget hotel hostel' :
                        budgetLevel === 'mid' ? 'hotel' : 'luxury hotel';
            targetPriceLevels = budgetLevel === 'budget' ? [0, 1] :
                               budgetLevel === 'mid' ? [1, 2] : [2, 3, 4];
        }

        const hotels = await searchPlaces(apiKey, `${hotelQuery} ${destination}`, '', 'lodging');
        console.log(`Found ${hotels.length} hotels`);

        // Search for popular attractions
        const attractions = await searchPlaces(apiKey, `top attractions ${destination}`, '', 'tourist_attraction');
        console.log(`Found ${attractions.length} attractions`);

        // Search for restaurants
        const restaurantQuery = budgetLevel === 'budget' ? 'cheap restaurant' :
                               budgetLevel === 'mid' ? 'restaurant' : 'fine dining';
        const restaurants = await searchPlaces(apiKey, `${restaurantQuery} ${destination}`, '', 'restaurant');
        console.log(`Found ${restaurants.length} restaurants`);

        // Filter hotels by budget
        const filteredHotels = hotels.filter(hotel => {
            const priceLevel = hotel.price_level !== undefined ? hotel.price_level : 2;
            return targetPriceLevels.includes(priceLevel);
        });

        console.log(`Filtered hotels within budget: ${filteredHotels.length}`);

        // Use all hotels if no filtered results
        const hotelsToUse = filteredHotels.length > 0 ? filteredHotels : hotels;

        for (let i = 0; i < Math.min(5, hotelsToUse.length); i++) {
            const hotel = hotelsToUse[i];
            placesData.hotels.push({
                name: hotel.name,
                address: hotel.formatted_address || hotel.vicinity || 'Address not available',
                rating: hotel.rating ? hotel.rating.toString() : 'N/A',
                priceLevel: hotel.price_level !== undefined ? hotel.price_level : 2,
                area: extractArea(hotel.formatted_address || hotel.vicinity),
                lat: hotel.geometry?.location?.lat,
                lng: hotel.geometry?.location?.lng
            });
        }

        // Process attraction data - get more for better clustering
        for (let i = 0; i < Math.min(15, attractions.length); i++) {
            const attr = attractions[i];
            placesData.attractions.push({
                name: attr.name,
                address: attr.formatted_address || attr.vicinity || 'Address not available',
                rating: attr.rating ? attr.rating.toString() : 'N/A',
                area: extractArea(attr.formatted_address || attr.vicinity),
                lat: attr.geometry?.location?.lat,
                lng: attr.geometry?.location?.lng
            });
        }

        // Process restaurant data - get more for better matching
        for (let i = 0; i < Math.min(10, restaurants.length); i++) {
            const rest = restaurants[i];
            placesData.restaurants.push({
                name: rest.name,
                address: rest.formatted_address || rest.vicinity || 'Address not available',
                rating: rest.rating ? rest.rating.toString() : 'N/A',
                priceLevel: rest.price_level || 0,
                area: extractArea(rest.formatted_address || rest.vicinity),
                lat: rest.geometry?.location?.lat,
                lng: rest.geometry?.location?.lng
            });
        }

    } catch (error) {
        console.error('Error fetching real places data:', (error as Error).message);
    }

    return placesData;
}

export function createGooglePlacesService(apiKey: string) {
    return {
        searchPlaces: (query: string, location: string, type?: string) =>
            searchPlaces(apiKey, query, location, type),
        getRealPlacesData: (destination: string, budgetLevel: string, budgetPerNight?: number) =>
            getRealPlacesData(apiKey, destination, budgetLevel, budgetPerNight),
    };
}

export type GooglePlacesService = ReturnType<typeof createGooglePlacesService>;
