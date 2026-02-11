import { readLogs, LogEntry } from '../../utils/logs'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const logs = await readLogs()

    let csv = '\uFEFF' // BOM
    csv += '操作日志\n'
    csv += '导出时间,' + new Date().toLocaleString('zh-CN') + '\n\n'
    csv += '时间,类型,标题,描述,IP地址,操作者\n'

    logs.forEach((log: LogEntry) => {
        const time = new Date(log.timestamp).toLocaleString('zh-CN')
        const type = log.type || '-'
        const title = `"${(log.title || '').replace(/"/g, '""')}"`
        const description = `"${(log.description || '').replace(/"/g, '""')}"`
        const ip = log.ip || '-'
        const operator = log.operator || '-' // log.operator collision with keyword? No.

        csv += `${time},${type},${title},${description},${ip},${operator}\n`
    })

    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename=dawnlight-logs-${new Date().toISOString().slice(0, 10)}.csv`)

    return csv
})
