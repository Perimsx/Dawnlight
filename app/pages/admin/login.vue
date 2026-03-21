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
            autocomplete="current-password"
            :disabled="loginLoading"
            @keyup.enter="handleLogin"
          >
          <label class="floating-label">请输入管理密码</label>
          <button type="button" class="password-toggle" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
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
          <span class="btn-text" :style="{ visibility: loginLoading ? 'hidden' : 'visible' }">登录</span>
          <span v-if="loginLoading" class="btn-spinner loading"></span>
        </button>
      </div>

      <p v-if="errorMsg" class="login-error show">{{ errorMsg }}</p>

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

const password = ref('')
const loginLoading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

onMounted(async () => {
  try {
    const isValid = await verify()
    if (isValid) navigateTo('/admin')
  } catch {}
})

const handleLogin = async () => {
  if (!password.value.trim()) {
    errorMsg.value = '请输入密码'
    ui.toast(errorMsg.value, 'warning')
    return
  }

  loginLoading.value = true
  errorMsg.value = ''

  try {
    const result = await login(password.value)
    if (result?.success) {
      ui.toast(result.message || '登录成功', 'success')
      navigateTo('/admin')
      return
    }
    errorMsg.value = result?.message || '密码错误'
    ui.toast(errorMsg.value, 'error')
  } catch {
    errorMsg.value = '登录失败，请检查网络后重试'
    ui.toast(errorMsg.value, 'error')
  } finally {
    loginLoading.value = false
  }
}
</script>

<style scoped>
.login-panel {
  padding: max(18px, env(safe-area-inset-top, 0px)) 14px max(18px, env(safe-area-inset-bottom, 0px));
}

.login-panel .login-box {
  width: min(420px, 100%);
  margin: 0 auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-panel .login-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 0 var(--a-glass-highlight);
}

.login-panel .input-group input:focus {
  border-color: var(--a-primary);
  box-shadow: 0 0 0 3px rgba(var(--a-primary-rgb), 0.15);
}

.login-panel #login-btn {
  position: relative;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
}

.login-panel #login-btn:active {
  transform: scale(0.98);
}

.login-panel #login-btn .btn-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -8px;
  margin-left: -8px;
}

@media (max-width: 768px) {
  .login-panel .login-box {
    padding: 28px 20px;
    border-radius: 14px;
  }

  .login-panel .login-logo {
    width: 52px;
    height: 52px;
    margin-bottom: 12px;
  }

  .login-panel .login-logo svg {
    width: 24px;
    height: 24px;
  }

  .login-panel .login-box h1 {
    font-size: 20px;
  }

  .login-panel .login-box > p {
    margin-bottom: 18px;
    font-size: 13px;
  }

  .login-panel .input-group input {
    min-height: 46px;
    height: 46px;
    font-size: 16px;
    padding: 12px 44px 12px 42px;
  }

  .login-panel #login-btn {
    min-height: 46px;
    font-size: 15px;
  }

  .login-panel .password-toggle {
    min-width: 42px;
    min-height: 42px;
    right: 8px;
  }

  .login-panel .login-footer {
    margin-top: 16px;
    padding-top: 14px;
  }
}

@media (max-width: 480px) {
  .login-panel {
    padding: max(14px, env(safe-area-inset-top, 0px)) 10px max(14px, env(safe-area-inset-bottom, 0px));
  }

  .login-panel .login-box {
    padding: 24px 16px;
    border-radius: 12px;
  }

  .login-panel .login-logo {
    width: 46px;
    height: 46px;
    margin-bottom: 10px;
  }

  .login-panel .login-box h1 {
    font-size: 19px;
  }

  .login-panel .login-box > p {
    margin-bottom: 14px;
    font-size: 12px;
  }

  .login-panel .input-group input {
    min-height: 44px;
    height: 44px;
    padding: 10px 42px 10px 40px;
  }

  .login-panel #login-btn {
    min-height: 44px;
    font-size: 14px;
  }

  .login-panel .login-footer-link {
    justify-content: center;
    width: 100%;
  }
}
</style>
