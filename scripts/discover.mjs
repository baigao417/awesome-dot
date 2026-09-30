import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const repos = [
  'mergisi/awesome-dots', 'mergisi/dots-mcp', 'ylwl1997/dotsbase-site',
  'Anil-matcha/open-dots', 'diggerhq/opendots', 'zero-phoenix/zeruel',
  'openai/plugins', 'openai/mcp-extensions',
  'abird-ai/dotlink', 'mvanhorn/agent-tincan', 'defog-ai/opendot', 'graydeon/dot-panel',
  'tcballard/omarchy-plugin-openai-dot', 'thinkwee/OpenDot', 'AgentForEach/AgentForEach',
  'beamnxw/dots-vs-grok-bot', 'Anil-matcha/awesome-dots-connectors', 'Kotodama-Project/Kotodama-project',
  'chenrui333/codex-docs', 'mehmetbaykar/codex-docs-skill', 'openai/tunnel-client',
  'PrisacariuRobert/openbot', 'composio-community/open-dot', 'dots-oai/dots',
  'alongor666/InsurHOT', 'evan-till/dot-os', 'carlesrabadagarces-hub/dots-catala',
  'ruijun1110/dots-screensaver', 'feder-cr/dots', 'feder-cr/awesome-dots', 'QuarkOS/grokbot-vs-dots',
];
const api = (path) => {
  const output = execFileSync(process.env.OPENCLI_BASH ?? 'bash', ['-lc', `opencli gh api '${path}'`], { encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  return JSON.parse(output.trim());
};
const result = { checkedAt: new Date().toISOString(), method: 'Public GitHub metadata, fixed-commit README and bounded source inspection. No installation or execution.', projects: [], errors: [] };
for (const repository of repos) {
  try {
    const meta = api(`repos/${repository}`);
    const commit = api(`repos/${repository}/commits/${meta.default_branch}`);
    const readme = api(`repos/${repository}/readme?ref=${commit.sha}`);
    const body = Buffer.from(readme.content, 'base64').toString('utf8');
    const tree = api(`repos/${repository}/git/trees/${commit.sha}?recursive=1`);
    const codePaths = tree.tree.filter(x => x.type === 'blob' && /\.(py|tsx?|jsx?|rs|go|json)$/.test(x.path) && !/(lock|test|spec|vendor|node_modules|package\.json)/.test(x.path));
    const selected = codePaths.filter(x => /(server|tools|agent|connector|event|plugin|index|main|app)/i.test(x.path)).slice(0, 2);
    const files = [];
    for (const item of selected) {
      const file = api(`repos/${repository}/contents/${item.path}?ref=${commit.sha}`);
      if (!file.content || file.size > 250000) continue;
      const text = Buffer.from(file.content, 'base64').toString('utf8');
      const lines = text.split('\n');
      const matched = lines.flatMap((line, i) => /dots|mcp|tool|plugin|approval|connector|memory|auth|agent|schedule/i.test(line) ? [{ line: i + 1, text: line.trim().slice(0, 200) }] : []).slice(0, 18);
      files.push({ path: item.path, url: `https://github.com/${repository}/blob/${commit.sha}/${item.path}`, sha256: createHash('sha256').update(text).digest('hex'), excerpts: matched });
    }
    result.projects.push({ repository, description: meta.description, url: meta.html_url, avatarUrl: meta.owner.avatar_url, stars: meta.stargazers_count, updatedAt: meta.pushed_at, license: meta.license?.spdx_id ?? 'NOASSERTION', commit: commit.sha, readmePath: readme.path, readmeUrl: `https://github.com/${repository}/blob/${commit.sha}/${readme.path}`, readmeSha256: createHash('sha256').update(body).digest('hex'), readmeExcerpt: body.slice(0, 7000), codePaths: codePaths.map(x => x.path).slice(0, 70), treeTruncated: tree.truncated, files });
    console.log(`Reviewed ${repository}: ${files.map(x => x.path).join(', ') || 'README only'}`);
  } catch (error) {
    result.errors.push({ repository, error: error.message.slice(0, 250) });
    console.log(`Partial ${repository}`);
  }
  mkdirSync('data', { recursive: true });
  writeFileSync('data/discovery.json', JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify({ reviewed: result.projects.length, errors: result.errors.length }));
if (result.errors.length) process.exitCode = 1;
