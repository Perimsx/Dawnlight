<template>
  <div v-if="visibleAnnouncements.length > 0" class="announcement-wrapper">
    <div v-if="showTitle" class="announcement-section-title">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-color);">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
      </svg>
      <span>公告</span>
    </div>
    <div class="announcement-list">
      <div v-for="ann in visibleAnnouncements" :key="ann.annId" class="announcement-item" :class="'type-' + (ann.type || 'info')">
        <span class="announcement-type-icon" v-html="getAnnouncementIcon(ann.type || 'info')"></span>
        <div class="announcement-content-text" v-html="parseMarkdown(ann.content)"></div>
        <div class="announcement-close-btn" @click="closeAnnouncement(ann.annId)" title="关闭">×</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showTitle: { type: Boolean, default: true }
})

const { config } = useSiteConfig()
const { parse: parseMarkdown } = useMarkdown()

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

const closeAnnouncement = (id) => {
  closedAnnouncements.value.add(id)
  if (import.meta.client) {
    localStorage.setItem(`announcement_closed_${id}`, Date.now().toString())
  }
}

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
        if (container.classList.contains('scrolling')) return

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

onMounted(() => {
  // 恢复已关闭的公告
  visibleAnnouncements.value.forEach(ann => {
    if (localStorage.getItem(`announcement_closed_${ann.annId}`)) {
      closedAnnouncements.value.add(ann.annId)
    }
  })
  
  // 初始化滚动
  if (visibleAnnouncements.value.length > 0) {
    initAnnouncementScroll()
  } else {
    // No visible announcements
  }
})

watch(() => visibleAnnouncements.value, () => {
  if (import.meta.client) initAnnouncementScroll()
}, { immediate: false })
</script>

<style scoped>
.announcement-close-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 2;
}

.announcement-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}

.dark-mode .announcement-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
