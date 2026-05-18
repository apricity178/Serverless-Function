# Cloudflare Worker 代理部署指南

## 为什么需要这个？

浏览器出于安全考虑，禁止网页直接调用第三方 API（CORS 限制）。
```
Failed to fetch
```

**解决方案**：创建一个**代理服务**，让浏览器调用代理，代理再调用 PushPlus API。

---

## 方案一：Cloudflare Workers（推荐 ⭐）

### 特点
- ✅ **完全免费**（每天 10 万次请求）
- ✅ **全球 CDN 加速**
- ✅ **无需信用卡**（免费账号即可）
- ✅ **部署简单**（复制粘贴代码）

---

### 步骤 1：注册 Cloudflare

1. 访问 [cloudflare.com](https://www.cloudflare.com/)
2. 注册免费账号（只需邮箱）

---

### 步骤 2：创建 Worker

1. 登录后，进入 **Workers & Pages**
2. 点击 **Create Application**
3. 选择 **Create Worker**
4. 输入名称，如：`punch-reminder-proxy`
5. 点击 **Deploy**

---

### 步骤 3：编辑代码

1. 部署成功后，点击 **Edit Code**
2. **删除**默认代码
3. **复制** `cloudflare-worker/index.js` 的内容
4. **粘贴**到编辑器
5. 点击 **Save and Deploy**

---

### 步骤 4：获取 Worker URL

部署完成后，你会得到一个 URL，例如：
```
https://punch-reminder-proxy.yourname.workers.dev
```

---

### 步骤 5：更新前端代码

打开 `index.html`，找到 `sendPushNotification` 函数，修改 API 地址：

```javascript
// 将 PushPlus URL 改为你的 Worker URL
const workerUrl = 'https://punch-reminder-proxy.yourname.workers.dev';

const url = `${workerUrl}?token=${token}&title=${encodeURIComponent(config.title)}&content=${encodeURIComponent(htmlContent)}&type=html`;
```

---

## 方案二：Vercel/Netlify 无服务器函数

如果你的网站部署在 Vercel 或 Netlify，可以创建 **Serverless Function**：

### Vercel 示例

创建 `api/proxy.js`：

```javascript
module.exports = async (req, res) => {
  const { token, title, content, type = 'html' } = req.query;
  
  if (!token) {
    return res.status(400).json({ code: 400, msg: 'Missing token' });
  }
  
  const url = `https://www.pushplus.plus/send?token=${token}&title=${title}&content=${content}&type=${type}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    res.status(200).send(text);
  } catch (error) {
    res.status(500).json({ code: 500, msg: error.message });
  }
};
```

部署后调用：`https://your-site.vercel.app/api/proxy?token=xxx&title=xxx&content=xxx`

---

## 方案三：本地后端（临时测试）

如果只想快速测试，可以创建一个简单的 Node.js 代理：

### 创建 `proxy-server.js`

```javascript
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const { token, title, content, type = 'html' } = req.query;
  
  if (!token) {
    return res.status(400).json({ code: 400, msg: 'Missing token' });
  }
  
  try {
    const url = `https://www.pushplus.plus/send?token=${token}&title=${title}&content=${content}&type=${type}`;
    const response = await fetch(url);
    const text = await response.text();
    res.send(text);
  } catch (error) {
    res.status(500).json({ code: 500, msg: error.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
```

运行：
```bash
npm install express node-fetch cors
node proxy-server.js
```

前端调用：`http://localhost:3000/proxy?token=xxx&title=xxx&content=xxx`

---

## 推荐方案对比

| 方案 | 难度 | 费用 | 稳定性 | 推荐度 |
|------|------|------|--------|---------|
| Cloudflare Workers | ⭐ | 免费 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Vercel/Netlify | ⭐⭐ | 免费 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 本地后端 | ⭐⭐⭐ | 免费 | ⭐⭐ | ⭐⭐ |

---

## 下一步

1. **选择方案一**（Cloudflare Workers）
2. 部署 Worker 后，把 URL 告诉我
3. 我帮你更新 `index.html` 使用代理
4. 测试推送 ✅
