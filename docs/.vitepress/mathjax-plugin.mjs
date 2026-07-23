// 本地 MathJax 插件：把 $$...$$ / $...$ 渲染为内联 SVG，
// 并包装成 html_block / html_inline token，让 VitePress(@mdit-vue) 原样透传。
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import juice from 'juice/client'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const documentOptions = {
  InputJax: new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }),
}

function renderMath(content, display) {
  const mathDocument = mathjax.document(content, documentOptions)
  const html = adaptor.outerHTML(mathDocument.convert(content, { display }))
  const stylesheet = adaptor.outerHTML(documentOptions.OutputJax.styleSheet(mathDocument))
  return juice(html + stylesheet)
}

function isValidDelim(state, pos) {
  let max = state.posMax
  let can_open = true
  let can_close = true
  const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1
  const nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1
  if (prevChar === 0x20 || prevChar === 0x09 || (nextChar >= 0x30 && nextChar <= 0x39)) can_close = false
  if (nextChar === 0x20 || nextChar === 0x09) can_open = false
  return { can_open, can_close }
}

function math_inline(state, silent) {
  if (state.src[state.pos] !== '$') return false
  const res = isValidDelim(state, state.pos)
  if (!res.can_open) {
    if (!silent) state.pending += '$'
    state.pos += 1
    return true
  }
  const start = state.pos + 1
  let match = start
  while ((match = state.src.indexOf('$', match)) !== -1) {
    let pos = match - 1
    while (state.src[pos] === '\\') pos -= 1
    if ((match - pos) % 2 === 1) break
    match += 1
  }
  if (match === -1) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }
  if (match - start === 0) {
    if (!silent) state.pending += '$$'
    state.pos = start + 1
    return true
  }
  const res2 = isValidDelim(state, match)
  if (!res2.can_close) {
    if (!silent) state.pending += '$'
    state.pos = start
    return true
  }
  if (!silent) {
    const token = state.push('html_inline', '', 0)
    token.content = renderMath(state.src.slice(start, match), false)
  }
  state.pos = match + 1
  return true
}

function math_block(state, startLine, endLine, silent) {
  let next
  let found = false
  let pos = state.bMarks[startLine] + state.tShift[startLine]
  let max = state.eMarks[startLine]
  let lastLine = ''
  if (pos + 2 > max) return false
  if (state.src.slice(pos, pos + 2) !== '$$') return false
  pos += 2
  let firstLine = state.src.slice(pos, max)
  if (silent) return true
  if (firstLine.trim().slice(-2) === '$$') {
    firstLine = firstLine.trim().slice(0, -2)
    found = true
  }
  for (next = startLine; !found;) {
    next++
    if (next >= endLine) break
    pos = state.bMarks[next] + state.tShift[next]
    max = state.eMarks[next]
    if (pos < max && state.tShift[next] < state.blkIndent) break
    if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
      const lastPos = state.src.slice(0, max).lastIndexOf('$$')
      lastLine = state.src.slice(pos, lastPos)
      found = true
    }
  }
  state.line = next + 1
  const content =
    (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
    state.getLines(startLine + 1, next, state.tShift[startLine], true) +
    (lastLine && lastLine.trim() ? lastLine : '')
  const token = state.push('html_block', '', 0)
  token.block = true
  token.content = renderMath(content, true)
  return true
}

export default function mathjaxPlugin(md) {
  md.inline.ruler.after('escape', 'math_inline', math_inline)
  md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  })
}
