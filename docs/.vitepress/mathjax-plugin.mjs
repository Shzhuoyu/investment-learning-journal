// VitePress 兼容的数学公式插件：
// 只把 $$...$$ / $...$ 包成「原生 HTML 占位标签」（mdit-vue 会原样保留），
// 真正的公式渲染交给浏览器端 KaTeX（见 theme/index.js）。
// 标签内保留原始公式文本作为兜底，JS 失效时也能看到内容。
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
    const tex = state.src.slice(start, match)
    const token = state.push('html_inline', '', 0)
    token.content = `<span class="math-render" data-display="false" data-tex="${tex}">${tex}</span>`
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
  const tex = content.trim()
  const token = state.push('html_block', '', 0)
  token.block = true
  token.content = `<div class="math-render" data-display="true" data-tex="${tex}">\n${tex}\n</div>\n`
  return true
}

export default function mathjaxPlugin(md) {
  md.inline.ruler.after('escape', 'math_inline', math_inline)
  md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  })
}
