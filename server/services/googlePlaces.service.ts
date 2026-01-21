import axios from 'axios';

interface PlaceResult {
    name: string;
    formatted_address?: string;
    vicinity?: string;
    rating?: number;
    price_level?: number;
}

interface PlacesData {
    hotels: Array<{
        name: string;
        address: string;
        rating: string;
        priceLevel: number;
        area: string;
    }>;
    attractions: Array<{
        name: string;
        address: string;
        rating: string;
        area: string;
    }>;
    restaurants: Array<{
        name: string;
        address: string;
        rating: string;
        priceLevel: number;
        area: string;
    }>;
}

export class GooglePlacesService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // 搜索地点
    async searchPlaces(query: string, location: string, type: string = 'tourist_attraction'): Promise<PlaceResult[]> {
        try {
            const searchQuery = location ? `${query} in ${location}` : query;

            const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
                params: {
                    query: searchQuery,
                    type: type,
                    key: this.apiKey
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

    // 获取真实的酒店、景点、餐厅数据
    async getRealPlacesData(destination: string, budgetLevel: string, budgetPerNight?: number): Promise<PlacesData> {
        const placesData: PlacesData = {
            hotels: [],
            attractions: [],
            restaurants: []
        };

        try {
            // 根据预算等级确定搜索词和价格等级范围
            let hotelQuery: string;
            let targetPriceLevels: number[];

            if (budgetPerNight) {
                // 根据每晚预算确定价格等级
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
                // 使用预算等级
                hotelQuery = budgetLevel === 'budget' ? 'budget hotel hostel' :
                            budgetLevel === 'mid' ? 'hotel' : 'luxury hotel';
                targetPriceLevels = budgetLevel === 'budget' ? [0, 1] :
                                   budgetLevel === 'mid' ? [1, 2] : [2, 3, 4];
            }

            const hotels = await this.searchPlaces(`${hotelQuery} ${destination}`, '', 'lodging');
            console.log(`找到 ${hotels.length} 个酒店`);

            // 搜索热门景点
            const attractions = await this.searchPlaces(`top attractions ${destination}`, '', 'tourist_attraction');
            console.log(`找到 ${attractions.length} 个景点`);

            // 搜索餐厅
            const restaurantQuery = budgetLevel === 'budget' ? 'cheap restaurant' :
                                   budgetLevel === 'mid' ? 'restaurant' : 'fine dining';
            const restaurants = await this.searchPlaces(`${restaurantQuery} ${destination}`, '', 'restaurant');
            console.log(`找到 ${restaurants.length} 个餐厅`);

            // 处理酒店数据 - 筛选符合预算的酒店
            const filteredHotels = hotels.filter(hotel => {
                const priceLevel = hotel.price_level !== undefined ? hotel.price_level : 2;
                return targetPriceLevels.includes(priceLevel);
            });

            console.log(`筛选后符合预算的酒店: ${filteredHotels.length} 个`);

            // 如果筛选后没有酒店，使用所有酒店
            const hotelsToUse = filteredHotels.length > 0 ? filteredHotels : hotels;

            for (let i = 0; i < Math.min(5, hotelsToUse.length); i++) {
                const hotel = hotelsToUse[i];
                placesData.hotels.push({
                    name: hotel.name,
                    address: hotel.formatted_address || hotel.vicinity || '地址未提供',
                    rating: hotel.rating ? hotel.rating.toString() : 'N/A',
                    priceLevel: hotel.price_level !== undefined ? hotel.price_level : 2,
                    area: this.extractArea(hotel.formatted_address || hotel.vicinity)
                });
            }

            // 处理景点数据
            for (let i = 0; i < Math.min(7, attractions.length); i++) {
                const attr = attractions[i];
                placesData.attractions.push({
                    name: attr.name,
                    address: attr.formatted_address || attr.vicinity || '地址未提供',
                    rating: attr.rating ? attr.rating.toString() : 'N/A',
                    area: this.extractArea(attr.formatted_address || attr.vicinity)
                });
            }

            // 处理餐厅数据
            for (let i = 0; i < Math.min(3, restaurants.length); i++) {
                const rest = restaurants[i];
                placesData.restaurants.push({
                    name: rest.name,
                    address: rest.formatted_address || rest.vicinity || '地址未提供',
                    rating: rest.rating ? rest.rating.toString() : 'N/A',
                    priceLevel: rest.price_level || 0,
                    area: this.extractArea(rest.formatted_address || rest.vicinity)
                });
            }

        } catch (error) {
            console.error('Error fetching real places data:', (error as Error).message);
        }

        return placesData;
    }

    // 从完整地址提取区域名称
    private extractArea(address?: string): string {
        if (!address) return '未知区域';

        // 提取中文地址中的区/街道
        const match = address.match(/([^,，]+?[区县市街道路])/);
        if (match) return match[1];

        // 提取英文地址的区域
        const parts = address.split(',');
        if (parts.length >= 2) return parts[1].trim();

        return address.split(',')[0] || '未知区域';
    }
}
