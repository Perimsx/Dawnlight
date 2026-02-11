<template>
  <aside class="sidebar-right">
    <ClientOnly>
    <!-- 公告区域 -->
    <div v-if="showAnnouncement && visibleAnnouncements.length > 0" class="announcement-wrapper">
      <div class="announcement-section-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        公告
      </div>
      <div class="announcement-list">
        <div
          v-for="ann in visibleAnnouncements"
          :key="ann.annId"
          class="announcement-item"
          :class="'type-' + (ann.type || 'info')"
        >
          <span class="announcement-type-icon" v-html="getAnnouncementIcon(ann.type || 'info')"></span>
          <div class="announcement-content-text" v-html="parseMarkdown(ann.content)"></div>
          <div class="announcement-close-btn" title="关闭" @click="closeAnnouncement(ann.annId)">×</div>
        </div>
      </div>
    </div>

    <!-- 站点统计 -->
    <div v-if="showStats" class="glass-card widget-card stats-card">
      <h4 class="widget-title">站点统计</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-num">{{ runtimeDays }}天</div>
            <div class="stat-label">运营天数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-num">{{ lastUpdate }}</div>
            <div class="stat-label">上次更新</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-num">{{ totalWordCount }}</div>
            <div class="stat-label">总字数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 站点信息 -->
    <div v-if="showSiteInfo" class="glass-card widget-card">
      <h4 class="widget-title">站点信息</h4>
      <div class="site-info-list">
        <div v-for="info in siteInfoList" :key="info.label" class="info-item">
          <span class="info-label">{{ info.label }}</span>
          <span class="info-value">{{ info.value }}</span>
        </div>
      </div>
    </div>

    <!-- 社交 -->
    <div v-if="showSocial && config.author.socials && config.author.socials.length > 0" class="glass-card widget-card">
      <h4 class="widget-title">社交</h4>
      <div class="social-cards">
        <a
          v-for="social in config.author.socials"
          :key="social.name"
          :href="social.url"
          :target="social.url.startsWith('mailto:') ? undefined : '_blank'"
          class="social-card"
          :class="{ 'has-bg': social.background, 'has-color': social.color }"
          :style="socialCardStyle(social)"
        >
          <div class="social-card-icon" v-html="social.icon || getSocialIcon(social.name)"></div>
          <div class="social-card-info">
            <div class="social-card-name">{{ social.name }}</div>
            <div v-if="social.description" class="social-card-desc">{{ social.description }}</div>
          </div>
          <svg class="social-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- 博客信息卡片 (友链页) -->
    <div v-if="showBlogInfo" class="glass-card widget-card blog-info-widget">
      <h4 class="widget-title">我的博客信息</h4>
      <div class="bi-header">
        <div class="bi-avatar">
          <img :src="config.author?.avatar || config.site?.logo || ''" :alt="config.author?.name" @error="(e) => e.target.style.display='none'">
        </div>
        <div class="bi-title-area">
          <span class="bi-name">{{ config.author?.name || '博主' }}</span>
          <span v-if="config.author?.bio" class="bi-slogan">{{ config.author.bio }}</span>
        </div>
      </div>
      <div class="bi-fields">
        <div v-if="config.author?.name" class="bi-field">
          <span class="bi-label">博主</span>
          <span class="bi-value">{{ config.author.name }}</span>
          <button class="bi-copy" @click="copyText(config.author.name)" title="复制">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div v-if="config.author?.bio" class="bi-field">
          <span class="bi-label">介绍</span>
          <span class="bi-value">{{ config.author.bio }}</span>
          <button class="bi-copy" @click="copyText(config.author.bio)" title="复制">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div v-if="config.author?.website" class="bi-field">
          <span class="bi-label">网址</span>
          <span class="bi-value bi-mono">{{ config.author.website }}</span>
          <button class="bi-copy" @click="copyText(config.author.website)" title="复制">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div v-if="config.author?.avatar" class="bi-field">
          <span class="bi-label">头像</span>
          <span class="bi-value bi-mono">{{ config.author.avatar }}</span>
          <button class="bi-copy" @click="copyText(config.author.avatar)" title="复制">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 更新日志 (归档页) -->
    <div v-if="showLog" id="log-card" class="glass-card widget-card fade-in">
      <div class="log-header">
        <h4 class="widget-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          更新日志
        </h4>
      </div>
      <div class="log-stats">
        <div class="log-stat-item">
          <span class="log-stat-label">运营时长</span>
          <span class="log-stat-value">{{ runtimeDays }} 天</span>
        </div>
        <div class="log-stat-item">
          <span class="log-stat-label">上次更新</span>
          <span class="log-stat-value">{{ sortedLogs.length > 0 ? sortedLogs[0].date : '暂无' }}</span>
        </div>
      </div>
      <div class="log-timeline">
        <div v-if="sortedLogs.length === 0" class="log-empty">暂无日志</div>
        <div v-else v-for="(log, index) in sortedLogs" :key="index" class="log-entry" :style="{ animationDelay: Math.min(index, 10) * 0.05 + 's' }">
          <div class="log-entry-date">{{ log.date }}</div>
          <div class="log-entry-content">{{ log.content }}</div>
        </div>
      </div>
      <div v-if="sortedLogs.length > 0" class="log-footer">
        <svg class="log-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="log-footer-text">共 <strong>{{ sortedLogs.length }}</strong> 条更新</span>
      </div>
    </div>

    <!-- 文章目录 -->
    <div v-if="showToc && tocItems.length > 0" id="toc-card" class="glass-card widget-card toc-card">
      <h4 class="widget-title">
        <span>文章目录</span>
        <div class="toc-header-actions">
          <button class="toc-action-btn" title="返回顶部" @click="scrollToTop">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="16 12 12 8 8 12"></polyline>
              <line x1="12" y1="16" x2="12" y2="8"></line>
            </svg>
          </button>
          <button class="toc-action-btn" :title="tocCollapsed ? '展开目录' : '收起目录'" @click="tocCollapsed = !tocCollapsed">
            <!-- 展开状态：三竖点图标 / 收起状态：向下箭头 -->
            <svg v-if="!tocCollapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </h4>
      <div v-show="!tocCollapsed" class="toc-content" id="toc-content">
        <ul class="toc-list">
          <li
            v-for="item in tocItems"
            :key="item.id"
            class="toc-item"
            :class="'level-' + item.level"
          >
            <a
              :href="'#' + item.id"
              class="toc-link"
              :data-target="item.id"
              @click.prevent="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    </ClientOnly>
  </aside>
</template>

<script setup>
const props = defineProps({
  showStats: { type: Boolean, default: true },
  showSiteInfo: { type: Boolean, default: true },
  showSocial: { type: Boolean, default: true },
  showAnnouncement: { type: Boolean, default: false },
  showLog: { type: Boolean, default: false },
  showToc: { type: Boolean, default: false },
  showBlogInfo: { type: Boolean, default: false },
  tocItems: { type: Array, default: () => [] },
  activeTocId: { type: String, default: '' }
})

const { config, getSocialIcon } = useSiteConfig()
const { posts } = usePosts()
const { parse: parseMarkdown } = useMarkdown()

// Toast 图标
const toastIcons = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

// Toast 提示函数（与前台评论Toast保持一致）
const showCommentToast = (() => {
  let toastTimer = null

  return (message, type = 'info') => {
    if (typeof document === 'undefined') return
    let toast = document.getElementById('comment-toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.id = 'comment-toast'
      toast.className = 'comment-toast'
      document.body.appendChild(toast)
    }

    toast.classList.remove('show')
    toast.className = `comment-toast comment-toast-${type}`
    const icon = toastIcons[type] || toastIcons.info
    toast.innerHTML = `<div class="comment-toast-icon">${icon}</div><div class="comment-toast-content">${message}</div>`
    requestAnimationFrame(() => toast.classList.add('show'))

    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000)
  }
})()

// 复制文本
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showCommentToast('复制成功', 'success')
  } catch {
    showCommentToast('复制失败', 'error')
  }
}

// 运营天数
const runtimeDays = computed(() => {
  const startTime = config.value.siteInfo?.startTime || '2024-01-01'
  const start = new Date(startTime)
  const now = new Date()
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

// 上次更新
const lastUpdate = computed(() => {
  if (posts.value.length === 0) return '-'
  const latestPost = posts.value.reduce((latest, post) => {
    return new Date(post.date) > new Date(latest.date) ? post : latest
  })
  const updateDate = new Date(latestPost.date)
  const diffMs = Date.now() - updateDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}天前`
  return `${(updateDate.getMonth() + 1).toString().padStart(2, '0')}-${updateDate.getDate().toString().padStart(2, '0')}`
})

// 总字数
const totalWordCount = computed(() => {
  const total = posts.value.reduce((sum, post) => sum + (post.wordCount || 0), 0)
  if (total >= 10000) return (total / 10000).toFixed(1) + 'w'
  if (total >= 1000) return (total / 1000).toFixed(1) + 'k'
  return total.toString()
})

// 站点信息列表
const siteInfoList = computed(() => {
  const list = []
  const infoMap = {
    imageStorage: '图片存储',
    softwareLicense: '软件协议',
    articleLicense: '文章许可',
    domain: '规范域名'
  }
  Object.entries(infoMap)
    .filter(([key]) => config.value.siteInfo?.[key])
    .forEach(([key, label]) => list.push({ label, value: config.value.siteInfo[key] }))
  return list
})

// 更新日志
const sortedLogs = computed(() => {
  const logs = config.value.siteInfo?.logs || []
  return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 公告
const closedAnnouncements = ref(new Set())

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

const visibleAnnouncements = computed(() => {
  let announcements = config.value.site?.announcements
  if (!announcements && config.value.site?.announcement) {
    announcements = [{ content: config.value.site.announcement, active: true }]
  }
  const active = (announcements || []).filter(a => a.active !== false && a.content?.trim())
  return active
    .map(ann => ({ ...ann, annId: simpleHash((ann.type || 'info') + ann.content) }))
    .filter(item => !closedAnnouncements.value.has(item.annId))
})

const closeAnnouncement = (annId) => {
  closedAnnouncements.value.add(annId)
  if (import.meta.client) {
    localStorage.setItem(`announcement_closed_${annId}`, Date.now().toString())
  }
}

onMounted(() => {
  // 恢复已关闭的公告
  visibleAnnouncements.value.forEach(ann => {
    if (localStorage.getItem(`announcement_closed_${ann.annId}`)) {
      closedAnnouncements.value.add(ann.annId)
    }
  })
  // 初始化公告滚动
  if (visibleAnnouncements.value.length > 0) initAnnouncementScroll()
})

const getAnnouncementIcon = (type) => {
  const icons = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-info"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-warning"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    danger: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-danger"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ann-icon-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  }
  return icons[type] || icons.info
}

// 公告文字溢出时启用滚动动画
const initAnnouncementScroll = () => {
  nextTick(() => {
    setTimeout(() => {
      document.querySelectorAll('.announcement-content-text').forEach(container => {
        const p = container.querySelector('p')
        if (!p) return
        const overflow = p.scrollWidth - container.clientWidth
        if (overflow > 30) {
          const originalText = p.innerHTML
          const gap = 80
          p.innerHTML = originalText + '<span style="display:inline-block;width:' + gap + 'px;"></span>' + originalText
          container.classList.add('scrolling')
          const scrollDistance = p.scrollWidth / 2
          p.style.setProperty('--scroll-distance', '-' + scrollDistance + 'px')
          const duration = Math.max(10, (scrollDistance / 100) * 3)
          p.style.animationDuration = duration + 's'
        }
      })
    }, 300)
  })
}

watch(() => visibleAnnouncements.value, () => {
  if (import.meta.client) initAnnouncementScroll()
}, { immediate: false })


const socialCardStyle = (social) => {
  let style = ''
  if (social.color) style += `background: ${social.color};`
  if (social.background) style += `--social-bg-image: url('${social.background}');`
  return style
}

const tocCollapsed = ref(false)

const scrollToTop = () => {
  const mainCol = document.querySelector('.main-column')
  if (mainCol && mainCol.scrollHeight > mainCol.clientHeight + 20) {
    mainCol.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const scrollToHeading = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>
