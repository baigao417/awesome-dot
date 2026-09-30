import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterItems, categories, kinds, taskBrief, tagIndex, chooseInspiration, dailyItem, dateKey } from '../src/catalog.js';
import { relevantRepository, scan } from '../scripts/scan-github.mjs';

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const discovery = JSON.parse(readFileSync('data/project-evidence.json', 'utf8'));
const sources = JSON.parse(readFileSync('data/sources.json', 'utf8')).sources;
test('every entry has provenance, role, prerequisites and honest verification', () => {
  assert.ok(catalog.items.length > 0);
  assert.equal(new Set(catalog.items.map(x => x.id)).size, catalog.items.length);
  for (const item of catalog.items) {
    for (const field of ['id','name','owner','kind','category','description','dotRole','outcome','limits','sourceUrl','verified']) assert.ok(item[field], `${item.id}: ${field}`);
    assert.ok(kinds[item.kind]);
    assert.ok(categories.some(x => x.id === item.category));
    assert.ok(item.requirements.length);
    assert.equal(new URL(item.sourceUrl).protocol, 'https:');
    for (const id of item.sourceIds) assert.ok(sources.some(x => x.id === id));
    if (item.tested) assert.ok(item.executionReceipt && item.acceptedOutput);
    if (item.repository) assert.ok(discovery.projects.some(x => x.repository === item.repository));
    if (item.verified === 'source_reviewed') assert.ok(discovery.projects.find(x => x.repository === item.repository).files.length > 0);
    if (item.kind === 'official_case') assert.equal(item.verified, 'official_example');
  }
});
test('repository evidence is commit-pinned', () => {
  for (const project of discovery.projects) {
    assert.match(project.commit, /^[a-f0-9]{40}$/);
    assert.ok(project.readmeUrl.includes(project.commit));
    for (const file of project.files) assert.ok(file.url.includes(project.commit));
  }
});
test('search handles Chinese, owner and AND tokens', () => {
  assert.equal(filterItems(catalog.items, { query: '产品反馈' })[0].id, 'feedback-to-fix');
  assert.equal(filterItems(catalog.items, { query: 'MERGISI MCP' }).length, 1);
  assert.equal(filterItems(catalog.items, { query: '不存在的案例_xyz' }).length, 0);
});
test('category, kind and favorites compose without mutating source', () => {
  const original = catalog.items.map(x => x.id);
  assert.equal(filterItems(catalog.items, { category:'content' }).length, 1);
  assert.ok(filterItems(catalog.items, { kind:'alternative' }).every(x => x.kind === 'alternative'));
  assert.equal(filterItems(catalog.items, { savedOnly:true, favorites:['dots-mcp'] })[0].id,'dots-mcp');
  assert.equal(filterItems(catalog.items, { savedOnly:true }).length,0);
  filterItems(catalog.items, { sort:'name' });
  assert.deepEqual(catalog.items.map(x => x.id), original);
});
test('task briefs preserve prerequisite and permission boundaries', () => {
  const item = catalog.items.find(x => x.id === 'planning-checkin');
  const brief = taskBrief(item);
  for (const required of item.requirements) assert.ok(brief.includes(required));
  assert.ok(brief.includes('不包含在这份任务草案'));
  assert.ok(brief.includes('未实测'));
});
test('candidate screen rejects dotnet, dotfiles and unrelated names', () => {
  assert.equal(relevantRepository({name:'openai-dotnet',description:'OpenAI .NET client'}),false);
  assert.equal(relevantRepository({name:'dotfiles',description:'OpenAI dots config'}),false);
  assert.equal(relevantRepository({name:'weather',description:'Weather app'}),false);
  assert.equal(relevantRepository({name:'dots-mcp',description:'OpenAI Dots resource search'}),true);
  assert.equal(relevantRepository({name:'dots-mcp',description:'OpenAI Dots',archived:true}),false);
});
test('scan deduplicates candidates and does not silently promote them', async () => {
  const repo = {name:'dots-mcp',full_name:'test/dots-mcp',description:'OpenAI Dots resource search',html_url:'https://github.com/test/dots-mcp',stargazers_count:1};
  const result = await scan({queriesToRun:['a','b'],known:['test/dots-mcp'],fetcher:async()=>({ok:true,json:async()=>({items:[repo]})})});
  assert.equal(result.candidates.length,1);
  assert.equal(result.candidates[0].status,'pending_source_review');
  assert.equal(result.candidates[0].tested,false);
  assert.equal(result.candidates[0].alreadyListed,true);
});
test('partial and total discovery failures remain visible', async () => {
  let calls = 0;
  const partial = await scan({queriesToRun:['a','b'],fetcher:async()=> (++calls===1 ? {ok:false,status:403} : {ok:true,json:async()=>({items:[]})})});
  assert.equal(partial.status,'partial');
  assert.equal(partial.errors.length,1);
  const blocked = await scan({queriesToRun:['a'],fetcher:async()=>({ok:false,status:429})});
  assert.equal(blocked.status,'blocked');
  assert.equal(blocked.errors[0].error,'GitHub HTTP 429');
});
test('tag any/all, stars and source-only filters compose correctly', () => {
  const indexed = catalog.items.map(item => ({ ...item, stars: discovery.projects.find(p => p.repository === item.repository)?.stars }));
  assert.equal(filterItems(indexed, { tags:['MCP'] }).length, 2);
  assert.equal(filterItems(indexed, { tags:['MCP','资源搜索'], tagMode:'all' })[0].id,'dots-mcp');
  assert.ok(filterItems(indexed, { tags:['MCP','采访'], tagMode:'any' }).length > filterItems(indexed, { tags:['MCP','采访'], tagMode:'all' }).length);
  assert.ok(filterItems(indexed, { minStars:1000 }).every(item => item.stars >= 1000));
  assert.ok(filterItems(indexed, { sourceOnly:true }).every(item => item.verified === 'source_reviewed'));
  assert.equal(filterItems(indexed, { tags:['MCP'], category:'content' }).length,0);
  assert.equal(tagIndex([{tags:['MCP','MCP']},{tags:['MCP','源码']}])[0].count,2);
});
test('search includes translated fields and keeps AND matching', () => {
  const item = { ...catalog.items[0], searchText:'Follow software feedback bug investigation' };
  assert.equal(filterItems([item], {query:'software feedback'}).length,1);
  assert.equal(filterItems([item], {query:'software nonexistent'}).length,0);
});
test('inspiration honors the supplied pool and avoids immediate repeats', () => {
  const pool = filterItems(catalog.items, {category:'operations'});
  const first = chooseInspiration(pool, undefined, () => 0);
  const next = chooseInspiration(pool, first.id, () => 0);
  assert.notEqual(first.id,next.id);
  assert.ok(pool.some(item => item.id === next.id));
  assert.equal(chooseInspiration([],undefined),null);
  assert.equal(chooseInspiration([first],first.id).id,first.id);
});
test('daily discovery is stable across item order and changes at Singapore midnight', () => {
  const before = new Date('2026-09-30T15:59:59Z');
  const after = new Date('2026-09-30T16:00:00Z');
  assert.equal(dateKey(before),'2026-09-30');
  assert.equal(dateKey(after),'2026-10-01');
  assert.equal(dailyItem(catalog.items,before).id,dailyItem(catalog.items.slice().reverse(),before).id);
  assert.notEqual(dailyItem(catalog.items,before).id,dailyItem(catalog.items,after).id);
  assert.equal(dailyItem([],before),null);
  assert.ok(['official_case','community_project'].includes(dailyItem(catalog.items,before).kind));
});
