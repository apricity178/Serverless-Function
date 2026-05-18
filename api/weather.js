// Vercel Serverless Function - 和风天气 API 代理
export default function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 405, msg: 'Method not allowed' });
  }

  const { location, type = 'today', action = 'weather' } = req.query;

  // 和风天气 API Key（固定 Key）
  const API_KEY = '822391a0ebe540ef916c96afd0c21862';

  // 如果是查询城市列表
  if (action === 'lookup') {
    const query = location || '';
    const cityLookupUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(query)}&key=${API_KEY}&lang=zh&number=50`;
    
    return fetch(cityLookupUrl)
      .then(response => response.json())
      .then(data => {
        if (data.code !== '200') {
          throw new Error('城市查询失败：' + (data.message || data.code));
        }
        res.status(200).json({
          code: 200,
          data: data.location || []
        });
      })
      .catch(error => {
        console.error('City lookup error:', error);
        res.status(500).json({ code: 500, msg: '城市查询失败：' + error.message });
      });
  }

  // 验证必需参数
  if (!location) {
    return res.status(400).json({ code: 400, msg: '缺少 location 参数' });
  }

  // 第一步：查询城市 ID
  const cityLookupUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURIComponent(location)}&key=${API_KEY}&lang=zh`;

  return fetch(cityLookupUrl)
    .then(response => response.json())
    .then(data => {
      if (data.code !== '200' || !data.location || data.location.length === 0) {
        throw new Error('城市查询失败：' + (data.message || data.code));
      }

      const cityId = data.location[0].id;
      const cityName = data.location[0].name;

      // 第二步：获取天气预报
      let weatherUrl;
      if (type === 'today') {
        // 当天天气（实况）
        weatherUrl = `https://devapi.qweather.com/v7/weather/now?location=${cityId}&key=${API_KEY}&lang=zh`;
      } else {
        // 明天天气（3天预报）
        weatherUrl = `https://devapi.qweather.com/v7/weather/3d?location=${cityId}&key=${API_KEY}&lang=zh`;
      }

      return fetch(weatherUrl);
    })
    .then(response => response.json())
    .then(weatherData => {
      if (weatherData.code !== '200') {
        throw new Error('天气查询失败：' + (weatherData.message || weatherData.code));
      }

      res.status(200).json({
        code: 200,
        data: weatherData,
        location: location
      });
    })
    .catch(error => {
      console.error('Weather API error:', error);
      res.status(500).json({ code: 500, msg: '天气查询失败：' + error.message });
    });
}
