// Vercel Serverless Function - 和风天气 API 代理（使用 LocationID）
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

  const { locationId, type = 'today' } = req.query;

  // 和风天气 API Key（固定 Key）
  const API_KEY = '822391a0ebe540ef916c96afd0c21862';

  // 验证必需参数
  if (!locationId) {
    return res.status(400).json({ code: 400, msg: '缺少 locationId 参数' });
  }

  // 直接使用 locationId 查询天气
  let weatherUrl;
  if (type === 'today') {
    // 当天天气（实况）
    weatherUrl = `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${API_KEY}&lang=zh`;
  } else {
    // 明天天气（3天预报）
    weatherUrl = `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${API_KEY}&lang=zh`;
  }

  return fetch(weatherUrl)
    .then(response => response.json())
    .then(weatherData => {
      if (weatherData.code !== '200') {
        throw new Error('天气查询失败：' + (weatherData.message || weatherData.code));
      }

      res.status(200).json({
        code: 200,
        data: weatherData,
        locationId: locationId
      });
    })
    .catch(error => {
      console.error('Weather API error:', error);
      res.status(500).json({ code: 500, msg: '天气查询失败：' + error.message });
    });
}
