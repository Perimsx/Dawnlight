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
          <span class="btn-text" :style="{ visibility: loginLoading ? 'hidden' : 'visible' }">登录</span>
          <span v-if="loginLoading" class="btn-spinner loading"></span>
        </button>
      </div>

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

<style>
/* 登录页优化 — 用高优先级覆盖 admin-style.css */
.login-panel .login-box {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-panel .login-box:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 0 var(--a-glass-highlight);
}

.login-panel .input-group input:focus {
    box-shadow: 0 0 0 3px rgba(var(--a-primary-rgb), 0.12);
}

/* ---- 移动端适配 ---- */
@media (max-width: 768px) {
    .login-panel .login-box {
        margin: 16px !important;
        padding: 30px 24px !important;
        max-width: 100% !important;
        border-radius: 14px !important;
    }

    .login-panel .login-logo {
        width: 44px !important;
        height: 44px !important;
        border-radius: 11px !important;
        margin: 0 auto 10px !important;
    }

    .login-panel .login-logo svg {
        width: 22px !important;
        height: 22px !important;
    }

    .login-panel .login-box h1 {
        font-size: 18px !important;
        margin-bottom: 2px !important;
    }

    .login-panel .login-box > p {
        font-size: 12px !important;
        margin-bottom: 14px !important;
    }

    .login-panel .login-form {
        margin-bottom: 8px !important;
    }

    .login-panel .input-group {
        margin-bottom: 10px !important;
    }

    .login-panel .input-group input {
        font-size: 14px !important;
        min-height: 42px !important;
        height: 42px !important;
        padding: 10px 40px !important;
    }

    .login-panel .floating-label {
        font-size: 12px !important;
    }

    .login-panel #login-btn {
        font-size: 14px !important;
        min-height: 40px !important;
        height: 40px !important;
        padding: 0 16px !important;
        border-radius: 10px !important;
    }

    .login-panel .login-hint {
        font-size: 11px !important;
        margin-top: 6px !important;
    }

    .login-panel .login-footer {
        margin-top: 12px !important;
    }

    .login-panel .login-footer-link {
        font-size: 12px !important;
    }

    .login-panel .login-footer-link svg {
        width: 14px !important;
        height: 14px !important;
    }
}

@media (max-width: 480px) {
    .login-panel .login-box {
        margin: 12px !important;
        padding: 24px 20px !important;
    }

    .login-panel .login-logo {
        width: 40px !important;
        height: 40px !important;
        margin: 0 auto 8px !important;
    }

    .login-panel .login-logo svg {
        width: 20px !important;
        height: 20px !important;
    }

    .login-panel .login-box h1 {
        font-size: 17px !important;
    }

    .login-panel .login-box > p {
        font-size: 11px !important;
        margin-bottom: 12px !important;
    }

    .login-panel .input-group input {
        font-size: 14px !important;
        min-height: 40px !important;
        height: 40px !important;
    }

    .login-panel #login-btn {
        min-height: 38px !important;
        height: 38px !important;
        font-size: 14px !important;
    }
}

/* 登录按钮加载态 — spinner 叠加在按钮中间，不改变按钮尺寸 */
.login-panel #login-btn {
    position: relative;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-panel #login-btn:active {
    transform: scale(0.96);
}

.login-panel #login-btn .btn-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -8px;
    margin-left: -8px;
}

.login-panel .input-group input:focus {
    box-shadow: 0 0 0 3px rgba(var(--a-primary-rgb), 0.2);
    border-color: var(--a-primary);
}
</style>
