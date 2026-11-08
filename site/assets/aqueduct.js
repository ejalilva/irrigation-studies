/* WRI Aqueduct's water-stress map on the irrigation page (irrigation.html, "Climate change makes it worse"), embedded
   with Tableau's Embedding API (the <tableau-viz> element), as wide as the text.

   The dashboard on Tableau Public has a fixed size, smaller than the text is wide, so it is drawn at its own size and
   scaled to fill the width (and the frame's height follows). Its size comes from Tableau once the map is ready
   (workbook.activeSheet.size); until then 800 x 600 is assumed. A dashboard that sizes itself (automatic) is given
   the full width at 4:3 instead. Tableau's script loads only as the map nears the screen. */
(() => {
  'use strict';
  const frame = document.getElementById('aqueduct');
  if (!frame) return;
  const box = frame.querySelector('.ir-tableau-scale'), viz = frame.querySelector('tableau-viz');
  if (!box || !viz) return;
  const API = 'https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js';
  let W = Number(viz.getAttribute('width')) || 800, H = Number(viz.getAttribute('height')) || 600, auto = false;

  function size(w, h) {
    viz.setAttribute('width', w); viz.setAttribute('height', h);
    viz.style.width = w + 'px'; viz.style.height = h + 'px';
    const f = viz.querySelector('iframe') || (viz.shadowRoot && viz.shadowRoot.querySelector('iframe'));
    if (f) { f.style.width = w + 'px'; f.style.height = h + 'px'; }
  }
  function fit() {
    const cw = frame.clientWidth;
    if (!cw) return;
    if (auto) {
      const h = cw < 500 ? 727 : Math.round(cw * 0.75);
      box.style.transform = ''; box.style.width = cw + 'px'; box.style.height = h + 'px';
      size(cw, h); frame.style.height = h + 'px';
      return;
    }
    const s = cw / W;
    box.style.width = W + 'px'; box.style.height = H + 'px'; box.style.transform = `scale(${s})`;
    frame.style.height = Math.round(H * s) + 'px';
  }
  viz.addEventListener('firstinteractive', () => {
    frame.classList.add('is-ready');
    try {
      const sz = viz.workbook.activeSheet.size;
      if (sz && sz.behavior === 'automatic') auto = true;
      else if (sz && sz.maxSize && sz.maxSize.width && sz.maxSize.height) { W = sz.maxSize.width; H = sz.maxSize.height; size(W, H); }
    } catch (e) { /* keep the assumed size */ }
    fit();
  });
  new ResizeObserver(fit).observe(frame);
  size(W, H); fit();

  const load = () => {
    if (document.querySelector(`script[src="${API}"]`)) return;
    const s = document.createElement('script');
    s.type = 'module'; s.src = API;
    s.onerror = () => frame.classList.add('is-failed');
    document.head.append(s);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '800px 0px' });
    io.observe(frame);
  } else load();
})();
