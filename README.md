# Awesome Dot

**有了一个 7×24 小时的赛博员工，可以让它做什么？**

Awesome Dot 收集 OpenAI dots 的官方场景、社区项目和开发资源，帮你找到把 Dot 用起来的方法。

[在线访问](https://baigao417.github.io/awesome-dot/) · [提交项目](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml) · [English](README.en.md)

## 功能

- **分类浏览**：按用途分为代码与产品反馈、内容与创作、业务与团队协作、研究与数据分析、监控与持续跟进、插件与 MCP、指南与资源库、独立 Agent 方案。
- **搜索与筛选**：按关键词、收录类型、标签、GitHub Stars 快速定位；筛选条件会写进链接，方便分享。
- **灵感卡**：没想好做什么时，从当前结果里随机抽一张。
- **今日一见**：每天推荐一个案例。
- **案例详情**：Dot 在这里做什么、能得到什么、开始前需要什么，以及来源链接；官方场景可一键复制任务草案，直接交给 Dot。
- **收藏**：收藏的案例保存在浏览器里，不需要注册。
- **四种语言、两种模式**：中文、English、日本語、한국어，暗黑 / 明亮模式随时切换。

## 收录类型

| 类型 | 内容 |
| --- | --- |
| 官方场景 | 来自 OpenAI 官方文档的使用场景 |
| 社区项目 | 社区开发、与 Dot 相关的公开项目 |
| 开发资源 | 插件、MCP 等搭建 Dot 应用的工具 |
| 独立替代 | 其他 Agent 实现方案 |
| 教程与文章 | 上手教程、使用技巧与深度解读 |
| 任务模板 | 可以直接交给 Dot 的任务、规则与 Skill 模板 |

完整清单见 [docs/catalog.md](docs/catalog.md)。

## 提交项目

做了 Dot 相关的项目，或者发现了好用的案例？欢迎提交：

- **Issue**：填写 [提交模板](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml)，写明名称、链接和 Dot 在其中的作用。
- **Pull Request**：直接编辑 `data/catalog.json`，流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

另外，仓库每 12 小时自动扫描 GitHub：明确围绕 OpenAI dots 的新项目会按仓库原文自动收录，拿不准的会列在 [自动收录报告](https://github.com/baigao417/awesome-dot/issues) 里。

## 本地开发

需要 Node.js 24。

```bash
npm ci
npm run dev       # 本地预览
npm test          # 运行测试
npm run build     # 构建到 dist/
```

站点代码或数据推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。

## 目录结构

```text
data/
  catalog.json         收录数据（中文原文）
  catalog-i18n.json    收录的英日韩译文
  sources.json         官方文档来源
src/
  main.js              页面与交互
  i18n.js              界面文案（四种语言）
  style.css            样式
scripts/               数据生成与 GitHub 扫描脚本
.github/workflows/     发布、测试与定时扫描
```

## 维护者

白告 · [@baigao111](https://x.com/baigao111)
