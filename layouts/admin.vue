<template>
  <div class="admin-layout-wrapper">
    <div id="admin-panel" class="admin-panel a-page">
      <!-- Mobile Menu Button -->
      <button class="a-mobile-menu-btn" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Mobile Overlay -->
      <div class="a-mobile-overlay" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = false"></div>

      <div class="a-shell">
        <!-- Sidebar -->
        <aside class="a-sidebar" :class="{ active: mobileMenuOpen }">
          <NuxtLink to="/" class="a-brand" title="返回站点首页">
            <div class="a-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 16h20" />
                <path d="M6 16a6 6 0 0 1 12 0" />
                <circle cx="12" cy="16" r="2" fill="currentColor" opacity="0.3" />
                <path d="M12 4v4" />
                <path d="M4.93 7.93l2.83 2.83" />
                <path d="M19.07 7.93l-2.83 2.83" />
              </svg>
            </div>
            <div style="min-width:0">
              <div class="a-brand-title">Dawnlight</div>
              <div class="a-brand-sub">管理后台</div>
            </div>
          </NuxtLink>

          <nav class="a-nav">
            <NuxtLink to="/admin" class="nav-link" :class="{ active: route.path === '/admin' }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              控制台
            </NuxtLink>
            <NuxtLink to="/admin/posts" class="nav-link" :class="{ active: route.path.startsWith('/admin/posts') }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
              文章管理
            </NuxtLink>
            <NuxtLink to="/admin/comments" class="nav-link" :class="{ active: route.path === '/admin/comments' }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              评论管理
            </NuxtLink>
            <NuxtLink to="/admin/links" class="nav-link" :class="{ active: route.path === '/admin/links' }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              友链管理
            </NuxtLink>
            <NuxtLink to="/admin/settings" class="nav-link" :class="{ active: route.path === '/admin/settings' }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
              站点设置
            </NuxtLink>
            <NuxtLink to="/admin/logs" class="nav-link" :class="{ active: route.path === '/admin/logs' }" @click="mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              操作日志
            </NuxtLink>
          </nav>

          <div class="a-sidebar-footer">
            <div class="a-user-row">
              <NuxtLink to="/" class="a-user" title="返回站点首页">
                <div class="a-user-avatar">
                  <img v-if="adminAvatar" :src="adminAvatar" alt="头像" @error="onAvatarError">
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div class="a-user-meta">
                  <div class="a-user-name">{{ siteConfig?.author?.name || '管理员' }}</div>
                  <div class="a-user-sub">返回首页</div>
                </div>
              </NuxtLink>
              <button class="a-theme-toggle" @click="toggleTheme" title="切换主题">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              </button>
            </div>
            <button class="a-logout" @click="handleLogout">退出登录</button>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="a-main">
          <div id="spa-view">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '~/assets/css/admin-style.css'

const route = useRoute()
const { logout, verify } = useAdmin()
const ui = useAdminUI()
const { config: siteConfig } = useSiteConfig()

const mobileMenuOpen = ref(false)

// 进入后台时解除前台对 html/body 的滚动锁定（前台 style.css 有 overflow:hidden）
useHead({
  htmlAttrs: { 'data-admin': '1' },
  bodyAttrs: { 'data-admin': '1' }
})

// 管理员头像：优先 site.logo → author.avatar → fallback SVG
const avatarSrc = computed(() => siteConfig.value?.site?.logo || siteConfig.value?.author?.avatar || '')
const avatarFailed = ref(false)
const adminAvatar = computed(() => avatarSrc.value && !avatarFailed.value ? avatarSrc.value : '')
const onAvatarError = () => { avatarFailed.value = true }

// 验证登录状态
onMounted(async () => {
  const isValid = await verify()
  if (!isValid) {
    navigateTo('/admin/login')
  }
})

// 主题切换
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', next)
  localStorage.setItem('themeMode', next)
}

// 退出登录（二次确认）
const handleLogout = async () => {
  const ok = await ui.confirm('确定要退出登录吗？', { confirmText: '退出', danger: true })
  if (!ok) return
  await logout()
  navigateTo('/admin/login')
}

// 路由变化关闭菜单
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>

<style scoped>
.admin-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* 品牌区域链接样式 */
.a-brand {
  text-decoration: none;
  color: inherit;
}
.a-brand:hover {
  text-decoration: none;
  opacity: .85;
}
/* 管理员头像链接样式 */
.a-user {
  text-decoration: none;
  color: inherit;
}
.a-user:hover {
  text-decoration: none;
  opacity: .85;
}
/* 管理员头像图片适配 */
.a-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
</style>
