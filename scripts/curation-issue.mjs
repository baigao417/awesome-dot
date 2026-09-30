// 把本轮自动收录结果评论到固定的 Issue；没有新增、也没有待确认候选时什么都不做。
import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const ISSUE_TITLE = 'Awesome Dot 自动收录报告';
const oneLine = (text, max) => text.replace(/[\r\n]+/g, ' ').slice(0, max);

export function renderComment(report, { siteUrl = '', runUrl = '' } = {}) {
  if (!report.added?.length && !report.pending?.length) return null;
  const lines = [`**${report.runAt.slice(0, 16).replace('T', ' ')} UTC**`, ''];
  if (report.added?.length) {
    lines.push(`### 已自动收录 ${report.added.length} 条`, '');
    for (const x of report.added) lines.push(`- [${x.repository}](https://github.com/${x.repository}) → ${x.kind} / ${x.category} · 评分 ${x.score}${siteUrl ? ` · [站内查看](${siteUrl}#${x.id})` : ''}`);
    lines.push('', '收录有误时，删除 data/catalog.json 中对应条目，并在 data/curation.json 的 rejected 里加上 "owner/repo": { "blocked": true } 即可永久排除。', '');
  }
  if (report.pending?.length) {
    lines.push(`### 待确认 ${report.pending.length} 条`, '', 'README 提到了 OpenAI dots，但不够突出，没有自动收录。想收录的在下面回复仓库名即可：', '');
    for (const x of report.pending) lines.push(`- [${x.repository}](${x.url}) ★${x.stars ?? 0} · 评分 ${x.score}${x.description ? ` — ${oneLine(x.description, 140)}` : ''}`);
    lines.push('');
  }
  lines.push(`扫描 ${report.searched} 个仓库，${report.signalPassed} 个提到了 Dot${report.errors?.length ? `，${report.errors.length} 个错误` : ''}。${runUrl ? `[运行记录](${runUrl})` : ''}`);
  return lines.join('\n');
}

async function github(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com/${path}`, { method, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${process.env.GH_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'awesome-dot-curator' }, body: body && JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status} ${method} ${path}`);
  return response.json();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = 'output/curation-report.json';
  const report = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
  const repo = process.env.GITHUB_REPOSITORY;
  const [owner, name] = repo.split('/');
  const runUrl = process.env.GITHUB_RUN_ID ? `https://github.com/${repo}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
  const comment = report && !report.dryRun ? renderComment(report, { siteUrl: `https://${owner}.github.io/${name}/`, runUrl }) : null;
  if (!comment) { console.log('Nothing to report'); process.exit(0); }
  const open = await github(`repos/${repo}/issues?state=open&per_page=100`);
  let issue = open.find(x => x.title === ISSUE_TITLE && !x.pull_request);
  if (!issue) issue = await github(`repos/${repo}/issues`, { method: 'POST', body: { title: ISSUE_TITLE, body: '定时扫描（每 12 小时）会在这里汇报自动收录的新项目和待确认的候选。关闭此 Issue 后，下次有新结果时会重新创建。' } });
  await github(`repos/${repo}/issues/${issue.number}/comments`, { method: 'POST', body: { body: comment } });
  console.log(`Reported to issue #${issue.number}`);
}
