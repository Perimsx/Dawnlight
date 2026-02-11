import { readComments, writeComments, UserComment } from '../../utils/storage'
import { extractClientInfo } from '../../utils/clientInfo'

// Rate limiting state (in-memory)
// Note: In production with multiple workers/instances, use Redis.
const rateLimitMap = new Map<string, number>()
const ipRateLimitMap = new Map<string, number>()
const ipRateCountMap = new Map<string, { count: number, windowStart: number }>()

const RATE_LIMIT_MS = 60000 // 60s
const IP_RATE_LIMIT_MS = 30000 // 30s
const IP_RATE_LIMIT_MAX = 10 // 10 per 10min

// Cleanup interval
setInterval(() => {
    const now = Date.now()
    for (const [key, time] of rateLimitMap) {
        if (now - time > RATE_LIMIT_MS) rateLimitMap.delete(key)
    }
    for (const [key, time] of ipRateLimitMap) {
        if (now - time > IP_RATE_LIMIT_MS) ipRateLimitMap.delete(key)
    }
    for (const [key, data] of ipRateCountMap) {
        if (now - data.windowStart > 600000) ipRateCountMap.delete(key)
    }
}, 600000)

export default defineEventHandler(async (event) => {
    const postId = getRouterParam(event, 'postId')
    if (!postId) throw createError({ statusCode: 400, message: '缺少文章ID' })

    const body = await readBody(event)
    const { qq, nickname, content } = body

    if (!qq || !nickname || !content) {
        throw createError({ statusCode: 400, message: '请填写所有必填项' })
    }

    if (!/^\d{5,12}$/.test(qq)) {
        throw createError({ statusCode: 400, message: '无效的QQ号格式' })
    }

    if (nickname.length > 20) {
        throw createError({ statusCode: 400, message: '昵称不能超过20个字符' })
    }

    if (content.length > 500) {
        throw createError({ statusCode: 400, message: '评论内容不能超过500个字符' })
    }

    const clientIp = getRequestIP(event) || 'unknown'

    // Rate limits
    const ipLastSubmit = ipRateLimitMap.get(clientIp)
    if (ipLastSubmit && Date.now() - ipLastSubmit < IP_RATE_LIMIT_MS) {
        const wait = Math.ceil((IP_RATE_LIMIT_MS - (Date.now() - ipLastSubmit)) / 1000)
        throw createError({ statusCode: 429, message: `操作太频繁，请${wait}秒后再试` })
    }

    const ipCount = ipRateCountMap.get(clientIp)
    if (ipCount && Date.now() - ipCount.windowStart < 600000 && ipCount.count >= IP_RATE_LIMIT_MAX) {
        throw createError({ statusCode: 429, message: '评论次数过多，请稍后再试' })
    }

    const lastSubmit = rateLimitMap.get(qq)
    if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSubmit)) / 1000)
        throw createError({ statusCode: 429, message: `操作太频繁，请${wait}秒后再试` })
    }

    // Process
    const comments = await readComments()
    if (!comments[postId]) {
        comments[postId] = []
    }

    const clientInfo = await extractClientInfo(event)

    // Sanitize input? Assuming frontend/safe usage or use simple escape.
    // Legacy used custom sanitizeInput. Let's do basic or leave it raw and rely on output encoding (Vue escapes by default).
    // But to store safely, maybe encoded.
    // For now simple pass through, but ideally use DOMPurify if rendering HTML later, OR just escape.
    // Nuxt/Vue escapes content by default.

    const newComment: UserComment = {
        id: 'c_' + Date.now(),
        qq: String(qq),
        nickname: String(nickname),
        avatar: `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`,
        content: String(content),
        createdAt: new Date().toISOString(),
        status: 'approved',
        ip: clientInfo.ip,
        location: clientInfo.location,
        ua: clientInfo.ua,
        browser: clientInfo.browser,
        os: clientInfo.os
    }

    comments[postId].push(newComment)
    await writeComments(comments)

    // Update limits
    rateLimitMap.set(qq, Date.now())
    ipRateLimitMap.set(clientIp, Date.now())

    const currentIpCount = ipRateCountMap.get(clientIp)
    if (currentIpCount && Date.now() - currentIpCount.windowStart < 600000) {
        currentIpCount.count++
    } else {
        ipRateCountMap.set(clientIp, { count: 1, windowStart: Date.now() })
    }

    return {
        success: true,
        message: '评论发表成功',
        data: newComment
    }
})
