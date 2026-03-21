<template>
  <section class="cm-page">
    <header class="a-topbar cm-top">
      <div>
        <h1 class="cm-title">评论管理</h1>
        <p class="cm-subtitle">审核、回复、批量处理与实时同步</p>
      </div>
      <div class="cm-top-actions">
        <span class="cm-sync" :class="{ online: realtimeConnected }">{{ realtimeConnected ? '实时连接中' : '轮询同步中' }}</span>
        <button class="a-btn" :disabled="syncing" @click="refresh()">{{ syncing ? '同步中...' : '刷新列表' }}</button>
      </div>
    </header>

    <div class="cm-stats">
      <button class="cm-stat" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'"><span>全部</span><strong>{{ totalCount }}</strong></button>
      <button class="cm-stat" :class="{ active: statusFilter === 'pending' }" @click="statusFilter = 'pending'"><span>待审核</span><strong>{{ pendingCount }}</strong></button>
      <button class="cm-stat" :class="{ active: statusFilter === 'approved' }" @click="statusFilter = 'approved'"><span>已通过</span><strong>{{ approvedCount }}</strong></button>
      <button class="cm-stat" :class="{ active: statusFilter === 'rejected' }" @click="statusFilter = 'rejected'"><span>已拒绝</span><strong>{{ rejectedCount }}</strong></button>
    </div>

    <div class="cm-filters">
      <input v-model="searchQuery" class="cm-search" type="search" placeholder="搜索昵称、内容、文章标题">
      <select v-model="postFilter" class="cm-select">
        <option value="all">全部文章</option>
        <option v-for="post in postOptions" :key="post.id" :value="post.id">{{ post.title }}</option>
      </select>
      <select v-model="timeFilter" class="cm-select">
        <option value="all">全部时间</option>
        <option value="today">今天</option>
        <option value="yesterday">昨天</option>
        <option value="week">本周</option>
        <option value="last7">近 7 天</option>
        <option value="month">本月</option>
        <option value="last30">近 30 天</option>
        <option value="custom">自定义</option>
      </select>
      <div v-if="timeFilter === 'custom'" class="cm-date-range">
        <input v-model="customStartDate" class="cm-select" type="date" aria-label="开始日期">
        <span>至</span>
        <input v-model="customEndDate" class="cm-select" type="date" aria-label="结束日期">
      </div>
    </div>

    <div v-if="selectedIds.size" class="cm-bulk">
      <strong>已选 {{ selectedIds.size }} 条</strong>
      <button class="a-btn a-btn-sm" @click="batchUpdateStatus('approved')">批量通过</button>
      <button class="a-btn a-btn-sm" @click="batchUpdateStatus('rejected')">批量拒绝</button>
      <button class="a-btn a-btn-sm a-btn-danger" @click="batchDelete">批量删除</button>
      <button class="cm-link" @click="clearSelection">清空选择</button>
    </div>

    <div class="cm-board">
      <div v-if="loading" class="cm-empty">正在加载评论...</div>
      <div v-else-if="threadGroups.length === 0" class="cm-empty">当前筛选条件下暂无评论</div>
      <template v-else>
        <div class="cm-headline">
          <label class="cm-select-all"><input type="checkbox" :checked="isAllVisibleSelected" @change="toggleSelectAll"> 全选当前筛选结果</label>
          <span>共 {{ filteredItems.length }} 条</span>
        </div>

        <div class="cm-list">
          <article v-for="group in threadGroups" :key="`t:${itemKey(group.root)}`" class="cm-thread">
            <div class="cm-card" :class="{ selected: isSelected(group.root) }">
              <input class="cm-check" type="checkbox" :checked="isSelected(group.root)" @change="toggleSelect(group.root)">
              <img class="cm-avatar" :src="getAvatar(group.root)" alt="" @error="onAvatarError">
              <div class="cm-main">
                <div class="cm-meta">
                  <div class="cm-author">
                    <span class="cm-name">{{ group.root.nickname }}</span>
                    <span v-if="group.root.isAuthor" class="cm-badge">作者</span>
                    <span class="cm-status" :class="`s-${normalizeStatus(group.root.status)}`">{{ statusText(group.root.status) }}</span>
                  </div>
                  <time>{{ formatRelativeTime(group.root.createdAt) }}</time>
                </div>
                <div class="cm-sub">{{ group.root.postTitle || group.root.postId }}</div>
                <div v-if="hasClientMeta(group.root)" class="cm-client">
                  <span v-if="displayLocation(group.root)"><span class="cm-icon cm-icon-location"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>{{ displayLocation(group.root) }}</span>
                  <span v-if="displayIp(group.root)">IP {{ displayIp(group.root) }}</span>
                  <span v-if="hasKnownValue(group.root.os)"><span class="cm-icon" v-html="getOsIcon(group.root.os || '')"></span>{{ group.root.os }}</span>
                  <span v-if="hasKnownValue(group.root.browser)"><span class="cm-icon" v-html="getBrowserIcon(group.root.browser || '')"></span>{{ group.root.browser }}</span>
                </div>
                <p class="cm-content">{{ group.root.content }}</p>
                <div v-if="group.authorReplies.length" class="cm-inline-author-list">
                  <div v-for="entry in group.authorReplies" :key="`ar:${itemKey(entry.item)}`" class="cm-inline-author-item" :class="{ selected: isSelected(entry.item) }">
                    <input class="cm-inline-check" type="checkbox" :checked="isSelected(entry.item)" @change="toggleSelect(entry.item)">
                    <div class="cm-inline-author-main">
                      <div class="cm-author-reply-line"><span class="cm-author-reply-label">博主回复</span><span class="cm-author-reply-content">{{ entry.item.content }}</span></div>
                      <div class="cm-author-reply-meta"><span class="cm-sub">回复 {{ getReplyTargetLabel(entry.item) }}</span><time>{{ formatRelativeTime(entry.item.createdAt) }}</time></div>
                    </div>
                    <button class="cm-inline-action cm-danger" @click="deleteItem(entry.item)">删除</button>
                  </div>
                </div>
                <div v-if="editingReplyKey === itemKey(group.root)" class="cm-editor">
                  <textarea v-model="replyDraft" rows="3" maxlength="500" placeholder="输入回复内容..."></textarea>
                  <div class="cm-editor-actions">
                    <span>{{ replyDraft.length }}/500</span>
                    <button class="a-btn a-btn-sm" @click="cancelReply">取消</button>
                    <button class="a-btn a-btn-sm a-btn-primary" :disabled="replySubmitting" @click="submitReply(group.root)">{{ replySubmitting ? '发送中...' : '发送回复' }}</button>
                  </div>
                </div>
              </div>
              <div class="cm-actions">
                <button @click="openReply(group.root)">回复</button>
                <button v-if="normalizeStatus(group.root.status) !== 'approved'" @click="updateStatus(group.root, 'approved')">通过</button>
                <button v-if="normalizeStatus(group.root.status) !== 'rejected'" @click="updateStatus(group.root, 'rejected')">拒绝</button>
                <button class="cm-danger" @click="deleteItem(group.root)">删除</button>
              </div>
            </div>

            <div v-if="group.replies.length" class="cm-replies">
              <div v-for="entry in group.replies" :key="itemKey(entry.item)" class="cm-card cm-reply" :class="{ selected: isSelected(entry.item) }" :style="{ '--depth': String(entry.depth) }">
                <input class="cm-check" type="checkbox" :checked="isSelected(entry.item)" @change="toggleSelect(entry.item)">
                <img class="cm-avatar" :src="getAvatar(entry.item)" alt="" @error="onAvatarError">
                <div class="cm-main">
                  <div class="cm-meta">
                    <div class="cm-author"><span class="cm-name">{{ entry.item.nickname }}</span><span class="cm-status" :class="`s-${normalizeStatus(entry.item.status)}`">{{ statusText(entry.item.status) }}</span></div>
                    <time>{{ formatRelativeTime(entry.item.createdAt) }}</time>
                  </div>
                  <div class="cm-sub">回复 {{ getReplyTargetLabel(entry.item) }}</div>
                  <div v-if="hasClientMeta(entry.item)" class="cm-client">
                    <span v-if="displayLocation(entry.item)"><span class="cm-icon cm-icon-location"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>{{ displayLocation(entry.item) }}</span>
                    <span v-if="displayIp(entry.item)">IP {{ displayIp(entry.item) }}</span>
                    <span v-if="hasKnownValue(entry.item.os)"><span class="cm-icon" v-html="getOsIcon(entry.item.os || '')"></span>{{ entry.item.os }}</span>
                    <span v-if="hasKnownValue(entry.item.browser)"><span class="cm-icon" v-html="getBrowserIcon(entry.item.browser || '')"></span>{{ entry.item.browser }}</span>
                  </div>
                  <p class="cm-content">{{ entry.item.content }}</p>
                  <div v-if="entry.authorReplies.length" class="cm-inline-author-list">
                    <div v-for="authorEntry in entry.authorReplies" :key="`ar:${itemKey(authorEntry.item)}`" class="cm-inline-author-item" :class="{ selected: isSelected(authorEntry.item) }">
                      <input class="cm-inline-check" type="checkbox" :checked="isSelected(authorEntry.item)" @change="toggleSelect(authorEntry.item)">
                      <div class="cm-inline-author-main">
                        <div class="cm-author-reply-line"><span class="cm-author-reply-label">博主回复</span><span class="cm-author-reply-content">{{ authorEntry.item.content }}</span></div>
                        <div class="cm-author-reply-meta"><span class="cm-sub">回复 {{ getReplyTargetLabel(authorEntry.item) }}</span><time>{{ formatRelativeTime(authorEntry.item.createdAt) }}</time></div>
                      </div>
                      <button class="cm-inline-action cm-danger" @click="deleteItem(authorEntry.item)">删除</button>
                    </div>
                  </div>
                  <div v-if="editingReplyKey === itemKey(entry.item)" class="cm-editor">
                    <textarea v-model="replyDraft" rows="3" maxlength="500" placeholder="输入回复内容..."></textarea>
                    <div class="cm-editor-actions">
                      <span>{{ replyDraft.length }}/500</span>
                      <button class="a-btn a-btn-sm" @click="cancelReply">取消</button>
                      <button class="a-btn a-btn-sm a-btn-primary" :disabled="replySubmitting" @click="submitReply(entry.item)">{{ replySubmitting ? '发送中...' : '发送回复' }}</button>
                    </div>
                  </div>
                </div>
                <div class="cm-actions">
                  <button @click="openReply(entry.item)">回复</button>
                  <button v-if="normalizeStatus(entry.item.status) !== 'approved'" @click="updateStatus(entry.item, 'approved')">通过</button>
                  <button v-if="normalizeStatus(entry.item.status) !== 'rejected'" @click="updateStatus(entry.item, 'rejected')">拒绝</button>
                  <button class="cm-danger" @click="deleteItem(entry.item)">删除</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { authFetch } = useAdmin()
const ui = useAdminUI()
const { getOsIcon, getBrowserIcon } = useClientIcons()

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23256ebd'/%3E%3Ccircle cx='40' cy='30' r='12' fill='rgba(255,255,255,0.9)'/%3E%3Cellipse cx='40' cy='58' rx='20' ry='14' fill='rgba(255,255,255,0.9)'/%3E%3C/svg%3E"

const statusFilter = ref('all')
const postFilter = ref('all')
const timeFilter = ref('all')
const customStartDate = ref('')
const customEndDate = ref('')
const searchQuery = ref('')
const loading = ref(true)
const syncing = ref(false)
const realtimeConnected = ref(false)
const allComments = ref([])
const postOptions = ref([])
const selectedIds = reactive(new Set())
const editingReplyKey = ref('')
const replyDraft = ref('')
const replySubmitting = ref(false)

let pollTimer = null
let source = null
let reconnectTimer = null
let queuedRefresh = null

const itemKey = (item) => `${String(item?.postId || '')}:${String(item?.id || '')}`
const parseDate = (value) => {
  const t = new Date(value || '').getTime()
  return Number.isFinite(t) ? t : 0
}
const normalizeStatus = (status) => (status === 'approved' || status === 'rejected' ? status : 'pending')
const statusText = (status) => ({ approved: '已通过', pending: '待审核', rejected: '已拒绝' })[normalizeStatus(status)]
const isValidQQ = (qq) => /^\d{5,12}$/.test(String(qq || '').trim())
const getAvatar = (item) => (isValidQQ(item?.qq) ? `/api/proxy/qq-avatar?qq=${encodeURIComponent(String(item.qq).trim())}` : (item?.avatar || defaultAvatar))
const onAvatarError = (e) => { if (e?.target) e.target.src = defaultAvatar }
const hasKnownValue = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return false
  return !['unknown', '未知', 'null', 'none', 'n/a', 'na', '-'].includes(raw.toLowerCase())
}
const trimTrailingEnglishPart = (value) => {
  const compact = String(value || '').replace(/\s+/g, ' ').trim()
  if (!compact) return ''
  if (!/[\u3400-\u9fff]/.test(compact)) return compact

  const tokens = compact.split(' ').filter(Boolean)
  while (tokens.length > 1 && /^[A-Za-z][A-Za-z'.-]*$/.test(tokens[tokens.length - 1])) {
    tokens.pop()
  }
  return tokens.join(' ').trim()
}
const displayIp = (item) => (hasKnownValue(item?.ip) ? String(item.ip).trim() : '')
const displayLocation = (item) => {
  const raw = String(item?.location || '').trim()
  if (!hasKnownValue(raw)) return ''
  const compact = trimTrailingEnglishPart(raw)
  if (!compact) return ''
  return compact
    .split(/\s*(?:\||\/|,|，|->|→|·)\s*/)
    .map(trimTrailingEnglishPart)
    .filter(Boolean)
    .slice(0, 2)
    .join(' · ')
}
const hasClientMeta = (item) => !!displayLocation(item) || !!displayIp(item) || hasKnownValue(item?.os) || hasKnownValue(item?.browser)
const formatRelativeTime = (value) => {
  const t = parseDate(value)
  if (!t) return '未知时间'
  const d = Date.now() - t
  if (d < 60000) return '刚刚'
  if (d < 3600000) return `${Math.floor(d / 60000)} 分钟前`
  if (d < 86400000) return `${Math.floor(d / 3600000)} 小时前`
  if (d < 604800000) return `${Math.floor(d / 86400000)} 天前`
  const date = new Date(t)
  const now = new Date()
  return date.getFullYear() === now.getFullYear()
    ? date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const commentsMap = computed(() => new Map(allComments.value.map((item) => [itemKey(item), item])))
const getReplyTargetLabel = (item) => {
  const rid = String(item?.replyTo || '').trim()
  if (!rid) return '原评论'
  const target = commentsMap.value.get(`${String(item?.postId || '')}:${rid}`)
  return target?.nickname ? `@${target.nickname}` : '原评论'
}

const totalCount = computed(() => allComments.value.length)
const pendingCount = computed(() => allComments.value.filter((item) => normalizeStatus(item.status) === 'pending').length)
const approvedCount = computed(() => allComments.value.filter((item) => normalizeStatus(item.status) === 'approved').length)
const rejectedCount = computed(() => allComments.value.filter((item) => normalizeStatus(item.status) === 'rejected').length)

const filteredItems = computed(() => {
  let list = allComments.value
  if (statusFilter.value !== 'all') list = list.filter((item) => normalizeStatus(item.status) === statusFilter.value)
  if (postFilter.value !== 'all') list = list.filter((item) => String(item.postId) === postFilter.value)

  if (timeFilter.value !== 'all') {
    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()
    let start = null
    let end = null

    if (timeFilter.value === 'today') { start = startToday; end = endToday }
    if (timeFilter.value === 'yesterday') {
      const yesterday = new Date(startToday - 86400000)
      start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime()
      end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999).getTime()
    }
    if (timeFilter.value === 'week') {
      const day = now.getDay() || 7
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1).getTime()
      end = Date.now()
    }
    if (timeFilter.value === 'last7') { start = Date.now() - 7 * 86400000; end = Date.now() }
    if (timeFilter.value === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      end = Date.now()
    }
    if (timeFilter.value === 'last30') { start = Date.now() - 30 * 86400000; end = Date.now() }
    if (timeFilter.value === 'custom') {
      const startAt = customStartDate.value ? new Date(`${customStartDate.value}T00:00:00`).getTime() : null
      const endAt = customEndDate.value ? new Date(`${customEndDate.value}T23:59:59.999`).getTime() : null
      start = Number.isFinite(startAt) ? startAt : null
      end = Number.isFinite(endAt) ? endAt : null
      if (start !== null && end !== null && start > end) [start, end] = [end, start]
    }

    if (start !== null || end !== null) {
      list = list.filter((item) => {
        const time = parseDate(item.createdAt)
        if (!time) return false
        if (start !== null && time < start) return false
        if (end !== null && time > end) return false
        return true
      })
    }
  }

  if (searchQuery.value.trim()) {
    const k = searchQuery.value.trim().toLowerCase()
    list = list.filter((item) => {
      const nickname = String(item.nickname || '').toLowerCase()
      const content = String(item.content || '').toLowerCase()
      const postTitle = String(item.postTitle || '').toLowerCase()
      return nickname.includes(k) || content.includes(k) || postTitle.includes(k)
    })
  }
  return list
})

const threadGroups = computed(() => {
  const nodes = filteredItems.value.map((item) => ({ ...item, children: [] }))
  const map = new Map(nodes.map((item) => [itemKey(item), item]))
  const roots = []
  for (const node of nodes) {
    const pid = String(node.replyTo || '').trim()
    const parent = pid ? map.get(`${String(node.postId || '')}:${pid}`) : null
    if (parent) parent.children.push(node); else roots.push(node)
  }
  const sortDesc = (a, b) => parseDate(b.createdAt) - parseDate(a.createdAt)
  const sortAsc = (a, b) => parseDate(a.createdAt) - parseDate(b.createdAt)
  const sortChildren = (node) => { node.children.sort(sortAsc); node.children.forEach(sortChildren) }
  roots.sort(sortDesc); roots.forEach(sortChildren)

  const toInlineAuthorReplies = (node) => node.children.filter((child) => child.isAuthor).map((child) => ({ item: child }))
  const collectVisibleReplies = (node, depth, out) => {
    for (const child of node.children) {
      if (child.isAuthor) {
        collectVisibleReplies(child, depth, out)
        continue
      }
      out.push({ item: child, depth: Math.min(depth, 8), authorReplies: toInlineAuthorReplies(child) })
      collectVisibleReplies(child, depth + 1, out)
    }
  }

  return roots.map((root) => {
    const replies = []
    collectVisibleReplies(root, 1, replies)
    return { root, authorReplies: toInlineAuthorReplies(root), replies }
  })
})

const isSelected = (item) => selectedIds.has(itemKey(item))
const isAllVisibleSelected = computed(() => filteredItems.value.length > 0 && filteredItems.value.every((item) => selectedIds.has(itemKey(item))))
const toggleSelect = (item) => { const k = itemKey(item); selectedIds.has(k) ? selectedIds.delete(k) : selectedIds.add(k) }
const toggleSelectAll = () => { isAllVisibleSelected.value ? filteredItems.value.forEach((item) => selectedIds.delete(itemKey(item))) : filteredItems.value.forEach((item) => selectedIds.add(itemKey(item))) }
const clearSelection = () => selectedIds.clear()
const openReply = (item) => { const k = itemKey(item); if (editingReplyKey.value === k) return cancelReply(); editingReplyKey.value = k; replyDraft.value = '' }
const cancelReply = () => { editingReplyKey.value = ''; replyDraft.value = '' }

const refresh = async ({ silent = false, preserveSelection = true, preserveReply = true } = {}) => {
  if (silent) syncing.value = true; else loading.value = true
  try {
    const [postsRes, commentsRes] = await Promise.all([authFetch('/api/posts'), authFetch('/api/comments')])
    const posts = Array.isArray(postsRes?.data) ? postsRes.data : []
    const grouped = commentsRes?.data && typeof commentsRes.data === 'object' ? commentsRes.data : {}
    const titleMap = new Map(posts.map((post) => [String(post?.id || ''), String(post?.title || post?.id || '')]))
    const merged = []; const ids = new Set()
    for (const [postId, list] of Object.entries(grouped)) {
      const rows = Array.isArray(list) ? list : []
      if (rows.length) ids.add(postId)
      for (const row of rows) merged.push({ ...row, postId, postTitle: titleMap.get(postId) || postId, status: normalizeStatus(row?.status) })
    }
    allComments.value = merged.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
    postOptions.value = [...ids].map((id) => ({ id, title: titleMap.get(id) || id })).sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    const valid = new Set(allComments.value.map((item) => itemKey(item)))
    if (!preserveSelection) clearSelection(); else for (const key of selectedIds) if (!valid.has(key)) selectedIds.delete(key)
    if (!preserveReply || (editingReplyKey.value && !valid.has(editingReplyKey.value))) cancelReply()
  } catch (error) {
    if (!silent) ui.toast(error?.data?.message || error?.message || '评论加载失败，请稍后重试', 'error')
  } finally {
    loading.value = false; syncing.value = false
  }
}

const selectedItems = () => {
  const list = []
  for (const key of selectedIds) {
    const item = commentsMap.value.get(key)
    if (item) list.push(item)
  }
  return list
}

const updateStatus = async (item, status) => {
  if (normalizeStatus(item.status) === status) return
  try {
    const res = await authFetch(`/api/comments/${item.postId}/${item.id}`, { method: 'PUT', body: { status } })
    if (res?.success === false) throw new Error(res?.message || '操作失败')
    const key = itemKey(item)
    allComments.value = allComments.value.map((comment) => itemKey(comment) === key ? { ...comment, status } : comment)
    ui.toast(status === 'approved' ? '评论已通过' : '评论已拒绝', 'success')
  } catch (error) { ui.toast(error?.data?.message || error?.message || '操作失败', 'error') }
}

const deleteItem = async (item) => {
  const ok = await ui.confirm('确定删除这条评论？删除后不可恢复。', { title: '删除确认', confirmText: '删除', cancelText: '取消', danger: true })
  if (!ok) return
  try {
    const res = await authFetch(`/api/comments/${item.postId}/${item.id}`, { method: 'DELETE' })
    if (res?.success === false) throw new Error(res?.message || '删除失败')
    const key = itemKey(item)
    allComments.value = allComments.value.filter((comment) => itemKey(comment) !== key)
    selectedIds.delete(key)
    if (editingReplyKey.value === key) cancelReply()
    ui.toast('评论已删除', 'success')
  } catch (error) { ui.toast(error?.data?.message || error?.message || '删除失败', 'error') }
}

const submitReply = async (item) => {
  const content = replyDraft.value.trim()
  if (!content) return ui.toast('请输入回复内容', 'warning')
  if (content.length > 500) return ui.toast('回复内容不能超过 500 字', 'warning')
  if (replySubmitting.value) return
  replySubmitting.value = true
  try {
    const res = await authFetch(`/api/comments/${item.postId}/${item.id}/reply`, {
      method: 'POST',
      body: { content },
      timeout: 8000
    })
    if (res?.success === false) throw new Error(res?.message || '回复失败')
    ui.toast('回复成功', 'success')
    cancelReply()
    await refresh({ silent: true, preserveSelection: true, preserveReply: false })
  } catch (error) {
    ui.toast(error?.data?.message || error?.message || '回复失败', 'error')
  } finally { replySubmitting.value = false }
}

const batchUpdateStatus = async (status) => {
  if (!selectedIds.size) return
  const label = status === 'approved' ? '通过' : '拒绝'
  const ok = await ui.confirm(`确认批量${label} ${selectedIds.size} 条评论？`, { title: '批量操作', confirmText: `批量${label}`, cancelText: '取消' })
  if (!ok) return
  const items = selectedItems().filter((item) => normalizeStatus(item.status) !== status).map((item) => ({ postId: item.postId, id: item.id }))
  if (!items.length) { clearSelection(); return ui.toast(`没有需要批量${label}的评论`, 'info') }
  try {
    const res = await authFetch('/api/comments/batch/status', { method: 'PUT', body: { status, items } })
    if (res?.success === false) throw new Error(res?.message || '批量操作失败')
    const keys = new Set(items.map((item) => `${item.postId}:${item.id}`))
    allComments.value = allComments.value.map((item) => keys.has(itemKey(item)) ? { ...item, status } : item)
    clearSelection()
    ui.toast(`批量${label}完成`, 'success')
  } catch (error) { ui.toast(error?.data?.message || error?.message || `批量${label}失败`, 'error') }
}

const batchDelete = async () => {
  if (!selectedIds.size) return
  const ok = await ui.confirm(`确认删除 ${selectedIds.size} 条评论？此操作不可恢复。`, { title: '批量删除', confirmText: '删除', cancelText: '取消', danger: true })
  if (!ok) return
  const items = selectedItems().map((item) => ({ postId: item.postId, id: item.id }))
  if (!items.length) { clearSelection(); return }
  try {
    const res = await authFetch('/api/comments/batch/delete', { method: 'POST', body: { items } })
    if (res?.success === false) throw new Error(res?.message || '批量删除失败')
    const keys = new Set(items.map((item) => `${item.postId}:${item.id}`))
    allComments.value = allComments.value.filter((item) => !keys.has(itemKey(item)))
    clearSelection()
    if (editingReplyKey.value && keys.has(editingReplyKey.value)) cancelReply()
    ui.toast('批量删除完成', 'success')
  } catch (error) { ui.toast(error?.data?.message || error?.message || '批量删除失败', 'error') }
}

const queueSilentRefresh = () => {
  if (queuedRefresh) return
  queuedRefresh = setTimeout(async () => {
    queuedRefresh = null
    if (document.hidden || replySubmitting.value) return
    await refresh({ silent: true, preserveSelection: true, preserveReply: true })
  }, 250)
}

const stopPolling = () => { if (pollTimer) { clearInterval(pollTimer); pollTimer = null } }
const startPolling = () => {
  stopPolling()
  if (!process.client) return
  pollTimer = setInterval(async () => {
    if (document.hidden || replySubmitting.value || editingReplyKey.value || realtimeConnected.value) return
    await refresh({ silent: true, preserveSelection: true, preserveReply: true })
  }, 20000)
}

const stopRealtime = () => {
  realtimeConnected.value = false
  if (source) { source.close(); source = null }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  if (queuedRefresh) { clearTimeout(queuedRefresh); queuedRefresh = null }
}

const connectRealtime = () => {
  if (!process.client || source) return
  try {
    source = new EventSource('/api/comments/stream')
    source.onopen = () => {
      realtimeConnected.value = true
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    }
    source.addEventListener('comments:ready', queueSilentRefresh)
    source.addEventListener('comments:update', queueSilentRefresh)
    source.onerror = () => {
      realtimeConnected.value = false
      if (source) { source.close(); source = null }
      if (!reconnectTimer) reconnectTimer = setTimeout(() => { reconnectTimer = null; connectRealtime() }, 5000)
    }
  } catch { realtimeConnected.value = false }
}

const onVisibilityChange = async () => { if (!document.hidden) await refresh({ silent: true, preserveSelection: true, preserveReply: true }) }

onMounted(async () => {
  await refresh()
  if (process.client) {
    startPolling()
    connectRealtime()
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
})

onUnmounted(() => {
  stopPolling()
  stopRealtime()
  if (process.client) document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.cm-page { display: flex; flex-direction: column; gap: 14px; min-height: 0; }
.cm-title { color: var(--a-text); font-size: 24px; line-height: 1.2; }
.cm-subtitle { margin-top: 6px; color: var(--a-text-3); font-size: 13px; }
.cm-top-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cm-sync { border: 1px solid var(--a-border); border-radius: 999px; padding: 6px 10px; font-size: 12px; color: var(--a-text-3); background: var(--a-bg-2); }
.cm-sync.online { color: #166534; border-color: rgba(34, 197, 94, .35); background: rgba(34, 197, 94, .12); }
.cm-stats { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.cm-stat { border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-bg-2); color: var(--a-text-2); padding: 12px; cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 6px; transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease; }
.cm-stat:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, .05); }
.cm-stat strong { color: var(--a-text); font-size: 20px; }
.cm-stat.active { border-color: var(--a-border); color: var(--a-text); background: rgba(var(--a-primary-rgb), .06); box-shadow: none; }
.cm-filters { display: grid; grid-template-columns: minmax(0, 1fr) 220px 170px; gap: 8px; }
.cm-search, .cm-select { border: 1px solid var(--a-border); border-radius: 10px; background: var(--a-bg-2); color: var(--a-text); padding: 8px 10px; outline: none; }
.cm-date-range { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 8px; }
.cm-date-range > span { color: var(--a-text-3); font-size: 12px; text-align: center; }
.cm-bulk { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 10px 12px; border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-bg-2); }
.cm-bulk strong { color: var(--a-text-2); font-size: 13px; }
.cm-link { margin-left: auto; border: none; background: transparent; color: var(--a-text-3); cursor: pointer; font-size: 12px; }
.cm-board { border: 1px solid var(--a-border); border-radius: 14px; background: var(--a-bg-2); min-height: 0; display: flex; flex-direction: column; overflow: hidden; flex: 1; }
.cm-headline { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--a-border); font-size: 12px; color: var(--a-text-3); }
.cm-select-all { display: inline-flex; align-items: center; gap: 8px; }
.cm-list { display: flex; flex-direction: column; gap: 10px; overflow: auto; min-height: 0; padding: 12px; }
.cm-thread { display: flex; flex-direction: column; gap: 8px; }
.cm-card { display: grid; grid-template-columns: 20px 40px minmax(0, 1fr) auto; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid var(--a-border); border-radius: 12px; background: var(--a-bg); }
.cm-card.selected { background: rgba(var(--a-primary-rgb), .06); }
.cm-check { margin-top: 10px; }
.cm-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(var(--a-primary-rgb), .24); }
.cm-main { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.cm-meta { display: flex; justify-content: space-between; gap: 8px; align-items: flex-start; }
.cm-author { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.cm-name { color: var(--a-text); font-size: 14px; font-weight: 600; }
.cm-badge { font-size: 11px; font-weight: 700; color: #065f46; background: rgba(16, 185, 129, .18); border-radius: 999px; padding: 1px 7px; }
.cm-status { font-size: 11px; padding: 2px 7px; border-radius: 999px; font-weight: 600; }
.cm-status.s-approved { color: #166534; background: rgba(34, 197, 94, .18); }
.cm-status.s-pending { color: #b45309; background: rgba(245, 158, 11, .2); }
.cm-status.s-rejected { color: #b91c1c; background: rgba(239, 68, 68, .18); }
.cm-meta time, .cm-sub { color: var(--a-text-3); font-size: 11px; }
.cm-client { display: flex; flex-wrap: wrap; gap: 6px; }
.cm-client > span { display: inline-flex; align-items: center; gap: 4px; color: var(--a-text-3); font-size: 11px; border: 1px solid rgba(var(--a-primary-rgb), .16); border-radius: 999px; background: rgba(var(--a-primary-rgb), .04); padding: 2px 8px; }
.cm-icon { width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 0; }
.cm-icon :deep(.client-brand-icon), .cm-icon :deep(img), .cm-icon :deep(svg) { width: 100%; height: 100%; display: block; }
.cm-icon-location { color: var(--a-primary); }
.cm-content { color: var(--a-text); font-size: 13px; line-height: 1.65; word-break: break-word; }
.cm-author-reply-line { display: flex; align-items: flex-start; gap: 6px; line-height: 1.65; }
.cm-author-reply-label { flex-shrink: 0; color: var(--a-primary); font-size: 13px; font-weight: 700; }
.cm-author-reply-content { color: var(--a-text); font-size: 13px; word-break: break-word; }
.cm-author-reply-meta { display: inline-flex; align-items: center; gap: 8px; }
.cm-author-reply-meta time { color: var(--a-text-3); font-size: 11px; }
.cm-inline-author-list { display: flex; flex-direction: column; gap: 6px; margin-top: 2px; }
.cm-inline-author-item { display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 8px; align-items: flex-start; border: 1px solid rgba(var(--a-primary-rgb), .14); border-radius: 10px; background: rgba(var(--a-primary-rgb), .04); padding: 8px 10px; }
.cm-inline-author-item.selected { background: rgba(var(--a-primary-rgb), .1); border-color: rgba(var(--a-primary-rgb), .28); }
.cm-inline-check { margin-top: 6px; }
.cm-inline-author-main { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cm-inline-action { border: 1px solid var(--a-border); border-radius: 8px; background: var(--a-bg); color: var(--a-text-3); cursor: pointer; padding: 5px 8px; font-size: 12px; line-height: 1; }
.cm-inline-action.cm-danger:hover { color: #b91c1c; border-color: rgba(239, 68, 68, .5); background: rgba(239, 68, 68, .08); }
.cm-actions { display: flex; flex-direction: column; gap: 6px; }
.cm-actions button { border: 1px solid var(--a-border); border-radius: 8px; background: var(--a-bg); color: var(--a-text-3); cursor: pointer; padding: 6px 8px; font-size: 12px; min-width: 54px; }
.cm-actions .cm-danger:hover { color: #b91c1c; border-color: rgba(239, 68, 68, .5); background: rgba(239, 68, 68, .08); }
.cm-editor { border: 1px solid var(--a-border); border-radius: 10px; background: var(--a-bg-2); padding: 10px; }
.cm-editor textarea { width: 100%; border: 1px solid var(--a-border); border-radius: 8px; background: var(--a-bg); color: var(--a-text); padding: 8px 10px; min-height: 76px; resize: vertical; outline: none; }
.cm-editor-actions { margin-top: 8px; display: flex; justify-content: flex-end; align-items: center; gap: 8px; color: var(--a-text-3); font-size: 11px; }
.cm-editor-actions span { margin-right: auto; }
.cm-replies { padding: 0 0 0 12px; display: flex; flex-direction: column; gap: 8px; }
.cm-reply { margin-left: calc((var(--depth, 1) - 1) * 12px); border-radius: 10px; background: var(--a-bg-2); }
.cm-empty { padding: 52px 20px; text-align: center; color: var(--a-text-3); font-size: 14px; }
@media (max-width: 1080px) {
  .cm-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cm-filters { grid-template-columns: minmax(0, 1fr) 1fr; }
  .cm-filters .cm-search { grid-column: 1 / -1; }
}
@media (max-width: 768px) {
  .cm-top-actions { width: 100%; justify-content: flex-start; }
  .cm-top-actions .a-btn { min-height: 40px; }
  .cm-filters { grid-template-columns: 1fr; }
  .cm-search, .cm-select { min-height: 42px; font-size: 14px; }
  .cm-date-range { grid-template-columns: 1fr; gap: 6px; }
  .cm-date-range > span { text-align: left; }
  .cm-card { grid-template-columns: 20px 34px minmax(0, 1fr); }
  .cm-avatar { width: 34px; height: 34px; }
  .cm-meta { flex-wrap: wrap; }
  .cm-actions { grid-column: 1 / -1; flex-direction: row; flex-wrap: wrap; justify-content: flex-end; }
  .cm-actions button { min-width: 58px; min-height: 36px; }
  .cm-bulk { padding: 12px; }
  .cm-bulk .a-btn { flex: 1; min-width: calc(50% - 4px); }
  .cm-link { width: 100%; margin-left: 0; text-align: right; }
  .cm-reply { margin-left: calc((var(--depth, 1) - 1) * 8px); }
  .cm-inline-author-item { grid-template-columns: 18px minmax(0, 1fr); }
  .cm-inline-action { justify-self: flex-end; grid-column: 2 / 3; min-height: 34px; }
  .cm-author-reply-line { flex-direction: column; gap: 2px; }
  .cm-author-reply-label, .cm-author-reply-content { font-size: 12px; }
  .cm-author-reply-meta { flex-wrap: wrap; row-gap: 4px; }
}
@media (max-width: 480px) {
  .cm-title { font-size: 20px; }
  .cm-stats { grid-template-columns: 1fr; }
  .cm-stat strong { font-size: 18px; }
  .cm-headline { flex-wrap: wrap; gap: 6px; }
  .cm-content { font-size: 12px; }
  .cm-client span { font-size: 10px; }
  .cm-actions button { flex: 1; min-width: calc(50% - 4px); }
  .cm-bulk .a-btn { min-width: 100%; }
}
</style>
