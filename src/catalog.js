export const categories = [
  { id: 'all', label: '全部收录', icon: 'Layers' },
  { id: 'coding', label: '代码与产品反馈', icon: 'CodeXml' },
  { id: 'content', label: '内容与创作', icon: 'PenTool' },
  { id: 'operations', label: '业务与团队协作', icon: 'BriefcaseBusiness' },
  { id: 'research', label: '研究与数据分析', icon: 'ChartNoAxesCombined' },
  { id: 'automation', label: '监控与持续跟进', icon: 'Clock3' },
  { id: 'integrations', label: '插件与 MCP', icon: 'Workflow' },
  { id: 'learning', label: '指南与资源库', icon: 'BookOpen' },
  { id: 'agents', label: '独立 Agent 方案', icon: 'Bot' },
];
export const kinds = {
  official_case: { label: '官方场景', color: 'green' },
  community_project: { label: '社区项目', color: 'blue' },
  building_block: { label: '开发资源', color: 'amber' },
  alternative: { label: '独立替代', color: 'violet' },
  tutorial: { label: '教程与文章', color: 'paper' },
  task_template: { label: '任务模板', color: 'dotted' },
};
export const evidenceLabels = { official_example: '官方示例 · 未实测', source_reviewed: '局部源码审阅 · 未运行', readme_reviewed: 'README 审阅 · 未运行', content_reviewed: '内容审阅 · 未实测' };
export function filterItems(items, { query = '', category = 'all', kind = 'all', tags = [], tagMode = 'any', minStars = 0, sourceOnly = false, savedOnly = false, favorites = [], sort = 'curated' } = {}) {
  const tokens = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const list = items.filter(item => {
    const haystack = [item.name, item.owner, item.description, item.dotRole, item.category, item.repository ?? '', item.searchText ?? '', ...item.tags, categories.find(c => c.id === item.category)?.label ?? ''].join(' ').toLocaleLowerCase();
    const matchesTags = tags.length === 0 || (tagMode === 'all' ? tags.every(t => item.tags.includes(t)) : tags.some(t => item.tags.includes(t)));
    return (category === 'all' || item.category === category) && (kind === 'all' || item.kind === kind) && matchesTags && (minStars === 0 || (item.stars ?? 0) >= minStars) && (!sourceOnly || item.verified === 'source_reviewed') && (!savedOnly || favorites.includes(item.id)) && tokens.every(t => haystack.includes(t));
  });
  if (sort === 'curated') list.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  if (sort === 'stars') list.sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1));
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
  return list;
}
export function tagIndex(items) {
  const counts = new Map();
  for (const item of items) for (const tag of new Set(item.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}
export function chooseInspiration(pool, previousId, random = Math.random) {
  if (pool.length === 0) return null;
  const candidates = pool.length > 1 ? pool.filter(item => item.id !== previousId) : pool;
  return candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))];
}
export function dateKey(date = new Date(), timeZone = 'Asia/Singapore') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function dailyItem(items, date = new Date(), timeZone = 'Asia/Singapore') {
  const pool = items.filter(item => item.kind === 'official_case' || item.kind === 'community_project').slice().sort((a, b) => a.id.localeCompare(b.id, 'en'));
  if (pool.length === 0) return null;
  const day = Math.floor(Date.parse(`${dateKey(date, timeZone)}T00:00:00Z`) / 86400000);
  return pool[((day % pool.length) + pool.length) % pool.length];
}
export function taskBrief(item) {
  return `任务：${item.name}\n\n目标：${item.outcome}\nDot 的角色：${item.dotRole}\n\n需要的输入／连接：\n${item.requirements.map(x => `- ${x}`).join('\n')}\n\n边界：${item.limits}\n仅在已授权范围内执行。先报告缺少的来源和连接，不猜测。发送、发布、付款、合并和部署不包含在这份任务草案中。\n\n验收：返回实际交付物、来源、验证过程、尚未解决的问题及下一项需要人的决定。不要把任务运行完成当作结果已经验收。\n\n参考：${item.sourceUrl}\n证据状态：${evidenceLabels[item.verified]}\n这是本站整理的任务草案，不是官方原文或实测承诺。`;
}
