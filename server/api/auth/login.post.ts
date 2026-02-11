import { checkLoginLockout, checkLoginInterval, verifyPassword, clearLoginFailures, createSession, recordLoginFailure, delay } from '../../utils/auth'
import { addLog } from '../../utils/logs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const password = body?.password
    const clientIP = getRequestIP(event) || 'unknown'
    const ERROR_DELAY = 500

    if (!password) {
        await delay(ERROR_DELAY)
        throw createError({ statusCode: 400, message: '请提供密码' })
    }

    const lockoutStatus = checkLoginLockout(clientIP)
    if (lockoutStatus.locked) {
        await delay(ERROR_DELAY)
        throw createError({
            statusCode: 429,
            message: `登录尝试次数过多，请 ${lockoutStatus.remainingTime} 秒后再试`
        })
    }

    const intervalStatus = checkLoginInterval(clientIP)
    if (intervalStatus.tooFast) {
        await delay(ERROR_DELAY)
        throw createError({
            statusCode: 429,
            message: '操作过于频繁，请稍后再试'
        })
    }

    try {
        const isValid = await verifyPassword(password)

        if (isValid) {
            clearLoginFailures(clientIP)
            const session = createSession(clientIP)
            addLog({ type: 'auth', title: '管理员登录', description: '登录成功' }, event)
            return {
                success: true,
                message: '登录成功',
                data: session
            }
        } else {
            const failureResult = recordLoginFailure(clientIP)
            await delay(ERROR_DELAY)

            if (failureResult.locked) {
                throw createError({
                    statusCode: 429,
                    message: `密码错误次数过多，账户已锁定 ${Math.ceil(failureResult.lockDuration / 60)} 分钟`
                })
            }

            throw createError({
                statusCode: 401,
                message: `密码错误，还剩 ${failureResult.remainingAttempts} 次尝试机会`
            })
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, message: '服务器内部错误' })
    }
})
