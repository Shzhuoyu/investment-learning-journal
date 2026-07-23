import DefaultTheme from 'vitepress/theme'
import { useRouter } from 'vitepress'
import { onMounted, nextTick } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './custom.css'

// 把页面里 .math-render 占位标签渲染成公式（公式文本保存在 data-tex / 标签内容里）
function renderMathInPage() {
  document.querySelectorAll('.math-render').forEach((el) => {
    // 已经渲染过的跳过
    if (el.querySelector('.katex')) return
    const tex = (el.getAttribute('data-tex') || el.textContent || '').trim()
    if (!tex) return
    const display = el.getAttribute('data-display') === 'true'
    try {
      katex.render(tex, el, { displayMode: display, throwOnError: false })
    } catch (e) {
      // 渲染失败则保留原始文本兜底
    }
  })
}

export default {
  extends: DefaultTheme,
  setup() {
    const router = useRouter()
    // 首次挂载
    onMounted(() => nextTick(renderMathInPage))
    // VitePress 是 SPA，客户端路由切换后内容会替换，需要重新渲染
    router.onAfterRouteChanged = () => nextTick(renderMathInPage)
  },
}
