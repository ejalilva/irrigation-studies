/* "Why irrigation comes first" (irrigation.html#focus): the human-managed processes start side by side, then move into place around
   irrigation, each showing how it is linked; lines are drawn from irrigation to the processes it touches.
   - It plays once when the diagram comes into view; the button switches between the two views.
   - Hovering a process highlights its line.
   - With reduced motion, and on narrow screens (a plain list), the linked view shows at once. */
(() => {
  'use strict';
  const box = document.getElementById('hx');
  if (!box) return;
  const stage = box.querySelector('.hx-stage'), svg = box.querySelector('.hx-lines'), btn = box.querySelector('.hx-toggle');
  const tiles = [...box.querySelectorAll('.hx-t')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  let played = false;

  // One line from irrigation to each linked process, in the linked layout's pixels.
  const lines = tiles.filter(t => t.classList.contains('is-direct') || t.classList.contains('is-less')).map(t => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('class', 'hx-line' + (t.classList.contains('is-less') ? ' is-less' : ''));
    l.dataset.k = t.dataset.k;
    l.style.setProperty('--d', getComputedStyle(t).getPropertyValue('--d') || 0);
    svg.appendChild(l);
    return [t, l];
  });
  function drawLines() {
    const w = stage.clientWidth;
    const h = parseFloat(getComputedStyle(stage).getPropertyValue('--h-linked')) || stage.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.height = h + 'px';
    const hub = tiles.find(t => t.classList.contains('is-irr'));
    const pos = t => [parseFloat(t.style.getPropertyValue('--x2')) / 100 * w, parseFloat(t.style.getPropertyValue('--y2')) / 100 * h];
    const [cx, cy] = pos(hub);
    lines.forEach(([t, l]) => {
      const [x, y] = pos(t);
      l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', x); l.setAttribute('y2', y);
      l.style.setProperty('--len', Math.ceil(Math.hypot(x - cx, y - cy)));
    });
  }
  let drawnTimer = 0;
  function setPhase(phase) {
    box.dataset.phase = phase;
    clearTimeout(drawnTimer); stage.classList.remove('is-drawn');
    if (phase === 'linked') drawnTimer = setTimeout(() => stage.classList.add('is-drawn'), reduce ? 0 : 2000);
    btn.setAttribute('aria-pressed', String(phase === 'linked'));
    btn.textContent = phase === 'linked' ? 'Show all processes' : 'Show how they link to irrigation';
  }
  btn.addEventListener('click', () => { played = true; setPhase(box.dataset.phase === 'linked' ? 'all' : 'linked'); });

  tiles.forEach(t => {
    t.addEventListener('pointerenter', () => {
      if (box.dataset.phase !== 'linked') return;
      stage.classList.add('has-active');
      tiles.forEach(o => o.classList.toggle('is-on', o === t || o.classList.contains('is-irr')));
      lines.forEach(([o, l]) => l.classList.toggle('is-on', o === t));
    });
    t.addEventListener('pointerleave', () => { stage.classList.remove('has-active'); tiles.forEach(o => o.classList.remove('is-on')); lines.forEach(([, l]) => l.classList.remove('is-on')); });
  });

  drawLines();
  addEventListener('resize', drawLines);
  if (reduce) { setPhase('linked'); return; }
  // Play once: the processes appear side by side, then gather around irrigation.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting) || played) return;
      io.disconnect(); played = true;
      setTimeout(() => setPhase('linked'), 1400);
    }, { threshold: 0.45 });
    io.observe(stage);
  } else setPhase('linked');
})();
