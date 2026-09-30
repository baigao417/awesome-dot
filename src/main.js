import { createIcons, Sparkles, Info, GitFork as Github, Plus, ArrowUpRight, ScanSearch, Layers, CodeXml, PenTool, BriefcaseBusiness, ChartNoAxesCombined, Clock3, Workflow, BookOpen, Bot, ArrowRight, Search, X, SlidersHorizontal, RotateCcw, ArrowDownWideNarrow, Bookmark, GitBranch, BadgeCheck, FileCode2, Star, SearchX, Download, CircleAlert, Copy, Link, Sun, Moon } from 'lucide';
import catalog from '../data/catalog.json';
import discovery from '../data/project-evidence.json';
import sourceRegister from '../data/sources.json';
import avatars from '../data/avatars.json';
import site from '../data/site.json';
import { categories, kinds, filterItems, taskBrief, tagIndex, chooseInspiration, dailyItem, dateKey } from './catalog.js';
import { languages, dictionaries } from './i18n.js';
import './style.css';

// 收录正文译文由 Codex 生成，中文原文为准；文件缺失或某条缺译时回退中文
const catalogI18n = Object.values(import.meta.glob('../data/catalog-i18n.json', { eager: true, import: 'default' }))[0]?.items ?? {};

const $ = (selector) => document.querySelector(selector);
const icons = { Sparkles, Info, Github, Plus, ArrowUpRight, ScanSearch, Layers, CodeXml, PenTool, BriefcaseBusiness, ChartNoAxesCombined, Clock3, Workflow, BookOpen, Bot, ArrowRight, Search, X, SlidersHorizontal, RotateCcw, ArrowDownWideNarrow, Bookmark, GitBranch, BadgeCheck, FileCode2, Star, SearchX, Download, CircleAlert, Copy, Link, Sun, Moon };
const escape = (text) => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const storage = { get: (key) => { try { return localStorage.getItem(key); } catch { return null; } }, set: (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } } };
const safeLoad = () => { try { const saved = JSON.parse(storage.get('awesome-dot-favorites') ?? '[]'); return Array.isArray(saved) ? saved.filter(x => catalog.items.some(i => i.id === x)) : []; } catch { return []; } };
const initial = new URLSearchParams(location.search);
const browserLang = (navigator.language || 'zh').slice(0, 2).toLowerCase();
const pickLang = (...ids) => ids.find(id => dictionaries[id]) ?? 'zh';
const allTags = tagIndex(catalog.items);
const state = { query: initial.get('q') ?? '', category: initial.get('category') ?? 'all', kind: initial.get('kind') ?? 'all', tags: initial.getAll('tag').filter(tag => allTags.some(x => x.tag === tag)), tagMode: initial.get('tagMode') === 'all' ? 'all' : 'any', minStars: [100, 1000].includes(Number(initial.get('stars'))) ? Number(initial.get('stars')) : 0, sourceOnly: initial.get('source') === '1', savedOnly: false, favorites: safeLoad(), sort: 'curated', lang: pickLang(initial.get('lang'), storage.get('awesome-dot-lang'), browserLang), theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark' };
if (!categories.some(c => c.id === state.category)) state.category = 'all';
if (state.kind !== 'all' && !kinds[state.kind]) state.kind = 'all';
const t = (key) => dictionaries[state.lang][key] ?? dictionaries.zh[key];
const translated = (item) => state.lang === 'zh' ? null : catalogI18n[item.id]?.[state.lang];
const tx = (item, field) => translated(item)?.[field] ?? item[field];
const srcLang = (item) => translated(item) ? '' : ' lang="zh-CN"';
const items = catalog.items.map(item => {
  const repo = discovery.projects.find(p => p.repository === item.repository);
  const translations = Object.values(catalogI18n[item.id] ?? {});
  const searchText = translations.flatMap(value => [value.name, value.description, value.dotRole, ...(value.tags ?? [])]).filter(Boolean).join(' ');
  return { ...item, searchText, stars: repo?.stars, license: repo?.license, repoEvidence: repo };
});
let opener;
let toastTimer;
let drawnId;
let currentDay = dateKey(new Date(), site.timezone);
const tagLabel = (tag) => {
  const item = items.find(x => x.tags.includes(tag));
  return item ? (tx(item, 'tags')[item.tags.indexOf(tag)] ?? tag) : tag;
};
// 干笔滤镜沿用 personal-site DS-06：旋转包在滤镜外层，鬃毛纹才顺着笔画方向；只铺在标题右侧，永不压字
const brush = `<div class="brush" aria-hidden="true"><svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"><defs><filter id="ink-core" filterUnits="userSpaceOnUse" x="-200" y="-600" width="2000" height="1600" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.05" numOctaves="4" seed="11" result="drag"/><feDisplacementMap in="SourceGraphic" in2="drag" scale="44" xChannelSelector="R" yChannelSelector="G" result="rough"/><feTurbulence type="fractalNoise" baseFrequency="0.006 0.28" numOctaves="2" seed="9" result="bristle"/><feColorMatrix in="bristle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -5 3.4" result="dry"/><feComposite in="rough" in2="dry" operator="in"/></filter><filter id="dry-brush" filterUnits="userSpaceOnUse" x="-200" y="-600" width="2000" height="1600" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.05" numOctaves="4" seed="11" result="drag"/><feDisplacementMap in="SourceGraphic" in2="drag" scale="60" xChannelSelector="R" yChannelSelector="G" result="rough"/><feTurbulence type="fractalNoise" baseFrequency="0.004 0.35" numOctaves="2" seed="4" result="bristle"/><feColorMatrix in="bristle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="dry"/><feComposite in="rough" in2="dry" operator="in"/></filter></defs><g transform="rotate(-34 1100 300)" fill="none" stroke="#0c0a09" stroke-linecap="round"><g filter="url(#dry-brush)"><path d="M760 300 C 960 288, 1180 286, 1520 302" stroke-width="190" opacity=".92"/><path d="M820 460 C 1000 452, 1200 456, 1420 470" stroke-width="42" opacity=".85"/><path d="M900 150 C 1060 144, 1240 148, 1460 158" stroke-width="36" opacity=".8"/></g><g filter="url(#ink-core)"><path d="M840 304 C 1020 296, 1220 296, 1520 308" stroke-width="130"/></g></g></svg></div>`;

function shell() {
  const cat = t('cat');
  const kind = t('kind');
  return `
  <header class="topbar">
    <div class="topbar-inner">
      <a href="./" class="brand" aria-label="${t('home')}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="ring-track" cx="18" cy="18" r="16"/><circle class="ring" id="progress-ring" cx="18" cy="18" r="16" pathLength="100"/></svg><span class="dot-core"></span></span><span class="brand-word">awesome<span class="brand-dot">·dot</span></span><span class="radar-label">RADAR</span></a>
      <nav class="primary-nav" aria-label="${t('mainNav')}"><button id="explore-tab" class="nav-tab active">${t('explore')}</button><button id="saved-tab" class="nav-tab">${t('saved')} <span id="saved-count">0</span></button></nav>
      <div class="header-actions"><button class="icon-button" id="about" title="${t('standards')}" aria-label="${t('standards')}">${icon('Info')}</button><a class="button subtle github-link" href="${site.repositoryUrl}" target="_blank" rel="noopener noreferrer">${icon('Github')}<span>${t('github')}</span></a><button class="button dark" id="submit">${icon('Plus')}<span>${t('submit')}</span></button></div>
    </div>
  </header>
  <div class="corner-controls">
    <div class="lang-switch" role="group" aria-label="${t('language')}">${languages.map(l => `<button data-lang="${l.id}" lang="${l.html}" title="${l.name}" aria-label="${l.name}" aria-pressed="${state.lang === l.id}" class="${state.lang === l.id ? 'active' : ''}">${l.short}</button>`).join('')}</div>
    <button class="theme-toggle" id="theme-toggle" title="${t(state.theme === 'dark' ? 'toLight' : 'toDark')}" aria-label="${t(state.theme === 'dark' ? 'toLight' : 'toDark')}">${icon(state.theme === 'dark' ? 'Sun' : 'Moon')}</button>
  </div>
  <main class="page">
    <section class="intro" aria-labelledby="page-title">${brush}<div class="grain" aria-hidden="true"></div><div class="intro-inner"><div class="intro-top"><span class="eyebrow"><span class="status-dot"></span>OPENAI DOTS · COMMUNITY RADAR</span><a class="official-link" href="https://learn.chatgpt.com/docs/dots" target="_blank" rel="noopener noreferrer">${t('official')} ${icon('ArrowUpRight')}</a></div><h1 id="page-title">${t('h1a')}<b>${t('h1b')}</b></h1><p>${t('lead')}</p><div class="intro-meta" aria-hidden="true"><span>VOL. 01 · ${catalog.checkedAt}</span><span>${t('local')} <b id="live-clock">--:--:--</b></span></div></div><div class="wedge" aria-hidden="true"><span class="wedge-rule"></span><strong>${String(items.length).padStart(2, '0')}</strong><em>ENTRIES INDEXED · ${items.length} ${t('indexed')}</em></div></section>
    <section class="stats" aria-label="${t('statsLabel')}"><div class="ledger-label">§ LEDGER</div><div><strong>${items.length}</strong><span>${t('statItems')}</span></div><div><strong>${items.filter(x => x.kind === 'official_case').length}</strong><span>${t('statOfficial')}</span></div><div><strong>${items.filter(x => x.repository).length}</strong><span>${t('statRepos')}</span></div><div><strong>${items.filter(x => x.tested).length}</strong><span>${t('statTested')}</span></div><div class="updated-stat"><span>${t('statChecked')}</span><strong>${catalog.checkedAt}</strong></div></section>
    <div class="notice-line">${icon('ScanSearch')}<span>${t('notice')}</span><button id="standards-link">${t('standards')} ${icon('ArrowUpRight')}</button></div>
    <section class="discovery-band" aria-label="${t('inspiration')}"><div class="draw-entry"><span class="small-label">01 / INSPIRATION</span><h2>${t('draw')}</h2><span id="draw-pool" class="draw-pool"></span><button class="button dark" id="draw-main">${icon('Sparkles')} ${t('draw')} ${icon('ArrowRight')}</button></div><div id="daily-pick" class="daily-entry"></div></section>
    <div class="directory">
      <aside class="sidebar"><div class="section-label">${t('categories')} <span>${categories.length - 1}</span></div><nav id="category-list" aria-label="${t('categoryNav')}"></nav><div class="maintainer-block"><span class="small-label">${t('maintainer')}</span><div class="maintainer-identity"><img src="${site.maintainer.avatar}" alt="${site.maintainer.name}" width="48" height="48" loading="lazy" referrerpolicy="no-referrer" /><div><strong>${site.maintainer.name}</strong><a href="${site.maintainer.url}" target="_blank" rel="noopener noreferrer">${site.maintainer.handle}</a></div></div><p>${site.maintainer.bio}</p><a class="text-button" href="${site.maintainer.url}" target="_blank" rel="noopener noreferrer">${t('follow')} ${icon('ArrowUpRight')}</a></div><div class="sidebar-footer"><span class="small-label">COMMUNITY EDITION</span><strong>${t('sideTitle')}</strong><p>${t('sideText')}</p><button id="sidebar-submit" class="text-button">${t('sideSubmit')} ${icon('ArrowRight')}</button></div></aside>
      <section class="results" aria-label="${t('resultsLabel')}">
        <div class="search-row"><label class="search-box">${icon('Search')}<input id="search" type="search" placeholder="${t('searchPlaceholder')}" aria-label="${t('searchLabel')}" autocomplete="off" value="${escape(state.query)}" /><button id="clear-search" class="icon-button" title="${t('clearSearch')}" aria-label="${t('clearSearch')}">${icon('X')}</button></label><button class="button draw-toolbar" id="draw-header" title="${t('draw')}" aria-label="${t('draw')}">${icon('Sparkles')}</button><button class="button filter-button" id="filter-toggle" aria-expanded="false" aria-controls="filter-panel">${icon('SlidersHorizontal')}<span>${t('filter')}</span><b id="filter-count" hidden></b></button></div>
        <div class="filter-panel" id="filter-panel" hidden><div class="filter-top"><label>${t('kindLabel')}<select id="kind-select"><option value="all">${t('allKinds')}</option>${Object.keys(kinds).map(id => `<option value="${id}">${kind[id]}</option>`).join('')}</select></label><label>${t('starsLabel')}<select id="stars-select"><option value="0">${t('starsAny')}</option><option value="100">100+</option><option value="1000">1,000+</option></select></label><label class="check-label"><input type="checkbox" id="source-only" />${t('sourceOnly')}</label><button class="text-button" id="reset-filters">${icon('RotateCcw')} ${t('resetFilters')}</button></div><div class="tag-heading"><strong>${t('tagsLabel')}</strong><div class="tag-modes" role="group" aria-label="${t('tagsLabel')}"><button data-tag-mode="any">${t('tagAny')}</button><button data-tag-mode="all">${t('tagAll')}</button></div></div><div id="tag-list" class="tag-options"></div></div>
        <div class="active-filters" id="active-filters" hidden></div>
        <div class="type-tabs" role="group" aria-label="${t('kindLabel')}"><button data-kind="all">${t('all')}</button>${Object.keys(kinds).map(id => `<button data-kind="${id}">${kind[id]}</button>`).join('')}</div>
        <div class="results-heading"><h2 id="results-title">${t('discover')} <span id="result-count"></span></h2><label class="sort-label">${icon('ArrowDownWideNarrow')}<select id="sort" aria-label="${t('sort')}"><option value="curated">${t('sortCurated')}</option><option value="stars">${t('sortStars')}</option><option value="name">${t('sortName')}</option></select></label></div>
        ${t('contentNote') ? `<p class="content-note">${t('contentNote')}</p>` : ''}
        <div class="project-grid" id="project-grid"></div>
      </section>
    </div>
    <footer class="page-footer"><span>${t('footer')}</span><a href="${site.maintainer.url}" target="_blank" rel="noopener noreferrer">${site.maintainer.name} · ${site.maintainer.handle} ${icon('ArrowUpRight')}</a><button id="export-data" class="text-button">${icon('Download')} ${t('exportData')}</button></footer>
  </main>
  <dialog id="detail-dialog" class="detail-dialog"><div id="detail-content"></div></dialog>
  <dialog id="inspiration-dialog" class="inspiration-dialog"><div class="modal-header"><span class="small-label">${t('inspiration')}</span><button class="icon-button close-dialog" title="${t('close')}" aria-label="${t('close')}">${icon('X')}</button></div><div id="inspiration-content"></div><div class="modal-actions"><button class="button" id="draw-again">${icon('Sparkles')} ${t('drawAgain')}</button><button class="button dark" id="draw-open">${t('drawOpen')} ${icon('ArrowRight')}</button></div></dialog>
  <dialog id="about-dialog" class="small-dialog"><div class="modal-header"><h2>${t('standards')}</h2><button class="icon-button close-dialog" aria-label="${t('close')}" title="${t('close')}">${icon('X')}</button></div><div class="modal-body"><p>${t('aboutIntro')}</p><dl class="standards">${t('standardList').map(([dt, dd]) => `<dt>${dt}</dt><dd>${dd}</dd>`).join('')}</dl><p class="muted">${t('aboutNote')}</p><a class="source-link" href="https://learn.chatgpt.com/docs/dots/controls" target="_blank" rel="noopener noreferrer">${t('aboutLink')} ${icon('ArrowUpRight')}</a></div></dialog>
  <dialog id="submit-dialog" class="small-dialog"><div class="modal-header"><h2>${t('submit')}</h2><button class="icon-button close-dialog" aria-label="${t('close')}" title="${t('close')}">${icon('X')}</button></div><form id="submit-form" class="modal-body"><label>${t('formName')}<input name="name" required maxlength="100" /></label><label>${t('formUrl')}<input name="url" type="url" required placeholder="https://github.com/owner/project" /></label><label>${t('formRole')}<textarea name="role" required rows="3" maxlength="1500"></textarea></label><label>${t('formEvidence')}<input name="evidence" type="url" placeholder="${t('formEvidenceHint')}" /></label><p class="muted">${t('formNote')}</p><button type="submit" class="button dark">${icon('Download')} ${t('formDownload')}</button></form></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>`;
}

function refreshIcons() { createIcons({ icons, attrs: { 'stroke-width': 1.7 } }); }
function syncUrl() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.category !== 'all') params.set('category', state.category);
  if (state.kind !== 'all') params.set('kind', state.kind);
  for (const tag of state.tags) params.append('tag', tag);
  if (state.tags.length && state.tagMode === 'all') params.set('tagMode', 'all');
  if (state.minStars) params.set('stars', state.minStars);
  if (state.sourceOnly) params.set('source', '1');
  params.set('lang', state.lang);
  history.replaceState(null, '', location.pathname + (params.size ? `?${params}` : '') + location.hash);
}
function render() {
  const visible = filterItems(items, state);
  const cat = t('cat');
  $('#saved-count').textContent = state.favorites.length;
  $('#result-count').textContent = visible.length;
  $('#results-title').firstChild.textContent = `${state.savedOnly ? t('mySaved') : t('discover')} `;
  $('#explore-tab').classList.toggle('active', !state.savedOnly);
  $('#saved-tab').classList.toggle('active', state.savedOnly);
  $('#kind-select').value = state.kind;
  $('#stars-select').value = state.minStars;
  $('#source-only').checked = state.sourceOnly;
  $('#sort').value = state.sort;
  $('#clear-search').hidden = !state.query;
  document.querySelectorAll('button[data-kind]').forEach(button => { button.classList.toggle('active', button.dataset.kind === state.kind); button.setAttribute('aria-pressed', String(button.dataset.kind === state.kind)); });
  document.querySelectorAll('[data-tag-mode]').forEach(button => { button.classList.toggle('active', button.dataset.tagMode === state.tagMode); button.setAttribute('aria-pressed', String(button.dataset.tagMode === state.tagMode)); });
  $('#tag-list').innerHTML = allTags.map(({ tag, count }) => `<label class="tag-option"><input type="checkbox" data-tag="${escape(tag)}" ${state.tags.includes(tag) ? 'checked' : ''} /><span>${escape(tagLabel(tag))}</span><em>${count}</em></label>`).join('');
  const active = state.tags.map(tag => `<button data-remove-tag="${escape(tag)}" aria-label="${t('removeFilter')} ${escape(tagLabel(tag))}">${escape(tagLabel(tag))} ${icon('X')}</button>`);
  for (const [field, label] of [['category', cat[state.category]], ['kind', t('kind')[state.kind]], ['minStars', `${state.minStars}+ Stars`], ['sourceOnly', t('sourceOnly')]]) {
    if (state[field] && state[field] !== 'all') active.push(`<button data-clear-filter="${field}" aria-label="${t('removeFilter')} ${escape(label)}">${escape(label)} ${icon('X')}</button>`);
  }
  $('#active-filters').hidden = active.length === 0;
  $('#active-filters').innerHTML = active.join('');
  $('#filter-count').hidden = active.length === 0;
  $('#filter-count').textContent = active.length;
  $('#category-list').innerHTML = categories.map((category, index) => `<button data-category="${category.id}" class="category ${state.category === category.id ? 'selected' : ''}" aria-pressed="${state.category === category.id}"><span class="category-index">${String(index).padStart(2, '0')}</span>${icon(category.icon)}<span>${cat[category.id]}</span><span class="category-count">${items.filter(x => (category.id === 'all' || x.category === category.id) && (!state.savedOnly || state.favorites.includes(x.id))).length}</span></button>`).join('');
  $('#project-grid').innerHTML = visible.length ? visible.map((item, index) => {
    const kind = kinds[item.kind];
    const saved = state.favorites.includes(item.id);
    const category = categories.find(c => c.id === item.category);
    const img = item.repository ? `<span class="project-avatar fallback-avatar"><span>${escape(item.owner.slice(0, 2).toUpperCase())}</span><img class="avatar-image" src="${avatars[item.owner] ?? `https://github.com/${encodeURIComponent(item.owner)}.png?size=96`}" alt="" loading="lazy" referrerpolicy="no-referrer" /></span>` : `<span class="project-avatar official-avatar">${icon(category.icon)}</span>`;
    return `<article class="project-card ${kind.color}" data-id="${item.id}" data-kind="${item.kind}"><span class="fig" aria-hidden="true">FIG. ${String(index + 1).padStart(2, '0')}</span><div class="card-top">${img}<div class="project-identity"><button class="project-title" data-detail="${item.id}">${escape(tx(item, 'name'))} ${icon('ArrowUpRight')}</button><span class="project-owner">${escape(item.owner)}</span></div><button class="icon-button favorite ${saved ? 'is-saved' : ''}" data-favorite="${item.id}" aria-pressed="${saved}" title="${saved ? t('unsave') : t('save')}" aria-label="${saved ? t('unsave') : t('save')} ${escape(tx(item, 'name'))}">${icon('Bookmark')}</button></div><div class="card-meta"><span class="kind-badge ${kind.color}">${t('kind')[item.kind]}</span><span class="card-category">${icon(category.icon)} ${cat[category.id]}</span></div><p class="description"${srcLang(item)}>${escape(tx(item, 'description'))}</p><div class="dot-role"><span class="small-label">${icon(item.kind === 'alternative' ? 'GitBranch' : 'Sparkles')}${item.kind === 'alternative' ? t('altRole') : t('dotRole')}</span><p${srcLang(item)}>${escape(tx(item, 'dotRole'))}</p></div><div class="tags"${srcLang(item)}>${tx(item, 'tags').map((tag, i) => `<button data-tag="${escape(item.tags[i])}" aria-pressed="${state.tags.includes(item.tags[i])}">${escape(tag)}</button>`).join('')}</div><div class="card-bottom"><span class="evidence-note">${icon(item.verified === 'official_example' ? 'BadgeCheck' : 'FileCode2')} ${t('evidenceShort')[item.verified]}</span>${item.stars === undefined ? '' : `<span class="stars">${icon('Star')} ${item.stars.toLocaleString()}</span>`}<button data-detail="${item.id}" class="detail-link">${t('viewDetail')} ${icon('ArrowRight')}</button></div></article>`;
  }).join('') : `<div class="empty-state">${icon(state.savedOnly ? 'Bookmark' : 'SearchX')}<h3>${state.savedOnly ? t('emptySavedTitle') : t('emptyTitle')}</h3><p>${state.savedOnly ? t('emptySavedText') : t('emptyText')}</p><button class="button" id="empty-reset">${t('resetFilters')}</button></div>`;
  $('#project-grid').querySelectorAll('img').forEach(img => {
    const reveal = () => { if (img.naturalWidth) img.classList.add('loaded'); };
    img.addEventListener('load', reveal);
    if (img.complete) reveal();
    img.addEventListener('error', () => img.remove());
  });
  renderDiscovery(visible);
  syncUrl();
  refreshIcons();
}
function renderDiscovery(visible = filterItems(items, state)) {
  $('#draw-pool').textContent = t('drawPool')(visible.length);
  $('#draw-main').disabled = visible.length === 0;
  $('#draw-header').disabled = visible.length === 0;
  const item = dailyItem(items, new Date(), site.timezone);
  $('#daily-pick').innerHTML = item ? `<div class="daily-heading"><span class="small-label">02 / ${t('daily')}</span><time datetime="${currentDay}">${currentDay}</time></div><span class="kind-badge ${kinds[item.kind].color}">${t('kind')[item.kind]}</span><h2><button data-detail="${item.id}">${escape(tx(item, 'name'))}</button></h2><p${srcLang(item)}>${escape(tx(item, 'description'))}</p><button class="text-button" data-detail="${item.id}">${t('dailyOpen')} ${icon('ArrowUpRight')}</button>` : '';
  $('#daily-pick').dataset.pickId = item?.id ?? '';
}
function drawInspiration() {
  const item = chooseInspiration(filterItems(items, state), drawnId);
  if (!item) { toast(t('drawEmpty')); return; }
  drawnId = item.id;
  $('#inspiration-content').innerHTML = `<div class="inspiration-face" data-drawn-id="${item.id}"><span class="small-label">INSPIRATION / ${escape(item.owner)}</span><span class="kind-badge ${kinds[item.kind].color}">${t('kind')[item.kind]}</span><h2>${escape(tx(item, 'name'))}</h2><p${srcLang(item)}>${escape(tx(item, 'description'))}</p><div class="dot-role"><span class="small-label">${item.kind === 'alternative' ? t('altRole') : t('dotRole')}</span><p${srcLang(item)}>${escape(tx(item, 'dotRole'))}</p></div><span class="draw-evidence">${t('evidence')[item.verified]}</span></div>`;
  if (!$('#inspiration-dialog').open) openDialog('#inspiration-dialog');
  refreshIcons();
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3500);
}
function openDialog(selector) { opener = document.activeElement; $(selector).showModal(); }
function closeDialog(dialog) { dialog.close(); opener?.focus(); }
function download(name, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copy(text, button) {
  try { await navigator.clipboard.writeText(text); button.dataset.copied = 'true'; toast(t('copied')); }
  catch { download('dot-task.txt', text, 'text/plain'); toast(t('clipboardFallback')); }
}
function showDetail(id) {
  const item = items.find(x => x.id === id);
  if (!item) return;
  const evidence = item.repoEvidence;
  const links = item.sourceIds.map(id => sourceRegister.sources.find(s => s.id === id)).filter(Boolean);
  $('#detail-content').innerHTML = `<div class="modal-header"><span class="kind-badge ${kinds[item.kind].color}">${t('kind')[item.kind]}</span><button class="icon-button close-dialog" aria-label="${t('close')}" title="${t('close')}">${icon('X')}</button></div><div class="modal-body"><div class="detail-byline">${escape(item.owner)} · ${t('cat')[item.category]}</div><h2>${escape(tx(item, 'name'))}</h2>${t('contentNote') ? `<p class="content-note">${t('contentNote')}</p>` : ''}<p class="detail-summary"${srcLang(item)}>${escape(tx(item, 'description'))}</p><div class="detail-section"><h3>${item.kind === 'alternative' ? t('altHeading') : t('roleHeading')}</h3><p${srcLang(item)}>${escape(tx(item, 'dotRole'))}</p></div><div class="detail-section"><h3>${t('outcome')}</h3><p${srcLang(item)}>${escape(tx(item, 'outcome'))}</p></div><div class="detail-section"><h3>${t('requirements')}</h3><ul${srcLang(item)}>${tx(item, 'requirements').map(x => `<li>${escape(x)}</li>`).join('')}</ul></div><div class="detail-warning">${icon('CircleAlert')}<div><strong>${t('evidence')[item.verified]}</strong><p${srcLang(item)}>${escape(tx(item, 'limits'))}</p></div></div><div class="detail-section"><h3>${t('sources')}</h3><a class="source-link" href="${escape(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${item.repository ? item.repository : t('officialDoc')} ${icon('ArrowUpRight')}</a>${links.map(link => `<a class="source-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${escape(link.title)} ${icon('ArrowUpRight')}</a>`).join('')}${evidence ? `<a class="source-link" href="${evidence.readmeUrl}" target="_blank" rel="noopener noreferrer">README · ${evidence.commit.slice(0, 7)} ${icon('ArrowUpRight')}</a>${evidence.files.map(file => `<a class="source-link" href="${file.url}" target="_blank" rel="noopener noreferrer">${escape(file.path)} ${icon('FileCode2')}</a>`).join('')}<p class="muted">${escape(evidence.license)} · Stars ${evidence.stars} · ${t('partialReview')}</p>` : ''}<p class="muted">${t('checkedNote')(catalog.checkedAt)}</p></div></div><div class="modal-actions">${item.kind === 'official_case' ? `<button class="button" id="copy-task">${icon('Copy')} ${t('copyTask')}</button>` : `<a class="button" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${icon('Github')} ${t('viewRepo')}</a>`}<button class="button dark" id="copy-share">${icon('Link')} ${t('copyLink')}</button></div>`;
  history.replaceState(null, '', location.pathname + location.search + `#${id}`);
  refreshIcons();
  openDialog('#detail-dialog');
  $('#copy-task')?.addEventListener('click', event => copy(taskBrief(item), event.currentTarget));
  $('#copy-share').addEventListener('click', event => copy(location.href, event.currentTarget));
}
function resetFilters() { state.query = ''; state.category = 'all'; state.kind = 'all'; state.tags = []; state.tagMode = 'any'; state.minStars = 0; state.sourceOnly = false; $('#search').value = ''; render(); }

// 外壳随语言整体重绘；筛选、搜索、收藏都在 state 里，重绘后原样恢复
function mount() {
  const lang = languages.find(l => l.id === state.lang);
  document.documentElement.lang = lang.html;
  document.title = t('title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('description'));
  $('#app').innerHTML = shell();
  $('#search').addEventListener('input', event => { state.query = event.target.value; render(); });
  $('#clear-search').addEventListener('click', () => { state.query = ''; $('#search').value = ''; render(); $('#search').focus(); });
  $('#sort').addEventListener('change', event => { state.sort = event.target.value; render(); });
  $('#kind-select').addEventListener('change', event => { state.kind = event.target.value; render(); });
  $('#stars-select').addEventListener('change', event => { state.minStars = Number(event.target.value); render(); });
  $('#source-only').addEventListener('change', event => { state.sourceOnly = event.target.checked; render(); });
  $('#reset-filters').addEventListener('click', resetFilters);
  $('#filter-toggle').addEventListener('click', () => { const panel = $('#filter-panel'); panel.hidden = !panel.hidden; $('#filter-toggle').setAttribute('aria-expanded', String(!panel.hidden)); });
  $('#explore-tab').addEventListener('click', () => { state.savedOnly = false; resetFilters(); });
  $('#saved-tab').addEventListener('click', () => { state.savedOnly = true; resetFilters(); });
  $('#export-data').addEventListener('click', () => { download('awesome-dot-catalog.json', JSON.stringify({ ...catalog, items: items.map(({ repoEvidence, ...item }) => item) }, null, 2)); toast(t('exported')); });
  ['#about', '#standards-link'].forEach(selector => $(selector).addEventListener('click', () => openDialog('#about-dialog')));
  ['#submit', '#sidebar-submit'].forEach(selector => $(selector).addEventListener('click', () => openDialog('#submit-dialog')));
  ['#draw-main', '#draw-header', '#draw-again'].forEach(selector => $(selector).addEventListener('click', drawInspiration));
  $('#draw-open').addEventListener('click', () => { closeDialog($('#inspiration-dialog')); showDetail(drawnId); });
  const issueLink = document.createElement('a');
  issueLink.className = 'button'; issueLink.href = site.issueUrl; issueLink.target = '_blank'; issueLink.rel = 'noopener noreferrer'; issueLink.textContent = t('issueSubmit');
  $('#submit-form').append(issueLink);
  $('#theme-toggle').addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
  $('#submit-form').addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target));
    if (![values.url, values.evidence].filter(Boolean).every(x => /^https?:$/.test(new URL(x).protocol))) { toast(t('badUrl')); return; }
    download('dot-submission.json', JSON.stringify({ ...values, status: 'pending_review', createdAt: new Date().toISOString(), tested: false }, null, 2));
    closeDialog($('#submit-dialog')); toast(t('drafted'));
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeDialog(dialog); } });
    dialog.addEventListener('close', () => { if (dialog.id === 'detail-dialog') history.replaceState(null, '', location.pathname + location.search); opener?.focus(); });
  });
  render();
  clock();
  progress();
}
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  storage.set('awesome-dot-theme', theme);
  const button = $('#theme-toggle');
  button.innerHTML = icon(theme === 'dark' ? 'Sun' : 'Moon');
  button.title = t(theme === 'dark' ? 'toLight' : 'toDark');
  button.setAttribute('aria-label', button.title);
  refreshIcons();
}
function setLang(lang) {
  if (lang === state.lang) return;
  const scroll = scrollY;
  state.lang = lang;
  storage.set('awesome-dot-lang', lang);
  mount();
  scrollTo(0, scroll);
  $(`[data-lang="${lang}"]`).focus();
}

document.addEventListener('click', event => {
  const lang = event.target.closest('[data-lang]');
  if (lang) setLang(lang.dataset.lang);
  const category = event.target.closest('[data-category]');
  if (category) { state.category = category.dataset.category; render(); }
  const kind = event.target.closest('button[data-kind]');
  if (kind) { state.kind = kind.dataset.kind; render(); }
  const tagMode = event.target.closest('[data-tag-mode]');
  if (tagMode) { state.tagMode = tagMode.dataset.tagMode; render(); }
  const tag = event.target.closest('button[data-tag], [data-remove-tag]');
  if (tag) { const value = tag.dataset.tag ?? tag.dataset.removeTag; state.tags = state.tags.includes(value) ? state.tags.filter(x => x !== value) : [...state.tags, value]; render(); }
  const clear = event.target.closest('[data-clear-filter]');
  if (clear) { const field = clear.dataset.clearFilter; state[field] = field === 'minStars' ? 0 : field === 'sourceOnly' ? false : 'all'; render(); }
  const favorite = event.target.closest('[data-favorite]');
  if (favorite) { const id = favorite.dataset.favorite; state.favorites = state.favorites.includes(id) ? state.favorites.filter(x => x !== id) : [...state.favorites, id]; if (!storage.set('awesome-dot-favorites', JSON.stringify(state.favorites))) toast(t('storageOff')); render(); }
  const detail = event.target.closest('[data-detail]');
  if (detail) showDetail(detail.dataset.detail);
  if (event.target.closest('.close-dialog')) closeDialog(event.target.closest('dialog'));
  if (event.target.closest('#empty-reset')) resetFilters();
});
document.addEventListener('change', event => {
  if (event.target.matches('input[data-tag]')) {
    const tag = event.target.dataset.tag;
    state.tags = event.target.checked ? [...new Set([...state.tags, tag])] : state.tags.filter(x => x !== tag);
    render();
    [...document.querySelectorAll('input[data-tag]')].find(input => input.dataset.tag === tag)?.focus();
  }
});
document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
  if (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) { event.preventDefault(); $('#search').focus(); }
});
function clock() {
  const now = new Date(); const el = $('#live-clock');
  if (el) el.textContent = now.toLocaleTimeString('en-GB', { hour12: false });
  const nextDay = dateKey(now, site.timezone);
  if (nextDay !== currentDay) { currentDay = nextDay; renderDiscovery(); refreshIcons(); }
}
setInterval(clock, 1000);
function progress() { const max = document.documentElement.scrollHeight - innerHeight; const ring = $('#progress-ring'); if (ring) ring.style.strokeDashoffset = String(100 - (max > 0 ? Math.min(1, scrollY / max) : 0) * 100); }
addEventListener('scroll', progress, { passive: true }); addEventListener('resize', progress);
mount();
if (location.hash) showDetail(decodeURIComponent(location.hash.slice(1)));
