# 投资学习笔记 📈

> 记录投资学习与成长之路的个人知识库

<div align="center">

[![Built with VitePress](https://img.shields.io/badge/Built%20with-VitePress-00897b)](https://vitepress.dev)
[![Github Pages](https://img.shields.io/badge/Gitee-Pages-00897b)](https://shzhuoyu.github.io/investment-learning-journal/investment/)

</div>

## 📋 关于本项目

这是一个**个人投资学习知识库**，使用 Markdown 格式记录，通过 VitePress 构建为静态网站，部署在 Gitee Pages 上。

### 涵盖内容

| 板块 | 说明 |
|------|------|
| 💰 [投资学习笔记](docs/investment/) | 基础知识、技术分析、基本面分析、投资策略 |
| 🧠 [大佬思想学习](docs/masters/) | 采取网络上的投资大V的一些思想观点和随笔，方便自己阅读 |
| 🔗 [资源收藏](docs/resources/) | 推荐书单和实用链接 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run docs:dev

# 构建生产版本
npm run docs:build

# 本地预览构建结果
npm run docs:preview
```

## 📝 写作指南

1. 所有 Markdown 文件放在 `docs/` 目录下
2. 图片资源放在 `public/images/` 目录下
3. 在编辑器中预览效果：`npm run docs:dev`
4. 写作完成后构建：`npm run docs:build`

### Markdown 扩展语法

VitePress 支持丰富的 Markdown 扩展：

```markdown
::: tip 提示
这是提示块
:::

::: warning 注意
这是警告块
:::

::: danger 危险
这是危险块
:::

- [x] 已办事项
- [ ] 待办事项
```

## 🌐 部署

本项目采用**本地构建 + Github Pages** 的方式部署：

```bash
npm run docs:build
git add .
git commit -m "update"
git push
```

然后在 Github 仓库的「服务 → Github Pages」中点「更新」即可。

## 🧭 目录结构

```
investment-learning-journal/
├── docs/
│   ├── index.md               # 首页
│   ├── .vitepress/            # VitePress 配置
│   │   ├── config.mjs
│   │   └── theme/
│   ├── investment/            # 投资笔记
│   ├── masters/               # 大佬思想
│   └── resources/             # 资源收藏
├── public/images/             # 图片资源
├── package.json
├── .gitignore
└── README.md
```

## 📜 License

MIT
