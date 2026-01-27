import { GooglePlacesService } from './googlePlaces.service';

interface ItineraryRequest {
    destination: string;
    days: number;
    budget: number;
    currency?: string;
    preferences?: string;
}

interface PlacesData {
    hotels: any[];
    attractions: any[];
    restaurants: any[];
}

export class ItineraryService {
    private googlePlacesService: GooglePlacesService;

    private exchangeRates: { [key: string]: number } = {
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

    private currencySymbols: { [key: string]: string } = {
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

    constructor(googlePlacesService: GooglePlacesService) {
        this.googlePlacesService = googlePlacesService;
    }

    private convertToCNY(amount: number, currency: string): number {
        const rate = this.exchangeRates[currency] || 1;
        return Math.floor(amount * rate);
    }

    private convertFromCNY(amountCNY: number, currency: string): number {
        const rate = this.exchangeRates[currency] || 1;
        return Math.floor(amountCNY / rate);
    }

    private getCurrencySymbol(currency: string): string {
        return this.currencySymbols[currency] || '$';
    }

    private getPriceLevelText(priceLevel: number): string {
        const levels: { [key: number]: string } = {
            0: 'Free',
            1: 'Budget ($)',
            2: 'Moderate ($$)',
            3: 'Expensive ($$$)',
            4: 'Luxury ($$$$)'
        };
        return levels[priceLevel] || 'Unknown';
    }

    async generateItinerary(request: ItineraryRequest): Promise<string> {
        const { destination, days, budget, preferences, currency = 'USD' } = request;

        const budgetInCNY = this.convertToCNY(budget, currency);
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
            realData = await this.googlePlacesService.getRealPlacesData(destination, budgetLevel, budgetPerNightCNY);
            console.log(`Found: ${realData.hotels.length} hotels, ${realData.attractions.length} attractions, ${realData.restaurants.length} restaurants`);
        } catch (error) {
            console.error('Google API call failed:', (error as Error).message);
        }

        const currencySymbol = this.getCurrencySymbol(currency);

        let itinerary = `# ${destination} ${days}-Day Travel Plan\n\n`;

        itinerary += this.generateBudgetSection(budget, Math.floor(budget / days), budgetInCNY, dailyBudgetCNY, currency, currencySymbol);
        itinerary += this.generateAccommodationSection(realData, days, budgetInCNY, currency, currencySymbol, destination);
        itinerary += this.generateDetailedItinerary(realData, days, destination);
        itinerary += this.generateTipsSection(destination, preferences);

        return itinerary;
    }

    private generateBudgetSection(
        budget: number,
        dailyBudget: number,
        budgetInCNY: number,
        dailyBudgetCNY: number,
        currency: string,
        currencySymbol: string
    ): string {
        let section = `## Budget Overview\n\n`;
        section += `**Total Budget**: ${currencySymbol}${budget}\n`;
        section += `**Daily Budget**: ${currencySymbol}${dailyBudget}\n\n`;

        const accommodationBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.35), currency);
        const foodBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.25), currency);
        const transportBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.20), currency);
        const activityBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.15), currency);
        const otherBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.05), currency);

        section += `**Suggested Budget Allocation**:\n`;
        section += `- Accommodation: ${currencySymbol}${accommodationBudget} (35%)\n`;
        section += `- Food & Dining: ${currencySymbol}${foodBudget} (25%)\n`;
        section += `- Transportation: ${currencySymbol}${transportBudget} (20%)\n`;
        section += `- Activities & Tickets: ${currencySymbol}${activityBudget} (15%)\n`;
        section += `- Miscellaneous: ${currencySymbol}${otherBudget} (5%)\n\n`;
        return section;
    }

    private generateAccommodationSection(
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
        const accommodationBudget = this.convertFromCNY(accommodationBudgetCNY, currency);
        const budgetPerNight = this.convertFromCNY(budgetPerNightCNY, currency);

        section += `**Accommodation Budget**: ~${currencySymbol}${accommodationBudget} total, ~${currencySymbol}${budgetPerNight}/night\n\n`;

        if (realData.hotels.length > 0) {
            section += `**Recommended Hotels**:\n\n`;

            const hotelsToShow = Math.min(3, realData.hotels.length);
            for (let i = 0; i < hotelsToShow; i++) {
                const hotel = realData.hotels[i];
                section += `**${i + 1}. ${hotel.name}**\n`;
                section += `- Address: ${hotel.address}\n`;
                section += `- Rating: ${hotel.rating}\n`;
                section += `- Price Level: ${this.getPriceLevelText(hotel.priceLevel)}\n\n`;
            }
        } else {
            section += `**Booking Tips**:\n`;
            section += `- Look for hotels in ${destination} city center or near main attractions\n`;
            section += `- Use Booking.com, Agoda, Airbnb, or Hotels.com to compare prices\n`;
            section += `- Book 1-2 weeks in advance for better rates\n\n`;
        }

        const priceRangeLow = this.convertFromCNY(Math.floor(budgetPerNightCNY * 0.8), currency);
        const priceRangeHigh = this.convertFromCNY(Math.floor(budgetPerNightCNY * 1.2), currency);

        section += `**Booking Tips**:\n`;
        section += `- Suggested price range: ${currencySymbol}${priceRangeLow}-${currencySymbol}${priceRangeHigh}/night\n`;
        section += `- ${totalNights} nights, estimated total: ${currencySymbol}${budgetPerNight * totalNights}\n\n`;

        return section;
    }

    private generateDetailedItinerary(
        realData: PlacesData,
        days: number,
        destination: string
    ): string {
        let section = `## Detailed Itinerary\n\n`;

        const { attractions, restaurants, hotels } = realData;
        const hasData = attractions.length > 0;

        for (let day = 1; day <= days; day++) {
            section += `### Day ${day}\n\n`;

            if (day === 1) {
                section += this.generateDayOne(destination, hotels, attractions, restaurants);
            } else if (day === days) {
                section += this.generateLastDay(destination);
            } else {
                section += this.generateMiddleDay(day, destination, attractions, restaurants, hasData);
            }
        }

        return section;
    }

    private generateDayOne(
        destination: string,
        hotels: any[],
        attractions: any[],
        restaurants: any[]
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
        if (restaurants.length > 0) {
            section += `- Recommended: ${restaurants[0].name}\n`;
            section += `- Address: ${restaurants[0].address}\n`;
            section += `- Rating: ${restaurants[0].rating}\n`;
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
        if (restaurants.length > 1) {
            section += `- Recommended: ${restaurants[1].name}\n`;
            section += `- Address: ${restaurants[1].address}\n`;
        } else {
            section += `- Enjoy local cuisine\n`;
        }
        section += `- Explore the nightlife of ${destination}\n\n`;

        return section;
    }

    private generateLastDay(destination: string): string {
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

    private generateMiddleDay(
        day: number,
        destination: string,
        attractions: any[],
        restaurants: any[],
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

    private generateTipsSection(destination: string, preferences?: string): string {
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
}
