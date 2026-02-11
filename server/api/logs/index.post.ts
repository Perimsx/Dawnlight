import { readLogs, saveLogs, LogEntry } from '../../utils/logs'
import { extractClientInfo } from '../../utils/clientInfo'

export default defineEventHandler(async (event) => {
    // Adding logs might be done by client (e.g. login failure reported) or internal?
    // Legacy `router.post('/', ...)` exists.
    // If it's for internal use, maybe we don't need auth?
    // But if client calls it, it should probably be allowed or restricted?
    // Legacy allows it without auth in the route file `logs.js` (unless global).
    // Let's assume it's allowed (e.g. recording client errors or actions).

    const body = await readBody(event)
    const { type, title, description, details, operator, userAgent, platform } = body

    if (!type || !title) {
        throw createError({ statusCode: 400, message: '缺少必要参数' })
    }

    const logs = await readLogs()
    const clientInfo = await extractClientInfo(event)

    const newLog: LogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11),
        type,
        title,
        description: description || '',
        details: details || null,
        timestamp: new Date().toISOString(),
        ip: clientInfo.ip,
        location: clientInfo.location || null,
        operator: operator || '管理员',
        userAgent: userAgent || '',
        platform: platform || ''
    }

    logs.unshift(newLog)
    await saveLogs(logs)

    return {
        success: true,
        message: '日志添加成功',
        data: newLog
    }
})
