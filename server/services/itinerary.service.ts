import { GooglePlacesService } from './googlePlaces.service';
import { destinationData } from '../data/destinations';

interface ItineraryRequest {
    destination: string;
    days: number;
    budget: number;
    currency?: string;
    preferences?: string;
}

export class ItineraryService {
    private googlePlacesService: GooglePlacesService;

    // 汇率映射（相对于人民币）
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

    // 货币符号
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

    // 转换为人民币
    private convertToCNY(amount: number, currency: string): number {
        const rate = this.exchangeRates[currency] || 1;
        return Math.floor(amount * rate);
    }

    // 从人民币转换为指定货币
    private convertFromCNY(amountCNY: number, currency: string): number {
        const rate = this.exchangeRates[currency] || 1;
        return Math.floor(amountCNY / rate);
    }

    // 获取货币符号
    private getCurrencySymbol(currency: string): string {
        return this.currencySymbols[currency] || '¥';
    }

    // 获取价格等级文本
    private getPriceLevelText(priceLevel: number): string {
        const levels: { [key: number]: string } = {
            0: '免费',
            1: '经济型 ($)',
            2: '中档 ($$)',
            3: '高档 ($$$)',
            4: '豪华 ($$$$)'
        };
        return levels[priceLevel] || '未知';
    }

    async generateItinerary(request: ItineraryRequest): Promise<string> {
        const { destination, days, budget, preferences, currency = 'CNY' } = request;

        // 转换为人民币进行计算
        const budgetInCNY = this.convertToCNY(budget, currency);
        const dailyBudgetCNY = Math.floor(budgetInCNY / days);

        // 确定预算等级（基于人民币）
        let budgetLevel: string;
        if (dailyBudgetCNY < 300) budgetLevel = 'budget';
        else if (dailyBudgetCNY < 600) budgetLevel = 'mid';
        else budgetLevel = 'luxury';

        // 计算每晚住宿预算（人民币）
        const accommodationBudgetCNY = Math.floor(budgetInCNY * 0.35);
        const budgetPerNightCNY = days > 1 ? Math.floor(accommodationBudgetCNY / (days - 1)) : accommodationBudgetCNY;

        // 尝试获取真实API数据，传入预算信息用于筛选
        console.log(`正在获取 ${destination} 的真实数据（预算等级: ${budgetLevel}，每晚预算: ¥${budgetPerNightCNY}）...`);
        const realData = await this.googlePlacesService.getRealPlacesData(destination, budgetLevel, budgetPerNightCNY);

        // 获取本地数据作为备用
        const destData = destinationData[destination];
        const hasDetailedData = !!destData;

        // 判断是否使用真实数据
        const useRealData = realData.hotels.length > 0 || realData.attractions.length > 0;

        let itinerary = `# ${destination} ${days}天旅行计划\n\n`;

        // 预算总览
        const currencySymbol = this.getCurrencySymbol(currency);
        itinerary += this.generateBudgetSection(budget, Math.floor(budget / days), budgetInCNY, dailyBudgetCNY, currency, currencySymbol);

        // 住宿推荐
        itinerary += this.generateAccommodationSection(
            useRealData, realData, hasDetailedData, destData, budgetLevel, days, budgetInCNY, currency, currencySymbol
        );

        // 详细行程
        itinerary += await this.generateDetailedItinerary(
            useRealData, realData, hasDetailedData, destData, budgetLevel, days, destination
        );

        // 交通信息
        if (hasDetailedData && destData.transport) {
            itinerary += `## 🚇 交通信息\n\n`;
            itinerary += `${destData.transport}\n\n`;
        }

        // 实用贴士
        itinerary += this.generateTipsSection(preferences);

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
        let section = `## 💰 预算总览\n\n`;
        section += `**总预算**: ${currencySymbol}${budget}`;
        if (currency !== 'CNY') {
            section += ` (约¥${budgetInCNY})`;
        }
        section += `\n`;
        section += `**日均预算**: ${currencySymbol}${dailyBudget}`;
        if (currency !== 'CNY') {
            section += ` (约¥${dailyBudgetCNY})`;
        }
        section += `\n\n`;

        // 计算各项预算并转换为用户货币
        const accommodationBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.35), currency);
        const foodBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.25), currency);
        const transportBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.20), currency);
        const activityBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.15), currency);
        const otherBudget = this.convertFromCNY(Math.floor(budgetInCNY * 0.05), currency);

        section += `**预算分配建议**:\n`;
        section += `- 住宿: ${currencySymbol}${accommodationBudget} (35%)\n`;
        section += `- 餐饮: ${currencySymbol}${foodBudget} (25%)\n`;
        section += `- 交通: ${currencySymbol}${transportBudget} (20%)\n`;
        section += `- 门票/活动: ${currencySymbol}${activityBudget} (15%)\n`;
        section += `- 其他/备用: ${currencySymbol}${otherBudget} (5%)\n\n`;
        return section;
    }

    private generateAccommodationSection(
        useRealData: boolean,
        realData: any,
        hasDetailedData: boolean,
        destData: any,
        budgetLevel: string,
        days: number,
        totalBudgetCNY: number,
        currency: string,
        currencySymbol: string
    ): string {
        let section = `## 🏨 住宿推荐\n\n`;
        const totalNights = days - 1;

        // 计算住宿预算（人民币）
        const accommodationBudgetCNY = Math.floor(totalBudgetCNY * 0.35);
        const budgetPerNightCNY = totalNights > 0 ? Math.floor(accommodationBudgetCNY / totalNights) : 0;

        // 转换为用户货币
        const accommodationBudget = this.convertFromCNY(accommodationBudgetCNY, currency);
        const budgetPerNight = this.convertFromCNY(budgetPerNightCNY, currency);

        if (useRealData && realData.hotels.length > 0) {
            // 添加预算说明（用户货币）
            section += `**💰 住宿预算**: 总预算的35%约为 ${currencySymbol}${accommodationBudget}，平均每晚 ${currencySymbol}${budgetPerNight}`;
            if (currency !== 'CNY') {
                section += ` (约¥${budgetPerNightCNY}/晚)`;
            }
            section += `\n\n`;

            section += `**✅ 根据您的预算，我们为您推荐以下符合价位的酒店**：\n\n`;

            // 显示筛选后的酒店
            const hotelsToShow = Math.min(3, realData.hotels.length);
            for (let i = 0; i < hotelsToShow; i++) {
                const hotel = realData.hotels[i];
                section += `**推荐酒店${i + 1}**: ${hotel.name}\n`;
                section += `- 📍 地址: ${hotel.address}\n`;
                section += `- ⭐ 评分: ${hotel.rating}\n`;
                section += `- 💵 价格等级: ${this.getPriceLevelText(hotel.priceLevel)}\n`;
                section += `- 📌 位置: ${hotel.area}\n\n`;
            }

            const priceRangeLow = this.convertFromCNY(Math.floor(budgetPerNightCNY * 0.8), currency);
            const priceRangeHigh = this.convertFromCNY(Math.floor(budgetPerNightCNY * 1.2), currency);
            const totalCost = budgetPerNight * totalNights;

            section += `**预订提示**:\n`;
            section += `- 推荐预订平台: Booking.com, Agoda, 携程, Airbnb\n`;
            section += `- 建议价格范围: ${currencySymbol}${priceRangeLow}-${currencySymbol}${priceRangeHigh}/晚\n`;
            section += `- 提前1-2周预订可获得更优价格\n`;
            section += `- 入住${totalNights}晚，预计总花费: ${currencySymbol}${totalCost}\n\n`;
        } else if (hasDetailedData) {
            const hotels = destData.hotels[budgetLevel];
            const hotel = hotels[0];
            const totalHotelCost = hotel.price * totalNights;

            section += `**推荐酒店**: ${hotel.name}\n`;
            section += `- 位置: ${hotel.area}\n`;
            section += `- 参考价格: ¥${hotel.price}/晚\n`;
            section += `- 入住${totalNights}晚总计: ¥${totalHotelCost}\n\n`;

            if (hotels.length > 1) {
                section += `**备选酒店**: ${hotels[1].name} (${hotels[1].area}，¥${hotels[1].price}/晚)\n\n`;
            }
        }

        return section;
    }

    private async generateDetailedItinerary(
        useRealData: boolean,
        realData: any,
        hasDetailedData: boolean,
        destData: any,
        budgetLevel: string,
        days: number,
        destination: string
    ): Promise<string> {
        let section = `## 📅 详细行程\n\n`;

        // 准备景点和餐厅数据
        let attractions: any, restaurants: any;

        if (useRealData && realData.attractions.length > 0) {
            attractions = realData.attractions;
            restaurants = realData.restaurants.length > 0 ? realData.restaurants :
                         (hasDetailedData ? destData.restaurants[budgetLevel] : []);
        } else if (hasDetailedData) {
            attractions = destData.attractions;
            restaurants = destData.restaurants[budgetLevel];
        }

        if ((useRealData && attractions) || hasDetailedData) {
            for (let day = 1; day <= days; day++) {
                section += `### 第${day}天\n\n`;

                if (day === 1) {
                    section += this.generateDayOneItinerary(
                        useRealData, realData, hasDetailedData, destData, budgetLevel,
                        destination, attractions, restaurants
                    );
                } else if (day === days) {
                    section += this.generateLastDayItinerary(destination);
                } else {
                    section += this.generateMiddleDayItinerary(day, attractions, restaurants);
                }
            }
        } else {
            // 通用模板
            for (let day = 1; day <= days; day++) {
                section += `### 第${day}天\n\n`;
                if (day === 1) {
                    section += `**上午**: 抵达${destination}，办理酒店入住\n`;
                    section += `**下午**: 市中心核心景区游览\n`;
                    section += `**晚上**: 体验当地美食\n\n`;
                } else if (day === days) {
                    section += `**上午**: 最后采购与收拾，退房\n`;
                    section += `**下午**: 返程\n\n`;
                } else {
                    section += `**上午**: 热门景点深度游\n`;
                    section += `**下午**: 文化体验/特色街区\n`;
                    section += `**晚上**: 当地特色演出/夜市\n\n`;
                }
            }
        }

        return section;
    }

    private generateDayOneItinerary(
        useRealData: boolean, realData: any, hasDetailedData: boolean,
        destData: any, budgetLevel: string, destination: string,
        attractions: any, restaurants: any
    ): string {
        let section = '';

        const hotel = useRealData && realData.hotels.length > 0 ? realData.hotels[0] :
                     (hasDetailedData ? destData.hotels[budgetLevel][0] : null);
        const restaurant = restaurants && restaurants.length > 0 ? restaurants[0] : null;

        section += `**上午 9:00-12:00**: 抵达${destination}\n`;
        if (hotel) {
            section += `- 办理酒店入住：${hotel.name}\n`;
            if (hotel.address) section += `- 地址：${hotel.address}\n`;
            else if (hotel.area) section += `- 位置：${hotel.area}\n`;
        }
        section += `- 稍作休息，整理行李\n\n`;

        section += `**中午 12:00-13:30**: 午餐\n`;
        if (restaurant) {
            section += `- 推荐：${restaurant.name}\n`;
            if (restaurant.address) section += `- 地址：${restaurant.address}\n`;
            if (restaurant.rating) section += `- 评分：${restaurant.rating}⭐\n`;
            if (restaurant.price) section += `- 人均消费：¥${restaurant.price}\n`;
            if (restaurant.type) section += `- 菜系：${restaurant.type}\n`;
        }
        section += `\n`;

        const attraction1 = attractions && attractions.length > 0 ? attractions[0] : null;
        if (attraction1) {
            section += `**下午 14:00-17:30**: ${attraction1.name}\n`;
            if (attraction1.address) section += `- 地址：${attraction1.address}\n`;
            if (attraction1.rating) section += `- 评分：${attraction1.rating}⭐\n`;
            if (attraction1.price !== undefined) section += `- 门票：¥${attraction1.price}\n`;
            if (attraction1.duration) section += `- 游玩时长：${attraction1.duration}\n`;
            if (attraction1.area && !attraction1.address) section += `- 位置：${attraction1.area}\n`;
            section += `\n`;
        }

        // 晚餐建议
        const dinnerRestaurant = restaurants && restaurants.length > 1 ? restaurants[1] : restaurant;
        if (dinnerRestaurant) {
            section += `**晚上 18:30-20:00**: 晚餐\n`;
            section += `- 推荐：${dinnerRestaurant.name}\n`;
            if (dinnerRestaurant.address) section += `- 地址：${dinnerRestaurant.address}\n`;
            if (dinnerRestaurant.rating) section += `- 评分：${dinnerRestaurant.rating}⭐\n`;
            section += `- 享受当地美食，体验夜生活\n\n`;
        }

        return section;
    }

    private generateLastDayItinerary(destination: string): string {
        let section = `**上午 8:00-10:00**: 早餐 & 最后购物\n`;
        section += `- 在酒店附近享用早餐\n`;
        section += `- 购买纪念品和特产\n\n`;
        section += `**上午 10:00-11:30**: 退房\n`;
        section += `- 整理行李，办理退房手续\n\n`;
        section += `**下午**: 返程\n`;
        section += `- 前往机场/车站\n`;
        section += `- 结束愉快的${destination}之旅\n\n`;
        return section;
    }

    private generateMiddleDayItinerary(day: number, attractions: any, restaurants: any): string {
        let section = '';
        const startIdx = (day - 1) * 2;
        const morningAttraction = attractions[startIdx % attractions.length];
        const afternoonAttraction = attractions[(startIdx + 1) % attractions.length];

        // 早餐
        if (restaurants && restaurants.length > 0) {
            const breakfastRestaurant = restaurants[(day - 1) % restaurants.length];
            section += `**早上 8:00-9:00**: 早餐\n`;
            section += `- 建议在酒店附近享用早餐，或前往 ${breakfastRestaurant.name}\n`;
            if (breakfastRestaurant.area || breakfastRestaurant.address) {
                section += `- 位置：${breakfastRestaurant.area || breakfastRestaurant.address}\n`;
            }
            section += `\n`;
        }

        if (morningAttraction) {
            section += `**上午 9:30-12:00**: ${morningAttraction.name}\n`;
            if (morningAttraction.address) section += `- 地址：${morningAttraction.address}\n`;
            if (morningAttraction.rating) section += `- 评分：${morningAttraction.rating}⭐\n`;
            if (morningAttraction.price !== undefined) section += `- 门票：¥${morningAttraction.price}\n`;
            if (morningAttraction.duration) section += `- 游玩时长：${morningAttraction.duration}\n`;
            section += `\n`;
        }

        if (restaurants && restaurants.length > 0) {
            const lunchRestaurant = restaurants[day % restaurants.length];
            section += `**中午 12:30-14:00**: 午餐\n`;
            section += `- 推荐：${lunchRestaurant.name}\n`;
            if (lunchRestaurant.address) section += `- 地址：${lunchRestaurant.address}\n`;
            if (lunchRestaurant.rating) section += `- 评分：${lunchRestaurant.rating}⭐\n`;
            if (lunchRestaurant.price) section += `- 人均消费：¥${lunchRestaurant.price}\n`;
            section += `\n`;
        }

        if (afternoonAttraction) {
            section += `**下午 14:30-18:00**: ${afternoonAttraction.name}\n`;
            if (afternoonAttraction.address) section += `- 地址：${afternoonAttraction.address}\n`;
            if (afternoonAttraction.rating) section += `- 评分：${afternoonAttraction.rating}⭐\n`;
            section += `\n`;
        }

        // 晚餐建议
        if (restaurants && restaurants.length > 1) {
            const dinnerRestaurant = restaurants[(day + 1) % restaurants.length];
            section += `**晚上 19:00-20:30**: 晚餐\n`;
            section += `- 推荐：${dinnerRestaurant.name}\n`;
            if (dinnerRestaurant.address) section += `- 地址：${dinnerRestaurant.address}\n`;
            if (dinnerRestaurant.rating) section += `- 评分：${dinnerRestaurant.rating}⭐\n`;
            section += `\n`;
        }

        section += `**晚上 21:30**: 返回酒店休息\n\n`;
        return section;
    }

    private generateTipsSection(preferences?: string): string {
        let section = `## 💡 实用贴士\n\n`;
        section += `- **必备物品**: 身份证件、充电宝、常用药品、舒适鞋子\n`;
        section += `- **预订建议**: 提前预订热门景点门票，避开高峰时段\n`;
        section += `- **省钱技巧**: 购买交通通票、选择套票组合、关注景点优惠日\n`;

        if (preferences) {
            section += `- **特别关注**: ${preferences}\n`;
        }

        section += `\n**祝您旅途愉快！** 🎉\n`;
        return section;
    }
}
