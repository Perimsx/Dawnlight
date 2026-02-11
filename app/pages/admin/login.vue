<template>
  <div class="login-panel">
    <div class="login-bg-animation"></div>
    <div class="login-box">
      <div class="login-logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 16h20" />
          <path d="M6 16a6 6 0 0 1 12 0" />
          <circle cx="12" cy="16" r="2" fill="currentColor" opacity="0.3" />
          <path d="M12 4v4" />
          <path d="M4.93 7.93l2.83 2.83" />
          <path d="M19.07 7.93l-2.83 2.83" />
        </svg>
      </div>
      <h1>Dawnlight</h1>
      <p>后台管理系统</p>
      <div class="login-form">
        <div class="input-group">
          <span class="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </span>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder=" "
            @keyup.enter="handleLogin"
            :disabled="loginLoading"
          >
          <label class="floating-label">请输入管理密码</label>
          <button type="button" class="password-toggle" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
        <button id="login-btn" @click="handleLogin" :disabled="loginLoading">
          <span v-if="!loginLoading" class="btn-text">登录</span>
          <span v-else class="btn-spinner"></span>
        </button>
      </div>
      <p v-if="errorMsg" class="login-hint" style="color: var(--danger-color)">{{ errorMsg }}</p>
      <p v-if="loginHint && !errorMsg" class="login-hint">{{ loginHint }}</p>
      <div class="login-footer">
        <NuxtLink to="/" class="login-footer-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          返回首页
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import '~/assets/css/admin-style.css'

definePageMeta({ layout: false })

const { login, verify } = useAdmin()
const ui = useAdminUI()
const { config: siteConfig, fetchConfig } = useSiteConfig()
const loginHint = computed(() => siteConfig.value?.site?.loginHint || '')

const password = ref('')
const loginLoading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

// 如果已登录，直接跳转
onMounted(async () => {
  await fetchConfig()
  const isValid = await verify()
  if (isValid) navigateTo('/admin')
})

const handleLogin = async () => {
  if (!password.value.trim()) {
    errorMsg.value = '请输入密码'
    ui.toast('请输入密码', 'warning')
    return
  }
  loginLoading.value = true
  errorMsg.value = ''

  try {
    const result = await login(password.value)
    if (result.success) {
      ui.toast(result.message || '登录成功', 'success')
      navigateTo('/admin')
    } else {
      errorMsg.value = result.message || '密码错误'
      ui.toast(errorMsg.value, 'error')
    }
  } catch (e) {
    errorMsg.value = '登录失败，请检查网络连接'
    ui.toast(errorMsg.value, 'error')
  } finally {
    loginLoading.value = false
  }
}
</script>
