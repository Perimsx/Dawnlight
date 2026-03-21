
type ToastType = 'info' | 'success' | 'warning' | 'error'

let toastTimer: any = null

const toastIcons: Record<ToastType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 7"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3z" fill="currentColor" fill-opacity="0.1"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11v6"/><circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none"/></svg>'
}

const TOAST_CSS = `
/* comment-toast — theme aware */
.comment-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%) translateY(-16px);display:flex;align-items:center;gap:10px;padding:10px 20px 10px 14px;border-radius:10px;background:var(--card-bg-solid,#fff);border:1px solid var(--card-border,rgba(0,0,0,.08));color:var(--text-primary,#18181b);font-size:13px;font-weight:500;white-space:nowrap;opacity:0;visibility:hidden;pointer-events:none;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,.1);transition:opacity .3s ease,transform .35s cubic-bezier(.34,1.56,.64,1),visibility .3s}
.comment-toast::before{display:none}
.comment-toast.show{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.comment-toast-icon{width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:50%}
.comment-toast-icon::after,.comment-toast-icon::before{display:none}
.comment-toast.show .comment-toast-icon{animation:ct-icon-pop .5s cubic-bezier(.34,1.56,.64,1) .1s both}
@keyframes ct-icon-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}
.comment-toast-icon svg{width:18px;height:18px}
.comment-toast-success .comment-toast-icon{color:#22c55e}
.comment-toast-error .comment-toast-icon{color:#ef4444}
.comment-toast-warning .comment-toast-icon{color:#f59e0b}
.comment-toast-info .comment-toast-icon{color:#3b82f6}
.comment-toast-success.show .comment-toast-icon svg path,.comment-toast-error.show .comment-toast-icon svg path,.comment-toast-warning.show .comment-toast-icon svg path:first-child,.comment-toast-info.show .comment-toast-icon svg path{stroke-dasharray:60;stroke-dashoffset:60;animation:ct-draw .5s ease .15s forwards}
@keyframes ct-draw{to{stroke-dashoffset:0}}
.comment-toast-content{flex:1;line-height:1.4}
.comment-toast:hover{transform:translateX(-50%) translateY(0) scale(1.01)}
[data-theme="dark"] .comment-toast{background:rgba(30,30,34,.96);border-color:rgba(255,255,255,.08);box-shadow:0 8px 28px rgba(0,0,0,.4)}
@media(max-width:768px){.comment-toast{max-width:calc(100vw - 32px);font-size:.78rem}}
`

function injectToastCSS() {
    if (typeof document === 'undefined') return
    const existing = document.querySelector<HTMLStyleElement>('style[data-comment-toast]')
    if (existing) {
        if (existing.textContent !== TOAST_CSS) existing.textContent = TOAST_CSS
        return
    }

    const style = document.createElement('style')
    style.setAttribute('data-comment-toast', '')
    style.textContent = TOAST_CSS
    document.head.appendChild(style)
}

function ensureToastEl(): HTMLElement | null {
    if (typeof document === 'undefined') return null
    injectToastCSS()
    let toast = document.getElementById('comment-toast')
    if (!toast) {
        toast = document.createElement('div')
        toast.id = 'comment-toast'
        toast.className = 'comment-toast'
        document.body.appendChild(toast)
    }
    return toast
}

function toast(message: string, type: ToastType = 'info', duration: number | null = null) {
    const el = ensureToastEl()
    if (!el) return null

    el.className = `comment-toast comment-toast-${type}`
    const icon = toastIcons[type] || toastIcons.info
    el.innerHTML = `<div class="comment-toast-icon">${icon}</div><div class="comment-toast-content">${message}</div>`

    requestAnimationFrame(() => el.classList.add('show'))

    if (toastTimer) clearTimeout(toastTimer)
    const actual = duration !== null ? duration : 3000
    if (actual > 0) {
        toastTimer = setTimeout(() => el.classList.remove('show'), actual)
    }

    return el
}

export const useToast = () => {
    return { toast }
}
