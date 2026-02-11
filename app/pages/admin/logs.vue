<template>
  <div>
    <div class="a-topbar">
      <div>
        <div class="a-title">操作日志</div>
        <div class="a-subtitle">记录系统操作历史</div>
      </div>
      <div class="a-actions">
        <button class="a-btn" @click="loadLogs">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          刷新
        </button>
        <button class="a-btn" @click="exportLogs">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          导出
        </button>
        <button class="a-btn a-btn-danger" @click="clearLogs">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          清空
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="log-stats-row">
      <div class="log-stat-card" :class="{ active: timeFilter === 'all' }" @click="timeFilter = 'all'">
        <div class="log-stat-icon" style="background:rgba(var(--a-primary-rgb),0.1);color:var(--a-primary);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </div>
        <div class="log-stat-body">
          <div class="log-stat-value">{{ logs.length }}</div>
          <div class="log-stat-label">全部日志</div>
        </div>
      </div>
      <div class="log-stat-card" :class="{ active: timeFilter === 'today' }" @click="timeFilter = 'today'">
        <div class="log-stat-icon" style="background:rgba(52,199,89,0.1);color:#34c759;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="log-stat-body">
          <div class="log-stat-value">{{ todayCount }}</div>
          <div class="log-stat-label">今天</div>
        </div>
      </div>
      <div class="log-stat-card" :class="{ active: timeFilter === 'week' }" @click="timeFilter = 'week'">
        <div class="log-stat-icon" style="background:rgba(0,122,255,0.1);color:#007aff;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="log-stat-body">
          <div class="log-stat-value">{{ weekCount }}</div>
          <div class="log-stat-label">本周</div>
        </div>
      </div>
      <div class="log-stat-card" :class="{ active: timeFilter === 'month' }" @click="timeFilter = 'month'">
        <div class="log-stat-icon" style="background:rgba(255,149,0,0.1);color:#ff9500;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        </div>
        <div class="log-stat-body">
          <div class="log-stat-value">{{ monthCount }}</div>
          <div class="log-stat-label">本月</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="log-filter-bar">
      <div class="log-search-wrap">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="搜索操作内容..." v-model="searchQuery">
      </div>
      <select class="log-filter-select" v-model="categoryFilter">
        <option value="all">全部分类</option>
        <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ categoryLabel(cat) }}</option>
      </select>
      <div v-if="hasActiveFilter" class="log-filter-clear" @click="clearFilters">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        清除筛选
      </div>
      <div style="flex:1"></div>
      <span class="log-result-count">{{ filteredLogs.length }} 条记录</span>
    </div>

    <!-- 日志列表 -->
    <div class="log-list-card" style="flex:1;min-height:0;overflow-y:auto;">
      <div v-if="loading" class="log-empty">
        <div class="log-loading-spinner"></div>
        加载中...
      </div>
      <div v-else-if="filteredLogs.length === 0" class="log-empty">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--a-text-3);opacity:0.5;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>暂无日志记录</span>
      </div>
      <template v-else>
        <!-- 按日期分组 -->
        <template v-for="(group, dateKey) in groupedLogs" :key="dateKey">
          <div class="log-date-header">
            <span class="log-date-dot"></span>
            <span>{{ dateKey }}</span>
            <span class="log-date-count">{{ group.length }} 条</span>
          </div>
          <div v-for="log in group" :key="log.id || log.timestamp" class="log-item">
            <div class="log-item-left">
              <div class="log-type-icon" :class="'type-' + (log.type || 'other')">
                <span v-html="typeIcon(log.type)"></span>
              </div>
            </div>
            <div class="log-item-body">
              <div class="log-item-header">
                <span class="log-type-badge" :class="'cat-' + (log.type || 'other')">{{ categoryLabel(log.type) }}</span>
                <span class="log-item-title">{{ log.title }}</span>
                <span class="log-item-time">{{ formatTime(log.timestamp) }}</span>
              </div>
              <div v-if="log.description" class="log-item-desc">{{ log.description }}</div>
              <!-- 始终显示元信息 -->
              <div class="log-item-meta">
                <span v-if="log.operator" class="log-meta-tag">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ log.operator }}
                </span>
                <span v-if="log.ip && log.ip !== 'unknown'" class="log-meta-tag">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {{ log.ip }}
                </span>
                <span v-else-if="log.ip === 'unknown'" class="log-meta-tag" title="本地开发环境无法获取真实IP">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  本地访问
                </span>
                <span v-if="log.location && log.location !== 'Unknown' && log.location !== '未知'" class="log-meta-tag">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ log.location }}
                </span>
                <span v-if="log.platform" class="log-meta-tag" title="操作系统">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  {{ log.platform }}
                </span>
                <span class="log-meta-tag">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ new Date(log.timestamp).toLocaleString('zh-CN') }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { authFetch } = useAdmin()
const ui = useAdminUI()

const logs = ref([])
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('all')
const timeFilter = ref('all')

// 动态分类选项
const categoryOptions = computed(() => {
  const types = new Set()
  logs.value.forEach(l => { if (l.type) types.add(l.type) })
  return [...types].sort()
})

const categoryLabelMap = {
  auth: '认证', post: '文章', link: '友链', config: '配置',
  comment: '评论', system: '系统', other: '其他'
}
const categoryLabel = (type) => categoryLabelMap[type] || type || '其他'

// 统计
const todayCount = computed(() => {
  const today = new Date().toDateString()
  return logs.value.filter(l => new Date(l.timestamp).toDateString() === today).length
})
const weekCount = computed(() => {
  const weekAgo = Date.now() - 7 * 86400000
  return logs.value.filter(l => new Date(l.timestamp).getTime() > weekAgo).length
})
const monthCount = computed(() => {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  return logs.value.filter(l => new Date(l.timestamp) >= monthStart).length
})

const hasActiveFilter = computed(() => {
  return searchQuery.value.trim() || categoryFilter.value !== 'all' || timeFilter.value !== 'all'
})

const clearFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = 'all'
  timeFilter.value = 'all'
}

// 过滤
const filteredLogs = computed(() => {
  let list = [...logs.value]

  if (timeFilter.value === 'today') {
    const today = new Date().toDateString()
    list = list.filter(l => new Date(l.timestamp).toDateString() === today)
  } else if (timeFilter.value === 'week') {
    const weekAgo = Date.now() - 7 * 86400000
    list = list.filter(l => new Date(l.timestamp).getTime() > weekAgo)
  } else if (timeFilter.value === 'month') {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    list = list.filter(l => new Date(l.timestamp) >= monthStart)
  }

  if (categoryFilter.value !== 'all') {
    list = list.filter(l => l.type === categoryFilter.value)
  }

  if (searchQuery.value.trim()) {
    const kw = searchQuery.value.trim().toLowerCase()
    list = list.filter(l =>
      (l.title || '').toLowerCase().includes(kw) ||
      (l.description || '').toLowerCase().includes(kw) ||
      (l.ip || '').includes(kw) ||
      (l.operator || '').toLowerCase().includes(kw)
    )
  }

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

// 按日期分组
const groupedLogs = computed(() => {
  const groups = {}
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  filteredLogs.value.forEach(log => {
    const d = new Date(log.timestamp)
    const ds = d.toDateString()
    let label
    if (ds === today) label = '今天'
    else if (ds === yesterday) label = '昨天'
    else label = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(log)
  })
  return groups
})

const formatTime = (ts) => {
  if (!ts) return ''
  const date = new Date(ts)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)} 小时前`
  // 同一年只显示月日+时分
  const now = new Date()
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return date.toLocaleString('zh-CN')
}


const typeIcon = (type) => {
  const icons = {
    auth: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    post: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    link: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    config: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    comment: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    system: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  }
  return icons[type] || '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
}

// 数据操作
const loadLogs = async () => {
  loading.value = true
  try {
    const data = await authFetch('/api/logs')
    if (data.success) logs.value = data.data || []
  } catch {}
  loading.value = false
}

const exportLogs = async () => {
  try {
    const data = await authFetch('/api/logs/export')
    const blob = new Blob([data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    ui.toast('导出成功', 'success')
  } catch {
    ui.toast('导出失败', 'error')
  }
}

const clearLogs = async () => {
  const ok = await ui.confirm('确定要清空所有操作日志？此操作不可恢复。', { danger: true, confirmText: '清空' })
  if (!ok) return
  try {
    await authFetch('/api/logs/clear', { method: 'DELETE' })
    logs.value = []
    ui.toast('已清空', 'success')
  } catch {}
}

onMounted(loadLogs)
</script>

<style scoped>
/* 统计卡片 */
.log-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.log-stat-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--a-bg-2); border: 1px solid var(--a-border); border-radius: 12px; cursor: pointer; transition: all .2s ease; }
.log-stat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.log-stat-card.active { border-color: var(--a-primary); background: rgba(var(--a-primary-rgb),0.04); }
.log-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.log-stat-body { min-width: 0; }
.log-stat-value { font-size: 22px; font-weight: 700; color: var(--a-text); line-height: 1.2; }
.log-stat-label { font-size: 12px; color: var(--a-text-3); margin-top: 2px; }

/* 筛选栏 */
.log-filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.log-search-wrap { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border: 1px solid var(--a-border); border-radius: 10px; background: var(--a-bg-2); flex: 1; min-width: 200px; transition: border-color .2s; }
.log-search-wrap:focus-within { border-color: var(--a-primary); }
.log-search-wrap svg { color: var(--a-text-3); flex-shrink: 0; }
.log-search-wrap input { border: none; background: none; outline: none; font-size: 13px; color: var(--a-text); width: 100%; }
.log-search-wrap input::placeholder { color: var(--a-text-3); }
.log-filter-select { padding: 8px 12px; border: 1px solid var(--a-border); border-radius: 10px; background: var(--a-bg-2); color: var(--a-text); font-size: 13px; outline: none; cursor: pointer; }
.log-filter-clear { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--a-primary); cursor: pointer; padding: 6px 10px; border-radius: 6px; transition: background .15s; }
.log-filter-clear:hover { background: rgba(var(--a-primary-rgb),0.08); }
.log-result-count { font-size: 12px; color: var(--a-text-3); white-space: nowrap; }

/* 日志列表 */
.log-list-card { background: var(--a-bg-2); border: 1px solid var(--a-border); border-radius: 14px; overflow: hidden; }
.log-empty { text-align: center; padding: 60px 20px; color: var(--a-text-3); font-size: 14px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.log-loading-spinner { width: 24px; height: 24px; border: 2px solid var(--a-border); border-top-color: var(--a-primary); border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 日期分组 */
.log-date-header { display: flex; align-items: center; gap: 8px; padding: 10px 20px; font-size: 12px; font-weight: 600; color: var(--a-text-2); background: rgba(var(--a-primary-rgb),0.02); border-bottom: 1px solid var(--a-border); }
.log-date-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--a-primary); flex-shrink: 0; }
.log-date-count { font-weight: 400; color: var(--a-text-3); margin-left: auto; }

/* 日志条目 */
.log-item { display: flex; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--a-border); transition: background .15s; }
.log-item:last-child { border-bottom: none; }
.log-item:hover { background: rgba(var(--a-primary-rgb),0.02); }

.log-item-left { flex-shrink: 0; padding-top: 2px; }
.log-type-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.log-type-icon.type-auth { background: rgba(88,86,214,.1); color: #5856d6; }
.log-type-icon.type-post { background: rgba(0,122,255,.1); color: #007aff; }
.log-type-icon.type-link { background: rgba(52,199,89,.1); color: #34c759; }
.log-type-icon.type-config { background: rgba(255,149,0,.1); color: #ff9500; }
.log-type-icon.type-comment { background: rgba(90,200,250,.1); color: #5ac8fa; }
.log-type-icon.type-system { background: rgba(142,142,147,.1); color: #8e8e93; }
.log-type-icon.type-other { background: var(--a-bg); color: var(--a-text-3); }

.log-item-body { flex: 1; min-width: 0; }
.log-item-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.log-type-badge { font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0; }
.cat-auth { background: rgba(88,86,214,.1); color: #5856d6; }
.cat-post { background: rgba(0,122,255,.1); color: #007aff; }
.cat-link { background: rgba(52,199,89,.1); color: #34c759; }
.cat-config { background: rgba(255,149,0,.1); color: #ff9500; }
.cat-comment { background: rgba(90,200,250,.1); color: #5ac8fa; }
.cat-system { background: rgba(142,142,147,.1); color: #8e8e93; }
.cat-other { background: var(--a-bg); color: var(--a-text-3); }
.log-item-title { font-size: 14px; font-weight: 500; color: var(--a-text); }
.log-item-time { font-size: 12px; color: var(--a-text-3); margin-left: auto; white-space: nowrap; flex-shrink: 0; }
.log-item-desc { font-size: 13px; color: var(--a-text-2); margin-top: 4px; line-height: 1.5; }

/* 元信息标签 */
.log-item-meta { display: flex; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
.log-meta-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: var(--a-text-3); }
.log-meta-tag svg { opacity: .6; }

/* 展开详情 */
/* 响应式 */
@media (max-width: 768px) {
  .log-stats-row { grid-template-columns: repeat(2, 1fr); }
  .log-item-header { flex-wrap: wrap; }
  .log-item-time { margin-left: 0; }
}
@media (max-width: 480px) {
  .log-stats-row { grid-template-columns: 1fr; }
}

</style>
