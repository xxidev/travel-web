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

        // 获取 Google Places API 数据
        let realData: PlacesData = { hotels: [], attractions: [], restaurants: [] };
        try {
            console.log(`正在获取 ${destination} 的数据（预算等级: ${budgetLevel}，每晚预算: ¥${budgetPerNightCNY}）...`);
            realData = await this.googlePlacesService.getRealPlacesData(destination, budgetLevel, budgetPerNightCNY);
            console.log(`获取到: ${realData.hotels.length} 个酒店, ${realData.attractions.length} 个景点, ${realData.restaurants.length} 个餐厅`);
        } catch (error) {
            console.error('Google API调用失败:', (error as Error).message);
        }

        const currencySymbol = this.getCurrencySymbol(currency);

        let itinerary = `# ${destination} ${days}天旅行计划\n\n`;

        // 预算总览
        itinerary += this.generateBudgetSection(budget, Math.floor(budget / days), budgetInCNY, dailyBudgetCNY, currency, currencySymbol);

        // 住宿推荐
        itinerary += this.generateAccommodationSection(realData, days, budgetInCNY, currency, currencySymbol, destination);

        // 详细行程
        itinerary += this.generateDetailedItinerary(realData, days, destination);

        // 实用贴士
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
        realData: PlacesData,
        days: number,
        totalBudgetCNY: number,
        currency: string,
        currencySymbol: string,
        destination: string
    ): string {
        let section = `## 🏨 住宿推荐\n\n`;
        const totalNights = days - 1;

        const accommodationBudgetCNY = Math.floor(totalBudgetCNY * 0.35);
        const budgetPerNightCNY = totalNights > 0 ? Math.floor(accommodationBudgetCNY / totalNights) : 0;
        const accommodationBudget = this.convertFromCNY(accommodationBudgetCNY, currency);
        const budgetPerNight = this.convertFromCNY(budgetPerNightCNY, currency);

        section += `**💰 住宿预算**: 总预算的35%约为 ${currencySymbol}${accommodationBudget}，平均每晚 ${currencySymbol}${budgetPerNight}`;
        if (currency !== 'CNY') {
            section += ` (约¥${budgetPerNightCNY}/晚)`;
        }
        section += `\n\n`;

        if (realData.hotels.length > 0) {
            section += `**为您推荐以下酒店**：\n\n`;

            const hotelsToShow = Math.min(3, realData.hotels.length);
            for (let i = 0; i < hotelsToShow; i++) {
                const hotel = realData.hotels[i];
                section += `**${i + 1}. ${hotel.name}**\n`;
                section += `- 📍 地址: ${hotel.address}\n`;
                section += `- ⭐ 评分: ${hotel.rating}\n`;
                section += `- 💵 价格等级: ${this.getPriceLevelText(hotel.priceLevel)}\n\n`;
            }
        } else {
            section += `**住宿建议**:\n`;
            section += `- 推荐在${destination}市中心或主要景区附近选择酒店\n`;
            section += `- 可通过携程、Booking.com、Agoda、Airbnb等平台预订\n`;
            section += `- 提前1-2周预订可获得更优惠的价格\n\n`;
        }

        const priceRangeLow = this.convertFromCNY(Math.floor(budgetPerNightCNY * 0.8), currency);
        const priceRangeHigh = this.convertFromCNY(Math.floor(budgetPerNightCNY * 1.2), currency);

        section += `**预订提示**:\n`;
        section += `- 建议价格范围: ${currencySymbol}${priceRangeLow}-${currencySymbol}${priceRangeHigh}/晚\n`;
        section += `- 入住${totalNights}晚，预计总花费: ${currencySymbol}${budgetPerNight * totalNights}\n\n`;

        return section;
    }

    private generateDetailedItinerary(
        realData: PlacesData,
        days: number,
        destination: string
    ): string {
        let section = `## 📅 详细行程\n\n`;

        const { attractions, restaurants, hotels } = realData;
        const hasData = attractions.length > 0;

        for (let day = 1; day <= days; day++) {
            section += `### 第${day}天\n\n`;

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

        section += `**上午 9:00-12:00**: 抵达${destination}\n`;
        if (hotels.length > 0) {
            section += `- 办理酒店入住：${hotels[0].name}\n`;
            section += `- 地址：${hotels[0].address}\n`;
        } else {
            section += `- 办理酒店入住\n`;
        }
        section += `- 稍作休息，整理行李\n\n`;

        section += `**中午 12:00-13:30**: 午餐\n`;
        if (restaurants.length > 0) {
            section += `- 推荐：${restaurants[0].name}\n`;
            section += `- 地址：${restaurants[0].address}\n`;
            section += `- 评分：${restaurants[0].rating}⭐\n`;
        } else {
            section += `- 在酒店附近寻找当地特色餐厅\n`;
            section += `- 推荐使用大众点评、美团等APP查找\n`;
        }
        section += `\n`;

        section += `**下午 14:00-17:30**: 景点游览\n`;
        if (attractions.length > 0) {
            section += `- ${attractions[0].name}\n`;
            section += `- 地址：${attractions[0].address}\n`;
            section += `- 评分：${attractions[0].rating}⭐\n`;
        } else {
            section += `- 游览${destination}的标志性景点\n`;
            section += `- 建议提前在网上搜索热门景点并预约门票\n`;
        }
        section += `\n`;

        section += `**晚上 18:30-20:30**: 晚餐 & 夜游\n`;
        if (restaurants.length > 1) {
            section += `- 推荐：${restaurants[1].name}\n`;
            section += `- 地址：${restaurants[1].address}\n`;
        } else {
            section += `- 品尝${destination}当地特色美食\n`;
        }
        section += `- 饭后可以欣赏${destination}夜景\n\n`;

        return section;
    }

    private generateLastDay(destination: string): string {
        let section = '';

        section += `**上午 8:00-10:00**: 早餐 & 购物\n`;
        section += `- 在酒店附近享用早餐\n`;
        section += `- 购买当地特产和纪念品\n\n`;

        section += `**上午 10:00-11:30**: 退房\n`;
        section += `- 整理行李，办理退房手续\n\n`;

        section += `**下午**: 返程\n`;
        section += `- 前往机场/车站\n`;
        section += `- 结束愉快的${destination}之旅\n\n`;

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

        section += `**上午 9:00-12:00**: 景点游览\n`;
        if (hasData && attractions[attrIndex % attractions.length]) {
            const attr = attractions[attrIndex % attractions.length];
            section += `- ${attr.name}\n`;
            section += `- 地址：${attr.address}\n`;
            section += `- 评分：${attr.rating}⭐\n`;
        } else {
            section += `- 探索${destination}的热门景点\n`;
            section += `- 建议提前规划路线\n`;
        }
        section += `\n`;

        section += `**中午 12:30-14:00**: 午餐\n`;
        if (hasData && restaurants[restIndex % restaurants.length]) {
            const rest = restaurants[restIndex % restaurants.length];
            section += `- 推荐：${rest.name}\n`;
            section += `- 地址：${rest.address}\n`;
        } else {
            section += `- 在景点附近寻找当地美食\n`;
        }
        section += `\n`;

        section += `**下午 14:30-18:00**: 继续探索\n`;
        if (hasData && attractions[(attrIndex + 1) % attractions.length]) {
            const attr = attractions[(attrIndex + 1) % attractions.length];
            section += `- ${attr.name}\n`;
            section += `- 地址：${attr.address}\n`;
            section += `- 评分：${attr.rating}⭐\n`;
        } else {
            section += `- 参观博物馆、历史街区或特色街道\n`;
            section += `- 体验${destination}当地文化\n`;
        }
        section += `\n`;

        section += `**晚上 19:00-21:00**: 晚餐 & 休闲\n`;
        section += `- 品尝当地美食\n`;
        section += `- 逛夜市或欣赏夜景\n\n`;

        return section;
    }

    private generateTipsSection(destination: string, preferences?: string): string {
        let section = `## 💡 实用贴士\n\n`;
        section += `- **必备物品**: 身份证件、充电宝、常用药品、舒适鞋子\n`;
        section += `- **预订建议**: 提前预订热门景点门票，避开高峰时段\n`;
        section += `- **交通出行**: 可使用当地公共交通或打车软件\n`;
        section += `- **省钱技巧**: 购买交通通票、选择套票组合、关注景点优惠日\n`;

        if (preferences) {
            section += `- **特别关注**: ${preferences}\n`;
        }

        section += `\n**祝您在${destination}旅途愉快！** 🎉\n`;
        return section;
    }
}
