
type ToastType = 'info' | 'success' | 'warning' | 'error'

let toastTimer: any = null

const toastIcons: Record<ToastType, string> = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 7"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3z" fill="currentColor" fill-opacity="0.1"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r="1" fill="currentColor" stroke="none"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 11v6"/><circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none"/></svg>'
}

let _toastCSSInjected = false
function injectToastCSS() {
    if (_toastCSSInjected || typeof document === 'undefined') return
    _toastCSSInjected = true
    // Only inject if style.css is not already loaded (admin pages) OR if we want to ensure specific toast style overrides
    if (document.querySelector('style[data-comment-toast]')) return

    // Check if .comment-toast style exists in stylesheets? 
    // Just inject it to be safe. It uses specific class names.
    const style = document.createElement('style')
    style.setAttribute('data-comment-toast', '')
    style.textContent = `
/* comment-toast — 灵动岛风格 */
.comment-toast{position:fixed;top:20px;left:50%;transform:translate(-50%) translateY(-20px) scale(.9);display:flex;align-items:center;gap:12px;padding:12px 24px 12px 16px;border-radius:50px;background:linear-gradient(135deg,rgba(30,30,32,.95),rgba(20,20,22,.98));color:#fff;font-size:13px;font-weight:500;white-space:nowrap;opacity:0;visibility:hidden;pointer-events:none;z-index:99999;backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);box-shadow:0 20px 60px rgba(0,0,0,.35),0 8px 25px rgba(0,0,0,.25),inset 0 0 0 1px rgba(255,255,255,.08),inset 0 1px rgba(255,255,255,.1);transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.34,1.56,.64,1),visibility .4s;overflow:hidden}
.comment-toast::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3) 50%,transparent);opacity:.8}
.comment-toast.show{opacity:1;visibility:visible;pointer-events:auto;transform:translate(-50%) translateY(0) scale(1)}
.comment-toast-icon{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative;border-radius:50%}
.comment-toast-icon::after,.comment-toast-icon::before{display:none}
.comment-toast.show .comment-toast-icon{animation:ct-icon-pop .6s cubic-bezier(.34,1.56,.64,1) .1s both}
@keyframes ct-icon-pop{0%{transform:scale(0) rotate(-15deg);opacity:0}50%{transform:scale(1.25) rotate(5deg);opacity:1}70%{transform:scale(.9) rotate(-3deg)}100%{transform:scale(1) rotate(0);opacity:1}}
.comment-toast-icon svg{width:22px;height:22px;position:relative;z-index:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.1))}
.comment-toast-success .comment-toast-icon{color:#4ade80;background:rgba(74,222,128,.12);box-shadow:0 0 10px rgba(74,222,128,.2)}
.comment-toast-success.show .comment-toast-icon svg path{stroke-dasharray:32;stroke-dashoffset:32;animation:ct-draw .6s cubic-bezier(.22,1,.36,1) .2s forwards}
@keyframes ct-draw{to{stroke-dashoffset:0}}
.comment-toast-error .comment-toast-icon{color:#f87171;background:rgba(248,113,113,.12);box-shadow:0 0 10px rgba(248,113,113,.2)}
.comment-toast-error.show .comment-toast-icon{animation:ct-icon-pop .5s cubic-bezier(.34,1.56,.64,1) .1s both,ct-shake .5s ease-in-out .5s}
.comment-toast-error.show .comment-toast-icon svg path{stroke-dasharray:42;stroke-dashoffset:42;animation:ct-draw .5s cubic-bezier(.65,0,.35,1) .2s forwards}
@keyframes ct-shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
.comment-toast-warning .comment-toast-icon{color:#fbbf24;background:rgba(251,191,36,.12);box-shadow:0 0 10px rgba(251,191,36,.2)}
.comment-toast-warning.show .comment-toast-icon{animation:ct-icon-pop .5s cubic-bezier(.34,1.56,.64,1) .1s both,ct-pulse 1.5s ease-in-out .6s infinite}
.comment-toast-warning.show .comment-toast-icon svg path:first-child{stroke-dasharray:65;stroke-dashoffset:65;animation:ct-draw .6s cubic-bezier(.65,0,.35,1) .15s forwards}
.comment-toast-warning.show .comment-toast-icon svg path:nth-child(2){stroke-dasharray:16;stroke-dashoffset:16;animation:ct-draw .35s cubic-bezier(.65,0,.35,1) .45s forwards}
@keyframes ct-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.comment-toast-info .comment-toast-icon{color:#60a5fa;background:rgba(96,165,250,.12);box-shadow:0 0 10px rgba(96,165,250,.2)}
.comment-toast-info.show .comment-toast-icon{animation:ct-icon-pop .5s cubic-bezier(.34,1.56,.64,1) .1s both,ct-bounce 2s ease-in-out .6s infinite}
.comment-toast-info.show .comment-toast-icon svg path{stroke-dasharray:20;stroke-dashoffset:20;animation:ct-draw .5s ease-out .2s forwards}
@keyframes ct-bounce{0%,100%{transform:translateY(0)}10%{transform:translateY(-3px)}20%{transform:translateY(0)}}
.comment-toast-content{flex:1;line-height:1.4;letter-spacing:.02em;text-shadow:0 1px 2px rgba(0,0,0,.3);margin-left:4px}
@media(max-width:768px){.comment-toast{max-width:calc(100vw - 32px);font-size:.74rem}}
`
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
