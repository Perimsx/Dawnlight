type LoginResult = { success: boolean, message: string }

export const useAdmin = () => {
  const token = useCookie<string | null>('admin-token')
  const isAuthenticated = computed(() => !!token.value)

  const login = async (password: string): Promise<LoginResult> => {
    try {
      const data = await $fetch<{ success: boolean; data?: { token: string }; message?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          body: { password }
        }
      )

      if (data.success && data.data?.token) {
        token.value = data.data.token
        return { success: true, message: data.message || '登录成功' }
      }
      return { success: false, message: data.message || '密码错误' }
    } catch (error: any) {
      const message = error?.data?.message || error?.message || '登录失败'
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'x-admin-token': token.value || '' }
      })
    } catch {
      // 登出请求失败时忽略，仍然清除本地 token
    }
    token.value = null
  }

  const verify = async () => {
    if (!token.value) return false
    try {
      const data = await $fetch<{ success: boolean }>('/api/auth/verify', {
        credentials: 'include',
        headers: { 'x-admin-token': token.value || '' }
      })
      return data.success
    } catch {
      return false
    }
  }

  const authFetch = async <T = any>(url: string, opts: any = {}): Promise<T> => {
    if (!token.value) {
      if (process.client) {
        navigateTo('/admin/login')
      }
      const unauthorizedError: any = new Error('UNAUTHORIZED')
      unauthorizedError.statusCode = 401
      throw unauthorizedError
    }

    try {
      return await $fetch<T>(url, {
        ...opts,
        timeout: typeof opts.timeout === 'number' ? opts.timeout : 15000,
        credentials: 'include',
        headers: {
          ...opts.headers,
          'x-admin-token': token.value || ''
        }
      })
    } catch (error: any) {
      const status = error?.statusCode || error?.response?.status || error?.data?.statusCode
      if (status === 401) {
        token.value = null
        if (process.client) {
          try {
            useAdminUI().toast('登录已过期，请重新登录', 'warning')
          } catch {
            // 忽略 UI 回调错误，优先执行跳转
          }
          navigateTo('/admin/login')
        }
      }
      throw error
    }
  }

  return {
    token,
    isAuthenticated,
    login,
    logout,
    verify,
    authFetch
  }
}
