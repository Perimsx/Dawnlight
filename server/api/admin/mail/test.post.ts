import { apiError, apiSuccess, ensureAdminAuth, parseString } from '../../../utils/apiResponse'
import { ConfigPaths, readConfigFile } from '../../../utils/helpers'
import { readPrivateMailConfig } from '../../../utils/mailConfig'
import { sendTestMail } from '../../../utils/mailer'
import { addLog } from '../../../utils/logs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value)
}

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const body = await readBody<Record<string, unknown>>(event).catch(() => ({}))
  const preferredTo = parseString(body?.to)
  const privateMailConfig = await readPrivateMailConfig()

  const siteConfig = await readConfigFile(
    ConfigPaths.SITE_CONFIG_FILE,
    ConfigPaths.DEFAULT_SITE_CONFIG_FILE
  ) || {}

  const to = preferredTo || privateMailConfig.notifyTo || parseString(siteConfig?.author?.email)
  if (!to) {
    return apiError(event, 400, '请先填写测试收件邮箱或配置通知收件邮箱', { code: 'MISSING_TEST_MAIL_TO' })
  }
  if (!isValidEmail(to)) {
    return apiError(event, 400, '测试收件邮箱格式不正确', { code: 'INVALID_TEST_MAIL_TO' })
  }

  const result = await sendTestMail(to)
  if (!result.success) {
    const statusCode = result.code === 'MAIL_SEND_FAILED' ? 500 : 400
    return apiError(event, statusCode, result.message, { code: result.code || 'MAIL_TEST_FAILED' })
  }

  addLog({
    type: 'config',
    title: '发送测试邮件',
    description: `发送至 ${to}`
  }, event)

  return apiSuccess({ to }, '测试邮件发送成功')
})
