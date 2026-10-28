/* About page: the publication list, built from the papers in assets/journals.js (window.Papers), newest first and
   grouped by year, with each journal's short name in its colour and Ehsan's name in bold. */
(() => {
  'use strict';
  const box = document.getElementById('ab-publist'), count = document.getElementById('ab-count');
  const P = window.Papers;
  if (!box || !P) return;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const papers = Object.entries(P.PAPERS).map(([key, p]) => ({ ...p, key,
    href: p.url || (/^10\./.test(key) ? 'https://doi.org/' + key : key) }));
  papers.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  const years = [...new Set(papers.map(p => p.year))];
  box.innerHTML = years.map(y => `<div class="ab-year"><h3>${y}</h3><ol>${papers.filter(p => p.year === y).map(p => {
    const j = P.JOURNALS[p.journal] || { acr: 'Paper', color: '#3f4c63' };
    const authors = esc(p.authors).replace(/Jalilvand, E\./, '<b>Jalilvand, E.</b>');
    const pdf = p.pdf ? `<a class="ab-pdf" href="${esc(p.pdf)}">PDF</a>` : '';
    return `<li class="ab-pub"><a class="ab-pub-title" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>` +
      `<p class="ab-pub-meta"><span class="ab-chip" style="--jc:${esc(j.color)}" aria-hidden="true">${esc(j.acr)}</span>${authors} <i>${esc(p.journal)}</i>${p.details ? ', ' + esc(p.details) : ''}${p.kind ? ' (' + esc(p.kind.toLowerCase()) + ')' : ''}.${pdf}</p></li>`;
  }).join('')}</ol></div>`).join('');
  if (count) count.textContent = `${papers.length} papers, ${years[years.length - 1]}–${years[0]}.`;
})();
