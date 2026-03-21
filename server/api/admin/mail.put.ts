import { apiError, apiSuccess, ensureAdminAuth, parseString } from '../../utils/apiResponse'
import { publishAdminEvent } from '../../utils/adminRealtime'
import {
  readPrivateMailConfig,
  savePrivateMailConfig,
  toSafeMailConfig
} from '../../utils/mailConfig'
import { addLog } from '../../utils/logs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

function extractMailbox(value: string): string {
  const raw = parseString(value)
  const matched = raw.match(/<([^>]+)>/)
  return parseString(matched?.[1] || raw)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return apiError(event, 400, '请求参数格式错误', { code: 'INVALID_BODY' })
  }

  const existing = await readPrivateMailConfig()
  const enabled = Boolean(body.enabled)
  const provider = parseString(body.provider) || existing.provider || 'qq'
  const host = parseString(body.host)
  const port = Number.parseInt(String(body.port ?? '').trim(), 10)
  const secure = typeof body.secure === 'boolean' ? body.secure : existing.secure
  const user = parseString(body.user)
  const pass = parseString(body.pass)
  const from = parseString(body.from)
  const notifyTo = parseString(body.notifyTo)
  const siteUrl = parseString(body.siteUrl).replace(/\/+$/g, '')

  const errors: string[] = []
  if (!host) errors.push('SMTP 主机不能为空')
  if (!Number.isFinite(port) || port < 1 || port > 65535) errors.push('SMTP 端口不合法')
  if (user && !isValidEmail(user)) errors.push('发件邮箱账号格式不正确')
  if (from && !isValidEmail(extractMailbox(from))) errors.push('发件人地址格式不正确')
  if (notifyTo && !isValidEmail(notifyTo)) errors.push('通知收件邮箱格式不正确')
  if (siteUrl && !isValidHttpUrl(siteUrl)) errors.push('站点地址必须为 http 或 https 链接')

  if (enabled) {
    if (!user) errors.push('启用邮件通知时必须填写发件邮箱账号')
    if (!from) errors.push('启用邮件通知时必须填写发件人地址')
    if (!pass && !existing.pass) errors.push('启用邮件通知时必须填写 SMTP 授权码')
  }

  if (errors.length > 0) {
    return apiError(event, 400, '邮件配置校验失败', {
      code: 'MAIL_CONFIG_VALIDATION_FAILED',
      details: { errors }
    })
  }

  const saved = await savePrivateMailConfig({
    enabled,
    provider,
    host,
    port,
    secure,
    user,
    pass,
    from,
    notifyTo,
    siteUrl
  }, { keepExistingPassword: true })

  addLog({ type: 'config', title: '更新邮件配置' }, event)
  await publishAdminEvent({
    topic: 'config',
    action: 'mail-updated',
    message: '邮件配置已更新'
  })

  return apiSuccess(toSafeMailConfig(saved), '邮件配置保存成功')
})
