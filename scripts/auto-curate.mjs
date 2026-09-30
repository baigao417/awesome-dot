// 每 12 小时自动收录，只用 GitHub 自己：搜索 → 硬过滤 → README 强信号 → 显著度评分 → 按原文写入收录。
// 不调用任何模型，也不翻译：名称、简介、与 Dot 的关系都取自仓库原文。高分自动上线，中间分数列进 Issue 待看。
// 所有网络请求都走可注入的 fetcher，测试里整体替换。README 是不可信输入，只截取纯文本片段，页面渲染时统一转义。
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const SEARCHES = [
  { type: 'repositories', q: '"openai dots" in:name,description,readme' },
  { type: 'repositories', q: '"chatgpt dots" in:name,description,readme' },
  { type: 'repositories', q: '"openai dot" in:name,description,readme' },
  { type: 'repositories', q: '"chatgpt dot" in:name,description,readme' },
  { type: 'repositories', q: 'topic:openai-dots' },
  { type: 'repositories', q: 'opendot in:name' },
  { type: 'repositories', q: 'open-dots in:name' },
  { type: 'code', q: '"learn.chatgpt.com/docs/dots"' },
  { type: 'code', q: '"chatgpt.com/dots"' },
  { type: 'code', q: '"openai.com/index/introducing-dots"' },
];
export const LIMITS = { perQuery: 50, maxReadmes: 100, maxNew: 8, deadlineMs: 15 * 60 * 1000 };
// 用已人工核实的 31 个仓库和一次真实扫描校准：≥4 分几乎都是真项目，2–3 分真假参半
export const AUTO_MIN_SCORE = 4;
export const REPORT_MIN_SCORE = 2;

// 必须明确指向 OpenAI 的 dots 产品；\b 让 dotnet、Dota 这类词不会命中
const SIGNALS = [
  /\bopenai(?:['’]s)?\s+dots?\b/i,
  /\bchatgpt(?:['’]s)?\s+dots?\b/i,
  /chatgpt\.com\/dots\b/i,
  /learn\.chatgpt\.com\/docs\/dots\b/i,
  /openai\.com\/index\/introducing-dots\b/i,
  /\bdots?\b[^.\n]{0,80}\bdevday\s+2026\b|\bdevday\s+2026\b[^.\n]{0,80}\bdots?\b/i,
];
// 读者看得到的正文：去掉 HTML 注释和代码块，评分和生成条目都基于它，避免藏起来的关键词刷分
export const visible = (readme = '') => readme.replace(/<!--[\s\S]*?-->/g, ' ').replace(/```[\s\S]*?```/g, ' ');

export function dotSignals(text = '') {
  const found = [];
  for (const pattern of SIGNALS) {
    const match = pattern.exec(text);
    if (match) found.push(text.slice(Math.max(0, match.index - 60), match.index + match[0].length + 60).replace(/\s+/g, ' ').trim());
  }
  return found.slice(0, 3);
}

// 显著度：Dot 写在名称/简介/topic 里最可信，其次是 README 开头，长列表里顺带一提的最弱
export function prominence(meta, readme = '') {
  let score = 0;
  if (dotSignals(`${meta.name ?? ''} ${meta.description ?? ''} ${(meta.topics ?? []).join(' ')}`.replace(/-/g, ' ')).length) score += 3;
  if (dotSignals(readme.slice(0, 2500)).length) score += 2;
  const mentions = SIGNALS.reduce((n, p) => n + (readme.match(new RegExp(p.source, 'gi'))?.length ?? 0), 0);
  score += Math.min(2, Math.max(0, mentions - 1));
  return score;
}

export function screen(meta, { listed = new Set(), listedIds = new Set(), own = '' } = {}) {
  const name = meta.full_name.toLowerCase();
  if (name === own.toLowerCase()) return 'own_repository';
  if (listed.has(name) || listedIds.has(meta.id)) return 'already_listed';
  if (meta.fork) return 'fork';
  if (meta.archived) return 'archived';
  if (meta.disabled) return 'disabled';
  if (!meta.size) return 'empty';
  return null;
}

// Markdown / HTML 转纯文本，只保留可读文字
export function plain(text = '') {
  return text
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

// README 开头第一段像样的正文（跳过徽章、标题、目录）
export function firstParagraph(readme = '') {
  for (const block of readme.split(/\n\s*\n/)) {
    const text = plain(block);
    if (text.length >= 30 && /[a-z一-鿿぀-ヿ가-힯]{3}/i.test(text)) return text;
  }
  return '';
}

// README 里提到 Dot 的那句原话
export function dotSentence(readme = '', { skip = '' } = {}) {
  // 按段落 / 列表项逐块找，跳过标题、以链接开头的行（视频、徽章说明）和与简介重复的句子；
  // 取最早提到 Dot 的一句，开头那句通常最能说明项目做什么
  const same = (a, b) => a.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '') === b.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '');
  const blocks = readme.split(/\n\s*\n|\n(?=\s{0,3}(?:[-*+>]|\d+\.)\s)/)
    .filter(block => !/^\s{0,3}#{1,6}\s[^\n]*$/.test(block.trim()) && !/^[\s>*+-]*(\[|<a\b|<img\b|!\[)/i.test(block));
  for (const block of blocks) {
    const text = plain(block.replace(/^\s{0,3}#{1,6}\s.*$/gm, ''));
    const match = SIGNALS.map(p => p.exec(text)).filter(Boolean).sort((x, y) => x.index - y.index)[0];
    if (!match) continue;
    const before = Math.max(text.lastIndexOf('. ', match.index), text.lastIndexOf('。', match.index));
    const start = before < 0 || match.index - before > 220 ? Math.max(0, match.index - 120) : before + (text[before] === '。' ? 1 : 2);
    const stop = text.slice(match.index).search(/[.!?。！？](\s|$)/);
    const end = stop < 0 || stop > 220 ? Math.min(text.length, match.index + 160) : match.index + stop + 1;
    const sentence = text.slice(start, end).trim();
    if (/^[^\p{L}\p{N}]/u.test(sentence) || (skip && same(sentence, skip))) continue;
    return sentence;
  }
  return '';
}

const RULES = {
  kind: [
    ['alternative', /\b(open[- ]?source|self[- ]?host(ed|able)?|local[- ]first)\b[^.\n]{0,60}\b(alternative|version|clone|implementation)\b|\balternative to\b|\binspired by\b[^.\n]{0,40}\bdots?\b/i],
    ['task_template', /\b(templates?|prompts?|rules?|playbooks?|recipes?)\b/i],
    ['tutorial', /\b(tutorial|guide|course|paper|study|article|blog|explainer|handbook|docs)\b|教程|指南|入门/i],
    ['building_block', /\b(sdk|api|library|framework|backend|server|runtime|toolkit|mcp)\b/i],
  ],
  category: [
    ['integrations', /\b(mcp|plugins?|connectors?|extensions?|integrations?|bridge|tunnel)\b/i],
    ['learning', /\b(awesome|curated list|resources|guide|tutorial|docs|course)\b|教程|指南/i],
    ['research', /\b(paper|study|research|benchmark|comparison|analysis)\b/i],
    ['content', /\b(video|screensaver|art|music|design|writing|content)\b/i],
    ['automation', /\b(monitor|schedule|cron|alerts?|watch|track)\b/i],
    ['coding', /\b(code|coding|pull request|review|ci|developer)\b/i],
    ['operations', /\b(email|calendar|slack|team|crm|sales|meeting)\b/i],
  ],
};
export function guessKind(text) { return RULES.kind.find(([, re]) => re.test(text))?.[0] ?? 'community_project'; }
export function guessCategory(text, kind) { return kind === 'alternative' ? 'agents' : RULES.category.find(([, re]) => re.test(text))?.[0] ?? 'agents'; }
export function detectLang(text = '') {
  if (/[぀-ヿ]/.test(text)) return 'ja';
  if (/[가-힯]/.test(text)) return 'ko';
  if (/[一-鿿]/.test(text)) return 'zh-CN';
  return 'en';
}

export function slugFor(name, owner, taken) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'dot-project';
  if (!taken.has(base)) return base;
  const withOwner = `${owner.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${base}`;
  let id = withOwner; let n = 2;
  while (taken.has(id)) id = `${withOwner}-${n++}`;
  return id;
}

export function buildRecords({ meta, commit, readme, taken, today }) {
  const text = visible(readme.body);
  const description = clip(plain(meta.description ?? '') || firstParagraph(text), 220);
  const dotRole = clip(dotSentence(text, { skip: description }) || plain(meta.description ?? ''), 240);
  // 类型只看仓库名、简介和 topic：README 正文里偶然出现的 guide、template 容易误判
  const profile = `${meta.name.replace(/[-_.]/g, ' ')} ${description} ${(meta.topics ?? []).join(' ')}`;
  const kind = guessKind(profile);
  const tags = [...new Set([...(meta.topics ?? []).filter(t => !/^(openai|chatgpt|dots?|openai-dots?|ai)$/i.test(t)), meta.language].filter(Boolean))].slice(0, 3);
  const item = {
    id: slugFor(meta.name, meta.owner.login, taken), name: meta.name, owner: meta.owner.login, repository: meta.full_name,
    kind, category: guessCategory(profile, kind), description, dotRole, outcome: '', requirements: [], limits: '',
    sourceIds: kind === 'alternative' ? [] : ['overview'], sourceUrl: meta.html_url, tags,
    verified: 'readme_reviewed', tested: false, autoAdded: today, lang: detectLang(`${description} ${dotRole}`),
  };
  const evidence = {
    repository: meta.full_name, repositoryId: meta.id, description: meta.description, url: meta.html_url, stars: meta.stargazers_count, updatedAt: meta.pushed_at,
    license: meta.license?.spdx_id ?? 'NOASSERTION', commit, readmePath: readme.path,
    readmeUrl: `https://github.com/${meta.full_name}/blob/${commit}/${readme.path}`,
    readmeSha256: createHash('sha256').update(readme.body).digest('hex'), files: [],
  };
  return { item, evidence };
}

async function githubJson(fetcher, token, path) {
  const response = await fetcher(`https://api.github.com/${path}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'awesome-dot-curator', 'X-GitHub-Api-Version': '2022-11-28', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) {
    const error = new Error(`GitHub HTTP ${response.status} ${path.split('?')[0]}`);
    error.status = response.status;
    const reset = Number(response.headers?.get?.('x-ratelimit-reset'));
    error.retryAfter = Number(response.headers?.get?.('retry-after')) || (reset ? Math.max(1, reset - Math.floor(Date.now() / 1000)) : 60);
    throw error;
  }
  return response.json();
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// 代码搜索每分钟只有 10 次额度：请求之间留间隔，被限流时按 GitHub 给的等待时间重试一次
export async function search({ fetcher, token, searches = SEARCHES, perQuery = LIMITS.perQuery, sleep = wait, codeGapMs = 7000 }) {
  const names = new Map();
  const errors = [];
  let lastCode = 0;
  let lastSearch = Date.now();
  for (const { type, q } of searches) {
    if (type === 'code' && !token) { errors.push({ q, error: 'code search needs a token' }); continue; }
    // 第一次代码搜索前也留间隔：紧跟在一串仓库搜索后面容易触发突发限流
    if (type === 'code') await sleep(Math.max(0, codeGapMs - (Date.now() - (lastCode || lastSearch))));
    const path = `search/${type}?q=${encodeURIComponent(q)}&per_page=${perQuery}${type === 'repositories' ? '&sort=updated' : ''}`;
    try {
      let body;
      for (let attempt = 0; !body; attempt++) {
        try { body = await githubJson(fetcher, token, path); }
        catch (error) {
          if (![403, 429].includes(error.status) || attempt >= 2) throw error;
          await sleep(Math.min(error.retryAfter, 65) * 1000);
        }
      }
      for (const item of body.items ?? []) {
        const repo = type === 'code' ? item.repository : item;
        if (repo?.full_name && !names.has(repo.full_name.toLowerCase())) names.set(repo.full_name.toLowerCase(), repo.full_name);
      }
    } catch (error) { errors.push({ q, error: error.message }); }
    if (type === 'code') lastCode = Date.now();
    lastSearch = Date.now();
  }
  return { repositories: [...names.values()], errors };
}

async function readReadme(fetcher, token, meta) {
  const commit = await githubJson(fetcher, token, `repos/${meta.full_name}/commits/${meta.default_branch}`);
  try {
    const file = await githubJson(fetcher, token, `repos/${meta.full_name}/readme?ref=${commit.sha}`);
    return { commit: commit.sha, readme: { path: file.path, body: Buffer.from(file.content, 'base64').toString('utf8') } };
  } catch (error) {
    // 只有确定的 404 才算没有 README；限流、超时等临时错误往上抛，下次重试，不记成否决
    if (error.status === 404) return { commit: commit.sha, readme: null };
    throw error;
  }
}

async function fetchAvatar(fetcher, meta) {
  try {
    const url = `${meta.owner.avatar_url.replace(/\?.*$/, '')}?s=96`;
    const response = await fetcher(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const ext = bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' ? 'png' : bytes.subarray(0, 3).toString('hex') === 'ffd8ff' ? 'jpg' : null;
    return ext ? { url, bytes, ext } : null;
  } catch { return null; }
}

// catalog.json 保持仓库现有写法：外层缩进，每条收录一行
export function serializeCatalog(catalog) {
  return `{\n  "name":${JSON.stringify(catalog.name)},\n  "checkedAt":${JSON.stringify(catalog.checkedAt)},\n  "items":[\n${catalog.items.map(x => `    ${JSON.stringify(x)}`).join(',\n')}\n  ]\n}\n`;
}
export const serializeAvatars = (avatars) => `${JSON.stringify(avatars, null, 2).replace(/": "/g, '":"')}\n`;

export async function curate({ root = '.', fetcher = fetch, token = process.env.GITHUB_TOKEN, dryRun = false, now = new Date(), limits = LIMITS, searches = SEARCHES, sleep = wait } = {}) {
  const read = (file, fallback) => existsSync(`${root}/${file}`) ? JSON.parse(readFileSync(`${root}/${file}`, 'utf8')) : fallback;
  const catalog = read('data/catalog.json');
  const evidence = read('data/project-evidence.json', { projects: [] });
  const avatars = read('data/avatars.json', {});
  const manifest = read('public/avatars/sources.json', { images: [] });
  const state = read('data/curation.json', { rejected: {}, reported: {} });
  state.rejected ??= {}; state.reported ??= {};
  const stateBefore = JSON.stringify(state);
  const site = read('data/site.json', {});
  const own = site.repositoryUrl ? new URL(site.repositoryUrl).pathname.slice(1) : '';
  const today = now.toISOString().slice(0, 10);
  const listed = new Set([...catalog.items.map(x => x.repository), ...evidence.projects.map(x => x.repository)].filter(Boolean).map(x => x.toLowerCase()));
  const listedIds = new Set(evidence.projects.map(x => x.repositoryId).filter(Boolean));
  const taken = new Set(catalog.items.map(x => x.id));
  const report = { runAt: now.toISOString(), status: 'success', dryRun, searched: 0, screened: {}, signalPassed: 0, added: [], pending: [], skipped: [], errors: [] };
  const count = (key) => { report.screened[key] = (report.screened[key] ?? 0) + 1; };
  // 不收录的仓库记下 README 哈希和最后推送时间；没有新推送就连 README 都不再抓。标了 blocked 的永久排除
  const remember = (meta, readmeSha, reason) => { if (!state.rejected[meta.full_name]?.blocked) state.rejected[meta.full_name] = { readmeSha256: readmeSha, pushedAt: meta.pushed_at, reason, at: today }; };

  const found = await search({ fetcher, token, searches, perQuery: limits.perQuery, sleep });
  report.errors.push(...found.errors);
  report.searched = found.repositories.length;

  const shortlist = [];
  const seenIds = new Set();
  const deadline = Date.now() + (limits.deadlineMs ?? LIMITS.deadlineMs);
  let readmes = 0;
  for (const name of found.repositories) {
    if (Date.now() > deadline) { report.skipped.push({ repository: name, reason: 'deadline_reached' }); continue; }
    if (listed.has(name.toLowerCase()) || name.toLowerCase() === own.toLowerCase()) { count('already_listed'); continue; }
    if (readmes >= limits.maxReadmes) { report.skipped.push({ repository: name, reason: 'readme_cap_reached' }); continue; }
    let meta;
    try { meta = await githubJson(fetcher, token, `repos/${name}`); } catch (error) { report.errors.push({ repository: name, error: error.message }); continue; }
    const reason = screen(meta, { listed, listedIds, own });
    if (reason) { count(reason); continue; }
    // 改名前后的两个地址会解析到同一个仓库 ID，同一轮里只处理一次
    if (seenIds.has(meta.id)) { count('duplicate'); continue; }
    seenIds.add(meta.id);
    const cached = state.rejected[meta.full_name];
    if (cached?.blocked) { count('blocked'); continue; }
    if (cached?.pushedAt && cached.pushedAt === meta.pushed_at) { count('rejected_unchanged'); continue; }
    readmes++;
    let repo;
    try { repo = await readReadme(fetcher, token, meta); } catch (error) { report.errors.push({ repository: meta.full_name, error: error.message }); continue; }
    if (!repo.readme) { remember(meta, null, 'no_readme'); count('no_readme'); continue; }
    const readmeSha = createHash('sha256').update(repo.readme.body).digest('hex');
    if (cached?.readmeSha256 === readmeSha) { cached.pushedAt = meta.pushed_at; count('rejected_unchanged'); continue; }
    const body = visible(repo.readme.body);
    const signals = dotSignals(`${meta.description ?? ''}\n${body}`);
    if (!signals.length) { remember(meta, readmeSha, 'no_dot_signal'); count('no_dot_signal'); continue; }
    report.signalPassed++;
    const score = prominence(meta, body);
    if (score < REPORT_MIN_SCORE) { remember(meta, readmeSha, `low_prominence:${score}`); count('low_prominence'); continue; }
    shortlist.push({ meta, ...repo, readmeSha, signals, score });
  }
  shortlist.sort((x, y) => y.score - x.score || (y.meta.stargazers_count ?? 0) - (x.meta.stargazers_count ?? 0));

  for (const { meta, commit, readme, readmeSha, signals, score } of shortlist) {
    if (score < AUTO_MIN_SCORE) {
      // 中间分数不自动上线，只在 Issue 里列一次；README 变了再列
      if (state.reported[meta.full_name]?.readmeSha256 === readmeSha) { count('reported_unchanged'); continue; }
      state.reported[meta.full_name] = { readmeSha256: readmeSha, score, at: today };
      report.pending.push({ repository: meta.full_name, url: meta.html_url, stars: meta.stargazers_count, description: meta.description, score, signals });
      continue;
    }
    if (report.added.length >= limits.maxNew) { report.skipped.push({ repository: meta.full_name, reason: 'run_cap_reached' }); continue; }
    const records = buildRecords({ meta, commit, readme, taken, today });
    // 取不到可读的简介或 Dot 相关句子时不上线，改为待确认
    if (!records.item.description || !records.item.dotRole) {
      state.reported[meta.full_name] = { readmeSha256: readmeSha, score, at: today };
      report.pending.push({ repository: meta.full_name, url: meta.html_url, stars: meta.stargazers_count, description: meta.description, score, signals, reason: 'no_readable_text' });
      continue;
    }
    taken.add(records.item.id);
    listed.add(meta.full_name.toLowerCase());
    listedIds.add(meta.id);
    catalog.items.push(records.item);
    evidence.projects.push(records.evidence);
    delete state.rejected[meta.full_name];
    delete state.reported[meta.full_name];
    const owner = meta.owner.login;
    if (!avatars[owner]) {
      const avatar = await fetchAvatar(fetcher, meta);
      if (avatar) {
        const file = `${owner.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.${avatar.ext}`;
        if (!dryRun) writeFileSync(`${root}/public/avatars/${file}`, avatar.bytes);
        avatars[owner] = `./avatars/${file}`;
        manifest.images.push({ owner, file, source: avatar.url });
      }
    }
    report.added.push({ id: records.item.id, repository: meta.full_name, kind: records.item.kind, category: records.item.category, score, signals });
  }

  if (found.errors.length === searches.length) report.status = 'blocked';
  else if (report.errors.length) report.status = 'partial';
  if (!dryRun) {
    if (report.added.length) {
      catalog.checkedAt = today;
      writeFileSync(`${root}/data/catalog.json`, serializeCatalog(catalog));
      writeFileSync(`${root}/data/project-evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`);
      writeFileSync(`${root}/data/avatars.json`, serializeAvatars(avatars));
      writeFileSync(`${root}/public/avatars/sources.json`, `${JSON.stringify(manifest, null, 2)}\n`);
    }
    // curation.json 只在判定结果变化时改写，免得每次运行都产生提交
    if (JSON.stringify(state) !== stateBefore || !existsSync(`${root}/data/curation.json`)) writeFileSync(`${root}/data/curation.json`, `${JSON.stringify(state, null, 2)}\n`);
  }
  mkdirSync(`${root}/output`, { recursive: true });
  writeFileSync(`${root}/output/curation-report.json`, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = await curate({ dryRun: process.argv.includes('--dry-run') || process.env.CURATE_DRY_RUN === 'true' });
  console.log(JSON.stringify({ status: report.status, searched: report.searched, signalPassed: report.signalPassed, added: report.added.map(x => `${x.repository} → ${x.kind}/${x.category} (${x.score})`), pending: report.pending.map(x => `${x.repository} (${x.score})`), screened: report.screened, errors: report.errors.slice(0, 5) }, null, 2));
  if (report.status === 'blocked') process.exitCode = 1;
}
