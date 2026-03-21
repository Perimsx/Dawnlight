import { createEventStream } from 'h3'
import { ensureAdminAuth } from '../../utils/apiResponse'
import { subscribeCommentEvents } from '../../utils/commentRealtime'

const HEARTBEAT_MS = 20_000

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const stream = createEventStream(event)

  const unsubscribe = subscribeCommentEvents((payload) => {
    stream.push({
      event: 'comments:update',
      data: JSON.stringify(payload)
    }).catch(() => {
      // Stream likely closed, ignore push failure.
    })
  })

  const heartbeatTimer = setInterval(() => {
    stream.push({
      event: 'comments:heartbeat',
      data: JSON.stringify({ timestamp: new Date().toISOString() })
    }).catch(() => {
      // Stream likely closed, ignore heartbeat failure.
    })
  }, HEARTBEAT_MS)

  stream.onClosed(async () => {
    clearInterval(heartbeatTimer)
    unsubscribe()
    await stream.close()
  })

  stream.push({
    event: 'comments:ready',
    data: JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString()
    })
  }).catch(() => {
    // Initial push failed, still return stream response.
  })

  return stream.send()
})
