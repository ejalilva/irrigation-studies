/* The header menu on every page (About, Research, My journey, Gallery, Contact) is plain links; Research opens the water
   cycle (index.html). This file adds the Contact panel. */

/* Contact: the "Contact" link (and the email icons) open a panel on the right. On wide screens it pushes the page
   left so both stay in view; on narrow screens it slides over the page. The panel has the address with a Copy
   button, ways to write, and the profile links. Without this script the links stay plain mailto: links.
   about.html#contact (or any page + #contact) opens it directly. */
(() => {
  'use strict';
  const EMAIL = 'ehsan.jalilvand@gmail.com';
  const ICONS = 'assets/icons.svg?v=2026-10-28a';
  const PROFILES = [
    ['Google Scholar', 'https://scholar.google.com/citations?user=RsLEzG0AAAAJ&hl=en', 'i-scholar'],
    ['ResearchGate', 'https://www.researchgate.net/profile/Ehsan-Jalilvand', 'i-researchgate'],
    ['GitHub', 'https://github.com/ejalilva', 'i-github'],
    ['LinkedIn', 'https://www.linkedin.com/in/ehsan-jalilvand-1699534a/', 'i-linkedin'],
    ['YouTube', 'https://www.youtube.com/channel/UC6SyjY2pXoI0UK1tfY7uxcw', 'i-youtube']
  ];
  const triggers = () => [...document.querySelectorAll(`a[href^="mailto:${EMAIL}"]`)].filter(a => !a.closest('.cp'));
  if (!triggers().length) return;

  const panel = document.createElement('aside');
  panel.className = 'cp';
  panel.id = 'contact-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'cp-title');
  panel.innerHTML = `
    <div class="cp-head">
      <img class="cp-ej" src="assets/ej-64.png?v=2026-10-30a" alt="" width="40" height="40">
      <div><p class="cp-kick">Contact</p><h2 id="cp-title">Get in touch</h2></div>
      <button type="button" class="cp-close" aria-label="Close contact panel">×</button>
    </div>
    <p class="cp-lead">For collaborations, talks, or questions about my papers, data and code, email is the best way to reach me.</p>
    <div class="cp-mail">
      <a class="cp-addr" href="mailto:${EMAIL}">${EMAIL}</a>
      <button type="button" class="cp-copy" aria-live="polite">Copy</button>
    </div>
    <div class="cp-actions">
      <a class="cp-btn cp-primary" href="mailto:${EMAIL}">Write an email</a>
      <a class="cp-btn" href="https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}" target="_blank" rel="noopener">Open in Gmail <span aria-hidden="true">↗</span></a>
    </div>
    <h3 class="cp-h">Elsewhere</h3>
    <ul class="cp-links">${PROFILES.map(([name, url, icon]) =>
      `<li><a href="${url}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="${ICONS}#${icon}"/></svg><span>${name}</span><span class="cp-out" aria-hidden="true">↗</span></a></li>`).join('')}</ul>
    <p class="cp-where">Hydrological Sciences Laboratory<br>NASA Goddard Space Flight Center<br>Greenbelt, Maryland</p>`;
  const shade = document.createElement('div');
  shade.className = 'cp-shade';
  document.body.append(shade, panel);

  const html = document.documentElement;
  const wide = matchMedia('(min-width: 1000px)');
  let opener = null, inerted = [];
  const isOpen = () => panel.classList.contains('open');
  const setInert = on => {
    inerted.forEach(el => { el.inert = false; });
    inerted = on ? [...document.body.children].filter(el => el !== panel && el !== shade && !el.inert) : [];
    inerted.forEach(el => { el.inert = true; });
  };
  const open = from => {
    opener = from || document.activeElement;
    panel.classList.add('open');
    html.classList.add(wide.matches ? 'cp-push' : 'cp-over');
    if (!wide.matches) setInert(true);
    panel.querySelector('.cp-close').focus({ preventScroll: true });
  };
  const close = () => {
    if (!isOpen()) return;
    panel.classList.remove('open');
    html.classList.remove('cp-push', 'cp-over');
    setInert(false);
    if (location.hash === '#contact') history.replaceState(null, '', location.pathname + location.search);
    opener?.focus?.({ preventScroll: true });
  };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="mailto:"]');
    if (a && !a.closest('.cp') && a.getAttribute('href').startsWith(`mailto:${EMAIL}`) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      isOpen() ? close() : open(a);
    }
  });
  panel.querySelector('.cp-close').addEventListener('click', close);
  shade.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  wide.addEventListener('change', () => { if (isOpen()) { close(); } });
  const copy = panel.querySelector('.cp-copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(EMAIL); }
    catch { const r = document.createRange(); r.selectNodeContents(panel.querySelector('.cp-addr')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); }
    copy.textContent = 'Copied';
    copy.classList.add('done');
    setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('done'); }, 1800);
  });
  if (location.hash === '#contact') open(triggers()[0]);
  window.addEventListener('hashchange', () => { if (location.hash === '#contact') open(triggers()[0]); });
})();
