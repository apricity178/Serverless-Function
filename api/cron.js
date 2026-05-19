// Vercel Serverless Function - 服务端定时推送（天气 + PushPlus）
// 由 Vercel Cron Jobs 或 GitHub Actions 定时触发
// 调用方式：GET /api/cron?tokens=xxx&locationId=xxx&title=xxx&morningContent=xxx&eveningContent=xxx

const QWEATHER_API_KEY = '822391a0ebe540ef916c96afd0c21862';

// ======== 特殊日期配置 ========
const SPECIAL_DATES = {
  myBirthday: '10-23',         // 你的生日（月-日，农历0911→公历10月23日）
  herBirthday: '09-27',        // 她的生日（月-日，农历0727→公历9月27日）
  anniversary: '2025-08-20',   // 在一起纪念日（YYYY-MM-DD）
};

// ======== 每日小情话 ========
const XIAOQINGHUA = [
  '遇见你，是我这辈子最幸运的事 💕',
  '我想你了，不止在每一个清晨和黄昏 💗',
  '不管多晚，我都会等你回家 🌙',
  '今天的你，也在闪闪发光呢 ✨',
  '有你在的日子，连发呆都觉得幸福 🫶',
  '我喜欢你，从心动到古稀 💖',
  '想念不用藏起来，因为我想的每一个你 🌸',
  '你是我的单曲循环，也是我的独家记忆 🎵',
  '今天的你，比昨天的星星还耀眼 🌟',
  '愿所有美好都如约而至，包括你 💌',
  '和你在一起的每一天，都是最好的时光 🕊️',
  '你是我疲惫生活里的那颗糖 🍬',
  '想你的时候，连空气都是甜的 🍯',
  '不管多大，你永远是我的小朋友 🧸',
  '我不要世界和平，我只要你 💗',
  '晚安，梦里见~ 🌙✨',
  '今天也在想你，超大声的那种 📢💕',
  '你是我的例外，也是我的偏爱 🏵️',
  '想牵你的手，走完剩下的所有春秋 🌿',
  '遇见你之后，我再也没羡慕过任何人 💫',
  '你一笑，我的世界都亮了 🌈',
  '余生很短，但和你在一起的日子我想慢慢过 🐢',
  '想你想到睡不着，但很甜 💤💕',
  '今天的你也辛苦了，好好休息 💝',
  '不管明天怎样，今晚有我陪着你 🌃',
  '爱你这件事，值得说一万遍 💋',
];

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

// 计算特殊日期倒计时
function getSpecialDatesText(now) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  let lines = [];

  // 在一起纪念日
  const [annYear, annMonth, annDay] = SPECIAL_DATES.anniversary.split('-').map(Number);
  const annThisYear = new Date(year, annMonth - 1, annDay);
  const annBase = new Date(annYear, annMonth - 1, annDay);
  const daysTogether = Math.floor((now - annBase) / 86400000);
  lines.push(`💑 在一起 ${daysTogether} 天啦~`);

  // 你的生日倒计时
  const [myMonth, myDay] = SPECIAL_DATES.myBirthday.split('-').map(Number);
  let myBdayThisYear = new Date(year, myMonth - 1, myDay);
  if (now > myBdayThisYear) myBdayThisYear = new Date(year + 1, myMonth - 1, myDay);
  const daysToMyBday = Math.ceil((myBdayThisYear - now) / 86400000);
  const myBdayLabel = daysToMyBday === 0 ? '🎂 今天是你的生日！生日快乐呀！🎉'
    : daysToMyBday === 1 ? '🎂 明天是你的生日哦，准备好了吗！'
    : `🎂 老公的生日还有 ${daysToMyBday} 天~`;
  lines.push(myBdayLabel);

  // 老婆的生日倒计时
  const [herMonth, herDay] = SPECIAL_DATES.herBirthday.split('-').map(Number);
  let herBdayThisYear = new Date(year, herMonth - 1, herDay);
  if (now > herBdayThisYear) herBdayThisYear = new Date(year + 1, herMonth - 1, herDay);
  const daysToHerBday = Math.ceil((herBdayThisYear - now) / 86400000);
  const herBdayLabel = daysToHerBday === 0 ? '🎀 今天是老婆生日！记得送上祝福呀~ 💐'
    : daysToHerBday === 1 ? '🎀 明天是老婆生日哦，准备好惊喜了吗！'
    : `🎀 老婆的生日还有 ${daysToHerBday} 天~`;
  lines.push(herBdayLabel);

  return lines.join(' | ');
}

// 获取今日小情话
function getTodaysXiaoqinghua(now) {
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % XIAOQINGHUA.length;
  return XIAOQINGHUA[index];
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
  const dayLabel = type === 'tomorrow' ? '明天' : '今天';

  // ---- 穿衣指南（覆盖所有温度段，更自然口语化）----
  if (temp <= 0) {
    suggestions += `   🧥 ${dayLabel}极寒（${temp}°C），全副武装出门吧！羽绒服+保暖内衣+围巾手套~\n`;
  } else if (temp <= 5) {
    suggestions += `   🧥 ${dayLabel}很冷（${temp}°C），厚羽绒服/棉服安排上，注意头部和脚部保暖~\n`;
  } else if (temp <= 10) {
    suggestions += `   🧥 ${dayLabel}较凉（${temp}°C），建议穿大衣或厚毛衣，怕冷加件保暖内衣~\n`;
  } else if (temp <= 15) {
    suggestions += `   🧥 ${dayLabel}微凉（${temp}°C），薄外套或针织衫刚好，早晚记得添衣~\n`;
  } else if (temp <= 20) {
    suggestions += `   👕 ${dayLabel}舒适（${temp}°C），长袖T恤或薄衬衫刚好，早晚可加件薄外套~\n`;
  } else if (temp <= 25) {
    suggestions += `   👕 ${dayLabel}温暖（${temp}°C），单衣长袖即可，午间轻便着装~\n`;
  } else if (temp <= 30) {
    suggestions += `   ☀️ ${dayLabel}偏热（${temp}°C），短袖安排上，记得多喝水哦~\n`;
  } else if (temp <= 35) {
    suggestions += `   🔥 ${dayLabel}炎热（${temp}°C），穿透气轻便的衣服，多喝水防中暑~\n`;
  } else {
    suggestions += `   🚨 ${dayLabel}高温（${temp}°C+），尽量别在户外待太久，空调房注意防护~\n`;
  }

  // ---- 体感温差提醒 ----
  if (feelsLike !== null && feelsLike !== undefined && Math.abs(feelsLike - temp) > 3) {
    if (feelsLike < temp) {
      suggestions += `   ❄️ 体感温度比实际低 ${temp - feelsLike}°C，注意保暖~\n`;
    } else {
      suggestions += `   🔥 体感温度比实际高 ${feelsLike - temp}°C，注意防暑~\n`;
    }
  }

  // ---- 天气状况提醒 ----
  if (weather.includes('雨')) {
    suggestions += weather.includes('大') || weather.includes('暴')
      ? `   ☔ ${dayLabel}有${weather}，记得带伞，注意安全~\n`
      : `   ☔ ${dayLabel}有${weather}，记得带伞哦~\n`;
  }
  if (weather.includes('雪')) {
    suggestions += weather.includes('大') || weather.includes('暴')
      ? `   ❄️ ${dayLabel}有${weather}，注意保暖防滑，小心路滑~\n`
      : `   ❄️ ${dayLabel}有${weather}，注意保暖防滑~\n`;
  }
  if (weather.includes('雾') || weather.includes('霾')) {
    suggestions += `   😷 ${dayLabel}有${weather}，建议戴口罩，减少户外活动~\n`;
  }
  if (weather.includes('晴') || weather.includes('多云')) {
    // 根据紫外线指数判断防晒（明日预报有 daily[0].uvIndex，now预报没有则按温度判断）
    const uvIndexVal = weatherData.daily && weatherData.daily[0] ? weatherData.daily[0].uvIndex : null;
    if (uvIndexVal) {
      const uv = parseInt(uvIndexVal);
      if (uv >= 3) {
        const uvDesc = { '1': '极弱', '2': '弱', '3': '中等', '4': '强', '5': '很强', '6': '极强' };
        suggestions += `   ☀️ ${dayLabel}紫外线${uvDesc[uvIndexVal] || '较强'}（指数${uv}），记得涂防晒霜~\n`;
      }
    } else if (weather.includes('晴') && temp > 20) {
      suggestions += `   😎 ${dayLabel}阳光明媚，适合户外活动，但注意防晒~\n`;
    }
  }
  if (weather.includes('阴')) {
    suggestions += `   🌥️ ${dayLabel}阴天，气温适宜，适合外出活动~\n`;
  }

  // ---- 风力提醒 ----
  // ---- 风力提醒 ----
  if (windScale >= 7) {
    suggestions += `   💨 风力较大（${windScale}级），注意防风，远离广告牌/临时搭建物~\n`;
  } else if (windScale >= 5) {
    suggestions += `   💨 风力较大（${windScale}级），注意防风保暖~\n`;
  }

  // ---- 早晚温差提醒 ----
  if (weatherData.daily) {
    const tomorrowData = weatherData.daily[0];
    const tempMin = parseInt(tomorrowData.tempMin);
    const tempMax = parseInt(tomorrowData.tempMax);
    const tempDiff = tempMax - tempMin;
    if (tempDiff >= 10) {
      suggestions += `   🌡️ 温差较大（${tempDiff}°C），早晚记得添衣保暖~\n`;
    }
  }

  // ---- 特殊日期倒计时 ----
  const specialDatesText = getSpecialDatesText(getChinaTime());
  suggestions += '\n' + specialDatesText + '\n';

  // ---- 今日小情话 ----
  const xqh = getTodaysXiaoqinghua(getChinaTime());
  suggestions += '\n💌 ' + xqh;

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
