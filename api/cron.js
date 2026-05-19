// Vercel Serverless Function - 服务端定时推送（天气 + PushPlus）
// 由 Vercel Cron Jobs 或 GitHub Actions 定时触发
// 调用方式：GET /api/cron?tokens=xxx&locationId=xxx&title=xxx&morningContent=xxx&eveningContent=xxx

// ======== 环境变量配置（Vercel Cron 触发时使用）=======
const CRON_CONFIG = {
  // PushPlus Tokens，多个用逗号分隔
  tokens: process.env.PUSHPLUS_TOKENS || '',
  // 和风天气 Location ID
  locationId: process.env.QWEATHER_LOCATION_ID || '101181502',
  // 推送标题
  title: process.env.PUSHPLUS_TITLE || '打卡提醒',
  // 上班提醒内容（可选，不填则用默认）
  morningContent: process.env.PUSHPLUS_MORNING_CONTENT || '',
  // 下班提醒内容（可选，不填则用默认）
  eveningContent: process.env.PUSHPLUS_EVENING_CONTENT || '',
  // 特殊日期 JSON（可选）
  specialDatesJson: process.env.SPECIAL_DATES_JSON || '',
};

const QWEATHER_API_KEY = '822391a0ebe540ef916c96afd0c21862';

// ======== 特殊日期配置（支持 URL 参数覆盖）=======
let SPECIAL_DATES = {
  myBirthday: '10-23',
  herBirthday: '09-27',
  anniversary: '2025-08-20',
};

// ======== 节日小情话（按节日分类）=======
const FESTIVAL_XIAOQINGHUA = {
  // 元旦
  newyear: [
    '🎊 新年第一天，有你在身边就是最好的开始~',
    '🌅 元旦快乐！新的一年，和你一起走过每一天~',
    '🎉 新年第一天，想对你说：遇见你，是我最大的幸运~',
    '🥂 新年好呀！愿我们在新的一年里，依然甜蜜如初~',
    '🎆 新年到！新的一年，陪你从日出到日落~',
  ],
  // 春节
  spring: [
    '🧧 新春快乐！老公/老婆，新年要有新气象，但我的爱你永远不变~',
    '🎊 过年啦！祝我们新年快乐，愿每一天都像今天一样幸福~',
    '🧨 春节到！新的一年，继续牵着手往前走~',
    '🏮 新春大吉！老公/老婆，过年也要甜甜蜜蜜哦~',
    '🎇 除夕快乐！今晚有你，新年才完整~',
  ],
  // 情人节
  valentine: [
    '💝 情人节快乐！老公/老婆，我爱你，不止今天~',
    '🌹 今天是情人节，想牵着你的手说：我爱你~',
    '💕 情人节快乐！遇见你，是我最美的意外~',
    '💗 今天是属于我们的节日，老公/老婆，节日快乐~',
    '💘 情人节到了，想大声告诉你：我超爱你~',
  ],
  // 七夕
  qixi: [
    '🌜 七夕快乐！老公/老婆，今晚的星星都没你耀眼~',
    '💫 七夕情人节，愿我们永远如今日般相爱~',
    '🌙 七夕到了，牛郎织女都羡慕我们呢~',
    '🐂 七夕快乐！不用隔河相望，我们天天在一起~',
    '💝 今天是七夕，想和你一起看星星，想你~',
  ],
  // 520
  '520': [
    '💗 520！我爱你！老公/老婆，今天要甜一点~',
    '💕 520快乐！想对你说的情话，今天说一百遍都不够~',
    '💖 520到啦！我爱你，不止今天，每一天都是~',
    '💓 520，老公/老婆，节日快乐！我超爱你的~',
    '💘 今天520，想牵着你的手说：我好喜欢你~',
  ],
  // 521
  '521': [
    '💗 521！我爱你！老公/老婆，今天也要甜甜的~',
    '💕 521快乐！我爱你这件事，值得说一万年~',
    '💖 521到啦！每一天爱你都不够~',
    '💓 521，我的唯一，我最爱的人，节日快乐~',
    '💘 今天521，老公/老婆我爱你！超爱的那种~',
  ],
  // 中秋
  midautumn: [
    '🌕 中秋节快乐！月圆人团圆，有你在身边就是最好的团圆~',
    '🥮 中秋到！想和你一起赏月，吃月饼，陪你~',
    '🌝 中秋节快乐！今晚的月亮很圆，但不如你在我身边~',
    '🏮 中秋快乐！月圆之夜，想和你一起看月亮~',
    '🥮 中秋到！团圆的日子，有你才完整~',
  ],
  // 国庆
  nationalday: [
    '🏮 国庆节快乐！假期来啦，陪你的时间更多了~',
    '🎉 祝我们国庆快乐！有你在，哪儿都是好风景~',
    '🌟 国庆节到！可以一起出去浪啦~',
    '🎊 国庆快乐！终于可以好好陪你了~',
    '🌈 国庆假期，想和你一起看祖国的大好河山~',
  ],
  // 圣诞
  christmas: [
    '🎄 圣诞节快乐！有你陪伴的每一天都是节日~',
    '🎅 圣诞到！老公/老婆，节日快乐~想要什么礼物？',
    '🎁 圣诞节快乐！遇见你，是我收到最好的礼物~',
    '🔔 圣诞快乐！今晚有我陪，比圣诞老人还暖~',
    '⭐ 圣诞节到！愿我们岁岁年年都像今天一样甜~',
  ],
  // 跨年夜
  newyearseve: [
    '🎆 跨年夜快乐！今年有你，明年也有你~',
    '🎇 又一年过去了，谢谢你一直陪在我身边~',
    '🥂 跨年夜！老公/老婆，新年快乐！我爱你~',
    '🌟 今年的最后一刻，想和你一起倒数~',
    '🎊 跨年夜！和你在一起的每一年，都是最好的一年~',
  ],
  // 老公生日
  mybirthday: [
    '🎂 今天是你的生日！老公，生日快乐！我会一直爱你~',
    '🎉 生日快乐！今天你是主角，要开开心心的哦~',
    '🎁 老公生日快乐！新的一岁，我们继续一起走~',
    '🌟 今天是你的大日子！生日快乐，我爱你~',
    '🥳 老公生日到！祝最爱的人生日快乐，万事胜意~',
  ],
  // 老婆生日
  herbirthday: [
    '🎀 今天是老婆的生日！生日快乐，我的小公主~',
    '🎉 老婆生日快乐！愿你永远像今天一样美丽快乐~',
    '💐 生日快乐！今天你是最美的，全世界都是你的~',
    '🎂 老婆，生日快乐！遇见你，是我最大的幸运~',
    '🌹 今天是你的生日！老婆，我爱你，永远爱你~',
  ],
  // 在一起纪念日
  anniversary: [
    '💑 在一起纪念日快乐！老公/老婆，谢谢你陪我走到今天~',
    '🎊 今天是我们的纪念日！回想这一天，全是幸福~',
    '💕 纪念日快乐！和你在一起的每一天，都值得纪念~',
    '🌸 今天是纪念日！老公/老婆，我爱你，一如既往~',
    '💖 纪念日到！感谢遇见你，感谢爱上你，感谢你一直都在~',
  ],
};

// ======== 日常小情话（上班/下班分开）=======
const XIAOQINGHUA_MORNING = [
  '早安，老公/老婆~今天也是爱你的一天 💕',
  '早安~新的一天开始了，想你 💗',
  '早安呀~起床第一件事就是想你 ☀️',
  '早上好~今天也要甜甜的哦 🌸',
  '早安~我的老公/老婆，今天也要加油 💪',
  '早安！今天天气很好，但不如你笑起来好看 🌞',
  '早安呀~醒来第一个想到的是你 💭',
  '早上好~新的一天，继续爱你 💕',
  '早安！今天也在想你，超大声的那种 📢',
  '早安呀~有你的早晨，连阳光都更温暖 🌅',
  '早上好~老公/老婆，起床啦，新的一天开始啦 ☀️',
  '早安~今天也要开开心心的，我在想你 💗',
  '早安呀~睁开眼就想告诉你：我爱你 💖',
  '早上好~今天的你也很好看呢 🌸',
  '早安~新的一天，先送一个早安吻 💋',
  '早安呀~今天的你，也在闪闪发光 ✨',
  '早上好~想你的时候，连空气都是甜的 🍬',
  '早安！不管多大，你永远是我的小朋友 🧸',
  '早安~你是我疲惫生活里的那颗糖 💕',
  '早上好~今天也要元气满满，我在想你 💗',
];

const XIAOQINGHUA_EVENING = [
  '晚安，老公/老婆~今天也辛苦了 💤',
  '晚安~下班了没？我在想你 🌙',
  '晚上好~今天的你辛苦了，好好休息 🌟',
  '晚安呀~不管多晚，我都会等你 🏠',
  '晚上好~回家路上注意安全，我在想你 💗',
  '晚安~今天辛苦了，早点休息哦 🌙',
  '晚上好~工作一天累了吧，想抱抱你 💝',
  '晚安呀~今晚做个好梦，梦里见 🌙✨',
  '晚上好~辛苦了，我的宝贝 💕',
  '晚安~回家路上小心，想你 🌙',
  '晚上好~今天也想你了，超大声的那种 📢',
  '晚安~你在身边的时候，连发呆都觉得幸福 🫶',
  '晚上好~累了吧？今天你也很棒 💖',
  '晚安呀~余生很短，但和你在一起的日子我想慢慢过 🐢',
  '晚上好~不管明天怎样，今晚有我陪着你 🌃',
  '晚安~想你想到睡不着，但很甜 💤💕',
  '晚上好~今天的你也辛苦了，好好休息 💝',
  '晚安~明天见，我最爱的人 🌙',
  '晚上好~陪你从心动到古稀 💕',
  '晚安呀~我不要世界和平，我只要你 💗',
];

// ======== 融合节日+日常小情话 ========
function getFestivalXiaoqinghua(now, type) {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const monthDay = `${month}-${day}`;
  const weekday = now.getDay();

  // 检查今天是什么节日
  // 元旦
  if (monthDay === '1-1') return pickOne(FESTIVAL_XIAOQINGHUA.newyear, now, type);
  // 情人节
  if (monthDay === '2-14') return pickOne(FESTIVAL_XIAOQINGHUA.valentine, now, type);
  // 520
  if (monthDay === '5-20') return pickOne(FESTIVAL_XIAOQINGHUA['520'], now, type);
  // 521
  if (monthDay === '5-21') return pickOne(FESTIVAL_XIAOQINGHUA['521'], now, type);
  // 中秋（农历八月十五≈公历9月）
  if (monthDay === '9-15' || monthDay === '9-16' || monthDay === '9-17') return pickOne(FESTIVAL_XIAOQINGHUA.midautumn, now, type);
  // 国庆
  if (monthDay === '10-1') return pickOne(FESTIVAL_XIAOQINGHUA.nationalday, now, type);
  // 圣诞
  if (monthDay === '12-25') return pickOne(FESTIVAL_XIAOQINGHUA.christmas, now, type);
  // 跨年夜
  if (monthDay === '12-31') return pickOne(FESTIVAL_XIAOQINGHUA.newyearseve, now, type);

  // 检查特殊日期
  const year = now.getFullYear();
  // 老公生日
  const [myMonth, myDay] = SPECIAL_DATES.myBirthday.split('-').map(Number);
  if (month === myMonth && day === myDay) return pickOne(FESTIVAL_XIAOQINGHUA.mybirthday, now, type);
  // 老婆生日
  const [herMonth, herDay] = SPECIAL_DATES.herBirthday.split('-').map(Number);
  if (month === herMonth && day === herDay) return pickOne(FESTIVAL_XIAOQINGHUA.herbirthday, now, type);
  // 在一起纪念日
  const [annYear, annMonth, annDay] = SPECIAL_DATES.anniversary.split('-').map(Number);
  if (month === annMonth && day === annDay) return pickOne(FESTIVAL_XIAOQINGHUA.anniversary, now, type);

  // 春节期间（近似：1月21日-2月5日左右）
  if ((month === 1 && day >= 21) || (month === 2 && day <= 5)) {
    return pickOne(FESTIVAL_XIAOQINGHUA.spring, now, type);
  }
  // 七夕近似（农历七月初七≈公历8月）
  if (month === 8 && (day >= 10 && day <= 14)) {
    return pickOne(FESTIVAL_XIAOQINGHUA.qixi, now, type);
  }

  // 日常：根据上下班选不同的情话
  if (type === 'morning') {
    return pickOne(XIAOQINGHUA_MORNING, now, type);
  } else {
    return pickOne(XIAOQINGHUA_EVENING, now, type);
  }
}

function pickOne(arr, now, type) {
  // 用日期+上下班类型作为seed，保证每天固定且上下班不同
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + (type === 'evening' ? 1000 : 0);
  return arr[seed % arr.length];
}

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

// 获取今日小情话（根据上下班类型，返回不同的内容）
function getTodaysXiaoqinghua(now, type) {
  return getFestivalXiaoqinghua(now, type);
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

  // ---- 今日小情话（上下班不同）----
  const xqh = getTodaysXiaoqinghua(getChinaTime(), type === 'today' ? 'morning' : 'evening');
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

  // ---- 1. 解析参数（优先 URL 参数，其次环境变量）----
  const urlTokens = req.query.tokens;
  const urlLocationId = req.query.locationId;
  const urlTitle = req.query.title;
  const urlMorningContent = req.query.morningContent;
  const urlEveningContent = req.query.eveningContent;
  const urlSpecialDatesJson = req.query.specialDatesJson;

  // URL 参数优先，环境变量兜底
  const tokens = urlTokens || CRON_CONFIG.tokens;
  const locationId = urlLocationId || CRON_CONFIG.locationId;
  const title = urlTitle || CRON_CONFIG.title;
  const morningContent = urlMorningContent || CRON_CONFIG.morningContent;
  const eveningContent = urlEveningContent || CRON_CONFIG.eveningContent;
  const specialDatesJson = urlSpecialDatesJson || CRON_CONFIG.specialDatesJson;

  // 覆盖特殊日期（支持从 URL 参数或环境变量传入）
  if (specialDatesJson) {
    try {
      const parsed = JSON.parse(decodeURIComponent(specialDatesJson));
      if (parsed.myBirthday) SPECIAL_DATES.myBirthday = parsed.myBirthday;
      if (parsed.herBirthday) SPECIAL_DATES.herBirthday = parsed.herBirthday;
      if (parsed.anniversary) SPECIAL_DATES.anniversary = parsed.anniversary;
    } catch (e) {
      console.warn('specialDatesJson 解析失败:', e.message);
    }
  }

  // forceType 仅支持手动测试（URL 参数传来）
  const forceType = req.query.forceType;

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
  const defaultMorning = '老公/老婆，早上好呀~ ☀️\n记得打卡上班哦，新的一天加油！\n我会一直想你的~ 💕';
  const defaultEvening = '老公/老婆，下班时间到啦~ 🌙\n记得打卡下班，今天辛苦了！\n回家好好休息，我在等你~ 💖';

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
