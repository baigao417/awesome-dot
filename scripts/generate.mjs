import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const localSnapshot = existsSync('data/discovery.json') ? 'data/discovery.json' : 'data/project-evidence.json';
const localDiscovery = JSON.parse(readFileSync(localSnapshot, 'utf8'));
const discovery = { checkedAt: localDiscovery.checkedAt, method: 'Fixed-commit public source references and hashes; bounded inspection, not execution.', projects: localDiscovery.projects.map(({ repository, description, url, stars, updatedAt, license, commit, readmePath, readmeUrl, readmeSha256, files }) => ({ repository, description, url, stars, updatedAt, license, commit, readmePath, readmeUrl, readmeSha256, files: files.map(({ path, url, sha256 }) => ({ path, url, sha256 })) })) };
writeFileSync('data/project-evidence.json', JSON.stringify(discovery, null, 2) + '\n');
const counts = {};
for (const item of catalog.items) counts[item.kind] = (counts[item.kind] ?? 0) + 1;
const lines = ['# Awesome Dot 收录清单', '', `核验日期：${catalog.checkedAt}。共 ${catalog.items.length} 条。官方示例不等于实测，独立替代品不等于 Dot 集成。`, '', '| 名称 | 类型 | Dot 的具体角色 | 出处 |', '| --- | --- | --- | --- |'];
for (const item of catalog.items) lines.push(`| ${item.name} | ${item.kind} | ${item.dotRole.replaceAll('|', '\\|')} | [来源](${item.sourceUrl}) |`);
mkdirSync('docs', { recursive: true });
writeFileSync('docs/catalog.md', lines.join('\n') + '\n');
writeFileSync('docs/source-review.md', '# Source Review\n\n' + discovery.projects.map(p => `## ${p.repository}\n\n- Commit: \`${p.commit}\`\n- README: ${p.readmeUrl}\n- Inspected paths: ${p.files.map(x => `\`${x.path}\``).join(', ') || 'README only; no code review'}\n- Scope: bounded excerpts only; not installed, executed or security-audited.\n`).join('\n'));
console.log(JSON.stringify({ items: catalog.items.length, counts, publicRepos: discovery.projects.length, tested: catalog.items.filter(x => x.tested).length }));
