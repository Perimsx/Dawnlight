// toast 实例延迟到 useAdminUI() 内部获取，避免在模块顶层调用 composable

type ToastType = 'info' | 'success' | 'warning' | 'error'

type ConfirmOptions = {
  title?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

type ConfirmController = {
  resolve: (value: boolean) => void
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
          <button class="modal-close" data-action="close" aria-label="关闭">&times;</button>
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

    modal.addEventListener('click', (event: any) => {
      const action = event?.target?.dataset?.action
      if (!action) return
      if (action === 'close' || action === 'cancel') {
        closeConfirm(false)
      } else if (action === 'confirm') {
        closeConfirm(true)
      }
    })

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      const current = document.getElementById('confirm-modal')
      if (current && current.style.display !== 'none') {
        closeConfirm(false)
      }
    })
  }

  return modal
}

function closeConfirm(result: boolean) {
  const modal = typeof document !== 'undefined'
    ? document.getElementById('confirm-modal')
    : null
  if (modal) {
    modal.style.display = 'none'
  }
  if (confirmController) {
    const current = confirmController
    confirmController = null
    current.resolve(result)
  }
}

function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  const modal = ensureConfirmModal()
  if (!modal) return Promise.resolve(false)

  const titleEl = modal.querySelector('#confirm-title') as HTMLElement | null
  const messageEl = modal.querySelector('#confirm-message') as HTMLElement | null
  const cancelBtn = modal.querySelector('[data-action="cancel"]') as HTMLButtonElement | null
  const confirmBtn = modal.querySelector('[data-action="confirm"]') as HTMLButtonElement | null

  if (titleEl) titleEl.textContent = options.title || '提示'
  if (messageEl) messageEl.textContent = message
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

/**
 * 纯弹窗提示（无取消按钮），用户点击确定后 resolve true
 */
async function alert(
  message: string,
  _type: ToastType = 'info',
  options: Omit<ConfirmOptions, 'danger'> = {}
) {
  return confirm(message, {
    ...options,
    cancelText: '',
    confirmText: options.confirmText || '确定'
  })
}

export const useAdminUI = () => {
  const { toast } = useToast()
  return { toast, confirm, alert }
}
