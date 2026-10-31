/* About page: the publication list, built from the papers in assets/journals.js (window.Papers), newest first and
   grouped by year, with each journal's short name in its colour and Ehsan's name in bold. Only the last RECENT_YEARS
   years (counted back from the newest paper) show at first; a button under the list shows the rest. */
(() => {
  'use strict';
  const RECENT_YEARS = 3;
  const box = document.getElementById('ab-publist'), count = document.getElementById('ab-count');
  const P = window.Papers;
  if (!box || !P) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const papers = Object.entries(P.PAPERS).map(([key, p]) => ({ ...p, key,
    href: p.url || (/^10\./.test(key) ? 'https://doi.org/' + key : key) }));
  papers.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  const years = [...new Set(papers.map(p => p.year))];
  const yearBlock = y => `<div class="ab-year"><h3>${y}</h3><ol>${papers.filter(p => p.year === y).map(p => {
    const j = P.JOURNALS[p.journal] || { acr: 'Paper', color: '#3f4c63' };
    const authors = esc(p.authors).replace(/Jalilvand, E\./, '<b>Jalilvand, E.</b>');
    const pdf = p.pdf ? `<a class="ab-pdf" href="${esc(p.pdf)}">PDF</a>` : '';
    return `<li class="ab-pub"><a class="ab-pub-title" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>` +
      `<p class="ab-pub-meta"><span class="ab-chip" style="--jc:${esc(j.color)}" aria-hidden="true">${esc(j.acr)}</span>${authors} <i>${esc(p.journal)}</i>${p.details ? ', ' + esc(p.details) : ''}${p.kind ? ' (' + esc(p.kind.toLowerCase()) + ')' : ''}.${pdf}</p></li>`;
  }).join('')}</ol></div>`;

  const cutoff = years[0] - RECENT_YEARS + 1;
  const recent = years.filter(y => y >= cutoff), older = years.filter(y => y < cutoff);
  const olderCount = papers.filter(p => p.year < cutoff).length;
  box.innerHTML = recent.map(yearBlock).join('') +
    (older.length ? `<div class="ab-older" id="ab-older" hidden>${older.map(yearBlock).join('')}</div>` : '');
  if (count) count.textContent = `${papers.length} papers, ${years[years.length - 1]}–${years[0]}.`;
  if (!older.length) return;

  const more = document.getElementById('ab-older');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ab-more';
  btn.setAttribute('aria-controls', 'ab-older');
  const set = open => {
    more.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open
      ? 'Show recent papers only <span aria-hidden="true">↑</span>'
      : `Show all ${papers.length} papers <span class="ab-more-n">${olderCount} more, ${older[older.length - 1]}–${older[0]}</span> <span aria-hidden="true">↓</span>`;
  };
  btn.addEventListener('click', () => {
    const open = more.hidden;
    set(open);
    if (!open) btn.scrollIntoView({ block: 'nearest' });
  });
  set(false);
  box.after(btn);
})();
