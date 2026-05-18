// 城市搜索和选择功能

// 搜索城市
async function searchCity() {
  const searchInput = document.getElementById('citySearch');
  const select = document.getElementById('citySelect');
  const query = searchInput.value.trim();

  if (!query) {
    showToast('请输入城市名称');
    return;
  }

  try {
    const response = await fetch(`/api/weather?action=lookup&location=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.code === 200 && data.data && data.data.length > 0) {
      // 显示下拉框
      select.style.display = 'block';
      select.innerHTML = '<option value="">请选择城市</option>';

      // 添加搜索结果
      data.data.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id; // 使用城市 ID
        option.textContent = `${city.name} (${city.adm2 || city.adm1})`;
        option.dataset.name = city.name; // 保存城市名
        select.appendChild(option);
      });

      select.onchange = onCitySelect;
      showToast(`找到 ${data.data.length} 个匹配城市，请选择`);
    } else {
      select.style.display = 'none';
      showToast('未找到匹配的城市');
    }
  } catch (error) {
    console.error('City search error:', error);
    showToast('城市搜索失败：' + error.message);
  }
}

// 城市选择
function onCitySelect() {
  const select = document.getElementById('citySelect');
  const selectedOption = select.options[select.selectedIndex];

  if (!selectedOption.value) {
    config.location = '';
    return;
  }

  // 保存选中的城市名
  config.location = selectedOption.dataset.name || selectedOption.textContent;
  console.log('Selected location:', config.location);
}

// 恢复城市选择
function restoreLocationSelector(location) {
  if (!location) return;

  const searchInput = document.getElementById('citySearch');
  const select = document.getElementById('citySelect');

  // 设置搜索框显示城市名
  searchInput.value = location;

  // 尝试加载该城市的选项
  fetch(`/api/weather?action=lookup&location=${encodeURIComponent(location)}`)
    .then(res => res.json())
    .then(data => {
      if (data.code === 200 && data.data && data.data.length > 0) {
        select.style.display = 'block';
        select.innerHTML = '<option value="">请选择城市</option>';

        data.data.forEach(city => {
          const option = document.createElement('option');
          option.value = city.id;
          option.textContent = `${city.name} (${city.adm2 || city.adm1})`;
          option.dataset.name = city.name;

          // 如果匹配当前配置的城市，选中它
          if (city.name === location) {
            option.selected = true;
          }

          select.appendChild(option);
        });

        select.onchange = onCitySelect;
      }
    })
    .catch(err => console.error('Restore city error:', err));
}
