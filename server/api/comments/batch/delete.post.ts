import { batchDeleteComments } from '../../../utils/storage'
import { apiError, apiSuccess, ensureAdminAuth } from '../../../utils/apiResponse'
import { parseBatchCommentItems } from '../../../utils/commentValidation'
import { publishCommentEvent } from '../../../utils/commentRealtime'

const MAX_BATCH_SIZE = 500

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body) {
    return apiError(event, 400, '请求体格式错误', { code: 'INVALID_BODY' })
  }

  const items = parseBatchCommentItems(body.items, MAX_BATCH_SIZE)
  if (items.length === 0) {
    return apiError(event, 400, '请选择要删除的评论', { code: 'EMPTY_BATCH_ITEMS' })
  }
  if (items.length > MAX_BATCH_SIZE) {
    return apiError(event, 400, `单次最多处理 ${MAX_BATCH_SIZE} 条评论`, { code: 'BATCH_LIMIT_EXCEEDED' })
  }

  try {
    const deleted = await batchDeleteComments(items)
    await publishCommentEvent({
      type: 'batch-deleted',
      ids: items.map(item => item.id)
    })

    return apiSuccess({ deleted }, `已删除 ${deleted} 条评论`)
  } catch (error) {
    console.error('[comments/batch/delete.post] failed:', error)
    return apiError(event, 500, '批量删除失败，请稍后重试', { code: 'BATCH_DELETE_FAILED' })
  }
})
