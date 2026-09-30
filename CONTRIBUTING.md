# Contributing

欢迎补充有出处的 Dot 案例、社区工具或开发资源。

1. 使用 Issue 模板说明名称、公开 URL、Dot 的具体角色、来源与运行状态。
2. 或修改 `data/catalog.json` 提 PR。仓库条目需在 `data/project-evidence.json` 中补固定提交的 README / 相关源码链接与哈希；不要复制完整第三方文档，也不要提交私有会话或凭证。
3. 区分官方示例、社区项目、开发底座与独立替代。Dot.NET、dotfiles 等关键词误匹配不收录；自托管 Agent 不自动算 OpenAI Dot 集成。
4. 标成 tested 时必须提供有日期的执行记录和实际验收输出。没有测量就不写速度倍数、收入或部署成功。
5. 运行 `npm test`、`npm run generate` 和 `npm run build`。新增条目可补英日韩译文，缺译时回退中文。

定时扫描产出的候选需要人工看来源再收录，不自动修改案例的证据等级。提交后由维护者审阅；不要直接向默认分支推送未审核内容。
