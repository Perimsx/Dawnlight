<template>
  <div>
    <div class="a-topbar">
      <div>
        <div class="a-title">文章管理</div>
        <div class="a-subtitle">共 {{ filteredPosts.length }} 篇文章</div>
      </div>
      <div class="a-actions">
        <NuxtLink class="a-btn a-btn-primary" to="/admin/posts/edit?new=1">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建文章
        </NuxtLink>
      </div>
    </div>

    <!-- 统计 -->
    <div class="ps-stats-row">
      <div class="ps-stat">
        <div class="ps-stat-icon" style="background:rgba(var(--a-primary-rgb),0.1);color:var(--a-primary);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="ps-stat-num">{{ allPosts.length }}</div>
        <div class="ps-stat-label">文章总数</div>
      </div>
      <div class="ps-stat">
        <div class="ps-stat-icon" style="background:rgba(255,149,0,0.1);color:#ff9500;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="ps-stat-num">{{ allPosts.filter(p => p.featured).length }}</div>
        <div class="ps-stat-label">精选文章</div>
      </div>
      <div class="ps-stat">
        <div class="ps-stat-icon" style="background:rgba(52,199,89,0.1);color:#34c759;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div class="ps-stat-num">{{ formatWordCount(totalWords) }}</div>
        <div class="ps-stat-label">总字数</div>
      </div>
      <div class="ps-stat">
        <div class="ps-stat-icon" style="background:rgba(0,122,255,0.1);color:#007aff;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div class="ps-stat-num">{{ totalViews }}</div>
        <div class="ps-stat-label">总浏览</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="ps-filter-bar">
      <div class="ps-search">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="搜索文章标题/标签..." v-model="searchQuery">
      </div>
      <select class="ps-select" v-model="categoryFilter">
        <option value="all">全部分类</option>
        <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <select class="ps-select" v-model="filterStatus">
        <option value="all">全部状态</option>
        <option value="featured">精选</option>
        <option value="normal">普通</option>
      </select>
      <select class="ps-select" v-model="sortBy">
        <option value="date-desc">最新发布</option>
        <option value="date-asc">最早发布</option>
        <option value="words-desc">字数最多</option>
        <option value="views-desc">浏览最多</option>
      </select>
    </div>

    <!-- 文章列表 -->
    <div class="ps-list-card" style="flex:1;min-height:0;display:flex;flex-direction:column;">
      <div v-if="postLoading" class="ps-empty">
        <div class="ps-spinner"></div>加载中...
      </div>
      <div v-else-if="filteredPosts.length === 0" class="ps-empty">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--a-text-3);opacity:.4;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>暂无文章</span>
      </div>
      <template v-else>
        <!-- 桌面表格 -->
        <div class="ps-desktop" style="flex:1;overflow-y:auto;min-height:0;">
          <table class="a-table" style="width:100%;">
            <thead>
              <tr>
                <th style="padding-left:16px;">标题</th>
                <th style="white-space:nowrap;">分类</th>
                <th style="white-space:nowrap;">发布时间</th>
                <th style="white-space:nowrap;">字数</th>
                <th style="white-space:nowrap;">浏览</th>
                <th style="white-space:nowrap;">状态</th>
                <th style="white-space:nowrap;text-align:right;padding-right:16px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="post in filteredPosts" :key="post.id" class="ps-row">
                <td style="padding-left:16px;">
                  <NuxtLink :to="`/admin/posts/edit?id=${post.id}`" class="ps-title-link">{{ post.title }}</NuxtLink>
                  <div v-if="post.tags && post.tags.length" class="ps-tags">
                    <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="ps-tag">{{ tag }}</span>
                    <span v-if="post.tags.length > 3" class="ps-tag">+{{ post.tags.length - 3 }}</span>
                  </div>
                </td>
                <td><span v-if="post.category" class="ps-category">{{ post.category }}</span><span v-else style="color:var(--a-text-3);font-size:12px;">-</span></td>
                <td style="color:var(--a-text-3);font-size:12px;white-space:nowrap;font-family:'SF Mono','Consolas',monospace;">{{ post.date?.split(' ')[0] || '-' }}</td>
                <td style="color:var(--a-text-3);font-size:13px;white-space:nowrap;">{{ (post.wordCount || 0).toLocaleString('zh-CN') }}</td>
                <td style="color:var(--a-text-3);font-size:13px;white-space:nowrap;">{{ post.views || 0 }}</td>
                <td><span v-if="post.featured" class="featured-badge">精选</span><span v-else class="normal-badge">普通</span></td>
                <td style="text-align:right;padding-right:16px;">
                  <div class="ps-actions">
                    <NuxtLink :to="`/admin/posts/edit?id=${post.id}`" class="ps-act-btn" title="编辑">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </NuxtLink>
                    <button class="ps-act-btn" @click="toggleFeatured(post)" :title="post.featured ? '取消精选' : '设为精选'">
                      <svg v-if="post.featured" viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="1" style="color:#ff9500;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    <button class="ps-act-btn delete" @click="deletePost(post)" title="删除">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 移动端卡片 -->
        <div class="ps-mobile" style="flex:1;overflow-y:auto;min-height:0;">
          <NuxtLink v-for="post in filteredPosts" :key="'m-'+post.id" :to="`/admin/posts/edit?id=${post.id}`" class="ps-mobile-card">
            <div class="ps-mobile-top">
              <span class="ps-mobile-title">{{ post.title }}</span>
              <span v-if="post.featured" class="featured-badge">精选</span>
            </div>
            <div class="ps-mobile-meta">
              <span v-if="post.category">{{ post.category }}</span>
              <span>{{ post.date?.split(' ')[0] || '-' }}</span>
              <span>{{ (post.wordCount || 0).toLocaleString('zh-CN') }}字</span>
            </div>
            <div v-if="post.tags && post.tags.length" class="ps-tags" style="margin-top:4px;">
              <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="ps-tag">{{ tag }}</span>
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { authFetch } = useAdmin()
const ui = useAdminUI()
const allPosts = ref([])
const postLoading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('all')
const categoryFilter = ref('all')
const sortBy = ref('date-desc')

const totalWords = computed(() => allPosts.value.reduce((s, p) => s + (p.wordCount || 0), 0))
const totalViews = computed(() => allPosts.value.reduce((s, p) => s + (p.views || 0), 0))

// 动态分类选项
const categoryOptions = computed(() => {
  const cats = new Set()
  allPosts.value.forEach(p => { if (p.category) cats.add(p.category) })
  return [...cats].sort((a, b) => a.localeCompare(b, 'zh-CN'))
})

const filteredPosts = computed(() => {
  let list = [...allPosts.value]
  if (searchQuery.value.trim()) {
    const kw = searchQuery.value.trim().toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(kw) || p.tags?.some(t => t.toLowerCase().includes(kw)))
  }
  if (filterStatus.value === 'featured') list = list.filter(p => p.featured)
  if (filterStatus.value === 'normal') list = list.filter(p => !p.featured)
  if (categoryFilter.value !== 'all') list = list.filter(p => p.category === categoryFilter.value)
  list.sort((a, b) => {
    switch (sortBy.value) {
      case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'words-desc': return (b.wordCount || 0) - (a.wordCount || 0)
      case 'views-desc': return (b.views || 0) - (a.views || 0)
      default: return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })
  return list
})

const formatWordCount = (num) => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const loadPosts = async () => {
  postLoading.value = true
  try {
    const data = await authFetch('/api/posts')
    if (data.success) allPosts.value = data.data
  } catch {}
  postLoading.value = false
}

const toggleFeatured = async (post) => {
  try {
    const target = !post.featured
    const res = await authFetch(`/api/posts/${post.id}/toggle-featured`, { method: 'POST', body: { featured: target } })
    if (res?.success) {
      post.featured = target
      ui.toast(target ? '已设为精选' : '已取消精选', 'success')
    }
  } catch {}
}

const deletePost = async (post) => {
  const ok = await ui.confirm(`确定删除「${post.title}」？此操作不可恢复。`, { danger: true, confirmText: '删除' })
  if (!ok) return
  try {
    const res = await authFetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res?.success) {
      allPosts.value = allPosts.value.filter(p => p.id !== post.id)
      ui.toast('删除成功', 'success')
    }
  } catch {}
}

onMounted(loadPosts)
</script>

<style scoped>
/* 统计 */
.ps-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px; }
.ps-stat { display:flex; align-items:center; gap:10px; padding:14px 16px; background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:12px; }
.ps-stat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ps-stat-num { font-size:20px; font-weight:700; color:var(--a-text); line-height:1; }
.ps-stat-label { font-size:11px; color:var(--a-text-3); }

/* 筛选 */
.ps-filter-bar { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; align-items:center; }
.ps-search { display:flex; align-items:center; gap:6px; padding:7px 12px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg-2); flex:1; min-width:200px; transition:border-color .2s; }
.ps-search:focus-within { border-color:var(--a-primary); }
.ps-search svg { color:var(--a-text-3); flex-shrink:0; }
.ps-search input { border:none; background:none; outline:none; font-size:13px; color:var(--a-text); width:100%; }
.ps-search input::placeholder { color:var(--a-text-3); }
.ps-select { padding:7px 10px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg-2); color:var(--a-text); font-size:13px; outline:none; cursor:pointer; }

/* 列表 */
.ps-list-card { background:var(--a-bg-2); border:1px solid var(--a-border); border-radius:14px; overflow:hidden; }
.ps-empty { text-align:center; padding:50px 20px; color:var(--a-text-3); font-size:14px; display:flex; flex-direction:column; align-items:center; gap:10px; }
.ps-spinner { width:22px; height:22px; border:2px solid var(--a-border); border-top-color:var(--a-primary); border-radius:50%; animation:spin .6s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }

.ps-desktop :deep(thead th) { position:sticky; top:0; background:var(--a-bg-2); z-index:2; }
.ps-row:hover { background:rgba(var(--a-primary-rgb),.02); }
.ps-title-link { color:var(--a-text); text-decoration:none; font-weight:500; font-size:14px; }
.ps-title-link:hover { color:var(--a-primary); }
.ps-tags { display:flex; gap:4px; margin-top:4px; flex-wrap:wrap; }
.ps-tag { font-size:11px; background:rgba(var(--a-primary-rgb),.06); padding:1px 6px; border-radius:4px; color:var(--a-text-3); }
.ps-category { font-size:12px; color:var(--a-primary); background:rgba(var(--a-primary-rgb),.08); padding:2px 8px; border-radius:4px; }
.featured-badge { font-size:11px; background:rgba(255,149,0,.12); color:#ff9500; padding:2px 8px; border-radius:4px; font-weight:500; }
.normal-badge { font-size:11px; color:var(--a-text-3); padding:2px 8px; border-radius:4px; background:rgba(125,125,125,0.08); }

/* 操作按钮 */
.ps-actions { display:flex; gap:4px; justify-content:flex-end; }
.ps-act-btn { width:30px; height:30px; border:1px solid var(--a-border); border-radius:8px; background:var(--a-bg); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; color:var(--a-text-3); text-decoration:none; }
.ps-act-btn:hover { transform:translateY(-1px); border-color:var(--a-primary); color:var(--a-primary); background:rgba(var(--a-primary-rgb),.06); }
.ps-act-btn.delete:hover { border-color:#ff3b30; color:#ff3b30; background:rgba(255,59,48,.06); }

/* 移动端 */
.ps-mobile { display:none; flex-direction:column; gap:8px; padding:12px; }
.ps-mobile-card { display:flex; flex-direction:column; gap:4px; padding:12px 14px; background:var(--a-bg); border-radius:10px; border:1px solid var(--a-border); text-decoration:none; transition:background .15s; }
.ps-mobile-card:active { background:rgba(var(--a-primary-rgb),.04); }
.ps-mobile-top { display:flex; align-items:center; gap:8px; }
.ps-mobile-title { font-size:14px; font-weight:500; color:var(--a-text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ps-mobile-meta { display:flex; gap:10px; font-size:12px; color:var(--a-text-3); }

@media (max-width:768px) {
  .ps-stats-row { grid-template-columns:repeat(2,1fr); }
  .ps-desktop { display:none !important; }
  .ps-mobile { display:flex !important; }
  .ps-filter-bar { flex-direction:column; }
  .ps-search { min-width:0; }
}
@media (max-width:480px) {
  .ps-stats-row { gap:8px; }
}
</style>
