import { apiSuccess, ensureAdminAuth } from '../../utils/apiResponse'
import { readPrivateMailConfigSafe } from '../../utils/mailConfig'

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const config = await readPrivateMailConfigSafe()
  return apiSuccess(config)
})
