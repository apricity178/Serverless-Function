// 中国主要城市数据（省市县三级）
// 数据来源：和风天气 API 支持的城市列表

const CITY_DATA = {
  "北京": {
    "北京": ["北京"]
  },
  "上海": {
    "上海": ["上海", "浦东", "闵行", "徐汇", "长宁", "静安", "普陀", "虹口", "杨浦", "黄浦", "卢湾", "南市", "奉贤", "松江", "金山", "青浦", "嘉定", "宝山", "崇明"]
  },
  "天津": {
    "天津": ["天津", "和平", "河东", "河西", "南开", "河北", "红桥", "塘沽", "汉沽", "大港", "东丽", "西青", "北辰", "津南", "武清", "宝坻", "蓟县", "宁河", "静海"]
  },
  "重庆": {
    "重庆": ["重庆", "万州", "涪陵", "渝中", "大渡口", "江北", "沙坪坝", "九龙坡", "南岸", "北碚", "万盛", "双桥", "渝北", "巴南", "长寿", "綦江", "潼南", "铜梁", "大足", "荣昌", "璧山", "梁平", "城口", "丰都", "垫江", "武隆", "忠县", "开县", "云阳", "奉节", "巫山", "巫溪", "石柱", "秀山", "酉阳", "彭水", "江津", "合川", "永川", "南川"]
  },
  "广东": {
    "广州": ["广州", "越秀", "荔湾", "海珠", "天河", "白云", "黄埔", "番禺", "花都", "南沙", "增城", "从化"],
    "深圳": ["深圳", "罗湖", "福田", "南山", "宝安", "龙岗", "盐田", "光明", "坪山", "龙华", "大鹏新区"],
    "珠海": ["珠海", "香洲", "斗门", "金湾"],
    "东莞": ["东莞"],
    "佛山": ["佛山", "禅城", "南海", "顺德", "三水", "高明"],
    "中山": ["中山"],
    "惠州": ["惠州", "惠城", "惠阳", "博罗", "惠东", "龙门"],
    "汕头": ["汕头", "金平", "龙湖", "濠江", "潮阳", "潮南", "澄海", "南澳"]
  },
  "浙江": {
    "杭州": ["杭州", "上城", "下城", "江干", "拱墅", "西湖", "滨江", "萧山", "余杭", "富阳", "临安", "桐庐", "淳安", "建德"],
    "宁波": ["宁波", "海曙", "江东", "江北", "北仑", "镇海", "鄞州", "象山", "宁海", "余姚", "慈溪", "奉化"],
    "温州": ["温州", "鹿城", "龙湾", "瓯海", "洞头", "瑞安", "乐清", "永嘉", "平阳", "苍南", "文成", "泰顺"],
    "嘉兴": ["嘉兴", "南湖", "秀洲", "海宁", "平湖", "桐乡", "嘉善", "海盐"]
  },
  "江苏": {
    "南京": ["南京", "玄武", "白下", "秦淮", "建邺", "鼓楼", "下关", "浦口", "栖霞", "雨花台", "江宁", "六合", "溧水", "高淳"],
    "苏州": ["苏州", "沧浪", "平江", "金阊", "虎丘", "吴中", "相城", "姑苏", "吴江", "常熟", "张家港", "昆山", "太仓"],
    "无锡": ["无锡", "崇安", "南长", "北塘", "锡山", "惠山", "滨湖", "江阴", "宜兴"],
    "常州": ["常州", "天宁", "钟楼", "戚墅堰", "新北", "武进", "溧阳", "金坛"]
  },
  "四川": {
    "成都": ["成都", "锦江", "青羊", "金牛", "武侯", "成华", "龙泉驿", "青白江", "新都", "温江", "金堂", "双流", "郫县", "大邑", "蒲江", "新津", "都江堰", "彭州", "邛崃", "崇州"],
    "绵阳": ["绵阳", "涪城", "游仙", "三台", "盐亭", "安县", "梓潼", "北川", "平武", "江油"]
  },
  "湖北": {
    "武汉": ["武汉", "江岸", "江汉", "硚口", "汉阳", "武昌", "青山", "洪山", "东西湖", "汉南", "蔡甸", "江夏", "黄陂", "新洲"],
    "宜昌": ["宜昌", "西陵", "伍家岗", "点军", "猇亭", "夷陵", "远安", "兴山", "秭归", "长阳", "五峰", "宜都", "当阳", "枝江"]
  },
  "湖南": {
    "长沙": ["长沙", "芙蓉", "天心", "岳麓", "开福", "雨花", "望城", "长沙县", "宁乡", "浏阳"]
  },
  "山东": {
    "济南": ["济南", "历下", "市中", "槐荫", "天桥", "历城", "长清", "平阴", "济阳", "商河", "章丘"],
    "青岛": ["青岛", "市南", "市北", "四方", "黄岛", "崂山", "李沧", "城阳", "胶州", "即墨", "平度", "胶南", "莱西"]
  },
  "河南": {
    "郑州": ["郑州", "中原", "二七", "管城", "金水", "上街", "惠济", "中牟", "巩义", "荥阳", "新密", "新郑", "登封"]
  },
  "河北": {
    "石家庄": ["石家庄", "长安", "桥东", "桥西", "新华", "裕华", "井陉矿", "井陉", "正定", "行唐", "灵寿", "高邑", "深泽", "赞皇", "无极", "平山", "元氏", "赵县", "辛集", "藁城", "晋州", "新乐", "鹿泉"]
  },
  "辽宁": {
    "沈阳": ["沈阳", "和平", "沈河", "大东", "皇姑", "铁西", "苏家屯", "东陵", "新城子", "于洪", "辽中", "康平", "法库", "新民"],
    "大连": ["大连", "中山", "西岗", "沙河口", "甘井子", "旅顺口", "金州", "长海", "瓦房店", "普兰店", "庄河"]
  },
  "陕西": {
    "西安": ["西安", "新城", "碑林", "莲湖", "灞桥", "未央", "雁塔", "阎良", "临潼", "长安", "蓝田", "周至", "户县", "高陵"]
  },
  "福建": {
    "福州": ["福州", "鼓楼", "台江", "仓山", "马尾", "晋安", "闽侯", "连江", "罗源", "闽清", "永泰", "平潭", "福清", "长乐"],
    "厦门": ["厦门", "思明", "海沧", "湖里", "集美", "同安", "翔安"]
  },
  "安徽": {
    "合肥": ["合肥", "瑶海", "庐阳", "蜀山", "包河", "长丰", "肥东", "肥西", "庐江", "巢湖"]
  },
  "江西": {
    "南昌": ["南昌", "东湖", "西湖", "青云谱", "湾里", "青山湖", "新建", "南昌县", "安义", "进贤"]
  },
  "云南": {
    "昆明": ["昆明", "五华", "盘龙", "官渡", "西山", "东川", "呈贡", "晋宁", "富民", "宜良", "石林", "嵩明", "禄劝", "寻甸", "安宁"]
  },
  "广西": {
    "南宁": ["南宁", "兴宁", "青秀", "江南", "西乡塘", "良庆", "邕宁", "武鸣", "隆安", "马山", "上林", "宾阳", "横县"]
  },
  "山西": {
    "太原": ["太原", "小店", "迎泽", "杏花岭", "尖草坪", "万柏林", "晋源", "清徐", "阳曲", "娄烦", "古交"]
  },
  "吉林": {
    "长春": ["长春", "南关", "宽城", "朝阳", "二道", "绿园", "双阳", "农安", "九台", "榆树", "德惠"]
  },
  "黑龙江": {
    "哈尔滨": ["哈尔滨", "道里", "南岗", "道外", "平房", "松北", "香坊", "呼兰", "阿城", "依兰", "方正", "宾县", "巴彦", "木兰", "通河", "延寿", "双城", "尚志", "五常"]
  },
  "贵州": {
    "贵阳": ["贵阳", "南明", "云岩", "花溪", "乌当", "白云", "观山湖", "开阳", "息烽", "修文", "清镇"]
  }
};

// 页面加载时初始化省份下拉框
function initProvinceSelector() {
  const provinceSelect = document.getElementById('province');
  provinceSelect.innerHTML = '<option value="">请选择省份</option>';
  
  Object.keys(CITY_DATA).forEach(province => {
    const option = document.createElement('option');
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });
}

// 省份变化时更新城市下拉框
function onProvinceChange() {
  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const countySelect = document.getElementById('county');
  
  const selectedProvince = provinceSelect.value;
  
  // 重置城市和区县
  citySelect.innerHTML = '<option value="">请选择城市</option>';
  countySelect.innerHTML = '<option value="">请选择区县</option>';
  countySelect.disabled = true;
  
  if (!selectedProvince) {
    citySelect.disabled = true;
    config.location = '';
    return;
  }
  
  // 启用城市下拉框
  citySelect.disabled = false;
  
  // 填充城市选项
  const cities = CITY_DATA[selectedProvince];
  Object.keys(cities).forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

// 城市变化时更新区县下拉框
function onCityChange() {
  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const countySelect = document.getElementById('county');
  
  const selectedProvince = provinceSelect.value;
  const selectedCity = citySelect.value;
  
  // 重置区县
  countySelect.innerHTML = '<option value="">请选择区县</option>';
  
  if (!selectedCity) {
    countySelect.disabled = true;
    config.location = selectedProvince;
    return;
  }
  
  // 启用区县下拉框
  countySelect.disabled = false;
  
  // 填充区县选项
  const counties = CITY_DATA[selectedProvince][selectedCity];
  counties.forEach(county => {
    const option = document.createElement('option');
    option.value = county;
    option.textContent = county;
    countySelect.appendChild(option);
  });
  
  // 更新 location（省市）
  config.location = selectedCity;
}

// 区县变化
function onCountyChange() {
  const provinceSelect = document.getElementById('province');
  const citySelect = document.getElementById('city');
  const countySelect = document.getElementById('county');
  
  const selectedProvince = provinceSelect.value;
  const selectedCity = citySelect.value;
  const selectedCounty = countySelect.value;
  
  // 更新 location（省市县）
  if (selectedCounty && selectedCounty !== selectedCity) {
    config.location = selectedCounty; // 和风天气 API 支持直接搜索区县名
  } else {
    config.location = selectedCity;
  }
}
