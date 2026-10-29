/* The "Research" menu in the header of every page. A mouse opens it by hovering (CSS); a click or tap on "Research",
   or Enter/Space when it has focus, opens and closes it. Escape, a click elsewhere or leaving it with the keyboard
   closes it. Without this script the menu still opens on hover and on keyboard focus. */
(() => {
  'use strict';
  document.documentElement.classList.add('js-nav');
  document.querySelectorAll('.nav-menu').forEach(menu => {
    const btn = menu.querySelector('.nav-btn');
    if (!btn) return;
    const isOpen = () => menu.classList.contains('open');
    const set = open => { menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
    btn.addEventListener('click', () => set(!isOpen()));
    menu.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') btn.setAttribute('aria-expanded', 'true'); });
    menu.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !isOpen()) btn.setAttribute('aria-expanded', 'false'); });
    menu.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); } });
    menu.addEventListener('focusout', e => { if (!menu.contains(e.relatedTarget)) set(false); });
    menu.querySelectorAll('.nav-sub a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('click', e => { if (isOpen() && !menu.contains(e.target)) set(false); });
  });
})();
