// Vercel Serverless Function - 代理 PushPlus API
export default function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 405, msg: 'Method not allowed' });
  }

  const { token, title, content, type = 'html' } = req.query;

  // 验证必需参数
  if (!token) {
    return res.status(400).json({ code: 400, msg: '缺少 token 参数' });
  }

  // 调用 PushPlus API
  const pushPlusUrl = `https://www.pushplus.plus/send?token=${encodeURIComponent(token)}&title=${encodeURIComponent(title || '打卡提醒')}&content=${encodeURIComponent(content || '')}&type=${type}`;

  // 使用 fetch API（Vercel 内置支持）
  return fetch(pushPlusUrl)
    .then(response => response.text())
    .then(data => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(data);
    })
    .catch(error => {
      console.error('Proxy error:', error);
      res.status(500).json({ code: 500, msg: '代理请求失败：' + error.message });
    });
}
