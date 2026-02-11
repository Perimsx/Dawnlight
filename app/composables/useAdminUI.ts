type ToastType = 'info' | 'success' | 'warning' | 'error'

let toastTimer: any = null

const toastIcons: Record<ToastType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
}

function ensureToastEl(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    let toast = document.getElementById('toast')
    if (!toast) {
        toast = document.createElement('div')
        toast.id = 'toast'
        toast.className = 'toast'
        document.body.appendChild(toast)
    }
    return toast
}

function toast(message: string, type: ToastType = 'info', duration: number | null = null) {
    const el = ensureToastEl()
    if (!el) return null

    el.className = `toast ${type}`
    const icon = toastIcons[type] || toastIcons.info
    el.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-content">${message}</div>`

    requestAnimationFrame(() => el.classList.add('show'))

    if (toastTimer) clearTimeout(toastTimer)
    const actual = duration !== null ? duration : 3000
    if (actual > 0) {
        toastTimer = setTimeout(() => el.classList.remove('show'), actual)
    }

    return el
}

type ConfirmOptions = {
    title?: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
}

type ConfirmController = {
    resolve: (v: boolean) => void
}

let confirmController: ConfirmController | null = null

function ensureConfirmModal(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    let modal = document.getElementById('confirm-modal')
    if (!modal) {
        modal = document.createElement('div')
        modal.id = 'confirm-modal'
        modal.className = 'modal'
        modal.style.display = 'none'
        modal.innerHTML = `
      <div class="modal-content" style="max-width: 380px;">
        <div class="modal-header">
          <h3 id="confirm-title">提示</h3>
          <button class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body" style="text-align:center;">
          <p id="confirm-message" style="margin:0; font-size:14px; color:var(--a-text); line-height:1.5;"></p>
        </div>
        <div class="modal-footer" style="justify-content:center; border-top:none;">
          <button class="a-btn" data-action="cancel">取消</button>
          <button class="a-btn a-btn-primary" data-action="confirm">确定</button>
        </div>
      </div>
    `
        document.body.appendChild(modal)

        modal.addEventListener('click', (e: any) => {
            const action = e?.target?.dataset?.action
            if (!action) return
            if (action === 'close' || action === 'cancel') {
                closeConfirm(false)
            } else if (action === 'confirm') {
                closeConfirm(true)
            }
        })

        // ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const m = document.getElementById('confirm-modal')
                if (m && m.style.display !== 'none') closeConfirm(false)
            }
        })
    }
    return modal
}

function closeConfirm(result: boolean) {
    const modal = typeof document !== 'undefined' ? document.getElementById('confirm-modal') : null
    if (modal) modal.style.display = 'none'
    if (confirmController) {
        const c = confirmController
        confirmController = null
        c.resolve(result)
    }
}

function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    const modal = ensureConfirmModal()
    if (!modal) return Promise.resolve(false)

    const titleEl = modal.querySelector('#confirm-title') as HTMLElement | null
    const msgEl = modal.querySelector('#confirm-message') as HTMLElement | null
    const cancelBtn = modal.querySelector('[data-action="cancel"]') as HTMLButtonElement | null
    const confirmBtn = modal.querySelector('[data-action="confirm"]') as HTMLButtonElement | null

    if (titleEl) titleEl.textContent = options.title || '提示'
    if (msgEl) msgEl.textContent = message

    if (cancelBtn) cancelBtn.textContent = options.cancelText || '取消'
    if (confirmBtn) {
        confirmBtn.textContent = options.confirmText || '确定'
        confirmBtn.className = `a-btn ${options.danger ? 'a-btn-danger' : 'a-btn-primary'}`
    }

    modal.style.display = 'flex'

    return new Promise<boolean>((resolve) => {
        confirmController = { resolve }
    })
}

async function alert(message: string, type: ToastType = 'info', options: Omit<ConfirmOptions, 'danger'> = {}) {
    // 统一使用 confirm 的单按钮模式（避免原生 alert）
    const ok = await confirm(message, {
        ...options,
        cancelText: '',
        confirmText: options.confirmText || '确定'
    })
    if (ok) toast(message, type)
    return ok
}

export const useAdminUI = () => {
    return { toast, confirm, alert }
}

