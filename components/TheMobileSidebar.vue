<template>
  <nav class="mobile-sidebar" id="mobile-sidebar" role="navigation" aria-label="移动端导航菜单"
    :class="{ active: isOpen }" :aria-hidden="!isOpen">
    <div class="mobile-sidebar-content">
      <!-- 站点信息头部 -->
      <div style="display:flex;flex-direction:row;align-items:center;gap:10px;margin-top:20px;margin-bottom:16px;">
        <img v-if="config.site?.logo || config.author?.avatar" :src="config.site?.logo || config.author?.avatar" alt="" style="width:42px;height:42px;border-radius:12px;object-fit:cover;flex-shrink:0;" @error="(e) => e.target.style.display='none'">
        <div style="min-width:0;">
          <div style="font-size:1.05rem;font-weight:700;color:var(--text-primary);">{{ config.site?.name || 'Dawnlight' }}</div>
          <div v-if="config.site?.slogan" style="font-size:0.72rem;color:var(--text-tertiary);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ config.site.slogan }}</div>
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
          <div v-if="config.siteInfo?.icp" class="mobile-beian">{{ config.siteInfo.icp }}</div>
          <div v-if="config.siteInfo?.policeBeian" class="mobile-beian">{{ config.siteInfo.policeBeian }}</div>
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

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

