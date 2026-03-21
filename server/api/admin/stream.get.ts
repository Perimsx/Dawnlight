import { createEventStream } from 'h3'
import { ensureAdminAuth } from '../../utils/apiResponse'
import { subscribeAdminEvents } from '../../utils/adminRealtime'

const HEARTBEAT_MS = 20_000

export default defineEventHandler(async (event) => {
  const unauthorized = ensureAdminAuth(event)
  if (unauthorized) return unauthorized

  const stream = createEventStream(event)

  const unsubscribe = subscribeAdminEvents((payload) => {
    stream.push({
      event: 'admin:update',
      data: JSON.stringify(payload)
    }).catch(() => {
      // Stream likely closed.
    })
  })

  const heartbeatTimer = setInterval(() => {
    stream.push({
      event: 'admin:heartbeat',
      data: JSON.stringify({ timestamp: new Date().toISOString() })
    }).catch(() => {
      // Stream likely closed.
    })
  }, HEARTBEAT_MS)

  stream.onClosed(async () => {
    clearInterval(heartbeatTimer)
    unsubscribe()
    await stream.close()
  })

  stream.push({
    event: 'admin:ready',
    data: JSON.stringify({
      topic: 'system',
      action: 'connected',
      timestamp: new Date().toISOString()
    })
  }).catch(() => {
    // Initial push can fail on abrupt close.
  })

  return stream.send()
})
