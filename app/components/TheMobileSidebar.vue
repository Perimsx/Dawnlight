<template>
  <nav class="mobile-sidebar" id="mobile-sidebar" role="navigation" aria-label="移动端导航菜单"
    :class="{ active: isOpen }" :aria-hidden="!isOpen">
    <div class="mobile-sidebar-content">
      <!-- 站点信息头部 -->
      <div style="display:flex;flex-direction:row;align-items:center;gap:12px;margin-top:24px;margin-bottom:20px;padding: 10px;margin-left: -10px;margin-right: -10px;border-radius: 16px;position: relative;text-decoration: none;">
        <div style="position: relative;border-radius: 14px;flex-shrink: 0;">
          <div style="position: absolute;top: 0; left: 0; right: 0; bottom: 0;border-radius: 14px;box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);pointer-events: none;"></div>
          <img v-if="config.site?.logo || config.author?.avatar" :src="config.site?.logo || config.author?.avatar" alt="" style="width:46px;height:46px;border-radius:14px;object-fit:cover;display:block;box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);" @error="(e) => e.target.style.display='none'">
        </div>
        <div style="min-width:0;display:flex;flex-direction:column;gap:2px;">
          <div style="font-size:1.1rem;font-weight:800;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25;background:linear-gradient(135deg, var(--text-primary) 0%, rgba(var(--accent-rgb), 0.8) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.3px;padding-right:2px;">{{ config.site?.name || 'Dawnlight' }}</div>
          <div v-if="config.site?.slogan" style="font-size:0.72rem;color:var(--text-tertiary);margin:0;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-weight:500;">{{ config.site.slogan }}</div>
        </div>
      </div>

      <!-- 公告 (移动端) -->
      <TheAnnouncement :show-title="false" style="margin-bottom:14px;" />

      <!-- 搜索框 -->
      <div style="display:flex;flex-direction:row;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--card-border);border-radius:8px;background:var(--bg-color);margin-bottom:14px;cursor:pointer;" @click="$emit('search')">
        <svg style="color:var(--text-tertiary);flex-shrink:0;" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span style="font-size:0.85rem;color:var(--text-tertiary);">搜索文章...</span>
      </div>

      <!-- 导航菜单 -->
      <div class="mobile-nav-menu">
        <NuxtLink
          v-for="nav in config.navigation"
          :key="nav.path"
          :to="nav.path"
          class="mobile-nav-item"
          :class="{ active: isActive(nav.path) }"
          @click="$emit('close')"
        >
          <span class="nav-icon" v-html="getNavIcon(nav.icon)"></span>
          {{ nav.name }}
        </NuxtLink>
      </div>

      <!-- 底部 -->
      <div class="mobile-footer">
        <TheThemeSwitcher mobile />
        <div class="mobile-copyright">
          {{ config.site.copyright }}
          <a
            v-if="config.siteInfo?.icp"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            class="mobile-beian mobile-beian-link"
          >
            {{ config.siteInfo.icp }}
          </a>
          <a
            v-if="policeBeianText"
            :href="policeBeianLink"
            target="_blank"
            rel="noopener noreferrer"
            class="mobile-beian mobile-beian-link"
          >
            {{ policeBeianText }}
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false }
})

defineEmits(['close', 'search'])

const route = useRoute()
const { config, getNavIcon } = useSiteConfig()

const getPoliceBeianLink = (text) => {
  const code = (text || '').match(/(\d{6,})/)?.[1]
  return code
    ? `https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=${code}`
    : 'https://www.beian.gov.cn/'
}

const policeBeianText = computed(() => {
  const value = config.value.siteInfo?.policeBeian?.trim() || ''
  return value && value !== '1' ? value : ''
})

const policeBeianLink = computed(() => getPoliceBeianLink(policeBeianText.value))

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

