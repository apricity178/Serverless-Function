// 河南省所有市、县、区数据
const HENAN_CITIES = [
  // 郑州市
  { name: '郑州市', district: '中原区' },
  { name: '郑州市', district: '二七区' },
  { name: '郑州市', district: '管城回族区' },
  { name: '郑州市', district: '金水区' },
  { name: '郑州市', district: '上街区' },
  { name: '郑州市', district: '惠济区' },
  { name: '郑州市', district: '巩义市' },
  { name: '郑州市', district: '荥阳市' },
  { name: '郑州市', district: '新密市' },
  { name: '郑州市', district: '新郑市' },
  { name: '郑州市', district: '登封市' },
  { name: '郑州市', district: '中牟县' },

  // 开封市
  { name: '开封市', district: '龙亭区' },
  { name: '开封市', district: '顺河回族区' },
  { name: '开封市', district: '鼓楼区' },
  { name: '开封市', district: '禹王台区' },
  { name: '开封市', district: '祥符区' },
  { name: '开封市', district: '杞县' },
  { name: '开封市', district: '通许县' },
  { name: '开封市', district: '尉氏县' },
  { name: '开封市', district: '兰考县' },

  // 洛阳市
  { name: '洛阳市', district: '老城区' },
  { name: '洛阳市', district: '西工区' },
  { name: '洛阳市', district: '瀍河回族区' },
  { name: '洛阳市', district: '涧西区' },
  { name: '洛阳市', district: '吉利区' },
  { name: '洛阳市', district: '洛龙区' },
  { name: '洛阳市', district: '孟津县' },
  { name: '洛阳市', district: '新安县' },
  { name: '洛阳市', district: '栾川县' },
  { name: '洛阳市', district: '嵩县' },
  { name: '洛阳市', district: '汝阳县' },
  { name: '洛阳市', district: '宜阳县' },
  { name: '洛阳市', district: '洛宁县' },
  { name: '洛阳市', district: '伊川县' },
  { name: '洛阳市', district: '偃师市' },

  // 平顶山市
  { name: '平顶山市', district: '新华区' },
  { name: '平顶山市', district: '卫东区' },
  { name: '平顶山市', district: '石龙区' },
  { name: '平顶山市', district: '湛河区' },
  { name: '平顶山市', district: '宝丰县' },
  { name: '平顶山市', district: '叶县' },
  { name: '平顶山市', district: '鲁山县' },
  { name: '平顶山市', district: '郏县' },
  { name: '平顶山市', district: '舞钢市' },
  { name: '平顶山市', district: '汝州市' },

  // 安阳市
  { name: '安阳市', district: '文峰区' },
  { name: '安阳市', district: '北关区' },
  { name: '安阳市', district: '殷都区' },
  { name: '安阳市', district: '龙安区' },
  { name: '安阳市', district: '安阳县' },
  { name: '安阳市', district: '汤阴县' },
  { name: '安阳市', district: '滑县' },
  { name: '安阳市', district: '内黄县' },
  { name: '安阳市', district: '林州市' },

  // 鹤壁市
  { name: '鹤壁市', district: '鹤山区' },
  { name: '鹤壁市', district: '山城区' },
  { name: '鹤壁市', district: '淇滨区' },
  { name: '鹤壁市', district: '浚县' },
  { name: '鹤壁市', district: '淇县' },

  // 新乡市
  { name: '新乡市', district: '红旗区' },
  { name: '新乡市', district: '卫滨区' },
  { name: '新乡市', district: '凤泉区' },
  { name: '新乡市', district: '牧野区' },
  { name: '新乡市', district: '新乡县' },
  { name: '新乡市', district: '获嘉县' },
  { name: '新乡市', district: '原阳县' },
  { name: '新乡市', district: '延津县' },
  { name: '新乡市', district: '封丘县' },
  { name: '新乡市', district: '长垣市' },
  { name: '新乡市', district: '卫辉市' },
  { name: '新乡市', district: '辉县市' },

  // 焦作市
  { name: '焦作市', district: '解放区' },
  { name: '焦作市', district: '中站区' },
  { name: '焦作市', district: '马村区' },
  { name: '焦作市', district: '山阳区' },
  { name: '焦作市', district: '修武县' },
  { name: '焦作市', district: '博爱县' },
  { name: '焦作市', district: '武陟县' },
  { name: '焦作市', district: '温县' },
  { name: '焦作市', district: '沁阳市' },
  { name: '焦作市', district: '孟州市' },

  // 濮阳市
  { name: '濮阳市', district: '华龙区' },
  { name: '濮阳市', district: '清丰县' },
  { name: '濮阳市', district: '南乐县' },
  { name: '濮阳市', district: '范县' },
  { name: '濮阳市', district: '台前县' },
  { name: '濮阳市', district: '濮阳县' },

  // 许昌市
  { name: '许昌市', district: '魏都区' },
  { name: '许昌市', district: '建安区' },
  { name: '许昌市', district: '鄢陵县' },
  { name: '许昌市', district: '襄城县' },
  { name: '许昌市', district: '禹州市' },
  { name: '许昌市', district: '长葛市' },

  // 漯河市
  { name: '漯河市', district: '源汇区' },
  { name: '漯河市', district: '郾城区' },
  { name: '漯河市', district: '召陵区' },
  { name: '漯河市', district: '舞阳县' },
  { name: '漯河市', district: '临颍县' },

  // 三门峡市
  { name: '三门峡市', district: '湖滨区' },
  { name: '三门峡市', district: '陕州区' },
  { name: '三门峡市', district: '渑池县' },
  { name: '三门峡市', district: '卢氏县' },
  { name: '三门峡市', district: '义马市' },
  { name: '三门峡市', district: '灵宝市' },

  // 南阳市
  { name: '南阳市', district: '宛城区' },
  { name: '南阳市', district: '卧龙区' },
  { name: '南阳市', district: '南召县' },
  { name: '南阳市', district: '方城县' },
  { name: '南阳市', district: '西峡县' },
  { name: '南阳市', district: '镇平县' },
  { name: '南阳市', district: '内乡县' },
  { name: '南阳市', district: '淅川县' },
  { name: '南阳市', district: '社旗县' },
  { name: '南阳市', district: '唐河县' },
  { name: '南阳市', district: '新野县' },
  { name: '南阳市', district: '桐柏县' },
  { name: '南阳市', district: '邓州市' },

  // 商丘市
  { name: '商丘市', district: '梁园区' },
  { name: '商丘市', district: '睢阳区' },
  { name: '商丘市', district: '民权县' },
  { name: '商丘市', district: '睢县' },
  { name: '商丘市', district: '宁陵县' },
  { name: '商丘市', district: '柘城县' },
  { name: '商丘市', district: '虞城县' },
  { name: '商丘市', district: '夏邑县' },
  { name: '商丘市', district: '永城市' },

  // 信阳市
  { name: '信阳市', district: '浉河区' },
  { name: '信阳市', district: '平桥区' },
  { name: '信阳市', district: '罗山县' },
  { name: '信阳市', district: '光山县' },
  { name: '信阳市', district: '新县' },
  { name: '信阳市', district: '商城县' },
  { name: '信阳市', district: '固始县' },
  { name: '信阳市', district: '潢川县' },
  { name: '信阳市', district: '淮滨县' },
  { name: '信阳市', district: '息县' },

  // 周口市
  { name: '周口市', district: '川汇区' },
  { name: '周口市', district: '扶沟县' },
  { name: '周口市', district: '西华县' },
  { name: '周口市', district: '商水县' },
  { name: '周口市', district: '沈丘县' },
  { name: '周口市', district: '郸城县' },
  { name: '周口市', district: '淮阳县' },
  { name: '周口市', district: '太康县' },
  { name: '周口市', district: '鹿邑县' },
  { name: '周口市', district: '项城市' },

  // 驻马店市
  { name: '驻马店市', district: '驿城区' },
  { name: '驻马店市', district: '西平县' },
  { name: '驻马店市', district: '上蔡县' },
  { name: '驻马店市', district: '平舆县' },
  { name: '驻马店市', district: '正阳县' },
  { name: '驻马店市', district: '确山县' },
  { name: '驻马店市', district: '泌阳县' },
  { name: '驻马店市', district: '汝南县' },
  { name: '驻马店市', district: '遂平县' },
  { name: '驻马店市', district: '新蔡县' },

  // 济源市（省直辖县级市）
  { name: '济源市', district: '济源市' }
];
