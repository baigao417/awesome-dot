# Awesome Dot

[导航站](https://baigao417.github.io/awesome-dot/) · [提交案例](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml) · [关注维护者白告](https://x.com/baigao111)

OpenAI dots 的非官方案例与项目导航。借鉴 Awesome Jev 的目录式浏览，换成 Dot 场景、社区资源与源码证据，不是对 Jev 项目进行关键词替换。

首批收录：7 个官方场景示例、3 个社区资料项目、2 个开发资源、3 个独立替代方案。本站实测为 0。具体数字以 `data/catalog.json` 为准。

## 本地运行

```powershell
npm ci
npm run dev
```

保留 Claude 改版的视觉风格：橙红首屏、墨色胶囊导航与明暗切换。支持四语界面（中 / EN / 日 / 한）、搜索、用途与类型筛选、标签任一／全部匹配、Stars 阈值、源码审阅筛选、收藏、详情、任务草案复制、分享链接与目录导出。

「抽张灵感卡」从当前筛选结果中抽取，多条结果时不会连续重复；「今日一见」按 Asia/Singapore 日期固定选择一条官方场景或社区项目。午夜换日后更新，不需要账号或网络跟踪。维护者为白告 `@baigao111`，关注入口指向其 X 主页。

语言、主题与收藏留在本浏览器，无遥测或后台上传。收录正文的英日韩译文见 `data/catalog-i18n.json`，以中文原文为准。项目与维护者头像来自公开 GitHub 头像服务。建议使用 Node.js 24。

```powershell
npm test
npm run generate
npm run build
```

## 收录与证据

- `data/catalog.json`：编辑收录与 Dot 的具体角色。
- `data/sources.json`：官方能力依据。
- `data/project-evidence.json`：固定提交的来源链接、哈希与元数据快照；不等于运行或安全审计。不在此仓库重发第三方 README 原文。
- `docs/catalog.md`：可分享的目录清单，由 `npm run generate` 生成。
- `docs/source-review.md`：核验范围与固定提交链接。

官方示例与本站实测分开；开源替代品不称为 OpenAI Dot 集成。`dots-mcp` 当前是资源搜索，不是控制 Dot 的 API。公共指南的价格、权限和支持范围须回到官方核实。

## 每 12 小时发现

`.github/workflows/discovery.yml` 配置为 UTC `00:17 / 12:17`，约对应新加坡时间 `08:17 / 20:17`。GitHub 可能延迟执行；实际启用状态与运行结果见仓库的 [Actions](https://github.com/baigao417/awesome-dot/actions/workflows/discovery.yml)。

扫描最多每个查询 30 个公开仓库，排除 dotnet/dotfiles 等误匹配，去重后产出 `data/candidates.json`。只给候选，不自动把未审阅项目写进正式目录；结果作为 Actions artifact 保留 14 天。失败也保留回执，不伪报完整覆盖。工作流只有读取仓库权限。

本机只读扫描：

```powershell
npm run discover
```

可选 `GITHUB_TOKEN` 只从环境读取，不放进文件。源码批量核验工具 `scripts/discover.mjs` 使用已安装的 OpenCLI/GitHub CLI，可通过 `OPENCLI_BASH` 指定 Bash 可执行程序。其原始本地输出被 Git 忽略；CI 使用跨平台 `scan-github.mjs`。

## PR / Issue

按 [Issue 模板](https://github.com/baigao417/awesome-dot/issues/new?template=project.yml) 填名称、公开链接、Dot 角色和证据，或按照 [CONTRIBUTING.md](CONTRIBUTING.md) 提 PR。页面支持本地草稿下载与真实 Issue 入口；不会自动向平台发消息，也不把打开投稿页面当作提交成功。

## 发布

GitHub Pages 使用 `.github/workflows/pages.yml`。配置 Pages 来源为 GitHub Actions 后，可手动运行 Publish Directory。实际发布结果见 [发布工作流](https://github.com/baigao417/awesome-dot/actions/workflows/pages.yml)。本机静态构建成功不等于线上部署成功。

设计参照：https://logicrw.github.io/awesome-jev-projects/ 。使用独立编写的实现，未拷贝原站源码或品牌资产。参照站 MIT 许可证已核对，致谢见 `THIRD_PARTY_NOTICES.md`。

代码采用 MIT 许可证；第三方项目保留各自的许可。此目录不宣称 100x 提效、100 万收入或未运行的真实案例。
