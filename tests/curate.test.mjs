import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dotSignals, prominence, screen, slugFor, curate, serializeCatalog, plain, firstParagraph, dotSentence, guessKind, guessCategory, detectLang, AUTO_MIN_SCORE } from '../scripts/auto-curate.mjs';

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const SHA = 'a'.repeat(40);

function fixture(repos) {
  const root = mkdtempSync(join(tmpdir(), 'curate-'));
  mkdirSync(join(root, 'data')); mkdirSync(join(root, 'public/avatars'), { recursive: true });
  writeFileSync(join(root, 'data/catalog.json'), serializeCatalog({ name: 'Awesome Dot', checkedAt: '2026-09-01', items: [{ id: 'listed', name: 'listed', owner: 'a', repository: 'a/listed', kind: 'community_project', category: 'coding', description: 'x', dotRole: 'x', outcome: 'x', requirements: ['x'], limits: 'x', sourceIds: [], sourceUrl: 'https://github.com/a/listed', tags: ['x', 'y'], verified: 'readme_reviewed', tested: false }] }));
  writeFileSync(join(root, 'data/project-evidence.json'), JSON.stringify({ projects: [{ repository: 'a/listed', files: [] }] }));
  writeFileSync(join(root, 'data/avatars.json'), '{}');
  writeFileSync(join(root, 'public/avatars/sources.json'), JSON.stringify({ images: [] }));
  writeFileSync(join(root, 'data/site.json'), JSON.stringify({ repositoryUrl: 'https://github.com/me/awesome-dot' }));
  const seen = [];
  const reply = (body, status = 200) => ({ ok: status < 300, status, json: async () => body, arrayBuffer: async () => body });
  const fetcher = async (url, options = {}) => {
    seen.push([url, options.headers?.Authorization]);
    if (url.includes('/search/repositories')) return reply({ items: Object.keys(repos).map(full_name => ({ full_name })) });
    if (url.includes('/search/code')) return reply({ items: [{ repository: { full_name: 'a/listed' } }] });
    if (url.startsWith('https://avatars.example/')) return reply(PNG);
    const match = url.match(/repos\/([^/]+\/[^/?]+)(\/commits|\/readme)?/);
    const repo = repos[match[1]];
    if (!match[2]) return reply({ id: repo.id ?? [...match[1]].reduce((h, c) => h * 31 + c.charCodeAt(0), 7), full_name: match[1], name: match[1].split('/')[1], owner: { login: match[1].split('/')[0], avatar_url: 'https://avatars.example/u/1?v=4' }, html_url: `https://github.com/${match[1]}`, default_branch: 'main', size: 10, stargazers_count: 3, pushed_at: repo.pushedAt ?? '2026-09-30T00:00:00Z', license: { spdx_id: 'MIT' }, description: repo.description ?? null, topics: repo.topics ?? [], language: 'TypeScript', fork: Boolean(repo.fork), archived: false });
    if (match[2] === '/commits') return reply({ sha: SHA });
    return reply({ path: 'README.md', content: Buffer.from(repo.readme).toString('base64') });
  };
  return { root, fetcher, seen };
}
const searches = [{ type: 'repositories', q: 'x' }, { type: 'code', q: 'y' }];
const run = (f, extra = {}) => curate({ root: f.root, fetcher: f.fetcher, token: 't', searches, sleep: async () => {}, now: new Date('2026-10-01T00:00:00Z'), ...extra });
const readJson = (f, file) => JSON.parse(readFileSync(join(f.root, file), 'utf8'));

const STRONG = { description: 'Connect your ChatGPT dot to local files over MCP', readme: '# dot-link\n\n[![badge](https://x/y.svg)](https://x)\n\nConnect your **ChatGPT dot** to files on your computer. It exposes an MCP server.\n\nWorks with OpenAI dots accounts.' };
const MIDDLE = { readme: '# Agent hub\n\nA place for agents such as ChatGPT Dots and Grok Bot to talk.\n\nMore text here.' };
const PASSING = { readme: `${'AI news item. '.repeat(300)}OpenAI dots launched.` };

test('dot signals require the OpenAI product, not look-alike words', () => {
  for (const text of ['Connect your ChatGPT dot to files', 'Inspired by OpenAI dots', 'See https://learn.chatgpt.com/docs/dots', 'Open chatgpt.com/dots in a window', "OpenAI's dots launched at DevDay 2026"]) assert.ok(dotSignals(text).length, text);
  for (const text of ['A .NET dotnet OpenAI client', 'OpenAI Five plays Dota 2', 'my dotfiles', 'DOT/USD market monitor', 'Unity DOTS ECS sample', 'polka dots wallpaper']) assert.equal(dotSignals(text).length, 0, text);
});

test('prominence ranks named projects above passing mentions in long lists', () => {
  assert.ok(prominence({ name: 'openai-dots-helper', description: 'Tools for OpenAI dots' }, 'OpenAI dots helper. Works with ChatGPT dots.') >= AUTO_MIN_SCORE);
  assert.equal(prominence({ name: 'ai-news', description: 'Daily AI news' }, PASSING.readme), 0);
});

test('entry text is taken verbatim from the repository and stripped of markup', () => {
  assert.equal(plain('**Bold** [link](https://a.b) <b>x</b> ![img](y.png) `code`'), 'Bold link x code');
  assert.equal(firstParagraph('# Title\n\n[![b](u)](v)\n\nA short tool that connects things for you.'), 'A short tool that connects things for you.');
  assert.equal(dotSentence(STRONG.readme), 'Connect your ChatGPT dot to files on your computer.');
  assert.equal(guessKind('An open-source alternative to OpenAI dots'), 'alternative');
  assert.equal(guessCategory('An MCP server for dots', 'building_block'), 'integrations');
  assert.equal(guessCategory('anything', 'alternative'), 'agents');
  assert.deepEqual(['English', '中文说明', '日本語のガイド', '한국어 안내'].map(detectLang), ['en', 'zh-CN', 'ja', 'ko']);
});

test('screen skips own, listed, renamed, forked and empty repositories', () => {
  const base = { full_name: 'o/r', id: 7, size: 5 };
  assert.equal(screen({ ...base, full_name: 'Me/Awesome-Dot' }, { own: 'me/awesome-dot' }), 'own_repository');
  assert.equal(screen(base, { listed: new Set(['o/r']) }), 'already_listed');
  assert.equal(screen(base, { listedIds: new Set([7]) }), 'already_listed');
  assert.equal(screen({ ...base, fork: true }), 'fork');
  assert.equal(screen({ ...base, size: 0 }), 'empty');
  assert.equal(screen(base), null);
  assert.equal(slugFor('Dot Link!', 'x', new Set()), 'dot-link');
  assert.equal(slugFor('dotlink', 'Abird', new Set(['dotlink'])), 'abird-dotlink');
});

test('strong matches go live, middle scores wait in the issue, noise is remembered', async () => {
  const f = fixture({
    'good/dot-link': { ...STRONG, id: 11, topics: ['openai-dots', 'mcp'] },
    'hub/agents': MIDDLE,
    'news/list': PASSING,
    'noise/dotnet-kit': { readme: 'OpenAI .NET dotnet helpers.' },
    'fork/copy': { readme: 'OpenAI dots fork', fork: true },
    'me/awesome-dot': { readme: 'OpenAI dots directory' },
  });
  const report = await run(f);
  assert.deepEqual(report.added.map(x => x.repository), ['good/dot-link']);
  assert.deepEqual(report.pending.map(x => x.repository), ['hub/agents']);
  assert.equal(report.screened.low_prominence, 1);
  assert.equal(report.screened.no_dot_signal, 1);
  assert.equal(report.screened.fork, 1);

  const item = readJson(f, 'data/catalog.json').items.find(x => x.repository === 'good/dot-link');
  assert.equal(item.name, 'dot-link');
  assert.equal(item.description, 'Connect your ChatGPT dot to local files over MCP');
  assert.equal(item.dotRole, 'Connect your ChatGPT dot to files on your computer.');
  assert.equal(item.lang, 'en');
  assert.equal(item.autoAdded, '2026-10-01');
  assert.deepEqual(item.requirements, []);
  assert.deepEqual(item.tags, ['mcp', 'TypeScript']);
  assert.equal(item.category, 'integrations');
  assert.equal(readJson(f, 'data/catalog.json').checkedAt, '2026-10-01');
  const evidence = readJson(f, 'data/project-evidence.json').projects.find(x => x.repository === 'good/dot-link');
  assert.ok(evidence.readmeUrl.includes(SHA) && evidence.repositoryId === 11);
  assert.equal(readJson(f, 'data/avatars.json').good, './avatars/good.png');
  assert.ok(existsSync(join(f.root, 'public/avatars/good.png')));
  assert.ok(!existsSync(join(f.root, 'data/catalog-i18n.json')), 'no translation file is produced');

  const again = await run(f);
  assert.equal(again.added.length + again.pending.length, 0);
  assert.equal(again.screened.rejected_unchanged, 2);
  assert.equal(again.screened.reported_unchanged, 1);
  const lastSearch = f.seen.findLastIndex(([u]) => u.includes('/search/'));
  assert.ok(!f.seen.slice(lastSearch).some(([u]) => /news\/list\/readme|noise\/dotnet-kit\/readme/.test(u)), 'unchanged rejects are not re-read');
});

test('run cap, dry runs, blocked repositories and credentials', async () => {
  const strong = (n) => ({ description: `Plugin ${n} for OpenAI dots`, readme: `# ${n}\n\nA plugin for OpenAI dots. Use it with ChatGPT dots.` });
  const repos = { 'one/a': strong('a'), 'two/b': strong('b'), 'three/c': strong('c') };
  const capped = fixture(repos);
  const report = await run(capped, { limits: { perQuery: 50, maxReadmes: 100, maxNew: 1 } });
  assert.equal(report.added.length, 1);
  assert.equal(report.skipped.filter(x => x.reason === 'run_cap_reached').length, 2);

  const dry = fixture(repos);
  const before = readFileSync(join(dry.root, 'data/catalog.json'), 'utf8');
  const dryReport = await run(dry, { dryRun: true });
  assert.equal(dryReport.added.length, 3);
  assert.equal(readFileSync(join(dry.root, 'data/catalog.json'), 'utf8'), before);
  assert.ok(!existsSync(join(dry.root, 'data/curation.json')));
  assert.ok(!existsSync(join(dry.root, 'public/avatars/one.png')));

  const blocked = fixture({ 'spam/dots': strong('spam') });
  writeFileSync(join(blocked.root, 'data/curation.json'), JSON.stringify({ rejected: { 'spam/dots': { blocked: true } }, reported: {} }));
  const blockedReport = await run(blocked);
  assert.equal(blockedReport.added.length, 0);
  assert.equal(blockedReport.screened.blocked, 1);

  // GitHub 令牌只发给 api.github.com
  assert.ok(capped.seen.every(([url, auth]) => !auth || url.startsWith('https://api.github.com/')));
});

test('transient README errors are retried, unreadable text never goes live, renamed duplicates collapse', async () => {
  const strong = { description: 'Plugin for OpenAI dots', readme: '# p\n\nA plugin for OpenAI dots. Use it with ChatGPT dots.' };
  const flaky = fixture({ 'slow/repo': strong });
  const base = flaky.fetcher;
  let fail = true;
  flaky.fetcher = async (url, options) => (fail && url.includes('/readme') ? { ok: false, status: 429, json: async () => ({}) } : base(url, options));
  const first = await run(flaky);
  assert.equal(first.status, 'partial');
  assert.equal(first.added.length, 0);
  assert.ok(!readJson(flaky, 'data/curation.json').rejected['slow/repo'], 'a 429 is not remembered as a rejection');
  fail = false;
  assert.deepEqual((await run(flaky)).added.map(x => x.repository), ['slow/repo']);

  // 只有 HTML 注释里藏着关键词：可见正文里没有 Dot，不收录
  const hidden = fixture({ 'hide/kw': { readme: '<!-- OpenAI dots ChatGPT dots OpenAI dots -->\n\nA generic toolkit.', description: null } });
  const hiddenReport = await run(hidden);
  assert.equal(hiddenReport.added.length, 0);
  assert.equal(hiddenReport.screened.no_dot_signal, 1);

  const renamed = fixture({ 'old/r': { ...strong, id: 7 }, 'new/r': { ...strong, id: 7 } });
  const renamedReport = await run(renamed);
  assert.equal(renamedReport.added.length, 1);
  assert.equal(renamedReport.screened.duplicate, 1);
});

test('search spaces out code searches and retries once after a rate limit', async () => {
  const { search } = await import('../scripts/auto-curate.mjs');
  const slept = [];
  let calls = 0;
  const fetcher = async (url) => {
    calls++;
    if (url.includes('learn') && calls === 1) return { ok: false, status: 429, headers: { get: (h) => (h === 'retry-after' ? '12' : null) }, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => ({ items: [{ repository: { full_name: url.includes('learn') ? 'a/one' : 'b/two' } }] }) };
  };
  const result = await search({ fetcher, token: 't', searches: [{ type: 'code', q: 'learn' }, { type: 'code', q: 'other' }], sleep: async (ms) => { slept.push(ms); } });
  assert.deepEqual(result.repositories, ['a/one', 'b/two']);
  assert.deepEqual(result.errors, []);
  // 第一次代码搜索前先等间隔，被限流后按 retry-after 等 12 秒重试，第二次代码搜索前再等间隔
  assert.equal(slept.length, 3);
  assert.equal(slept[1], 12000);
  assert.ok([slept[0], slept[2]].every(ms => ms > 0 && ms <= 7000));
});

test('Dot sentence skips link captions and repeats of the description; kind ignores README body words', async () => {
  const { buildRecords } = await import('../scripts/auto-curate.mjs');
  const readme = '# Open Dots\n\n[▶ Watch: OpenAI Dots Alternative](https://youtu.be/x)\n\nOpen Dots: Open-Source Alternative to OpenAI Dots\n\nRun an agent like OpenAI Dots on your own Mac, with approvals and connectors.\n\nSee the guide and docs.';
  assert.equal(dotSentence(readme, { skip: 'Open Dots: Open-Source Alternative to OpenAI Dots' }), 'Run an agent like OpenAI Dots on your own Mac, with approvals and connectors.');
  const meta = { id: 1, name: 'msg.lmm.best', full_name: 'o/msg.lmm.best', owner: { login: 'o' }, html_url: 'https://github.com/o/msg.lmm.best', description: 'A place where agents post and trade', topics: [], language: 'Python' };
  const { item } = buildRecords({ meta, commit: SHA, readme: { path: 'README.md', body: 'A forum for ChatGPT dots agents. Read the guide and docs.' }, taken: new Set(), today: '2026-10-01' });
  assert.equal(item.kind, 'community_project');
});

test('keyword-heavy ledgers without a sentence about Dot wait for review instead of going live', async () => {
  const ledger = { description: 'AI Research Radar — trend ledger for AI systems', readme: '# Radar\n\n| item | note |\n|---|---|\n| OpenAI dots | launched |\n| ChatGPT dots | pricing |\n\n- OpenAI dots\n- ChatGPT dots\n' };
  const f = fixture({ 'neetx/radar': ledger });
  const report = await run(f);
  assert.equal(report.added.length, 0);
  assert.deepEqual(report.pending.map(x => x.repository), ['neetx/radar']);
});
