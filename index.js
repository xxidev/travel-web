const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 生成行程的API端点
app.post('/api/generate-itinerary', async (req, res) => {
    try {
        const { destination, startDate, endDate, budget, preferences } = req.body;

        // 验证必填字段
        if (!destination || !startDate || !endDate || !budget) {
            return res.status(400).json({ error: '请填写所有必填字段' });
        }

        // 计算旅行天数
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // 生成行程（调用真实API）
        const itinerary = await generateItinerary(destination, days, budget, preferences);

        res.json({ itinerary });

    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({
            error: '生成行程时出现错误',
            details: error.message
        });
    }
});

// ========== Google Places API 调用函数 ==========

// 搜索地点（酒店、景点、餐厅）
async function searchPlaces(query, location, type = 'tourist_attraction') {
    try {
        // 如果location为空，直接使用query
        const searchQuery = location ? `${query} in ${location}` : query;

        const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
            params: {
                query: searchQuery,
                type: type,
                key: GOOGLE_API_KEY
            }
        });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error(`Google API error: ${response.data.status}`, response.data.error_message);
        }

        return response.data.results || [];
    } catch (error) {
        console.error('Error searching places:', error.message);
        return [];
    }
}

// 获取地点详情
async function getPlaceDetails(placeId) {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
                place_id: placeId,
                fields: 'name,formatted_address,rating,opening_hours,price_level,photos,reviews,geometry',
                key: GOOGLE_API_KEY,
                language: 'zh-CN'
            }
        });

        return response.data.result || null;
    } catch (error) {
        console.error('Error getting place details:', error.message);
        return null;
    }
}

// 获取真实的酒店、景点、餐厅数据
async function getRealPlacesData(destination, budgetLevel) {
    const placesData = {
        hotels: [],
        attractions: [],
        restaurants: []
    };

    try {
        // 根据预算等级确定搜索词（使用英文以兼容全球城市）
        const hotelQuery = budgetLevel === 'budget' ? 'budget hotel' :
                          budgetLevel === 'mid' ? 'hotel' : 'luxury hotel';
        const hotels = await searchPlaces(`${hotelQuery} ${destination}`, '', 'lodging');
        console.log(`找到 ${hotels.length} 个酒店`);

        // 搜索热门景点
        const attractions = await searchPlaces(`top attractions ${destination}`, '', 'tourist_attraction');
        console.log(`找到 ${attractions.length} 个景点`);

        // 搜索餐厅
        const restaurantQuery = budgetLevel === 'budget' ? 'cheap restaurant' :
                               budgetLevel === 'mid' ? 'restaurant' : 'fine dining';
        const restaurants = await searchPlaces(`${restaurantQuery} ${destination}`, '', 'restaurant');
        console.log(`找到 ${restaurants.length} 个餐厅`);

        // 处理酒店数据
        for (let i = 0; i < Math.min(2, hotels.length); i++) {
            const hotel = hotels[i];
            placesData.hotels.push({
                name: hotel.name,
                address: hotel.formatted_address || hotel.vicinity || '地址未提供',
                rating: hotel.rating || 'N/A',
                priceLevel: hotel.price_level || 0,
                area: extractArea(hotel.formatted_address)
            });
        }

        // 处理景点数据
        for (let i = 0; i < Math.min(7, attractions.length); i++) {
            const attr = attractions[i];
            placesData.attractions.push({
                name: attr.name,
                address: attr.formatted_address || attr.vicinity || '地址未提供',
                rating: attr.rating || 'N/A',
                area: extractArea(attr.formatted_address)
            });
        }

        // 处理餐厅数据
        for (let i = 0; i < Math.min(3, restaurants.length); i++) {
            const rest = restaurants[i];
            placesData.restaurants.push({
                name: rest.name,
                address: rest.formatted_address || rest.vicinity || '地址未提供',
                rating: rest.rating || 'N/A',
                priceLevel: rest.price_level || 0,
                area: extractArea(rest.formatted_address)
            });
        }

    } catch (error) {
        console.error('Error fetching real places data:', error.message);
    }

    return placesData;
}

// 从完整地址提取区域名称
function extractArea(address) {
    if (!address) return '未知区域';

    // 提取中文地址中的区/街道
    const match = address.match(/([^,，]+?[区县市街道路])/);
    if (match) return match[1];

    // 提取英文地址的区域
    const parts = address.split(',');
    if (parts.length >= 2) return parts[1].trim();

    return address.split(',')[0] || '未知区域';
}

// 目的地数据库 - 全球热门旅游城市
const destinationData = {
    // ========== 亚洲 ==========
    '东京': {
        hotels: {
            budget: [
                { name: "K's House Tokyo", price: 180, area: '浅草' },
                { name: 'Grids Tokyo', price: 220, area: '秋叶原' }
            ],
            mid: [
                { name: '东急Stay新宿', price: 450, area: '新宿' },
                { name: 'Hotel Gracery Shinjuku', price: 520, area: '新宿' }
            ],
            luxury: [
                { name: '东京柏悦酒店', price: 2800, area: '新宿' },
                { name: '安缦东京', price: 4500, area: '大手町' }
            ]
        },
        attractions: [
            { name: '浅草寺', price: 0, duration: '2小时', area: '浅草' },
            { name: '东京国立博物馆', price: 70, duration: '3小时', area: '上野' },
            { name: '东京塔', price: 150, duration: '2小时', area: '芝公园' },
            { name: 'teamLab无界美术馆', price: 240, duration: '3小时', area: '台场' },
            { name: '明治神宫', price: 0, duration: '1.5小时', area: '原宿' },
            { name: '筑地外市场', price: 0, duration: '2小时', area: '筑地' },
            { name: '涩谷Sky观景台', price: 180, duration: '1.5小时', area: '涩谷' }
        ],
        restaurants: {
            budget: [
                { name: '一兰拉面', price: 65, type: '拉面' },
                { name: '松屋', price: 45, type: '快餐' }
            ],
            mid: [
                { name: '磯丸水产', price: 120, type: '海鲜居酒屋' },
                { name: '叙叙苑', price: 280, type: '烤肉' }
            ],
            luxury: [
                { name: 'Sukiyabashi Jiro', price: 2000, type: '寿司' },
                { name: 'Narisawa', price: 1800, type: '法餐' }
            ]
        },
        transport: '地铁一日券¥800，西瓜卡按次计费¥15-30/次'
    },
    '首尔': {
        hotels: {
            budget: [
                { name: 'K-Guesthouse', price: 150, area: '明洞' },
                { name: 'Philstay Myeongdong', price: 180, area: '明洞' }
            ],
            mid: [
                { name: 'Nine Tree Premier', price: 420, area: '明洞' },
                { name: 'Hotel Skypark', price: 480, area: '东大门' }
            ],
            luxury: [
                { name: '首尔四季酒店', price: 2200, area: '光化门' },
                { name: '乐天酒店', price: 1800, area: '明洞' }
            ]
        },
        attractions: [
            { name: '景福宫', price: 22, duration: '2.5小时', area: '钟路区' },
            { name: 'N首尔塔', price: 80, duration: '2小时', area: '南山' },
            { name: '北村韩屋村', price: 0, duration: '2小时', area: '钟路区' },
            { name: '国立中央博物馆', price: 0, duration: '3小时', area: '龙山区' },
            { name: '明洞购物街', price: 0, duration: '3小时', area: '中区' },
            { name: '弘大自由市场', price: 0, duration: '2小时', area: '麻浦区' },
            { name: '乐天世界', price: 380, duration: '5小时', area: '松坡区' }
        ],
        restaurants: {
            budget: [
                { name: '明洞饺子', price: 50, type: '韩餐' },
                { name: 'Isaac吐司', price: 25, type: '快餐' }
            ],
            mid: [
                { name: '全州中央会馆', price: 120, type: '韩定食' },
                { name: '八色烤肉', price: 150, type: '烤肉' }
            ],
            luxury: [
                { name: 'Jungsik', price: 800, type: '米其林二星' },
                { name: 'Mingles', price: 900, type: '米其林二星' }
            ]
        },
        transport: 'T-money卡，地铁单程¥8-12，出租车起步¥25'
    },
    '曼谷': {
        hotels: {
            budget: [
                { name: 'Lub d Bangkok Silom', price: 120, area: 'Silom' },
                { name: 'NapPark Hostel', price: 100, area: '考山路' }
            ],
            mid: [
                { name: 'Eastin Grand Sathorn', price: 380, area: 'Sathorn' },
                { name: 'Novotel Bangkok', price: 420, area: 'Sukhumvit' }
            ],
            luxury: [
                { name: '文华东方酒店', price: 2500, area: '湄南河畔' },
                { name: '曼谷半岛酒店', price: 2200, area: '湄南河畔' }
            ]
        },
        attractions: [
            { name: '大皇宫', price: 35, duration: '3小时', area: '老城区' },
            { name: '卧佛寺', price: 7, duration: '1.5小时', area: '老城区' },
            { name: '郑王庙', price: 3.5, duration: '1小时', area: '湄南河西岸' },
            { name: 'Siam海洋世界', price: 70, duration: '3小时', area: 'Siam' },
            { name: '恰图恰周末市场', price: 0, duration: '4小时', area: 'Mo Chit' },
            { name: 'Asiatique河滨夜市', price: 0, duration: '3小时', area: 'Charoen Krung' },
            { name: '暹罗天地购物中心', price: 0, duration: '2小时', area: 'Siam' }
        ],
        restaurants: {
            budget: [
                { name: 'Som Tam Nua', price: 35, type: '泰东北菜' },
                { name: '街边小吃', price: 20, type: '泰餐' }
            ],
            mid: [
                { name: 'The Deck', price: 120, type: '泰餐' },
                { name: 'Supanniga Eating Room', price: 100, type: '泰餐' }
            ],
            luxury: [
                { name: 'Gaggan Anand', price: 1500, type: '米其林' },
                { name: 'Le Normandie', price: 1200, type: '法餐' }
            ]
        },
        transport: 'BTS/MRT单程¥10-25，出租车起步¥25，嘟嘟车议价'
    },
    '新加坡': {
        hotels: {
            budget: [
                { name: 'Capsule Pod Boutique', price: 200, area: '牛车水' },
                { name: 'The Pod', price: 250, area: '武吉士' }
            ],
            mid: [
                { name: 'Hotel Boss', price: 450, area: '薰衣草' },
                { name: 'Parkroyal on Beach', price: 550, area: '乌节路' }
            ],
            luxury: [
                { name: '滨海湾金沙酒店', price: 2800, area: '滨海湾' },
                { name: '莱佛士酒店', price: 3500, area: '政府大厦' }
            ]
        },
        attractions: [
            { name: '滨海湾花园', price: 200, duration: '3小时', area: '滨海湾' },
            { name: '圣淘沙环球影城', price: 550, duration: '6小时', area: '圣淘沙' },
            { name: '新加坡动物园', price: 260, duration: '4小时', area: '万礼' },
            { name: '鱼尾狮公园', price: 0, duration: '1小时', area: '滨海湾' },
            { name: '牛车水', price: 0, duration: '2小时', area: '牛车水' },
            { name: '乌节路', price: 0, duration: '3小时', area: '乌节路' },
            { name: '克拉码头', price: 0, duration: '2小时', area: '河畔' }
        ],
        restaurants: {
            budget: [
                { name: '老巴刹美食中心', price: 40, type: '小贩中心' },
                { name: '328加东叻沙', price: 35, type: '叻沙' }
            ],
            mid: [
                { name: 'Jumbo Seafood', price: 220, type: '海鲜' },
                { name: 'Tim Ho Wan', price: 80, type: '点心' }
            ],
            luxury: [
                { name: 'Odette', price: 2000, type: '米其林三星' },
                { name: 'Les Amis', price: 1800, type: '米其林三星' }
            ]
        },
        transport: '地铁单程¥8-20，出租车起步¥25，Grab打车'
    },
    '北京': {
        hotels: {
            budget: [
                { name: '7天连锁酒店', price: 150, area: '王府井' },
                { name: '如家快捷酒店', price: 180, area: '天安门' }
            ],
            mid: [
                { name: '北京饭店', price: 500, area: '王府井' },
                { name: '诺富特和平宾馆', price: 450, area: '王府井' }
            ],
            luxury: [
                { name: '北京柏悦酒店', price: 2200, area: 'CBD' },
                { name: '北京文华东方', price: 2500, area: '王府井' }
            ]
        },
        attractions: [
            { name: '故宫博物院', price: 60, duration: '4小时', area: '东城区' },
            { name: '长城（八达岭）', price: 40, duration: '5小时', area: '延庆区' },
            { name: '颐和园', price: 30, duration: '3小时', area: '海淀区' },
            { name: '天坛公园', price: 15, duration: '2小时', area: '东城区' },
            { name: '天安门广场', price: 0, duration: '1小时', area: '东城区' },
            { name: '南锣鼓巷', price: 0, duration: '2小时', area: '东城区' },
            { name: '798艺术区', price: 0, duration: '3小时', area: '朝阳区' }
        ],
        restaurants: {
            budget: [
                { name: '庆丰包子铺', price: 30, type: '小吃' },
                { name: '护国寺小吃', price: 40, type: '北京小吃' }
            ],
            mid: [
                { name: '全聚德烤鸭', price: 180, type: '烤鸭' },
                { name: '东来顺', price: 150, type: '火锅' }
            ],
            luxury: [
                { name: '大董烤鸭', price: 500, type: '创意中餐' },
                { name: 'TRB Hutong', price: 600, type: '法餐' }
            ]
        },
        transport: '地铁单程¥3-9，公交¥2，出租车起步¥13'
    },
    '上海': {
        hotels: {
            budget: [
                { name: '锦江之星', price: 180, area: '人民广场' },
                { name: '汉庭酒店', price: 200, area: '南京路' }
            ],
            mid: [
                { name: '和平饭店', price: 800, area: '外滩' },
                { name: '上海大厦', price: 600, area: '外滩' }
            ],
            luxury: [
                { name: '上海浦东丽思卡尔顿', price: 2500, area: '陆家嘴' },
                { name: '上海半岛酒店', price: 3000, area: '外滩' }
            ]
        },
        attractions: [
            { name: '外滩', price: 0, duration: '2小时', area: '黄浦区' },
            { name: '东方明珠', price: 220, duration: '2小时', area: '浦东新区' },
            { name: '上海博物馆', price: 0, duration: '3小时', area: '人民广场' },
            { name: '豫园', price: 40, duration: '2小时', area: '老城厢' },
            { name: '田子坊', price: 0, duration: '2小时', area: '卢湾区' },
            { name: '南京路步行街', price: 0, duration: '2小时', area: '黄浦区' },
            { name: '上海迪士尼乐园', price: 399, duration: '8小时', area: '浦东新区' }
        ],
        restaurants: {
            budget: [
                { name: '小杨生煎', price: 25, type: '生煎' },
                { name: '南翔馒头店', price: 50, type: '小笼包' }
            ],
            mid: [
                { name: '外婆家', price: 100, type: '江浙菜' },
                { name: '鼎泰丰', price: 150, type: '台湾小吃' }
            ],
            luxury: [
                { name: 'Ultraviolet', price: 4000, type: '米其林三星' },
                { name: '8½ Otto e Mezzo', price: 1500, type: '米其林三星' }
            ]
        },
        transport: '地铁单程¥3-10，出租车起步¥14，磁悬浮¥50'
    },

    // ========== 欧洲 ==========
    '巴黎': {
        hotels: {
            budget: [
                { name: 'Generator Paris', price: 280, area: '10区' },
                { name: 'Ibis Budget Paris', price: 350, area: '11区' }
            ],
            mid: [
                { name: 'Hotel Le Marais', price: 800, area: '玛黑区' },
                { name: 'Hotel Atmospheres', price: 950, area: '5区' }
            ],
            luxury: [
                { name: '巴黎丽兹酒店', price: 5500, area: '1区' },
                { name: '巴黎四季酒店', price: 6800, area: '8区' }
            ]
        },
        attractions: [
            { name: '卢浮宫', price: 120, duration: '4小时', area: '1区' },
            { name: '埃菲尔铁塔', price: 180, duration: '2小时', area: '7区' },
            { name: '奥赛博物馆', price: 100, duration: '3小时', area: '7区' },
            { name: '凡尔赛宫', price: 150, duration: '5小时', area: '凡尔赛' },
            { name: '圣母院（外观）', price: 0, duration: '1小时', area: '4区' },
            { name: '蒙马特高地', price: 0, duration: '2.5小时', area: '18区' },
            { name: '橘园美术馆', price: 90, duration: '2小时', area: '1区' }
        ],
        restaurants: {
            budget: [
                { name: 'Breizh Café', price: 80, type: '可丽饼' },
                { name: "L'As du Fallafel", price: 60, type: '中东菜' }
            ],
            mid: [
                { name: "Le Relais de l'Entrecôte", price: 180, type: '牛排' },
                { name: 'Bouillon Chartier', price: 150, type: '法餐' }
            ],
            luxury: [
                { name: 'Le Jules Verne', price: 1500, type: '米其林三星' },
                { name: "L'Astrance", price: 1800, type: '米其林三星' }
            ]
        },
        transport: '地铁单程票¥15，日票¥50，周票¥160'
    },
    '伦敦': {
        hotels: {
            budget: [
                { name: 'Generator London', price: 350, area: '国王十字' },
                { name: 'Premier Inn', price: 420, area: '南岸' }
            ],
            mid: [
                { name: 'The Hoxton', price: 900, area: 'Shoreditch' },
                { name: 'Zetter Hotel', price: 1100, area: 'Clerkenwell' }
            ],
            luxury: [
                { name: '萨伏伊酒店', price: 4500, area: 'Strand' },
                { name: '丽思酒店', price: 5200, area: 'Piccadilly' }
            ]
        },
        attractions: [
            { name: '大英博物馆', price: 0, duration: '4小时', area: 'Bloomsbury' },
            { name: '伦敦塔', price: 210, duration: '3小时', area: 'Tower Hill' },
            { name: '白金汉宫', price: 210, duration: '2小时', area: 'Westminster' },
            { name: '伦敦眼', price: 230, duration: '1.5小时', area: '南岸' },
            { name: '国家美术馆', price: 0, duration: '3小时', area: 'Trafalgar Square' },
            { name: '泰特现代美术馆', price: 0, duration: '2.5小时', area: '南岸' },
            { name: '哈利波特片场', price: 350, duration: '4小时', area: 'Watford' }
        ],
        restaurants: {
            budget: [
                { name: 'Dishoom', price: 120, type: '印度菜' },
                { name: 'Borough Market', price: 80, type: '市集' }
            ],
            mid: [
                { name: 'The Ivy', price: 250, type: '英餐' },
                { name: 'Hawksmoor', price: 300, type: '牛排' }
            ],
            luxury: [
                { name: 'Restaurant Gordon Ramsay', price: 2000, type: '米其林三星' },
                { name: 'Sketch', price: 1500, type: '米其林二星' }
            ]
        },
        transport: '地铁单程¥30-50，Oyster卡日封顶¥90，巴士¥18'
    },
    '罗马': {
        hotels: {
            budget: [
                { name: 'The Beehive', price: 280, area: 'Termini' },
                { name: 'Alessandro Palace', price: 250, area: 'Termini' }
            ],
            mid: [
                { name: 'Hotel Raphael', price: 850, area: 'Navona' },
                { name: 'Hotel Quirinale', price: 750, area: 'Termini' }
            ],
            luxury: [
                { name: '罗马宝格丽酒店', price: 4800, area: 'Via Condotti' },
                { name: 'Hotel de Russie', price: 3500, area: 'Piazza del Popolo' }
            ]
        },
        attractions: [
            { name: '斗兽场', price: 120, duration: '3小时', area: '古罗马区' },
            { name: '梵蒂冈博物馆', price: 120, duration: '4小时', area: '梵蒂冈' },
            { name: '圣彼得大教堂', price: 0, duration: '2小时', area: '梵蒂冈' },
            { name: '许愿池', price: 0, duration: '30分钟', area: 'Trevi' },
            { name: '西班牙广场', price: 0, duration: '1小时', area: 'Spagna' },
            { name: '万神殿', price: 0, duration: '1小时', area: 'Pantheon' },
            { name: '博尔盖塞美术馆', price: 90, duration: '2.5小时', area: 'Villa Borghese' }
        ],
        restaurants: {
            budget: [
                { name: 'Pizzarium', price: 50, type: '披萨' },
                { name: 'Supplizio', price: 40, type: '街头小吃' }
            ],
            mid: [
                { name: 'Trattoria Da Enzo', price: 150, type: '意餐' },
                { name: 'Armando al Pantheon', price: 180, type: '罗马菜' }
            ],
            luxury: [
                { name: 'La Pergola', price: 2500, type: '米其林三星' },
                { name: 'Il Pagliaccio', price: 1800, type: '米其林二星' }
            ]
        },
        transport: '地铁单程¥12，24小时票¥50，出租车起步¥25'
    },
    '巴塞罗那': {
        hotels: {
            budget: [
                { name: 'Sant Jordi Hostels', price: 200, area: '哥特区' },
                { name: 'TOC Hostel', price: 220, area: 'Passeig de Gràcia' }
            ],
            mid: [
                { name: 'Hotel 1898', price: 750, area: '兰布拉大道' },
                { name: 'Cotton House', price: 850, area: 'Gran Via' }
            ],
            luxury: [
                { name: '曼达林东方酒店', price: 3500, area: 'Passeig de Gràcia' },
                { name: 'Hotel Arts', price: 2800, area: '海滩区' }
            ]
        },
        attractions: [
            { name: '圣家堂', price: 190, duration: '2.5小时', area: 'Eixample' },
            { name: '桂尔公园', price: 70, duration: '2小时', area: 'Gràcia' },
            { name: '米拉之家', price: 160, duration: '1.5小时', area: 'Passeig de Gràcia' },
            { name: '哥特区', price: 0, duration: '3小时', area: '老城区' },
            { name: '巴特罗之家', price: 190, duration: '1.5小时', area: 'Passeig de Gràcia' },
            { name: '兰布拉大道', price: 0, duration: '2小时', area: '市中心' },
            { name: '毕加索博物馆', price: 90, duration: '2小时', area: 'Born' }
        ],
        restaurants: {
            budget: [
                { name: 'Cervecería Catalana', price: 80, type: 'Tapas' },
                { name: 'La Boqueria市场', price: 60, type: '市场' }
            ],
            mid: [
                { name: 'Cal Pep', price: 180, type: '海鲜' },
                { name: 'Tickets Bar', price: 220, type: 'Tapas' }
            ],
            luxury: [
                { name: 'ABaC', price: 2000, type: '米其林三星' },
                { name: 'Lasarte', price: 1800, type: '米其林三星' }
            ]
        },
        transport: '地铁单程¥16，T-10十次票¥80，出租车起步¥15'
    },

    // ========== 美洲 ==========
    '纽约': {
        hotels: {
            budget: [
                { name: 'HI NYC Hostel', price: 450, area: '上西区' },
                { name: 'Pod 51', price: 550, area: '中城' }
            ],
            mid: [
                { name: 'Yotel New York', price: 1100, area: '时代广场' },
                { name: 'The Jane Hotel', price: 900, area: '西村' }
            ],
            luxury: [
                { name: '文华东方酒店', price: 4500, area: '哥伦布圆环' },
                { name: 'The Plaza', price: 5500, area: '中央公园' }
            ]
        },
        attractions: [
            { name: '大都会艺术博物馆', price: 180, duration: '4小时', area: '上东区' },
            { name: '自由女神像', price: 160, duration: '4小时', area: '自由岛' },
            { name: '帝国大厦', price: 280, duration: '2小时', area: '中城' },
            { name: '中央公园', price: 0, duration: '3小时', area: '曼哈顿' },
            { name: '时代广场', price: 0, duration: '1.5小时', area: '中城' },
            { name: '布鲁克林大桥', price: 0, duration: '1.5小时', area: '布鲁克林' },
            { name: '现代艺术博物馆', price: 180, duration: '3小时', area: '中城' }
        ],
        restaurants: {
            budget: [
                { name: 'Joe\'s Pizza', price: 50, type: '披萨' },
                { name: 'Shake Shack', price: 80, type: '汉堡' }
            ],
            mid: [
                { name: 'Carbone', price: 500, type: '意餐' },
                { name: 'Peter Luger', price: 600, type: '牛排' }
            ],
            luxury: [
                { name: 'Eleven Madison Park', price: 2500, type: '米其林三星' },
                { name: 'Le Bernardin', price: 2200, type: '米其林三星' }
            ]
        },
        transport: '地铁单程¥20，7日通票¥240，出租车起步¥20'
    },
    '洛杉矶': {
        hotels: {
            budget: [
                { name: 'Freehand LA', price: 380, area: '市中心' },
                { name: 'USA Hostels Hollywood', price: 320, area: '好莱坞' }
            ],
            mid: [
                { name: 'The LINE LA', price: 850, area: '韩国城' },
                { name: 'Hotel Figueroa', price: 750, area: '市中心' }
            ],
            luxury: [
                { name: 'Beverly Wilshire', price: 4000, area: '比佛利山' },
                { name: 'Hotel Bel-Air', price: 4500, area: 'Bel Air' }
            ]
        },
        attractions: [
            { name: '好莱坞星光大道', price: 0, duration: '2小时', area: '好莱坞' },
            { name: '环球影城', price: 700, duration: '8小时', area: '环球城' },
            { name: '盖蒂中心', price: 0, duration: '3小时', area: 'Brentwood' },
            { name: '圣莫尼卡海滩', price: 0, duration: '3小时', area: '圣莫尼卡' },
            { name: '格里菲斯天文台', price: 0, duration: '2小时', area: '格里菲斯公园' },
            { name: '迪士尼乐园', price: 750, duration: '10小时', area: '阿纳海姆' },
            { name: 'LACMA艺术博物馆', price: 180, duration: '3小时', area: 'Miracle Mile' }
        ],
        restaurants: {
            budget: [
                { name: 'In-N-Out Burger', price: 60, type: '汉堡' },
                { name: 'Grand Central Market', price: 80, type: '市集' }
            ],
            mid: [
                { name: 'Republique', price: 250, type: '法餐' },
                { name: 'Gjelina', price: 220, type: '加州菜' }
            ],
            luxury: [
                { name: 'Providence', price: 2000, type: '米其林二星' },
                { name: 'n/naka', price: 1800, type: '米其林二星' }
            ]
        },
        transport: '租车推荐，地铁单程¥12，Uber/Lyft打车'
    },

    // ========== 大洋洲 ==========
    '悉尼': {
        hotels: {
            budget: [
                { name: 'Wake Up! Sydney', price: 280, area: '中央车站' },
                { name: 'YHA Sydney Harbour', price: 320, area: '岩石区' }
            ],
            mid: [
                { name: 'QT Sydney', price: 850, area: 'CBD' },
                { name: 'The Grace Hotel', price: 750, area: 'CBD' }
            ],
            luxury: [
                { name: '悉尼四季酒店', price: 3200, area: '岩石区' },
                { name: '悉尼柏悦酒店', price: 3800, area: '环形码头' }
            ]
        },
        attractions: [
            { name: '悉尼歌剧院', price: 280, duration: '2小时', area: '环形码头' },
            { name: '海港大桥攀登', price: 1200, duration: '3.5小时', area: '岩石区' },
            { name: '邦迪海滩', price: 0, duration: '3小时', area: '邦迪' },
            { name: '塔龙加动物园', price: 320, duration: '4小时', area: 'Mosman' },
            { name: '达令港', price: 0, duration: '2小时', area: 'Darling Harbour' },
            { name: '悉尼海洋生物水族馆', price: 280, duration: '2.5小时', area: 'Darling Harbour' },
            { name: '皇家植物园', price: 0, duration: '2小时', area: 'CBD' }
        ],
        restaurants: {
            budget: [
                { name: 'Harry\'s Cafe de Wheels', price: 50, type: '派' },
                { name: 'Chinatown美食街', price: 80, type: '亚洲菜' }
            ],
            mid: [
                { name: 'The Grounds of Alexandria', price: 180, type: 'Brunch' },
                { name: 'Aria Restaurant', price: 350, type: '澳洲菜' }
            ],
            luxury: [
                { name: 'Quay', price: 2200, type: '米其林' },
                { name: 'Bennelong', price: 1800, type: '高端澳洲菜' }
            ]
        },
        transport: 'Opal卡，地铁/巴士单程¥20-40，渡轮¥50'
    },

    // ========== 中国国内城市 ==========
    '成都': {
        hotels: {
            budget: [
                { name: '成都梦之旅国际青年旅舍', price: 80, area: '春熙路' },
                { name: '如家快捷酒店', price: 150, area: '天府广场' }
            ],
            mid: [
                { name: '成都明宇豪雅饭店', price: 380, area: '天府广场' },
                { name: '博舍酒店', price: 580, area: '太古里' }
            ],
            luxury: [
                { name: '成都尼依格罗酒店', price: 1200, area: '太古里' },
                { name: '成都瑞吉酒店', price: 1800, area: '天府新区' }
            ]
        },
        attractions: [
            { name: '武侯祠', price: 50, duration: '2小时', area: '武侯区' },
            { name: '杜甫草堂', price: 50, duration: '2小时', area: '青羊区' },
            { name: '金沙遗址博物馆', price: 70, duration: '2.5小时', area: '青羊区' },
            { name: '大熊猫繁育研究基地', price: 55, duration: '3小时', area: '成华区' },
            { name: '宽窄巷子', price: 0, duration: '2小时', area: '青羊区' },
            { name: '锦里古街', price: 0, duration: '2小时', area: '武侯区' },
            { name: '成都博物馆', price: 0, duration: '2.5小时', area: '天府广场' }
        ],
        restaurants: {
            budget: [
                { name: '小龙坎火锅', price: 80, type: '火锅' },
                { name: '陈麻婆豆腐', price: 50, type: '川菜' }
            ],
            mid: [
                { name: '大龙燚火锅', price: 120, type: '火锅' },
                { name: '玉芝兰', price: 350, type: '川菜' }
            ],
            luxury: [
                { name: '松云泽', price: 800, type: '川菜' },
                { name: 'The Temple House餐厅', price: 600, type: '融合菜' }
            ]
        },
        transport: '地铁单程¥2-7，公交¥2，共享单车¥1.5/小时'
    },
    '西安': {
        hotels: {
            budget: [
                { name: '西安湘子门国际青年旅舍', price: 90, area: '南门' },
                { name: '7天连锁酒店', price: 140, area: '钟楼' }
            ],
            mid: [
                { name: '西安凯宾斯基酒店', price: 450, area: '大雁塔' },
                { name: '西安索菲特人民大厦', price: 520, area: '钟楼' }
            ],
            luxury: [
                { name: '西安威斯汀酒店', price: 1100, area: '曲江' },
                { name: '西安香格里拉', price: 1300, area: '高新区' }
            ]
        },
        attractions: [
            { name: '兵马俑博物馆', price: 120, duration: '4小时', area: '临潼区' },
            { name: '西安城墙', price: 54, duration: '2.5小时', area: '碑林区' },
            { name: '大雁塔', price: 50, duration: '2小时', area: '雁塔区' },
            { name: '陕西历史博物馆', price: 0, duration: '3小时', area: '雁塔区' },
            { name: '回民街', price: 0, duration: '2小时', area: '莲湖区' },
            { name: '钟鼓楼', price: 50, duration: '1.5小时', area: '莲湖区' },
            { name: '大唐芙蓉园', price: 120, duration: '3小时', area: '曲江新区' }
        ],
        restaurants: {
            budget: [
                { name: '老孙家泡馍', price: 35, type: '泡馍' },
                { name: '回民街小吃', price: 50, type: '小吃' }
            ],
            mid: [
                { name: '德发长饺子馆', price: 100, type: '饺子宴' },
                { name: '西安饭庄', price: 150, type: '陕菜' }
            ],
            luxury: [
                { name: '长安壹号', price: 500, type: '陕菜' },
                { name: '盛唐1900', price: 400, type: '创意陕菜' }
            ]
        },
        transport: '地铁单程¥2-7，公交¥1-2，共享单车¥1.5/小时'
    },
    '杭州': {
        hotels: {
            budget: [
                { name: '杭州青芝坞国际青年旅舍', price: 100, area: '西湖区' },
                { name: '汉庭酒店', price: 180, area: '武林广场' }
            ],
            mid: [
                { name: '杭州开元名都', price: 480, area: '武林广场' },
                { name: '西湖国宾馆', price: 650, area: '西湖' }
            ],
            luxury: [
                { name: '杭州安缦法云', price: 4500, area: '灵隐' },
                { name: '杭州西子湖四季酒店', price: 2800, area: '西湖' }
            ]
        },
        attractions: [
            { name: '西湖景区', price: 0, duration: '4小时', area: '西湖区' },
            { name: '灵隐寺', price: 75, duration: '2.5小时', area: '西湖区' },
            { name: '雷峰塔', price: 40, duration: '1.5小时', area: '西湖区' },
            { name: '西溪湿地', price: 80, duration: '3小时', area: '西湖区' },
            { name: '宋城', price: 310, duration: '4小时', area: '之江路' },
            { name: '河坊街', price: 0, duration: '2小时', area: '上城区' },
            { name: '中国美术学院', price: 0, duration: '1.5小时', area: '南山路' }
        ],
        restaurants: {
            budget: [
                { name: '知味观', price: 60, type: '杭帮菜' },
                { name: '新丰小吃', price: 35, type: '小吃' }
            ],
            mid: [
                { name: '外婆家', price: 100, type: '杭帮菜' },
                { name: '楼外楼', price: 180, type: '杭帮菜' }
            ],
            luxury: [
                { name: '湖畔居', price: 600, type: '杭帮菜' },
                { name: '紫萱度假村', price: 800, type: '高端中餐' }
            ]
        },
        transport: '地铁单程¥2-6，公交¥2，共享单车¥1.5/小时'
    }
};

// 行程生成逻辑（使用真实API + 本地备用数据）
async function generateItinerary(destination, days, budget, preferences) {
    const dailyBudget = Math.floor(budget / days);

    // 确定预算等级
    let budgetLevel;
    if (dailyBudget < 300) budgetLevel = 'budget';
    else if (dailyBudget < 600) budgetLevel = 'mid';
    else budgetLevel = 'luxury';

    // 尝试获取真实API数据
    console.log(`正在获取 ${destination} 的真实数据...`);
    const realData = await getRealPlacesData(destination, budgetLevel);

    // 获取本地数据作为备用
    const destData = destinationData[destination];
    const hasDetailedData = !!destData;

    // 判断是否使用真实数据
    const useRealData = realData.hotels.length > 0 || realData.attractions.length > 0;

    let itinerary = `# ${destination} ${days}天旅行计划\n\n`;

    // 预算总览
    itinerary += `## 💰 预算总览\n\n`;
    itinerary += `**总预算**: ¥${budget}\n`;
    itinerary += `**日均预算**: ¥${dailyBudget}\n\n`;
    itinerary += `**预算分配建议**:\n`;
    itinerary += `- 住宿: ¥${Math.floor(budget * 0.35)} (35%)\n`;
    itinerary += `- 餐饮: ¥${Math.floor(budget * 0.25)} (25%)\n`;
    itinerary += `- 交通: ¥${Math.floor(budget * 0.20)} (20%)\n`;
    itinerary += `- 门票/活动: ¥${Math.floor(budget * 0.15)} (15%)\n`;
    itinerary += `- 其他/备用: ¥${Math.floor(budget * 0.05)} (5%)\n\n`;

    // 住宿推荐（优先使用真实数据）
    itinerary += `## 🏨 住宿推荐\n\n`;

    if (useRealData && realData.hotels.length > 0) {
        // 使用真实API数据
        const hotel = realData.hotels[0];
        const totalNights = days - 1;

        itinerary += `**推荐酒店**: ${hotel.name}\n`;
        itinerary += `- 地址: ${hotel.address}\n`;
        itinerary += `- 评分: ${hotel.rating}⭐\n`;
        itinerary += `- 位置: ${hotel.area}\n`;
        itinerary += `- 入住${totalNights}晚\n\n`;
        itinerary += `*价格请访问预订平台查询实时价格*\n\n`;

        if (realData.hotels.length > 1) {
            itinerary += `**备选酒店**: ${realData.hotels[1].name}\n`;
            itinerary += `- 地址: ${realData.hotels[1].address}\n`;
            itinerary += `- 评分: ${realData.hotels[1].rating}⭐\n\n`;
        }
    } else if (hasDetailedData) {
        // 使用本地数据作为备用
        const hotels = destData.hotels[budgetLevel];
        const hotel = hotels[0];
        const totalNights = days - 1;
        const totalHotelCost = hotel.price * totalNights;

        itinerary += `**推荐酒店**: ${hotel.name}\n`;
        itinerary += `- 位置: ${hotel.area}\n`;
        itinerary += `- 参考价格: ¥${hotel.price}/晚\n`;
        itinerary += `- 入住${totalNights}晚总计: ¥${totalHotelCost}\n\n`;

        if (hotels.length > 1) {
            itinerary += `**备选酒店**: ${hotels[1].name} (${hotels[1].area}，¥${hotels[1].price}/晚)\n\n`;
        }
    }

    // 详细行程
    itinerary += `## 📅 详细行程\n\n`;

    // 准备景点和餐厅数据（优先使用真实数据）
    let attractions, restaurants;

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
            itinerary += `### 第${day}天\n\n`;

            if (day === 1) {
                // 第一天：抵达
                const hotel = useRealData && realData.hotels.length > 0 ? realData.hotels[0] :
                             (hasDetailedData ? destData.hotels[budgetLevel][0] : null);
                const restaurant = restaurants && restaurants.length > 0 ? restaurants[0] : null;

                itinerary += `**上午 9:00-12:00**: 抵达${destination}\n`;
                if (hotel) {
                    itinerary += `- 办理酒店入住：${hotel.name}\n`;
                    if (hotel.address) itinerary += `- 地址：${hotel.address}\n`;
                    else if (hotel.area) itinerary += `- 位置：${hotel.area}\n`;
                }
                itinerary += `- 稍作休息，整理行李\n\n`;

                itinerary += `**中午 12:00-13:30**: 午餐\n`;
                if (restaurant) {
                    itinerary += `- 推荐：${restaurant.name}\n`;
                    if (restaurant.address) itinerary += `- 地址：${restaurant.address}\n`;
                    if (restaurant.rating) itinerary += `- 评分：${restaurant.rating}⭐\n`;
                    if (restaurant.price) itinerary += `- 人均消费：¥${restaurant.price}\n`;
                    if (restaurant.type) itinerary += `- 菜系：${restaurant.type}\n`;
                }
                itinerary += `\n`;

                const attraction1 = attractions && attractions.length > 0 ? attractions[0] : null;
                if (attraction1) {
                    itinerary += `**下午 14:00-17:00**: ${attraction1.name}\n`;
                    if (attraction1.address) itinerary += `- 地址：${attraction1.address}\n`;
                    if (attraction1.rating) itinerary += `- 评分：${attraction1.rating}⭐\n`;
                    if (attraction1.price !== undefined) itinerary += `- 门票：¥${attraction1.price}\n`;
                    if (attraction1.duration) itinerary += `- 游玩时长：${attraction1.duration}\n`;
                    if (attraction1.area && !attraction1.address) itinerary += `- 位置：${attraction1.area}\n`;
                    itinerary += `\n`;
                }

                const dinnerRestaurant = restaurants && restaurants.length > 1 ? restaurants[1] : restaurant;
                if (dinnerRestaurant) {
                    itinerary += `**晚上 18:30-20:00**: 晚餐\n`;
                    itinerary += `- 推荐：${dinnerRestaurant.name}\n`;
                    if (dinnerRestaurant.address) itinerary += `- 地址：${dinnerRestaurant.address}\n`;
                    if (dinnerRestaurant.rating) itinerary += `- 评分：${dinnerRestaurant.rating}⭐\n`;
                    if (dinnerRestaurant.price) itinerary += `- 人均消费：¥${dinnerRestaurant.price}\n`;
                    itinerary += `\n`;
                }

                const attraction2 = attractions && attractions.length > 1 ? attractions[1] : null;
                if (attraction2) {
                    itinerary += `**晚上 20:30-22:00**: ${attraction2.name}\n`;
                    if (attraction2.address) itinerary += `- 地址：${attraction2.address}\n`;
                    itinerary += `- 夜间游览，感受城市夜景\n\n`;
                }

            } else if (day === days) {
                // 最后一天：返程
                itinerary += `**上午 8:00-10:00**: 早餐 & 最后购物\n`;
                itinerary += `- 在酒店附近享用早餐\n`;
                itinerary += `- 购买纪念品和特产\n\n`;

                itinerary += `**上午 10:00-11:30**: 退房\n`;
                itinerary += `- 整理行李，办理退房手续\n\n`;

                itinerary += `**下午**: 返程\n`;
                itinerary += `- 前往机场/车站\n`;
                itinerary += `- 结束愉快的${destination}之旅\n\n`;

            } else {
                // 中间天数：深度游览
                const startIdx = (day - 1) * 2;
                const morningAttraction = attractions[startIdx % attractions.length];
                const afternoonAttraction = attractions[(startIdx + 1) % attractions.length];

                if (morningAttraction) {
                    itinerary += `**上午 9:00-12:00**: ${morningAttraction.name}\n`;
                    if (morningAttraction.address) itinerary += `- 地址：${morningAttraction.address}\n`;
                    if (morningAttraction.rating) itinerary += `- 评分：${morningAttraction.rating}⭐\n`;
                    if (morningAttraction.price !== undefined) itinerary += `- 门票：¥${morningAttraction.price}\n`;
                    if (morningAttraction.duration) itinerary += `- 游玩时长：${morningAttraction.duration}\n`;
                    if (morningAttraction.area && !morningAttraction.address) itinerary += `- 位置：${morningAttraction.area}\n`;
                    itinerary += `\n`;
                }

                if (restaurants && restaurants.length > 0) {
                    const lunchRestaurant = restaurants[day % restaurants.length];
                    itinerary += `**中午 12:30-14:00**: 午餐\n`;
                    itinerary += `- 推荐：${lunchRestaurant.name}\n`;
                    if (lunchRestaurant.address) itinerary += `- 地址：${lunchRestaurant.address}\n`;
                    if (lunchRestaurant.rating) itinerary += `- 评分：${lunchRestaurant.rating}⭐\n`;
                    if (lunchRestaurant.price) itinerary += `- 人均消费：¥${lunchRestaurant.price}\n`;
                    if (lunchRestaurant.type) itinerary += `- 菜系：${lunchRestaurant.type}\n`;
                    itinerary += `\n`;
                }

                if (afternoonAttraction) {
                    itinerary += `**下午 14:30-18:00**: ${afternoonAttraction.name}\n`;
                    if (afternoonAttraction.address) itinerary += `- 地址：${afternoonAttraction.address}\n`;
                    if (afternoonAttraction.rating) itinerary += `- 评分：${afternoonAttraction.rating}⭐\n`;
                    if (afternoonAttraction.price !== undefined) itinerary += `- 门票：¥${afternoonAttraction.price}\n`;
                    if (afternoonAttraction.duration) itinerary += `- 游玩时长：${afternoonAttraction.duration}\n`;
                    if (afternoonAttraction.area && !afternoonAttraction.address) itinerary += `- 位置：${afternoonAttraction.area}\n`;
                    itinerary += `\n`;
                }

                if (restaurants && restaurants.length > 0) {
                    const dinnerRestaurant = restaurants[(day + 1) % restaurants.length];
                    itinerary += `**晚上 19:00-21:00**: 晚餐\n`;
                    itinerary += `- 推荐：${dinnerRestaurant.name}\n`;
                    if (dinnerRestaurant.address) itinerary += `- 地址：${dinnerRestaurant.address}\n`;
                    if (dinnerRestaurant.rating) itinerary += `- 评分：${dinnerRestaurant.rating}⭐\n`;
                    if (dinnerRestaurant.price) itinerary += `- 人均消费：¥${dinnerRestaurant.price}\n`;
                    itinerary += `\n`;
                }

                itinerary += `**晚上 21:30**: 返回酒店休息\n\n`;
            }
        }

        // 交通信息
        if (hasDetailedData && destData.transport) {
            itinerary += `## 🚇 交通信息\n\n`;
            itinerary += `${destData.transport}\n\n`;
        }

    } else {
        // 通用模板（没有详细数据的城市）
        for (let day = 1; day <= days; day++) {
            itinerary += `### 第${day}天\n\n`;
            if (day === 1) {
                itinerary += `**上午**: 抵达${destination}，办理酒店入住\n`;
                itinerary += `**下午**: 市中心核心景区游览\n`;
                itinerary += `**晚上**: 体验当地美食\n\n`;
            } else if (day === days) {
                itinerary += `**上午**: 最后采购与收拾，退房\n`;
                itinerary += `**下午**: 返程\n\n`;
            } else {
                itinerary += `**上午**: 热门景点深度游\n`;
                itinerary += `**下午**: 文化体验/特色街区\n`;
                itinerary += `**晚上**: 当地特色演出/夜市\n\n`;
            }
        }
    }

    // 实用贴士
    itinerary += `## 💡 实用贴士\n\n`;
    itinerary += `- **必备物品**: 身份证件、充电宝、常用药品、舒适鞋子\n`;
    itinerary += `- **预订建议**: 提前预订热门景点门票，避开高峰时段\n`;
    itinerary += `- **省钱技巧**: 购买交通通票、选择套票组合、关注景点优惠日\n`;

    if (preferences) {
        itinerary += `- **特别关注**: ${preferences}\n`;
    }

    itinerary += `\n**祝您旅途愉快！** 🎉\n`;

    return itinerary;
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`旅行规划网站运行在 http://localhost:${PORT}`);
    console.log('请在浏览器中打开上述地址访问');
})
