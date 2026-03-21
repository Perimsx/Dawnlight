import { batchUpdateCommentStatus } from '../../../utils/storage'
import { apiError, apiSuccess, ensureAdminAuth } from '../../../utils/apiResponse'
import { parseBatchCommentItems, parseCommentStatus } from '../../../utils/commentValidation'
import { publishCommentEvent } from '../../../utils/commentRealtime'

const MAX_BATCH_SIZE = 500

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body) {
    return apiError(event, 400, '请求体格式错误', { code: 'INVALID_BODY' })
  }

  const status = parseCommentStatus(body.status)
  if (!status) {
    return apiError(event, 400, '无效的评论状态', {
      code: 'INVALID_STATUS',
      details: { allowed: ['approved', 'pending', 'rejected'] }
    })
  }

  const items = parseBatchCommentItems(body.items, MAX_BATCH_SIZE)
  if (items.length === 0) {
    return apiError(event, 400, '请选择要操作的评论', { code: 'EMPTY_BATCH_ITEMS' })
  }
  if (items.length > MAX_BATCH_SIZE) {
    return apiError(event, 400, `单次最多处理 ${MAX_BATCH_SIZE} 条评论`, { code: 'BATCH_LIMIT_EXCEEDED' })
  }

  try {
    const updated = await batchUpdateCommentStatus(items, status)
    await publishCommentEvent({
      type: 'batch-status-updated',
      ids: items.map(item => item.id)
    })

    return apiSuccess({ updated }, `已更新 ${updated} 条评论`)
  } catch (error) {
    console.error('[comments/batch/status.put] failed:', error)
    return apiError(event, 500, '批量状态更新失败，请稍后重试', { code: 'BATCH_STATUS_UPDATE_FAILED' })
  }
})
