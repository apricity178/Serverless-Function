# 修复 index.html - 在 <script> 后添加 <style> 标签
file_path = r"C:\Users\高炯\Desktop\打卡提醒\index.html"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 在第 32 行（索引 31）后面插入 <style>
# 第 32 行是 `<script src="city-data.js"></script>`
# 我们需要在这一行后面插入 `<style>`

# 方案：在第 32 行（索引 31）后插入新行
new_lines = lines[:32] + ['    <style>\n'] + lines[32:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"✅ 修复完成！添加了 <style> 标签")
print(f"   <script> 在第 32 行")
print(f"   <style> 在第 33 行")
