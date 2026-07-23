import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import mathjaxPlugin from './mathjax-plugin.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsDir = path.resolve(__dirname, '..')

/**
 * 自动扫描目录生成侧边栏
 * @param {string} subDir - docs 下的子目录，如 'investment/content'
 * @param {object} options
 * @param {string} options.index - 目录首页的文字，如 '概览'
 * @param {string} options.prefix - 链接前缀，默认同 subDir
 */
function autoSidebar(subDir, { index, prefix } = {}) {
  const dir = path.join(docsDir, subDir)
  prefix = prefix || '/' + subDir.replace(/\\/g, '/')

  const items = []

  // 如果目录首页存在，作为第一项
  if (index) {
    items.push({ text: index, link: '/' + subDir.split('/')[0] + '/' })
  }

  // 扫描 .md 文件
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .sort()

    for (const f of files) {
      const name = f.replace(/\.md$/, '')
      items.push({ text: name, link: `${prefix}/${name}` })
    }
  }

  return items
}

// 仅生产构建（部署到 GitHub Pages 项目站）使用子路径，本地 dev 仍用根路径
const base = process.env.NODE_ENV === 'production' ? '/investment-learning-journal/' : '/'

export default withMermaid(defineConfig({
  title: '投资学习笔记',
  description: '个人知识库，记录自己的投资学习之路的',
  base,

  // 数学公式渲染（$$ ... $$ 块级 / $ ... $ 行内），构建时生成内联 SVG，无需运行时
  markdown: {
    config: (md) => md.use(mathjaxPlugin),
  },

  themeConfig: {
    logo: '/images/logo.svg',

    // 顶部导航
    nav: [
      { text: '💰 投资笔记', link: '/investment/' },
      { text: '🧠 大V思想', link: '/masters/' },
      { text: '🔗 资源', link: '/resources/' },
    ],

    // 侧边栏 — 自动从目录读取
    sidebar: {
      '/investment/': [
        { text: '概览', link: '/investment/' },
        ...autoSidebar('investment/content'),
      ],
      '/masters/': [
        { text: '概览', link: '/masters/' },
        ...autoSidebar('masters/content'),
      ],
      '/resources/': [
        { text: '推荐链接', link: '/resources/' },
        ...autoSidebar('resources/content'),
      ],
    },

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/Shzhuoyu/investment-learning-journal/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    footer: {
      message: '基于 VitePress 构建，记录投资学习之路',
      copyright: 'Copyright © 2026',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Shzhuoyu/investment-learning-journal' },
    ],

    lastUpdated: true,
    lastUpdatedText: '最后更新',
    returnToTopLabel: '返回顶部',

    outline: {
      level: [2, 4],
      label: '页面目录',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    darkModeSwitchLabel: '主题切换',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    langMenuLabel: '语言',
  },
}))