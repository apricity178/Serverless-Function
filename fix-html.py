# 修复 index.html - 删除混乱的内联数据
import sys

file_path = r"C:\Users\高炯\Desktop\打卡提醒\index.html"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 分析（基于 1-indexed 行号）：
# 第 32 行（索引 31）：`<script src="city-data.js"></script>` - 正确，保留
# 第 33 行（索引 32）：`<style>` - 错误，删除
# ...
# 第 156 行（索引 155）：`</script>` - 错误，删除
# 第 157 行（索引 156）：`<style>` - 正确，保留

# 删除索引 32 到 155（即第 33-156 行）
new_lines = lines[:32] + lines[156:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"✅ 修复完成！删除了 {len(lines) - len(new_lines)} 行")
print(f"   原始行数: {len(lines)}")
print(f"   当前行数: {len(new_lines)}")
