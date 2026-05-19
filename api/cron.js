// Vercel Serverless Function - 服务端定时推送（天气 + PushPlus）
// 由 Vercel Cron Jobs 或 GitHub Actions 定时触发
// 调用方式：GET /api/cron?tokens=xxx&locationId=xxx&title=xxx&morningContent=xxx&eveningContent=xxx

const QWEATHER_API_KEY = '822391a0ebe540ef916c96afd0c21862';

// ======== 工具函数 ========

function formatTime(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Shanghai' });
}

function getChinaTime() {
  // 获取中国时间（UTC+8）
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

// 生成贴心天气提醒内容（与前端 generateSmartContent 逻辑一致）
function buildWeatherText(baseContent, weatherData, type) {
  if (!weatherData) return baseContent;

  let weatherInfo = '';
  let temp, weather, feelsLike, windScale, windDir;

  if (type === 'today' && weatherData.now) {
    const now = weatherData.now;
    temp = parseInt(now.temp);
    feelsLike = parseInt(now.feelsLike);
    weather = now.text;
    windScale = parseInt(now.windScale);
    windDir = now.windDir;

    weatherInfo = `📍 当前天气：\n`;
    weatherInfo += `🌡️ 温度：${temp}°C（体感 ${feelsLike}°C）\n`;
    weatherInfo += `🌤️ 天气：${weather}\n`;
    weatherInfo += `💨 风力：${windDir} ${windScale}级`;
  } else if (type === 'tomorrow' && weatherData.daily) {
    const tomorrow = weatherData.daily[0];
    temp = parseInt(tomorrow.tempMin);
    feelsLike = null;
    weather = tomorrow.textDay;
    windScale = parseInt(tomorrow.windScaleDay);
    windDir = tomorrow.windDirDay;

    weatherInfo = `📍 明日预报：\n`;
    weatherInfo += `🌡️ 温度：${tomorrow.tempMin}°C ~ ${tomorrow.tempMax}°C\n`;
    weatherInfo += `🌤️ 天气：${weather}\n`;
    weatherInfo += `💨 风力：${windDir} ${windScale}级`;
  } else {
    return baseContent;
  }

  let suggestions = '\n\n💡 贴心提醒：\n';

  if (temp < 5) {
    suggestions += `   🧥 天气寒冷（${temp}°C），记得穿厚外套和保暖衣物哦~\n`;
  } else if (temp < 15) {
    suggestions += `   🧥 天气微凉（${temp}°C），建议带件外套~\n`;
  } else if (temp > 32) {
    suggestions += `   🌞 天气炎热（${temp}°C），注意防晒补水，避免中暑~\n`;
  } else if (temp > 28) {
    suggestions += `   ☀️ 天气较热（${temp}°C），注意防暑降温~\n`;
  }

  if (feelsLike !== null && feelsLike !== undefined && Math.abs(feelsLike - temp) > 3) {
    if (feelsLike < temp) {
      suggestions += `   ❄️ 体感温度比实际低 ${temp - feelsLike}°C，注意保暖~\n`;
    } else {
      suggestions += `   🔥 体感温度比实际高 ${feelsLike - temp}°C，注意防暑~\n`;
    }
  }

  if (weather.includes('雨')) {
    suggestions += weather.includes('大') || weather.includes('暴')
      ? `   ☔ 今天有${weather}，记得带伞，注意安全~\n`
      : `   ☔ 今天有${weather}，记得带伞哦~\n`;
  }
  if (weather.includes('雪')) {
    suggestions += weather.includes('大') || weather.includes('暴')
      ? `   ❄️ 今天有${weather}，注意保暖防滑，小心路滑~\n`
      : `   ❄️ 今天有${weather}，注意保暖防滑~\n`;
  }
  if (weather.includes('雾') || weather.includes('霾')) {
    suggestions += `   😷 今天有${weather}，建议戴口罩，减少户外活动~\n`;
  }
  if (weather.includes('晴') && temp > 20) {
    suggestions += `   😎 今天阳光明媚，适合户外活动，但注意防晒~\n`;
  }
  if (weather.includes('阴') || weather.includes('多云')) {
    suggestions += `   🌥️ 今天${weather}，气温适宜，适合外出~\n`;
  }
  if (windScale >= 7) {
    suggestions += `   💨 风力较大（${windScale}级），注意防风，远离广告牌~\n`;
  } else if (windScale >= 5) {
    suggestions += `   💨 风力较大（${windScale}级），注意防风保暖~\n`;
  }

  return baseContent + '\n\n' + weatherInfo + suggestions;
}

// 生成推送 HTML（与前端 generateRomanticHTML 逻辑一致）
function buildHtmlContent(content, isMorning, title) {
  const now = getChinaTime();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const bgColor = isMorning ? '#fff8e1' : '#1a1a2e';
  const cardColor = isMorning ? '#ffffff' : '#2d2d44';
  const textColor = isMorning ? '#333' : '#e0e0e0';
  const accentColor = isMorning ? '#ff9800' : '#9c27b0';
  const emoji = isMorning ? '🌅' : '🌙';

  const htmlContent = content.replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bgColor}; padding: 20px; margin: 0; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
        .card { background: ${cardColor}; border-radius: 20px; padding: 30px; max-width: 400px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center; }
        .emoji { font-size: 60px; margin-bottom: 20px; }
        .title { color: ${accentColor}; font-size: 24px; font-weight: bold; margin-bottom: 15px; }
        .content { color: ${textColor}; font-size: 16px; line-height: 1.8; margin: 20px 0; }
        .datetime { color: ${textColor}; opacity: 0.6; font-size: 13px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="emoji">${emoji}</div>
        <div class="title">${title}</div>
        <div class="content">${htmlContent}</div>
        <div class="datetime">📅 ${dateStr}<br>⏰ ${timeStr}</div>
    </div>
</body>
</html>`;
}

// ======== 主处理函数 ========

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' });

  // ---- 1. 解析参数 ----
  const {
    tokens,           // 多个 token 用逗号分隔
    locationId,       // 和风天气 Location_ID
    title = '打卡提醒',
    morningContent,   // 上班提醒内容
    eveningContent,   // 下班提醒内容
    forceType,        // 可选：强制指定 morning / evening（测试用）
  } = req.query;

  if (!tokens) {
    return res.status(400).json({ code: 400, msg: '缺少 tokens 参数' });
  }

  const tokenList = tokens.split(',').map(t => t.trim()).filter(Boolean);
  if (tokenList.length === 0) {
    return res.status(400).json({ code: 400, msg: 'tokens 不能为空' });
  }

  // ---- 2. 判断当前是上班还是下班 ----
  const now = getChinaTime();
  const hour = now.getHours();
  let isMorning;

  if (forceType === 'morning') {
    isMorning = true;
  } else if (forceType === 'evening') {
    isMorning = false;
  } else {
    isMorning = hour < 12;
  }

  const weatherType = isMorning ? 'today' : 'tomorrow';

  // 默认提醒内容
  const defaultMorning = '宝贝，早上好呀~ ☀️\n记得打卡上班哦，新的一天加油！\n我会一直想你的~ 💕';
  const defaultEvening = '宝贝，下班时间到啦~ 🌙\n记得打卡下班，今天辛苦了！\n回家好好休息，我在等你~ 💖';

  let baseContent = isMorning
    ? (morningContent ? decodeURIComponent(morningContent) : defaultMorning)
    : (eveningContent ? decodeURIComponent(eveningContent) : defaultEvening);

  // ---- 3. 获取天气 ----
  let weatherData = null;
  if (locationId) {
    try {
      const weatherUrl = weatherType === 'today'
        ? `https://devapi.qweather.com/v7/weather/now?location=${locationId}&key=${QWEATHER_API_KEY}&lang=zh`
        : `https://devapi.qweather.com/v7/weather/3d?location=${locationId}&key=${QWEATHER_API_KEY}&lang=zh`;

      const weatherRes = await fetch(weatherUrl);
      const weatherJson = await weatherRes.json();

      if (weatherJson.code === '200') {
        weatherData = weatherJson;
      } else {
        console.warn('天气 API 返回错误:', weatherJson.code);
      }
    } catch (err) {
      console.error('天气获取失败:', err.message);
    }
  }

  // ---- 4. 融合天气内容 ----
  const finalContent = buildWeatherText(baseContent, weatherData, weatherType);

  // ---- 5. 生成 HTML ----
  const htmlContent = buildHtmlContent(finalContent, isMorning, title);

  // ---- 6. 发送 PushPlus ----
  const results = [];
  for (const token of tokenList) {
    try {
      const pushUrl = `https://www.pushplus.plus/send?token=${encodeURIComponent(token)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(htmlContent)}&type=html`;
      const pushRes = await fetch(pushUrl);
      const pushText = await pushRes.text();
      const isOk = pushText.includes('"code":200') || pushText.includes('"code":0');
      results.push({ token: token.substring(0, 8) + '...', success: isOk, response: pushText });
    } catch (err) {
      results.push({ token: token.substring(0, 8) + '...', success: false, error: err.message });
    }
  }

  const successCount = results.filter(r => r.success).length;

  return res.status(200).json({
    code: 200,
    msg: `推送完成，成功 ${successCount}/${tokenList.length}`,
    type: isMorning ? 'morning' : 'evening',
    weatherFetched: !!weatherData,
    chinaTime: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    results,
  });
}
