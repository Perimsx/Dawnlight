<template>
  <div>
    <div class="a-topbar">
      <div>
        <div class="a-title">评论管理</div>
        <div class="a-subtitle">管理文章评论</div>
      </div>
      <div class="a-actions">
        <button class="a-btn" @click="refresh">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          刷新
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="cm-stats-row">
      <div class="cm-stat" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
        <div class="cm-stat-icon" style="background:rgba(var(--a-primary-rgb),0.1);color:var(--a-primary);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="cm-stat-num">{{ totalCount }}</div>
        <div class="cm-stat-label">全部</div>
      </div>
      <div class="cm-stat" :class="{ active: statusFilter === 'pending' }" @click="statusFilter = 'pending'">
        <div class="cm-stat-icon" style="background:rgba(255,149,0,0.1);color:#ff9500;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="cm-stat-num">{{ pendingCount }}</div>
        <div class="cm-stat-label">待审核</div>
      </div>
      <div class="cm-stat" :class="{ active: statusFilter === 'approved' }" @click="statusFilter = 'approved'">
        <div class="cm-stat-icon" style="background:rgba(52,199,89,0.1);color:#34c759;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="cm-stat-num">{{ approvedCount }}</div>
        <div class="cm-stat-label">已通过</div>
      </div>
      <div class="cm-stat" :class="{ active: statusFilter === 'rejected' }" @click="statusFilter = 'rejected'">
        <div class="cm-stat-icon" style="background:rgba(255,59,48,0.1);color:#ff3b30;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div class="cm-stat-num">{{ rejectedCount }}</div>
        <div class="cm-stat-label">已拒绝</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="cm-filter-bar">
      <div class="cm-filter-right">
        <div class="cm-search">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" v-model="searchQuery" placeholder="搜索昵称或内容...">
        </div>
        <select class="cm-select" v-model="postFilter">
          <option value="all">全部文章</option>
          <option v-for="p in postOptions" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <select class="cm-select" v-model="timeFilter">
          <option value="all">全部时间</option>
          <option value="today">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
        </select>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedIds.size > 0" class="cm-bulk-bar">
      <span class="cm-bulk-count">已选 {{ selectedIds.size }} 项</span>
      <button class="a-btn a-btn-sm" @click="batchAction('approved')">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        批量通过
      </button>
      <button class="a-btn a-btn-sm" @click="batchAction('rejected')">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        批量拒绝
      </button>
      <button class="a-btn a-btn-sm a-btn-danger" @click="batchDelete">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        批量删除
      </button>
      <div style="flex:1"></div>
      <button class="cm-bulk-clear" @click="selectedIds.clear()">取消选择</button>
    </div>

    <!-- 列表 -->
    <div class="cm-list-card" style="flex:1;min-height:0;display:flex;flex-direction:column;">
      <div v-if="loading" class="cm-empty">
        <div class="cm-spinner"></div>
        加载中...
      </div>
      <div v-else-if="filteredItems.length === 0" class="cm-empty">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--a-text-3);opacity:.4;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>暂无评论</span>
      </div>
      <template v-else>
        <!-- 全选 -->
        <div class="cm-select-all" style="flex-shrink:0;">
          <label class="cm-checkbox-wrap">
            <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll">
            <span class="cm-checkbox"></span>
          </label>
          <span class="cm-select-all-text">{{ isAllSelected ? '取消全选' : '全选' }}</span>
          <span class="cm-result-count">{{ filteredItems.length }} 条记录</span>
        </div>

        <div class="cm-scroll-area">
        <div v-for="item in filteredItems" :key="item.id" class="cm-card" :class="{ selected: selectedIds.has(item.id) }">
          <label class="cm-checkbox-wrap" @click.stop>
            <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)">
            <span class="cm-checkbox"></span>
          </label>
          <img :src="getAvatar(item)" alt="" class="cm-avatar" @error="onAvatarError">
          <div class="cm-body">
            <div class="cm-meta">
              <span class="cm-nickname">{{ item.nickname }}</span>
              <span class="cm-status" :class="'s-' + (item.status || 'pending')">{{ statusText(item.status) }}</span>
              <span v-if="item.postTitle" class="cm-post-link">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>
                {{ item.postTitle }}
              </span>
              <span class="cm-time">{{ formatTime(item.createdAt) }}</span>
            </div>
            <div class="cm-content">{{ item.content }}</div>
            <div class="cm-info" v-if="item.location || item.os || item.browser">
              <span v-if="item.location && item.location !== 'Unknown' && item.location !== '未知'" class="cm-tag">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ item.location }}
              </span>
              <span v-if="item.os && item.os !== 'Unknown' && item.os !== '未知'" class="cm-tag">
                <span v-html="getOsIcon(item.os)"></span>
                {{ item.os }}
              </span>
              <span v-if="item.browser && item.browser !== 'Unknown' && item.browser !== '未知'" class="cm-tag">
                <span v-html="getBrowserIcon(item.browser)"></span>
                {{ item.browser }}
              </span>
            </div>
          </div>
          <div class="cm-actions">
            <button v-if="item.status !== 'approved'" class="cm-act-btn approve" @click="updateStatus(item, 'approved')" title="通过">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button v-if="item.status !== 'rejected'" class="cm-act-btn reject" @click="updateStatus(item, 'rejected')" title="拒绝">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button class="cm-act-btn delete" @click="deleteItem(item)" title="删除">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { authFetch } = useAdmin()
const ui = useAdminUI()
const { getOsIcon, getBrowserIcon } = useClientIcons()

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%234f8fff'/%3E%3Cstop offset='100%25' stop-color='%236c5ce7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='40' cy='40' r='40' fill='url(%23g)'/%3E%3Ccircle cx='40' cy='30' r='12' fill='rgba(255,255,255,0.85)'/%3E%3Cellipse cx='40' cy='58' rx='20' ry='14' fill='rgba(255,255,255,0.85)'/%3E%3C/svg%3E"

const statusFilter = ref('all')
const postFilter = ref('all')
const timeFilter = ref('all')
const searchQuery = ref('')
const loading = ref(true)
const allComments = ref([])
const postOptions = ref([])
const selectedIds = reactive(new Set())

const isValidQQ = (qq) => /^\d{5,12}$/.test(String(qq || '').trim())
const getAvatar = (item) => {
  const qq = String(item?.qq || '').trim()
  if (isValidQQ(qq)) return `/api/proxy/qq-avatar?qq=${encodeURIComponent(qq)}`
  return item?.avatar || defaultAvatar
}
const onAvatarError = (e) => { if (e?.target) e.target.src = defaultAvatar }

// 统计
const items = computed(() => allComments.value)
const totalCount = computed(() => items.value.length)
const pendingCount = computed(() => items.value.filter(i => (i.status || 'pending') === 'pending').length)
const approvedCount = computed(() => items.value.filter(i => i.status === 'approved').length)
const rejectedCount = computed(() => items.value.filter(i => i.status === 'rejected').length)

const filteredItems = computed(() => {
  let list = items.value

  if (statusFilter.value !== 'all') {
    list = list.filter(i => (i.status || 'pending') === statusFilter.value)
  }

  if (postFilter.value !== 'all') {
    list = list.filter(i => i.postId === postFilter.value)
  }

  if (timeFilter.value !== 'all') {
    const now = new Date()
    let startTime
    if (timeFilter.value === 'today') startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    else if (timeFilter.value === 'week') { const d = now.getDay() || 7; startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d + 1) }
    else if (timeFilter.value === 'month') startTime = new Date(now.getFullYear(), now.getMonth(), 1)
    if (startTime) list = list.filter(i => new Date(i.createdAt) >= startTime)
  }

  if (searchQuery.value.trim()) {
    const kw = searchQuery.value.trim().toLowerCase()
    list = list.filter(i =>
      (i.nickname || '').toLowerCase().includes(kw) ||
      (i.content || '').toLowerCase().includes(kw)
    )
  }

  return list
})

// 选择
const isAllSelected = computed(() => filteredItems.value.length > 0 && filteredItems.value.every(i => selectedIds.has(i.id)))
const toggleSelect = (id) => { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id) }
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    filteredItems.value.forEach(i => selectedIds.delete(i.id))
  } else {
    filteredItems.value.forEach(i => selectedIds.add(i.id))
  }
}

const statusText = (status) => ({ approved: '已通过', pending: '待审核', rejected: '已拒绝' })[status] || '待审核'

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)}小时前`
  if (mins < 10080) return `${Math.floor(mins / 1440)}天前`
  const now = new Date()
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return date.toLocaleString('zh-CN')
}

const refresh = async () => {
  loading.value = true
  selectedIds.clear()
  try {
    const postsData = await authFetch('/api/posts')
    const postTitleMap = new Map()
    const postOpts = []
    if (postsData?.success && Array.isArray(postsData.data)) {
      for (const p of postsData.data) {
        if (p?.id) postTitleMap.set(p.id, p.title || p.id)
      }
    }

    const commentsData = await authFetch('/api/comments')
    if (commentsData?.success && commentsData.data) {
      const grouped = commentsData.data || {}
      const allC = []
      const postIdsWithComments = new Set()
      for (const [postId, list] of Object.entries(grouped)) {
        const arr = Array.isArray(list) ? list : []
        if (arr.length > 0) postIdsWithComments.add(postId)
        for (const c of arr) allC.push({ ...c, postId, postTitle: postTitleMap.get(postId) || postId })
      }
      allComments.value = allC.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      for (const pid of postIdsWithComments) postOpts.push({ id: pid, title: postTitleMap.get(pid) || pid })
      postOptions.value = postOpts.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    } else {
      allComments.value = []
      postOptions.value = []
    }
  } catch {}
  loading.value = false
}

const updateStatus = async (item, status) => {
  try {
    const url = `/api/comments/${item.postId}/${item.id}`
    await authFetch(url, { method: 'PUT', body: { status } })
    item.status = status
    ui.toast(status === 'approved' ? '已通过' : '已拒绝', 'success')
  } catch { ui.toast('操作失败', 'error') }
}

const deleteItem = async (item) => {
  const ok = await ui.confirm('确定删除这条评论？', { danger: true, confirmText: '删除' })
  if (!ok) return
  try {
    const url = `/api/comments/${item.postId}/${item.id}`
    await authFetch(url, { method: 'DELETE' })
    allComments.value = allComments.value.filter(c => c.id !== item.id)
    selectedIds.delete(item.id)
    ui.toast('删除成功', 'success')
  } catch {}
}

// 批量操作
const batchAction = async (status) => {
  if (selectedIds.size === 0) return
  const label = status === 'approved' ? '通过' : '拒绝'
  const ok = await ui.confirm(`确定批量${label} ${selectedIds.size} 条评论？`, { confirmText: label })
  if (!ok) return
  let count = 0
  for (const id of selectedIds) {
    const item = filteredItems.value.find(i => i.id === id)
    if (!item || item.status === status) continue
    try {
      const url = `/api/comments/${item.postId}/${item.id}`
      await authFetch(url, { method: 'PUT', body: { status } })
      item.status = status
      count++
    } catch {}
  }
  selectedIds.clear()
  ui.toast(`已${label} ${count} 条`, 'success')
}

const batchDelete = async () => {
  if (selectedIds.size === 0) return
  const ok = await ui.confirm(`确定删除 ${selectedIds.size} 条评论？此操作不可恢复。`, { danger: true, confirmText: '删除' })
  if (!ok) return
  let count = 0
  for (const id of [...selectedIds]) {
    const item = allComments.value.find(i => i.id === id)
    if (!item) continue
    try {
      const url = `/api/comments/${item.postId}/${item.id}`
      await authFetch(url, { method: 'DELETE' })
      allComments.value = allComments.value.filter(c => c.id !== id)
      count++
    } catch {}
  }
  selectedIds.clear()
  ui.toast(`已删除 ${count} 条`, 'success')
}

onMounted(refresh)
</script>

<style scoped>
/* 统计 */
.cm-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
.cm-stat { display:flex; align-items:center; gap:10px; padding:14px 16px; background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:12px; cursor:pointer; transition:all .2s; }
.cm-stat:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.05); }
.cm-stat.active { border-color:var(--a-primary); background:rgba(var(--a-primary-rgb),.04); }
.cm-stat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.cm-stat-num { font-size:20px; font-weight:700; color:var(--a-text); line-height:1; }
.cm-stat-label { font-size:11px; color:var(--a-text-3); }

/* 筛选栏 */
.cm-filter-bar { display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
.cm-filter-right { display:flex; gap:8px; align-items:center; flex:1; justify-content:flex-end; flex-wrap:wrap; }
.cm-search { display:flex; align-items:center; gap:6px; padding:7px 12px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg-2); min-width:180px; transition:border-color .2s; }
.cm-search:focus-within { border-color:var(--a-primary); }
.cm-search svg { color:var(--a-text-3); flex-shrink:0; }
.cm-search input { border:none; background:none; outline:none; font-size:13px; color:var(--a-text); width:100%; }
.cm-search input::placeholder { color:var(--a-text-3); }
.cm-select { padding:7px 10px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg-2); color:var(--a-text); font-size:13px; outline:none; cursor:pointer; }

/* 批量操作 */
.cm-bulk-bar { display:flex; align-items:center; gap:8px; padding:10px 16px; background:rgba(var(--a-primary-rgb),.06); border:1px solid rgba(var(--a-primary-rgb),.2); border-radius:10px; margin-bottom:12px; flex-wrap:wrap; }
.cm-bulk-count { font-size:13px; font-weight:600; color:var(--a-primary); margin-right:4px; }
.cm-bulk-clear { font-size:12px; color:var(--a-text-3); cursor:pointer; border:none; background:none; padding:4px 8px; border-radius:4px; transition:color .15s; }
.cm-bulk-clear:hover { color:var(--a-text); }

/* 列表 */
.cm-list-card { background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:14px; overflow:hidden; }
.cm-scroll-area { flex:1; overflow-y:auto; min-height:0; }
.cm-empty { text-align:center; padding:50px 20px; color:var(--a-text-3); font-size:14px; display:flex; flex-direction:column; align-items:center; gap:10px; }
.cm-spinner { width:22px; height:22px; border:2px solid var(--a-border); border-top-color:var(--a-primary); border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

/* 全选 */
.cm-select-all { display:flex; align-items:center; gap:8px; padding:8px 16px; border-bottom:1px solid var(--a-border); font-size:12px; color:var(--a-text-3); background:rgba(var(--a-primary-rgb),.02); }
.cm-select-all-text { cursor:pointer; }
.cm-result-count { margin-left:auto; }

/* 复选框 */
.cm-checkbox-wrap { display:flex; align-items:center; cursor:pointer; flex-shrink:0; }
.cm-checkbox-wrap input { display:none; }
.cm-checkbox { width:16px; height:16px; border:1.5px solid var(--a-border); border-radius:4px; display:flex; align-items:center; justify-content:center; transition:all .15s; }
.cm-checkbox-wrap input:checked + .cm-checkbox { background:var(--a-primary); border-color:var(--a-primary); }
.cm-checkbox-wrap input:checked + .cm-checkbox::after { content:''; display:block; width:4px; height:8px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg) translateY(-1px); }

/* 评论卡片 */
.cm-card { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border-bottom:1px solid var(--a-border); transition:background .15s; }
.cm-card:last-child { border-bottom:none; }
.cm-card:hover { background:rgba(var(--a-primary-rgb),.02); }
.cm-card.selected { background:rgba(var(--a-primary-rgb),.04); }
.cm-avatar { width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; }
.cm-body { flex:1; min-width:0; }
.cm-meta { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px; }
.cm-nickname { font-size:14px; font-weight:600; color:var(--a-text); }
.cm-status { font-size:10px; padding:1px 6px; border-radius:4px; font-weight:600; flex-shrink:0; }
.cm-status.s-approved { background:rgba(52,199,89,.12); color:#34c759; }
.cm-status.s-pending { background:rgba(255,149,0,.12); color:#ff9500; }
.cm-status.s-rejected { background:rgba(255,59,48,.12); color:#ff3b30; }
.cm-post-link { font-size:11px; color:var(--a-text-3); display:inline-flex; align-items:center; gap:2px; max-width:160px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cm-time { font-size:11px; color:var(--a-text-3); margin-left:auto; white-space:nowrap; flex-shrink:0; }
.cm-content { font-size:13px; color:var(--a-text); line-height:1.55; margin-bottom:6px; word-break:break-word; }
.cm-info { display:flex; gap:6px; flex-wrap:wrap; }
.cm-tag { display:inline-flex; align-items:center; gap:3px; font-size:10px; color:var(--a-text-3); padding:1px 6px; border-radius:3px; background:rgba(var(--a-primary-rgb),.05); }
.cm-tag :deep(svg) { width:10px; height:10px; flex-shrink:0; }

/* 操作按钮 */
.cm-actions { display:flex; gap:4px; flex-shrink:0; opacity:0; transition:opacity .15s; padding-top:2px; }
.cm-card:hover .cm-actions { opacity:1; }
.cm-act-btn { width:30px; height:30px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; color:var(--a-text-3); }
.cm-act-btn:hover { transform:translateY(-1px); }
.cm-act-btn.approve:hover { border-color:#34c759; color:#34c759; background:rgba(52,199,89,.08); }
.cm-act-btn.reject:hover { border-color:#ff9500; color:#ff9500; background:rgba(255,149,0,.08); }
.cm-act-btn.delete:hover { border-color:#ff3b30; color:#ff3b30; background:rgba(255,59,48,.08); }

/* 响应式 */
@media (max-width:768px) {
  .cm-stats-row { grid-template-columns:repeat(2,1fr); }
  .cm-filter-bar { flex-direction:column; align-items:stretch; }
  .cm-filter-right { justify-content:flex-start; }
  .cm-actions { opacity:1; }
  .cm-time { margin-left:0; }
  .cm-meta { flex-wrap:wrap; }
}
@media (max-width:480px) {
  .cm-stats-row { grid-template-columns:1fr 1fr; gap:8px; }
  .cm-search { min-width:0; flex:1; }
}

</style>
