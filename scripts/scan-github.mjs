import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const queries = ['"openai dots" in:name,description,readme', '"chatgpt dots" in:name,description,readme', 'topic:openai-dots'];
export function relevantRepository(repo) {
  if (repo.fork || repo.archived || /dotnet|dotfiles|awesomewm|\.net/i.test(repo.name)) return false;
  return /openai\s+dots?\b|chatgpt\s+dots?\b|dots?[- ](?:mcp|guide|agent)|always-on.*dots?/i.test(`${repo.name} ${repo.description ?? ''}`) || Boolean(repo.topics?.includes('openai-dots'));
}
export async function scan({ fetcher = fetch, token = process.env.GITHUB_TOKEN, queriesToRun = queries, known = [], excludedRepositories = [] } = {}) {
  const results = new Map();
  const report = { checkedAt: new Date().toISOString(), status: 'success', queries: queriesToRun, candidates: [], errors: [], excludedCount: 0, searchCoverage: 'Bounded: up to 30 results per query; not a full GitHub census.' };
  for (const query of queriesToRun) {
    try {
      const response = await fetcher(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&per_page=30`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'awesome-dot-discovery', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
      const body = await response.json();
      if (!Array.isArray(body.items)) throw new Error('Invalid GitHub search response');
      if (body.incomplete_results) { report.status = 'partial'; report.errors.push({ query, error: 'GitHub returned incomplete search results' }); }
      for (const repo of body.items) {
        if (excludedRepositories.includes(repo.full_name)) { report.excludedCount++; continue; }
        if (!relevantRepository(repo)) { report.excludedCount++; continue; }
        results.set(repo.full_name, { repository: repo.full_name, url: repo.html_url, description: repo.description, stars: repo.stargazers_count, updatedAt: repo.pushed_at, alreadyListed: known.includes(repo.full_name), status: 'pending_source_review', tested: false });
      }
    } catch (error) { report.status = 'partial'; report.errors.push({ query, error: error.message }); }
  }
  report.candidates = [...results.values()];
  if (report.errors.length === queriesToRun.length && !report.candidates.length) report.status = 'blocked';
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const known = JSON.parse(readFileSync('data/catalog.json', 'utf8')).items.map(x => x.repository).filter(Boolean);
  const site = JSON.parse(readFileSync('data/site.json', 'utf8'));
  const ownRepository = new URL(site.repositoryUrl).pathname.replace(/^\//, '');
  const report = await scan({ known, excludedRepositories: [ownRepository] });
  mkdirSync('data', { recursive: true });
  writeFileSync('data/candidates.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, candidates: report.candidates.length, new: report.candidates.filter(x => !x.alreadyListed).length, errors: report.errors }));
  if (report.status !== 'success') process.exitCode = 1;
}
