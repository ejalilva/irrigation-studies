/* Cues that invite visitors to click the farm (the center pivot and the river-fed fields), which opens irrigation.html.
   Choose them with data-cue on #explore, or try others with ?cue= in the address (a comma-separated list, or "none"):
     beacon  soft rings pulse out from the center pivot and from the river-fed fields
     tag     a small "Start here" tag bobs above the center pivot
     alive   the farm keeps working at rest (the pivot turns, the pump runs), so it is the one part of the map that moves
     coach   a one-time note beside the farm ("Irrigation is my main focus..."), with a Got it button; dismissed for good once
             closed or once the farm has been hovered or clicked
   Every cue waits while the intro tour plays, steps aside while the farm itself is highlighted, and keeps still with
   reduced motion. Styles in assets/water-cycle.css (search for "Farm cues"). */
(() => {
  'use strict';
  const explore = document.getElementById('explore');
  const farm = document.querySelector('.scene-item[data-topic="human"]');
  const svg = document.querySelector('.water-cycle .landscape');
  if (!explore || !farm || !svg) return;
  const asked = new URLSearchParams(location.search).get('cue');
  const cues = new Set((asked ?? explore.dataset.cue ?? 'beacon,tag').split(',').map(s => s.trim()).filter(c => c && c !== 'none'));
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const body = document.body;
  cues.forEach(c => body.classList.add('has-cue-' + c));

  // Beacon: two rings around the pivot field and one around the river-fed fields, each growing and fading in turn.
  if (cues.has('beacon')) {
    const g = el('g', { class: 'cue-beacon', 'aria-hidden': 'true' });
    [[897, 403, 81, 38, 0], [897, 403, 81, 38, 1.2], [737, 404, 66, 33, .6]].forEach(([cx, cy, rx, ry, d]) => {
      g.append(el('ellipse', { class: 'cue-ring', cx, cy, rx, ry, style: `animation-delay:${d}s` }));
    });
    farm.append(g);
  }
  // Tag: "Start here" just below the pivot field, pointing up at it. It sits on top of the whole map (the lake would hide it
  // inside the farm group) and is a link to the same page the farm opens; hovering it highlights the farm.
  if (cues.has('tag')) {
    const g = el('a', { class: 'cue-tag', href: 'irrigation.html', 'aria-hidden': 'true', tabindex: '-1' });
    const pos = el('g', { transform: 'translate(948 446)' }), inner = el('g', { class: 'cue-tag-bob' });
    inner.append(el('path', { d: 'M-6 -12.5L0 -20L6 -12.5Z' }), el('rect', { x: -44, y: -13, width: 88, height: 26, rx: 13 }));
    const t = el('text', { y: 4.5, 'text-anchor': 'middle' }); t.textContent = 'Start here';
    inner.append(t); pos.append(inner); g.append(pos); svg.append(g);
    g.addEventListener('pointerenter', () => farm.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' })));
    g.addEventListener('pointerleave', () => farm.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' })));
  }
  // Coach mark: an HTML note pinned beside the pivot, shown once the tour is over (or at once if it has been seen before).
  if (cues.has('coach')) {
    const KEY = 'farm-coach-seen-v1';
    const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
    const remember = () => { try { localStorage.setItem(KEY, '1'); } catch (e) {} };
    if (!seen() || asked) {
      const note = document.createElement('div');
      note.className = 'cue-coach'; note.setAttribute('role', 'note'); note.hidden = true;
      note.innerHTML = '<p><strong>Irrigation is my main focus.</strong> Click the farm to see why it matters and how I study it.</p><button type="button">Got it</button>';
      explore.append(note);
      const place = () => {
        const m = svg.getScreenCTM(), box = explore.getBoundingClientRect(); if (!m) return;
        const p = svg.createSVGPoint(); p.x = 897; p.y = 360; const q = p.matrixTransform(m);
        const w = note.offsetWidth || 260;
        const left = Math.max(8, Math.min(q.x - box.left - w + 40, box.width - w - 8));
        note.style.left = left + 'px'; note.style.top = (q.y - box.top) + 'px'; note.style.setProperty('--tip', (q.x - box.left - left) + 'px');
      };
      let closed = false;
      const close = () => { closed = true; note.hidden = true; remember(); };
      const show = () => { if (closed) return; note.hidden = false; place(); };
      note.querySelector('button').addEventListener('click', close);
      farm.addEventListener('pointerenter', close); farm.addEventListener('click', close);
      addEventListener('resize', () => { if (!note.hidden) place(); });
      addEventListener('keydown', e => { if (e.key === 'Escape' && !note.hidden) close(); });
      // Wait for the tour, then a moment more, so the note never talks over it.
      let timer = 0;
      const queue = () => { clearTimeout(timer); if (!body.classList.contains('touring')) timer = setTimeout(show, 900); else note.hidden = true; };
      new MutationObserver(queue).observe(body, { attributes: true, attributeFilter: ['class'] });
      if (document.readyState === 'complete') queue(); else addEventListener('load', queue);
    }
  }
})();
