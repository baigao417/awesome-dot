import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const localSnapshot = existsSync('data/discovery.json') ? 'data/discovery.json' : 'data/project-evidence.json';
const localDiscovery = JSON.parse(readFileSync(localSnapshot, 'utf8'));
// 本地快照只覆盖它自己扫描过的仓库；定时任务自动收录写进 project-evidence.json 的条目原样保留
const published = existsSync('data/project-evidence.json') ? JSON.parse(readFileSync('data/project-evidence.json', 'utf8')).projects : [];
const snapshotRepos = new Set(localDiscovery.projects.map(p => p.repository));
const discovery = { checkedAt: localDiscovery.checkedAt, method: 'Fixed-commit public source references and hashes; bounded inspection, not execution.', projects: [...localDiscovery.projects.map(p => ({ repositoryId: published.find(x => x.repository === p.repository)?.repositoryId, ...p })), ...published.filter(p => !snapshotRepos.has(p.repository))].map(({ repository, repositoryId, description, url, stars, updatedAt, license, commit, readmePath, readmeUrl, readmeSha256, files }) => ({ repository, ...(repositoryId ? { repositoryId } : {}), description, url, stars, updatedAt, license, commit, readmePath, readmeUrl, readmeSha256, files: files.map(({ path, url, sha256 }) => ({ path, url, sha256 })) })) };
writeFileSync('data/project-evidence.json', JSON.stringify(discovery, null, 2) + '\n');
const counts = {};
const avatarManifest = JSON.parse(readFileSync('public/avatars/sources.json', 'utf8'));
for (const image of avatarManifest.images) image.sha256 = createHash('sha256').update(readFileSync(`public/avatars/${image.file}`)).digest('hex');
writeFileSync('public/avatars/sources.json', JSON.stringify(avatarManifest, null, 2) + '\n');
for (const item of catalog.items) counts[item.kind] = (counts[item.kind] ?? 0) + 1;
const lines = ['# Awesome Dot 收录清单', '', `更新日期：${catalog.checkedAt}。共 ${catalog.items.length} 条。`, '', '| 名称 | 类型 | Dot 的具体角色 | 出处 |', '| --- | --- | --- | --- |'];
for (const item of catalog.items) lines.push(`| ${item.name} | ${item.kind} | ${item.dotRole.replaceAll('|', '\\|')} | [来源](${item.sourceUrl}) |`);
mkdirSync('docs', { recursive: true });
writeFileSync('docs/catalog.md', lines.join('\n') + '\n');
writeFileSync('docs/source-review.md', '# Source Review\n\n' + discovery.projects.map(p => `## ${p.repository}\n\n- Commit: \`${p.commit}\`\n- README: ${p.readmeUrl}\n- Inspected paths: ${p.files.map(x => `\`${x.path}\``).join(', ') || 'README only; no code review'}\n- Scope: bounded excerpts only; not installed, executed or security-audited.\n`).join('\n'));
console.log(JSON.stringify({ items: catalog.items.length, counts, publicRepos: discovery.projects.length, tested: catalog.items.filter(x => x.tested).length }));
