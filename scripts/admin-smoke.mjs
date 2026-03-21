import { spawn } from 'node:child_process'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'

const HOST = '127.0.0.1'
const PORT = '3210'
const BASE_URL = `http://${HOST}:${PORT}`

const results = []
const decoder = new TextDecoder()

function addResult(name, pass, status, detail = '') {
  results.push({ name, pass, status, detail })
}

async function request(name, { method = 'GET', path, headers = {}, body, expected } = {}) {
  let res
  let text = ''
  let json = null

  try {
    const requestHeaders = { ...headers }
    const options = {
      method,
      headers: requestHeaders
    }

    if (body !== undefined) {
      requestHeaders['content-type'] = 'application/json'
      options.body = JSON.stringify(body)
    }

    res = await fetch(`${BASE_URL}${path}`, options)
    text = await res.text()
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  } catch (error) {
    addResult(name, false, 'ERR', String(error?.message || error))
    return null
  }

  const pass = Array.isArray(expected) ? expected.includes(res.status) : res.status < 500
  addResult(name, pass, res.status, pass ? 'ok' : text.slice(0, 240))
  return { res, text, json }
}

async function testSSE(name, path, token, readyMarker) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  let gotMarker = false

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'x-admin-token': token },
      signal: controller.signal
    })

    if (!res.ok || !res.body) {
      clearTimeout(timeout)
      addResult(name, false, res.status, 'invalid SSE response')
      return
    }

    const reader = res.body.getReader()
    let payload = ''
    while (payload.length < 8000) {
      const { value, done } = await reader.read()
      if (done) break
      payload += decoder.decode(value, { stream: true })
      if (payload.includes(readyMarker)) {
        gotMarker = true
        break
      }
    }

    clearTimeout(timeout)
    controller.abort()

    addResult(name, gotMarker, res.status, gotMarker ? 'ready received' : payload.slice(0, 240))
  } catch (error) {
    clearTimeout(timeout)
    if (gotMarker) {
      addResult(name, true, 200, 'ready received (abort after read)')
      return
    }
    addResult(name, false, 'ERR', String(error?.name || error?.message || error))
  }
}

function startPreviewServer() {
  return spawn('node', ['.output/server/index.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST,
      PORT,
      NITRO_HOST: HOST,
      NITRO_PORT: PORT
    },
    stdio: ['ignore', 'pipe', 'pipe']
  })
}

async function waitForServerReady(maxAttempts = 60, waitMs = 500) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts`)
      if (res.status >= 200 && res.status < 500) {
        return true
      }
    } catch {
      // ignore until ready
    }
    await delay(waitMs)
  }
  return false
}

async function runChecks() {
  await request('Page /', { path: '/', expected: [200] })
  await request('Page /admin', { path: '/admin', expected: [200] })
  await request('Page /admin/login', { path: '/admin/login', expected: [200] })
  await request('Page /admin/comments', { path: '/admin/comments', expected: [200] })
  await request('Page /robots.txt', { path: '/robots.txt', expected: [200] })
  await request('Page /sitemap.xml', { path: '/sitemap.xml', expected: [200] })

  const postsResp = await request('API /api/posts', { path: '/api/posts', expected: [200] })
  await request('API /api/stats', { path: '/api/stats', expected: [200] })
  await request('API /api/links', { path: '/api/links', expected: [200] })
  await request('API /api/client-info', { path: '/api/client-info', expected: [200] })
  await request('API /api/config (public)', { path: '/api/config', expected: [200] })
  await request('API /api/hybridaction noop', {
    path: '/api/hybridaction/zybTrackerStatisticsAction?__callback__=cb',
    expected: [200]
  })

  await request('Icon windows.svg', { path: '/icons/client/windows.svg', expected: [200] })
  await request('Icon chrome.svg', { path: '/icons/client/chrome.svg', expected: [200] })
  await request('Icon edge.svg', { path: '/icons/client/edge.svg', expected: [200] })
  await request('Icon qq.png', { path: '/icons/client/qq.png', expected: [200] })
  await request('Icon wechat.png', { path: '/icons/client/wechat.png', expected: [200] })
  await request('KaTeX direct path', {
    path: '/_nuxt/katex/dist/katex.min.css',
    expected: [200, 404]
  })

  const posts = postsResp?.json?.data || []
  const firstPost = Array.isArray(posts) ? posts[0] : null
  const firstPostId = firstPost?.id || firstPost?.slug || 'non-existent-post-id'

  const loginResp = await request('AUTH /api/auth/login', {
    method: 'POST',
    path: '/api/auth/login',
    body: { password: '123456' },
    expected: [200]
  })

  const token = loginResp?.json?.data?.token || ''
  addResult('AUTH token extracted', Boolean(token), 'N/A', token ? 'ok' : 'missing token')

  await request('AUTH /api/auth/verify (no token)', {
    path: '/api/auth/verify',
    expected: [200]
  })
  await request('AUTH /api/auth/verify (with token)', {
    path: '/api/auth/verify',
    headers: { 'x-admin-token': token },
    expected: [200]
  })

  await request('401 /api/comments', { path: '/api/comments', expected: [401] })
  await request('401 /api/logs', { path: '/api/logs', expected: [401] })
  await request('401 PUT /api/config', {
    method: 'PUT',
    path: '/api/config',
    body: {},
    expected: [401]
  })
  await request('401 POST /api/config/reset', {
    method: 'POST',
    path: '/api/config/reset',
    expected: [401]
  })
  await request('401 PUT /api/auth/password', {
    method: 'PUT',
    path: '/api/auth/password',
    body: {},
    expected: [401]
  })
  await request('401 POST /api/posts', {
    method: 'POST',
    path: '/api/posts',
    body: {},
    expected: [401]
  })
  await request('401 GET /api/admin/stream', { path: '/api/admin/stream', expected: [401] })
  await request('401 GET /api/comments/stream', { path: '/api/comments/stream', expected: [401] })

  const allCommentsResp = await request('200 /api/comments', {
    path: '/api/comments',
    headers: { 'x-admin-token': token },
    expected: [200]
  })

  await request('200 /api/logs', {
    path: '/api/logs',
    headers: { 'x-admin-token': token },
    expected: [200]
  })
  await request('200 /api/logs/export', {
    path: '/api/logs/export',
    headers: { 'x-admin-token': token },
    expected: [200]
  })
  await request('400 POST /api/logs invalid', {
    method: 'POST',
    path: '/api/logs',
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })

  await request('GET /api/posts/[id]', {
    path: `/api/posts/${encodeURIComponent(firstPostId)}`,
    expected: [200, 404]
  })
  await request('GET /api/posts/[id]/content', {
    path: `/api/posts/${encodeURIComponent(firstPostId)}/content`,
    expected: [200, 404]
  })
  await request('400 PUT /api/posts/[id] invalid', {
    method: 'PUT',
    path: `/api/posts/${encodeURIComponent(firstPostId)}`,
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })
  await request('400 POST /api/posts/[id]/toggle-featured invalid', {
    method: 'POST',
    path: `/api/posts/${encodeURIComponent(firstPostId)}/toggle-featured`,
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })
  await request('404 DELETE /api/posts/non-existent', {
    method: 'DELETE',
    path: '/api/posts/non-existent-post-id',
    headers: { 'x-admin-token': token },
    expected: [404]
  })

  await request('400 POST /api/links invalid', {
    method: 'POST',
    path: '/api/links',
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })
  await request('400 PUT /api/links/info invalid', {
    method: 'PUT',
    path: '/api/links/info',
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })
  await request('404 PUT /api/links/[name] non-existent', {
    method: 'PUT',
    path: '/api/links/non-existent-link-name',
    headers: { 'x-admin-token': token },
    body: { url: 'https://example.com' },
    expected: [404]
  })
  await request('404 DELETE /api/links/[name] non-existent', {
    method: 'DELETE',
    path: '/api/links/non-existent-link-name',
    headers: { 'x-admin-token': token },
    expected: [404]
  })

  await request('400 PUT /api/config invalid body', {
    method: 'PUT',
    path: '/api/config',
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })
  await request('400 PUT /api/auth/password invalid body', {
    method: 'PUT',
    path: '/api/auth/password',
    headers: { 'x-admin-token': token },
    body: {},
    expected: [400]
  })

  await request('200 GET /api/comments/[postId] public', {
    path: `/api/comments/${encodeURIComponent(firstPostId)}`,
    expected: [200]
  })
  await request('200 GET /api/comments/[postId]?admin=1', {
    path: `/api/comments/${encodeURIComponent(firstPostId)}?admin=1`,
    headers: { 'x-admin-token': token },
    expected: [200]
  })
  await request('401 GET /api/comments/[postId]?admin=1 no token', {
    path: `/api/comments/${encodeURIComponent(firstPostId)}?admin=1`,
    expected: [401]
  })
  await request('400 POST /api/comments/[postId] invalid body', {
    method: 'POST',
    path: `/api/comments/${encodeURIComponent(firstPostId)}`,
    body: {},
    expected: [400]
  })

  const commentsMap = allCommentsResp?.json?.data || {}
  const firstCommentPostId = Object.keys(commentsMap)[0] || firstPostId

  await request('404 PUT /api/comments/[postId]/[id] non-existent', {
    method: 'PUT',
    path: `/api/comments/${encodeURIComponent(firstCommentPostId)}/non-existent-comment-id`,
    headers: { 'x-admin-token': token },
    body: { status: 'approved' },
    expected: [404]
  })
  await request('404 DELETE /api/comments/[postId]/[id] non-existent', {
    method: 'DELETE',
    path: `/api/comments/${encodeURIComponent(firstCommentPostId)}/non-existent-comment-id`,
    headers: { 'x-admin-token': token },
    expected: [404]
  })
  await request('404 POST /api/comments/[postId]/[id]/reply non-existent', {
    method: 'POST',
    path: `/api/comments/${encodeURIComponent(firstCommentPostId)}/non-existent-comment-id/reply`,
    headers: { 'x-admin-token': token },
    body: { content: 'smoke reply' },
    expected: [404]
  })
  await request('400 PUT /api/comments/batch/status empty', {
    method: 'PUT',
    path: '/api/comments/batch/status',
    headers: { 'x-admin-token': token },
    body: { status: 'approved', items: [] },
    expected: [400]
  })
  await request('400 POST /api/comments/batch/delete empty', {
    method: 'POST',
    path: '/api/comments/batch/delete',
    headers: { 'x-admin-token': token },
    body: { items: [] },
    expected: [400]
  })

  await request('400 /api/proxy/image missing url', {
    path: '/api/proxy/image',
    expected: [400]
  })
  await request('400 /api/proxy/qq-avatar invalid qq', {
    path: '/api/proxy/qq-avatar?qq=12',
    expected: [400]
  })

  await testSSE('SSE /api/admin/stream ready', '/api/admin/stream', token, 'admin:ready')
  await testSSE('SSE /api/comments/stream ready', '/api/comments/stream', token, 'comments:ready')

  await request('AUTH /api/auth/logout', {
    method: 'POST',
    path: '/api/auth/logout',
    body: { token },
    expected: [200]
  })
}

async function main() {
  const server = startPreviewServer()
  let serverStdout = ''
  let serverStderr = ''

  server.stdout?.on('data', (chunk) => {
    serverStdout += String(chunk)
  })
  server.stderr?.on('data', (chunk) => {
    serverStderr += String(chunk)
  })

  try {
    const ready = await waitForServerReady()
    if (!ready) {
      throw new Error('preview server failed to start in time')
    }

    await runChecks()
  } catch (error) {
    addResult('SMOKE runner', false, 'ERR', String(error?.message || error))
  } finally {
    if (!server.killed) {
      server.kill('SIGTERM')
      await delay(300)
      if (!server.killed) {
        server.kill('SIGKILL')
      }
    }
  }

  if (serverStderr.trim()) {
    addResult('Server stderr non-empty', true, 'INFO', serverStderr.slice(0, 400))
  } else if (serverStdout.trim()) {
    addResult('Server stdout captured', true, 'INFO', serverStdout.slice(0, 400))
  }

  const failed = results.filter(item => !item.pass)
  const passed = results.length - failed.length

  const summary = {
    total: results.length,
    passed,
    failed: failed.length,
    failedCases: failed,
    results
  }

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  if (failed.length > 0) {
    process.exitCode = 1
  }
}

await main()
