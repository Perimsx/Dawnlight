import { readLogs } from '../../utils/logs'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const logs = await readLogs()

    return {
        success: true,
        data: logs,
        total: logs.length
    }
})
