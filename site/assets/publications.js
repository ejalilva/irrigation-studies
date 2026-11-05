/* Publications on the research pages (research.html and satellites.html): every paper in assets/journals.js, listed by
   year (the default), by part of the water cycle or by satellite. The list starts with the last RECENT_YEARS years;
   "Show all" at the bottom lists every paper.

   PARTS and SATELLITES say which papers belong to each group, by the paper's key in assets/journals.js (its lowercase
   DOI, or its address when it has no DOI). They follow the water-cycle map (assets/water-cycle.js) and the
   satellites page (assets/satellites.js); a paper can sit in more than one group. When you add a paper to
   journals.js, add it to its parts and satellites here too. Papers that used no satellite data are listed under
   "Field data and models". */
(() => {
  'use strict';
  const RECENT_YEARS = 3;
  let view = 'year', all = false;
  const PARTS = [
    ['Rain', ['10.3390/cli10110161', '10.1016/j.jhydrol.2018.08.035']],
    ['Lakes and evaporation', ['https://www.researchgate.net/publication/304498967']],
    ['Vegetation', ['10.1016/j.rse.2025.115153', '10.1016/j.rse.2025.114825']],
    ['Soil moisture', ['10.1029/2026wr044944', '10.3389/feart.2026.1854083', '10.1016/j.agwat.2024.108918', '10.3390/su132011355']],
    ['Soil drainage', ['10.1016/j.agwat.2024.108918', '10.22059/ijswr.2021.321263.668924', '10.1016/j.jhydrol.2018.08.035']],
    ['Rivers and floods', ['10.1007/s11269-020-02596-3']],
    ['Farms and irrigation', ['10.1016/j.rse.2025.115153', '10.1029/2022wr033342', '10.1109/jstars.2021.3119228', '10.3390/su132011355', '10.1016/j.rse.2019.111226']],
    ['Crops', ['10.1016/j.rse.2025.114825', '10.1016/j.compag.2024.109340', '10.1016/j.isprsjprs.2024.08.018', '10.1016/j.jag.2022.103047']]
  ];
  const SATELLITES = [
    ['SMAP', ['10.3389/feart.2026.1854083', '10.1029/2026wr044944', '10.1016/j.rse.2025.115153', '10.1016/j.agwat.2024.108918', '10.1029/2022wr033342', '10.3390/su132011355', '10.1109/jstars.2021.3119228']],
    ['Sentinel-1', ['10.1016/j.rse.2025.114825', '10.1016/j.isprsjprs.2024.08.018', '10.1016/j.compag.2024.109340', '10.1029/2022wr033342', '10.1016/j.jag.2022.103047', '10.3390/su132011355', '10.1109/jstars.2021.3119228']],
    ['Terra', ['10.3389/feart.2026.1854083', '10.1029/2022wr033342', '10.1109/jstars.2021.3119228']],
    ['Aqua', ['10.1016/j.rse.2025.115153', '10.1029/2022wr033342']],
    ['GPM', ['10.1029/2022wr033342', '10.1109/jstars.2021.3119228']],
    ['Sentinel-2', ['10.1016/j.rse.2025.114825', '10.3390/su132011355']],
    ['GCOM-W (AMSR2)', ['10.1016/j.rse.2019.111226']],
    ['SMOS', ['10.1029/2026wr044944']],
    ['CYGNSS', ['10.1029/2026wr044944']]
  ];
  const OTHER = 'Field data and models';

  const box = document.getElementById('pubs');
  const P = window.Papers;
  if (!box || !P) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const papers = Object.entries(P.PAPERS).map(([key, p]) => ({ ...p, key,
    href: p.url || (/^10\./.test(key) ? 'https://doi.org/' + key : key) }));
  papers.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  const byKey = Object.fromEntries(papers.map(p => [p.key, p]));
  const years = [...new Set(papers.map(p => p.year))];
  const recent = years.filter(y => y > years[0] - RECENT_YEARS);
  const pick = keys => keys.map(k => byKey[k]).filter(Boolean).sort((a, b) => b.year - a.year);
  const withSat = new Set(SATELLITES.flatMap(([, k]) => k));
  const satGroups = SATELLITES.concat([[OTHER, papers.filter(p => !withSat.has(p.key)).map(p => p.key)]]);

  const row = (p, i, list) => {  // in the year list, only the first paper of each year shows the year
    const j = P.JOURNALS[p.journal] || { acr: 'Paper', color: '#3f4c63' };
    const authors = esc(p.authors).replace(/Jalilvand, E\./, '<b>Jalilvand, E.</b>');
    const pdf = p.pdf ? ` <a class="pubs-pdf" href="${esc(p.pdf)}">PDF</a>` : '';
    const yr = view !== 'year' || !i || list[i - 1].year !== p.year ? p.year : '';
    return `<li class="pubs-item${yr && view === 'year' && i ? ' pubs-newyear' : ''}"><span class="pubs-year">${yr}</span><span class="pubs-body">` +
      `<a class="pubs-title" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>` +
      `<span class="pubs-meta"><span class="pubs-chip" style="--jc:${esc(j.color)}" aria-hidden="true">${esc(j.acr)}</span>${authors} <i>${esc(p.journal)}</i>${p.details ? ', ' + esc(p.details) : ''}${p.kind ? ' (' + esc(p.kind.toLowerCase()) + ')' : ''}.${pdf}</span></span></li>`;
  };
  const group = (name, list, open) => `<details class="pubs-group"${open ? ' open' : ''}><summary><span class="pubs-gname">${esc(name)}</span>` +
    `<span class="pubs-gcount">${list.length} ${list.length === 1 ? 'paper' : 'papers'}</span></summary><ol class="pubs-list">${list.map(row).join('')}</ol></details>`;

  const VIEWS = [['year', 'By year'], ['part', 'By water cycle'], ['sat', 'By satellite']];
  box.innerHTML = `<div class="pubs-head"><h2 id="pubs-title">Publications</h2><p class="pubs-count">${papers.length} papers, ${years[years.length - 1]}–${years[0]}</p></div>
    <div class="pubs-main"><div class="pubs-tabs" role="tablist" aria-label="List publications">${VIEWS.map(([k, label]) =>
      `<button type="button" role="tab" id="pubs-tab-${k}" data-view="${k}" aria-controls="pubs-panel">${label}</button>`).join('')}</div>
    <div class="pubs-panel" id="pubs-panel" role="tabpanel"></div>
    <button type="button" class="pubs-all" aria-controls="pubs-panel"></button></div>`;
  const panel = box.querySelector('.pubs-panel'), more = box.querySelector('.pubs-all');
  const tabs = [...box.querySelectorAll('.pubs-tabs button')];
  function render() {
    tabs.forEach(t => { const on = t.dataset.view === view; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'pubs-tab-' + view);
    if (view === 'year') {
      const list = all ? papers : papers.filter(p => recent.includes(p.year));
      panel.innerHTML = `<ol class="pubs-list pubs-by-year">${list.map(row).join('')}</ol>`;
    } else {
      const groups = view === 'part' ? PARTS : satGroups;
      panel.innerHTML = groups.map(([name, keys], i) => group(name, pick(keys), all || i === 0)).join('');
    }
    const showingAll = view === 'year' && all;
    more.hidden = false;
    more.setAttribute('aria-expanded', String(showingAll));
    more.innerHTML = showingAll ? 'Show recent papers only' : `Show all ${papers.length} papers`;
  }
  box.querySelector('.pubs-tabs').addEventListener('click', e => {
    const b = e.target.closest('button[data-view]'); if (!b) return;
    view = b.dataset.view; all = false; render();
  });
  box.querySelector('.pubs-tabs').addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    e.preventDefault();
    const i = (VIEWS.findIndex(v => v[0] === view) + k + VIEWS.length) % VIEWS.length;
    view = VIEWS[i][0]; all = false; render(); tabs[i].focus();
  });
  // Show all: the whole list, by year; pressed again, back to the recent papers
  more.addEventListener('click', () => {
    const was = view === 'year' && all;
    view = 'year'; all = !was; render();
    if (was) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  render();
})();
