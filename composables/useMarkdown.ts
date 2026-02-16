import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

export const useMarkdown = () => {
    // 自定义 renderer：给标题自动加 id
    const renderer = new marked.Renderer()
    renderer.heading = function ({ tokens, depth }: { tokens: any[]; depth: number }) {
        const text = this.parser.parseInline(tokens)
        const raw = text.replace(/<[^>]+>/g, '')
        const id = raw
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fff]+/g, '-')
            .replace(/^-+|-+$/g, '')
            || `heading-${depth}`
        return `<h${depth} id="${id}">${text}</h${depth}>\n`
    }

    marked.setOptions({
        breaks: true,
        gfm: true,
        renderer
    })

    const parse = (text: string): string => {
        if (!text) return ''
        const raw = marked.parse(text) as string
        // DOMPurify 需要允许 id 属性
        return DOMPurify.sanitize(raw, {
            ADD_ATTR: ['id', 'class', 'target', 'rel']
        })
    }

    // 从 Markdown 文本中移除第一个 h1
    const removeFirstH1 = (html: string): string => {
        return html.replace(/<h1[^>]*>.*?<\/h1>/, '')
    }

    // 移除"发布于"引用块
    const removePublishQuote = (html: string): string => {
        return html.replace(/<blockquote[^>]*>[\s\S]*?发布于[\s\S]*?<\/blockquote>/g, '')
    }

    return {
        parse,
        removeFirstH1,
        removePublishQuote
    }
}
