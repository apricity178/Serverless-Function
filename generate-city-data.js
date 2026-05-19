const fs = require('fs');

// 读取 CSV 文件
const csvContent = fs.readFileSync('China-City-List-latest.csv', 'utf-8');

// 解析 CSV（处理带逗号的字段）
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[1].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 2; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // 简单解析（假设字段中没有逗号）
    const values = lines[i].split(',');
    if (values.length >= 14) {
      data.push({
        locationId: values[0].trim(),
        nameEN: values[1].trim(),
        nameZH: values[2].trim(),
        country: values[4].trim(),
        provinceEN: values[6].trim(),
        provinceZH: values[7].trim(),
        cityEN: values[8].trim(),
        cityZH: values[9].trim(),
        lat: parseFloat(values[11].trim()),
        lon: parseFloat(values[12].trim()),
        adCode: values[13].trim()
      });
    }
  }
  
  return data;
}

// 解析数据
const cities = parseCSV(csvContent);

// 构建三级联动数据结构
const CITY_DATA = {};

cities.forEach(city => {
  const province = city.provinceZH;
  const cityName = city.cityZH;
  
  // 初始化省
  if (!CITY_DATA[province]) {
    CITY_DATA[province] = {};
  }
  
  // 初始化市
  if (!CITY_DATA[province][cityName]) {
    CITY_DATA[province][cityName] = [];
  }
  
  // 添加区县
  CITY_DATA[province][cityName].push({
    name: city.nameZH,
    id: city.locationId,
    lat: city.lat,
    lon: city.lon,
    adCode: city.adCode
  });
});

// 生成 JavaScript 文件
const jsContent = `// 城市数据 - 从 China-City-List-latest.csv 自动生成
// 生成时间: ${new Date().toISOString()}
// 数据条数: ${cities.length}

const CITY_DATA = ${JSON.stringify(CITY_DATA, null, 2)};

// 获取所有省份
function getProvinces() {
  return Object.keys(CITY_DATA).sort();
}

// 根据省份获取所有市
function getCities(province) {
  if (!CITY_DATA[province]) return [];
  return Object.keys(CITY_DATA[province]).sort();
}

// 根据省市获取所有区县
function getCounties(province, city) {
  if (!CITY_DATA[province] || !CITY_DATA[province][city]) return [];
  return CITY_DATA[province][city];
}
`;

// 写入文件
fs.writeFileSync('city-data.js', jsContent, 'utf-8');

console.log(`✅ 数据生成成功！`);
console.log(`   - 总条数: ${cities.length}`);
console.log(`   - 省份数: ${Object.keys(CITY_DATA).length}`);
console.log(`   - 文件大小: ${(fs.statSync('city-data.js').size / 1024).toFixed(2)} KB`);
