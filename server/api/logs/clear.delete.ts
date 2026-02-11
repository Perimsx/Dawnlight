import { saveLogs } from '../../utils/logs'

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    await saveLogs([])

    return {
        success: true,
        message: '日志已清空'
    }
})
