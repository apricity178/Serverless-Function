/**
 * 打卡提醒 - PushPlus 代理 Worker
 * 
 * 部署到 Cloudflare Workers（免费）
 * 解决浏览器 CORS 跨域问题
 * 
 * 使用方法：
 * 1. 注册 Cloudflare 账号
 * 2. 创建 Worker，复制本文件代码
 * 3. 部署后获得 URL，如：https://punch-reminder.yourname.workers.dev
 * 4. 前端调用这个 Worker URL 即可
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS 头部
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  // 只接受 GET 请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ code: 405, msg: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 获取请求参数
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const title = url.searchParams.get('title')
  const content = url.searchParams.get('content')
  const type = url.searchParams.get('type') || 'html'

  // 参数验证
  if (!token) {
    return new Response(JSON.stringify({ code: 400, msg: 'Missing token parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 调用 PushPlus API
  const pushPlusUrl = `https://www.pushplus.plus/send?token=${token}&title=${title || '打卡提醒'}&content=${content || ''}&type=${type}`

  try {
    const response = await fetch(pushPlusUrl)
    const text = await response.text()
    
    return new Response(text, {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ code: 500, msg: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}
