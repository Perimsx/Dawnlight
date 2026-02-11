<template>
  <div>
    <!-- 返回首页悬浮按钮 -->
    <NuxtLink v-if="showBackBtn && !mobileMenuOpen" class="floating-back-btn visible" to="/" aria-label="返回首页">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </NuxtLink>

    <!-- 评论悬浮按钮（文章页） -->
    <button v-if="showCommentBtn && !mobileMenuOpen" class="floating-comment-btn visible" aria-label="跳转评论区" @click="scrollToComments">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <!-- 移动端目录按钮 -->
    <button v-if="showTocBtn && !mobileMenuOpen" class="mobile-toc-btn visible" aria-label="文章目录" @click="mobileTocOpen = true">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="15" y2="12"></line>
        <line x1="3" y1="18" x2="9" y2="18"></line>
      </svg>
    </button>

    <!-- 搜索弹窗 -->
    <Teleport to="body">
      <div class="search-modal-overlay" :class="{ active: searchOpen }" @click.self="closeSearch">
        <div class="search-modal" :class="{ 'has-results': searchResults.length > 0 }">
          <!-- 搜索头部 -->
          <div class="search-modal-header">
            <div class="search-input-wrapper">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref="searchInput"
                type="text"
                placeholder="键入开始搜索"
                autocomplete="off"
                v-model="searchQuery"
                @input="onSearchInput"
                @keydown="onSearchKeydown"
              >
              <button v-if="searchQuery" class="search-clear-btn" title="清除" @click="clearSearch">×</button>
            </div>
          </div>

          <!-- 搜索结果区 -->
          <div class="search-modal-body" :class="{ active: searchResults.length > 0 || searchLoading }">
            <div class="search-results-list">
              <div v-if="searchLoading" style="text-align: center; padding: 20px; color: var(--text-tertiary);">搜索中...</div>
              <div v-else-if="searchQuery && searchResults.length === 0 && searchDone" style="text-align: center; padding: 20px; color: var(--text-tertiary);">未找到相关文章</div>
              <div
                v-else
                v-for="(result, index) in searchResults"
                :key="result.id"
                class="search-result-item"
                :class="{ active: activeSearchIndex === index }"
                @click="goToPost(result.id)"
              >
                <div class="search-result-content">
                  <div class="search-result-header">
                    <div class="search-result-title" v-html="highlightText(result.title, searchQuery)"></div>
                    <span class="search-result-date">{{ result.date?.split(' ')[0] }}</span>
                  </div>
                  <div class="search-result-excerpt" v-html="highlightText(result.description || '', searchQuery)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部快捷键提示 -->
          <div class="search-modal-footer">
            <div class="search-tips">
              <span class="tip-item"><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
              <span class="tip-item"><kbd>↵</kbd> 选择</span>
              <span class="tip-item"><kbd>Esc</kbd> 关闭</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 移动端目录弹出层 -->
    <Teleport to="body">
      <div v-if="mobileTocOpen" class="mobile-toc-overlay active" @click.self="mobileTocOpen = false">
        <div class="mobile-toc-drawer">
          <div class="mobile-toc-header">
            <h3>文章目录</h3>
            <button class="mobile-toc-close" aria-label="关闭目录" @click="mobileTocOpen = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="mobile-toc-content">
            <a
              v-for="item in tocItems"
              :key="item.id"
              :href="'#' + item.id"
              class="toc-item"
              :class="['toc-h' + item.level, { active: activeTocId === item.id }]"
              @click.prevent="scrollToHeading(item.id); mobileTocOpen = false"
            >
              {{ item.text }}
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  showBackBtn: { type: Boolean, default: false },
  showCommentBtn: { type: Boolean, default: false },
  showTocBtn: { type: Boolean, default: false },
  tocItems: { type: Array, default: () => [] },
  activeTocId: { type: String, default: '' },
  searchOpen: { type: Boolean, default: false },
  mobileMenuOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['update:searchOpen'])

const { config } = useSiteConfig()
const { posts } = usePosts()

const searchInput = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchDone = ref(false)
const activeSearchIndex = ref(-1)
const mobileTocOpen = ref(false)
let debounceTimer = null

// 打开移动端目录时自动滚动到当前高亮项
watch(mobileTocOpen, (val) => {
  if (val && props.activeTocId) {
    nextTick(() => {
      setTimeout(() => {
        const container = document.querySelector('.mobile-toc-content')
        const activeItem = container?.querySelector('.toc-item.active')
        if (container && activeItem) {
          const containerRect = container.getBoundingClientRect()
          const itemRect = activeItem.getBoundingClientRect()
          const scrollTarget = container.scrollTop + itemRect.top - containerRect.top - container.clientHeight / 2 + itemRect.height / 2
          container.scrollTo({ top: scrollTarget, behavior: 'smooth' })
        }
      }, 100)
    })
  }
})

// 监听搜索状态
watch(() => props.searchOpen, (val) => {
  if (val) {
    nextTick(() => searchInput.value?.focus())
  } else {
    searchQuery.value = ''
    searchResults.value = []
    activeSearchIndex.value = -1
    searchDone.value = false
  }
})

// 全局快捷键
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})

const handleGlobalKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    emit('update:searchOpen', !props.searchOpen)
  }
  if (e.key === 'Escape' && props.searchOpen) {
    e.preventDefault()
    closeSearch()
  }
}

const closeSearch = () => {
  emit('update:searchOpen', false)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  searchDone.value = false
  searchInput.value?.focus()
}

const onSearchInput = () => {
  clearTimeout(debounceTimer)
  searchDone.value = false
  debounceTimer = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch(searchQuery.value.trim())
    } else {
      searchResults.value = []
    }
  }, 200)
}

const performSearch = (query) => {
  searchLoading.value = true
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0)

  const results = posts.value.map(post => {
    const title = post.title.toLowerCase()
    const desc = (post.description || '').toLowerCase()
    const tags = post.tags.map(t => t.toLowerCase())
    let score = 0
    let allMatch = true

    for (const kw of keywords) {
      let matched = false
      if (title.includes(kw)) { score += 100; matched = true }
      if (tags.some(t => t.includes(kw))) { score += 60; matched = true }
      if (desc.includes(kw)) { score += 40; matched = true }
      if (!matched) allMatch = false
    }

    if (keywords.length > 1 && !allMatch) score = 0
    return { post, score }
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(r => r.post)

  searchResults.value = results
  searchLoading.value = false
  searchDone.value = true
  activeSearchIndex.value = -1
}

const onSearchKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeSearchIndex.value = Math.min(activeSearchIndex.value + 1, searchResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeSearchIndex.value = Math.max(activeSearchIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const idx = activeSearchIndex.value >= 0 ? activeSearchIndex.value : 0
    if (searchResults.value[idx]) {
      goToPost(searchResults.value[idx].id)
    }
  }
}

const goToPost = (id) => {
  closeSearch()
  navigateTo(`/post/${id}`)
}

const highlightText = (text, query) => {
  if (!query || !text) return escapeHtml(text || '')
  const keywords = query.split(/\s+/).filter(k => k.length > 0)
  let result = escapeHtml(text)
  for (const kw of keywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
  }
  return result
}

const escapeHtml = (text) => {
  if (!text) return ''
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return text.replace(/[&<>"']/g, m => map[m])
}

const scrollToComments = () => {
  const el = document.getElementById('comments-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const scrollToHeading = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
