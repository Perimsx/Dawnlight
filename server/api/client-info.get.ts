import { extractClientInfo } from '../utils/clientInfo'
import { apiSuccess } from '../utils/apiResponse'

export default defineEventHandler(async (event) => {
  const info = await extractClientInfo(event)

  return apiSuccess({
    ip: info.ip || '',
    location: info.location || '未知',
    browser: info.browser || '未知',
    os: info.os || '未知'
  })
})
