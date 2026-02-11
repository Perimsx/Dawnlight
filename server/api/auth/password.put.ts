import crypto from 'node:crypto'
import path from 'path'
import { verifyPassword, clearAllSessions, updatePasswordConfig, hashPassword } from '../../utils/auth'
import { readJson, writeJson, pathExists } from '../../utils/fs'

const AUTH_CONFIG_PATH = path.join(process.cwd(), 'config', 'auth.json')

export default defineEventHandler(async (event) => {
    if (!event.context.auth?.authenticated) {
        throw createError({ statusCode: 401, message: '未授权' })
    }

    const body = await readBody(event)
    const { currentPassword, newPassword } = body || {}

    if (!currentPassword || !newPassword) {
        throw createError({ statusCode: 400, message: '请填写当前密码和新密码' })
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
        throw createError({ statusCode: 400, message: '新密码长度至少 6 位' })
    }

    // 验证旧密码
    const valid = await verifyPassword(currentPassword)
    if (!valid) {
        throw createError({ statusCode: 403, message: '当前密码不正确' })
    }

    // 生成新的 PBKDF2 hash + 随机 salt
    const newSalt = crypto.randomBytes(32).toString('hex')
    const newHash = await hashPassword(newPassword, newSalt)

    // 读取现有 auth.json 或创建新的
    let authConfig: any = {}
    try {
        if (await pathExists(AUTH_CONFIG_PATH)) {
            authConfig = await readJson(AUTH_CONFIG_PATH)
        }
    } catch {
        // 文件不存在或读取失败，使用空对象
    }

    // 写入新密码
    authConfig.password = {
        pbkdf2Hash: newHash,
        pbkdf2Salt: newSalt,
        // 保留 sha256Hash 以备兼容
        sha256Hash: authConfig.password?.sha256Hash || undefined
    }

    await writeJson(AUTH_CONFIG_PATH, authConfig)

    // 更新内存中的密码配置
    updatePasswordConfig(newHash, newSalt)

    // 清空所有会话，强制重新登录
    clearAllSessions()

    return {
        success: true,
        message: '密码修改成功，请重新登录'
    }
})
