/* Study cards that come alive: the Water cycle and Satellites cards under My studies on the About page (index.html).

   Each card with data-live plays while it is "active":
   - on a hover (or keyboard focus), for as long as the pointer stays; hovering one card rests the others;
   - when it scrolls into view, for one round (ROUND below), then it rests; scrolling away and back plays another round.
   With reduced motion nothing plays and the cards keep their still pictures.

   The cards:
   - data-live="water-cycle": the real water-cycle map of research.html, fetched when the card nears the screen and drawn
     without its labels. It plays a short tour, each part in badge order, as the Play tour button on that page does,
     with the part's name in a chip. Its animations come from assets/water-cycle.css (loaded with it).
   - data-live="satellites": the orbit of satellites.html in miniature, drawn on a canvas: the satellites in launch
     order turn around the ring, and the Earth turns under its clouds (the same shading as that page's globe, here
     drawn without WebGL). Pictures in assets/about/: sat-sky.webp (the Milky Way photo and its stars), sat-sprites.webp
     (the 13 satellites, in RING order, 5 to a row), earth-card.webp (Blue Marble with clouds) and earth-card-glint.webp
     (open water, where the sun glints), made from that page's pictures by scripts/build_card_pictures.py.
   */
(() => {
  'use strict';
  const cards = [...document.querySelectorAll('[data-live]')];
  if (!cards.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ROUND = { 'water-cycle': 0, satellites: 22000 };  // 0: the card's own length (one tour)
  let hovered = null;

  const live = new Map();
  cards.forEach(card => {
    const kind = card.dataset.live;
    const make = kind === 'water-cycle' ? waterCycle : kind === 'satellites' ? satellites : null;
    if (!make) return;
    const c = { card, kind, ctl: make(card), visible: false, roundUntil: 0, timer: 0, playing: false, loading: null };
    live.set(card, c);
  });

  function update(c) {
    const now = performance.now();
    const want = !reduced.matches && !document.hidden && c.ready &&
      (hovered === c.card || (!hovered && c.visible && now < c.roundUntil));
    if (want !== c.playing) { c.playing = want; want ? c.ctl.play() : c.ctl.pause(); }
    clearTimeout(c.timer);
    if (want && hovered !== c.card) c.timer = setTimeout(() => update(c), c.roundUntil - now + 20);
  }
  const updateAll = () => live.forEach(update);
  const startRound = c => { c.roundUntil = performance.now() + (ROUND[c.kind] || c.ctl.roundMs?.() || 12000); update(c); };
  const load = c => {
    if (!c.loading) c.loading = Promise.resolve(c.ctl.load()).then(() => { c.ready = true; if (c.visible) startRound(c); else update(c); }).catch(() => {});
    return c.loading;
  };

  // Near the screen: get the card ready. In view (at least half of it): play a round.
  const near = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(live.get(e.target)); near.unobserve(e.target); } }), { rootMargin: '400px 0px' });
  const seen = new IntersectionObserver(es => es.forEach(e => {
    const c = live.get(e.target); if (!c) return;
    const vis = e.intersectionRatio >= 0.5;
    if (vis && !c.visible) { c.visible = true; startRound(c); }
    else if (!vis && e.intersectionRatio === 0 && c.visible) { c.visible = false; update(c); }
  }), { threshold: [0, 0.5] });
  live.forEach(c => {
    near.observe(c.card); seen.observe(c.card);
    const on = () => { hovered = c.card; load(c); updateAll(); };
    const off = () => { if (hovered === c.card) { hovered = null; updateAll(); } };
    c.card.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') on(); });
    c.card.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') off(); });
    c.card.addEventListener('focusin', () => { if (c.card.matches(':focus-visible')) on(); });
    c.card.addEventListener('focusout', off);
  });
  document.addEventListener('visibilitychange', updateAll);
  reduced.addEventListener?.('change', updateAll);

  /* ---- The water-cycle map ---- */
  function waterCycle(card) {
    const pic = card.querySelector('.ab-rs-pic');
    const cap = document.createElement('span');
    cap.className = 'ab-live-cap'; cap.setAttribute('aria-hidden', 'true');
    let svg = null, steps = [], at = 0, timer = 0, sped = [];
    const NAMES = { snow: 'Snow & frozen ground', human: 'Human-driven processes', rain: 'Rain & runoff', flood: 'Runoff & rivers',
      lake: 'Lakes', vegetation: 'Vegetation & ET', soil: 'Soil moisture', drainage: 'Drainage' };
    const css = () => new Promise(res => {
      if (document.querySelector('link[data-wc-css]')) return res();
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = 'assets/water-cycle.css?v=ce0f7e208d'; l.dataset.wcCss = '';
      l.onload = l.onerror = () => res(); document.head.append(l);
    });
    async function load() {
      const [html] = await Promise.all([fetch('research.html').then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }), css()]);
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const src = doc.querySelector('svg.landscape');
      if (!src) throw new Error('no map');
      // A picture inside a link: no titles, nothing to focus, no callout, no "Start here" cue.
      src.querySelectorAll('title, desc, .hint-panel, [class^="cue"], [class*=" cue"], foreignObject').forEach(el => el.remove());
      src.querySelectorAll('[tabindex], [role], [aria-label], [aria-haspopup], [aria-labelledby]').forEach(el => {
        ['tabindex', 'role', 'aria-label', 'aria-haspopup', 'aria-labelledby'].forEach(a => el.removeAttribute(a));
      });
      // Its ids get a prefix so they can't clash with anything else on the page.
      let text = src.outerHTML.replace(/\bid="([^"]+)"/g, 'id="wc-$1"').replace(/url\(#([^)]+)\)/g, 'url(#wc-$1)').replace(/href="#([^"]+)"/g, 'href="#wc-$1"');
      const box = document.createElement('span');
      box.className = 'ab-wc-map';
      box.innerHTML = text;
      svg = box.firstElementChild;
      svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      svg.setAttribute('viewBox', '222 150 860 538'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      // Tour steps, as on the research page: the badge order, with a part that has data-tour-with playing inside that step.
      const items = [...svg.querySelectorAll('.scene-item[data-topic]')];
      const num = k => +(svg.querySelector(`.scene-item[data-topic="${k}"] .numtext`)?.textContent || 99);
      const keys = [...new Set(items.map(e => e.dataset.topic))].sort((a, b) => num(a) - num(b));
      const withOf = k => svg.querySelector(`.scene-item[data-topic="${k}"]`)?.dataset.tourWith;
      steps = keys.filter(k => !withOf(k)).map(k => [k, ...keys.filter(o => withOf(o) === k)]);
      pic.append(box, cap);
      requestAnimationFrame(() => pic.classList.add('is-live'));
    }
    const els = key => [...svg.querySelectorAll(`.scene-item[data-topic="${key}"]`),
      ...[...svg.querySelectorAll('[data-link]')].filter(el => el.dataset.link.split(' ')[0] === key)];
    const cycle = a => { const d = a.effect?.getTiming().duration; return typeof d === 'number' ? d : 0; };
    function stepMs(i) {
      const key = steps[i][0], fixed = +(svg.querySelector(`.scene-item[data-topic="${key}"]`)?.dataset.tourStep || 0);
      const anims = steps[i].flatMap(els).flatMap(el => el.getAnimations({ subtree: true }));
      return fixed || Math.min(3200, Math.max(1800, Math.max(0, ...anims.map(cycle)) / 3));
    }
    function show(i) {
      sped.forEach(a => { a.playbackRate = 1; }); sped = [];
      at = i % steps.length;
      const step = steps[at], ms = stepMs(at);
      svg.querySelectorAll('.scene-item').forEach(el => el.classList.toggle('active', step.includes(el.dataset.topic)));
      svg.querySelectorAll('[data-link]').forEach(el => el.classList.toggle('link-run', step.includes(el.dataset.link.split(' ')[0])));
      const anims = [...new Set(step.flatMap(els).flatMap(el => el.getAnimations({ subtree: true })))];
      anims.forEach(a => { a.playbackRate = Math.min(4, Math.max(1, cycle(a) / ms)); a.currentTime = 0; });
      sped = anims;
      const n = svg.querySelector(`.scene-item[data-topic="${step[0]}"] .numtext`)?.textContent || '';  // the part's badge on the map
      cap.innerHTML = `<b>${n}</b>${NAMES[step[0]] || step[0]}`;
      cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in');
      return ms;
    }
    const run = i => { const ms = show(i); timer = setTimeout(() => run(at + 1), ms); };
    return {
      load,
      roundMs: () => steps.reduce((t, s, i) => t + stepMs(i), 0) || 20000,
      play() { pic.classList.remove('is-paused'); clearTimeout(timer); run(at); },
      pause() { clearTimeout(timer); pic.classList.add('is-paused'); at = (at + 1) % (steps.length || 1); }
    };
  }

  /* ---- The satellites around the Earth ---- */
  function satellites(card) {
    const pic = card.querySelector('.ab-rs-pic');
    // In launch order, as on satellites.html; size enlarges thin or sparse pictures there too.
    const RING = [['Terra', 1], ['Aqua', 1], ['SMOS', 1.15], ['GCOM-W', 1.15], ['Landsat', 1], ['GPM', 1.2], ['Sentinel-1', 1],
      ['SMAP', 1.35], ['Sentinel-2', 1], ['CYGNSS', 1.15], ['ISS', 1.05], ['GOSAT-GW', 1.1], ['NISAR', 1.45]];
    const N = RING.length, STEP = 2 * Math.PI / N, CW = 240, CH = 192;
    const img = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
    let canvas, g, W = 0, H = 0, dpr = 1, sprites, globe = null, raf = 0, last = 0, speed = 0, target = 0;
    let pos = 7 - N / 4, spin = -45 * Math.PI / 180;   // SMAP comes round to the front; the globe opens on Lake Urmia
    let tex = null, glint = null;

    async function load() {
      const [sky, sp, day, gl] = await Promise.all([img('assets/about/sat-sky.webp?v=988ea40c86'), img('assets/about/sat-sprites.webp?v=f046d83b9b'),
        img('assets/about/earth-card.webp?v=ad73da0477'), img('assets/about/earth-card-glint.webp?v=86f927899c')]);
      sprites = sp;
      const pix = (im) => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0); return { w: c.width, h: c.height, d: x.getImageData(0, 0, c.width, c.height).data }; };
      tex = pix(day); glint = pix(gl);
      canvas = document.createElement('canvas');
      canvas.className = 'ab-sat-canvas'; canvas.setAttribute('aria-hidden', 'true');
      pic.style.setProperty('--sky', `url("${sky.src}")`);
      pic.append(canvas);
      g = canvas.getContext('2d');
      new ResizeObserver(() => { size(); frame(); }).observe(pic);
      size(); frame();
      requestAnimationFrame(() => pic.classList.add('is-live'));
    }
    let cx, cy, Rx, Ry, ER, SW;
    function size() {
      const r = pic.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      cx = W / 2; cy = H * 0.43; Rx = W * 0.42; Ry = H * 0.28; ER = H * 0.205; SW = W * 0.2;
      globe = makeGlobe(Math.round(ER * dpr));
    }

    // The globe, shaded as on satellites.html (sunlit from the upper left, a rim of atmosphere, the sun's glint on the
    // sea). Everything that does not change as it turns is worked out once per size; each frame only looks up the map.
    function makeGlobe(R) {
      const tilt = 22 * Math.PI / 180, ct = Math.cos(tilt), st = Math.sin(tilt);
      const L = (() => { const v = [-0.6, 0.38, 0.7], m = Math.hypot(...v); return v.map(x => x / m); })();
      const H2 = (() => { const v = [L[0], L[1], L[2] + 1], m = Math.hypot(...v); return v.map(x => x / m); })();
      const halo = Math.max(3, R * 0.05), ext = Math.ceil(halo * 5), D = 2 * (R + ext), n = D * D;
      const u0 = new Float32Array(n), row = new Int32Array(n), shade = new Float32Array(n), spec = new Float32Array(n);
      const rim = new Float32Array(n * 3), alpha = new Float32Array(n), edge = new Float32Array(n), base = new Uint8ClampedArray(n * 4), inside = new Uint8Array(n);
      const TW = tex.w, TH = tex.h;
      for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
        const k = y * D + x, px = (x + 0.5 - D / 2) / R, py = -(y + 0.5 - D / 2) / R;
        const rr = px * px + py * py, r = Math.sqrt(rr);
        const nh = [px / Math.max(r, 1e-4), py / Math.max(r, 1e-4)];
        const hal = Math.exp(-Math.max(0, (r - 1) * R) / halo) * 0.75 * Math.min(1, Math.max(0, (nh[0] * L[0] + nh[1] * L[1]) * 0.9 + 0.35));
        let a = 0;
        if (r < 1) {
          const z = Math.sqrt(1 - rr);
          const yw = py * ct + z * st, zw = -py * st + z * ct;
          const lat = Math.asin(Math.max(-1, Math.min(1, yw))), lon = Math.atan2(px, zw);
          u0[k] = (lon + Math.PI) / (2 * Math.PI) * TW;
          row[k] = Math.min(TH - 1, Math.max(0, Math.floor((Math.PI / 2 - lat) / Math.PI * TH)));
          const d = px * L[0] + py * L[1] + z * L[2];
          const t = Math.min(1, Math.max(0, (d + 0.12) / 0.34)), dayf = t * t * (3 - 2 * t);
          shade[k] = 0.02 + dayf * (0.3 + 0.7 * Math.pow(Math.max(d, 0), 0.75));
          spec[k] = dayf * Math.pow(Math.max(px * H2[0] + py * H2[1] + z * H2[2], 0), 60);
          const rimk = Math.pow(1 - z, 2.6) * (0.25 + 0.75 * dayf);
          rim[k * 3] = 0.27 * rimk; rim[k * 3 + 1] = 0.53 * rimk; rim[k * 3 + 2] = 1.0 * rimk;
          a = Math.min(1, Math.max(0, (1 - r) * R / 1.25));
          inside[k] = 1;
        }
        alpha[k] = a;
        // The halo alone (outside the globe, and under its anti-aliased edge).
        const A2 = a + hal * (1 - a);
        if (!inside[k] && A2 > 0.002) {
          base[k * 4] = 0.36 * 255 * hal / A2; base[k * 4 + 1] = 0.62 * 255 * hal / A2; base[k * 4 + 2] = 255 * hal / A2; base[k * 4 + 3] = A2 * 255;
        }
        else if (inside[k]) edge[k] = hal;  // the halo under the globe's anti-aliased edge, mixed in drawGlobe()
      }
      const off = document.createElement('canvas'); off.width = off.height = D;
      const ox = off.getContext('2d'), out = ox.createImageData(D, D);
      return { R, D, ext, n, u0, row, shade, spec, rim, alpha, edge, base, inside, off, ox, out };
    }
    function drawGlobe() {
      const G = globe, T = tex.d, TW = tex.w, GW = glint.w, GD = glint.d, o = G.out.data, sh = spin / (2 * Math.PI) * TW;
      o.set(G.base);
      for (let k = 0; k < G.n; k++) {
        if (!G.inside[k]) continue;
        let u = Math.floor(G.u0[k] - sh) % TW; if (u < 0) u += TW;
        const v = G.row[k], ti = (v * TW + u) * 4, gi = ((v >> 1) * GW + (u >> 1)) * 4;
        const s = G.shade[k], sp = G.spec[k] * GD[gi] / 255, a = G.alpha[k];
        let r = T[ti] * s + 209 * sp + G.rim[k * 3] * 255, gg = T[ti + 1] * s + 204 * sp + G.rim[k * 3 + 1] * 255, b = T[ti + 2] * s + 189 * sp + G.rim[k * 3 + 2] * 255;
        if (a < 1) {  // the edge: blend with the halo, as the shader does
          const hal = G.edge[k], A2 = a + hal * (1 - a);
          r = (r * a + 0.36 * 255 * hal * (1 - a)) / A2; gg = (gg * a + 0.62 * 255 * hal * (1 - a)) / A2; b = (b * a + 255 * hal * (1 - a)) / A2;
          o[k * 4 + 3] = A2 * 255;
        } else o[k * 4 + 3] = 255;
        o[k * 4] = r; o[k * 4 + 1] = gg; o[k * 4 + 2] = b;
      }
      G.ox.putImageData(G.out, 0, 0);
    }

    function state(i) {
      let a = (i - pos) * STEP; a = Math.atan2(Math.sin(a), Math.cos(a));
      const d = Math.cos(a), t = (d + 1) / 2;
      return { i, x: cx + Rx * Math.sin(a), y: cy + Ry * d, d, s: 0.3 + 0.7 * Math.pow(t, 5), o: 0.45 + 0.55 * t };
    }
    function ring(front) {
      g.save(); g.beginPath();
      g.ellipse(cx, cy, Rx, Ry, 0, front ? 0 : Math.PI, front ? Math.PI : 2 * Math.PI);
      g.lineWidth = 1; g.strokeStyle = front ? 'rgba(255,255,255,.32)' : 'rgba(255,255,255,.16)';
      if (!front) g.setLineDash([2, 6]);
      g.stroke(); g.restore();
    }
    function sat(st) {
      const [, size] = RING[st.i], w = SW * size * st.s, h = w * 0.8, k = st.i;
      g.globalAlpha = st.o;
      g.drawImage(sprites, (k % 5) * CW, Math.floor(k / 5) * CH, CW, CH, st.x - w / 2, st.y - h * 0.62, w, h);
      g.globalAlpha = 1;
    }
    function label(st) {
      const fs = Math.max(9, Math.min(11.5, W * 0.021)), text = RING[st.i][0];
      g.font = `600 ${fs}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
      const tw = g.measureText(text).width, ph = fs * 1.45, y = st.y + SW * RING[st.i][1] * st.s * 0.8 * 0.38 + 4;
      // Names on the near side of the ring only, fading in as each satellite comes round, so the picture stays calm.
      const vis = Math.min(1, Math.max(0, (st.d + 0.3) / 0.45));
      if (!vis) return;
      g.globalAlpha = vis * (0.55 + 0.45 * ((st.d + 1) / 2));
      g.fillStyle = 'rgba(6,12,26,.66)';
      g.beginPath(); g.roundRect(st.x - tw / 2 - 6, y, tw + 12, ph, ph / 2); g.fill();
      g.fillStyle = '#e6edf6'; g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillText(text, st.x, y + ph / 2 + 0.5);
      g.globalAlpha = 1;
    }
    function frame() {
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      const all = RING.map((_, i) => state(i)).sort((a, b) => a.d - b.d);
      ring(false);
      all.filter(s => s.d < 0).forEach(sat);
      drawGlobe();
      const G = globe;
      g.drawImage(G.off, cx - (G.D / 2) / dpr, cy - (G.D / 2) / dpr, G.D / dpr, G.D / dpr);
      ring(true);
      all.filter(s => s.d >= 0).forEach(sat);
      all.forEach(label);
    }
    // One satellite every 5 s round the ring, the Earth once every 40 s; it speeds up and slows down smoothly.
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      speed += (target - speed) * Math.min(1, dt * 2.5);
      pos += speed * dt / 5; spin += speed * dt * 2 * Math.PI / 40;
      frame();
      if (target > 0 || speed > 0.01) raf = requestAnimationFrame(tick); else { speed = 0; raf = 0; }
    }
    return {
      load,
      play() { target = 1; if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } },
      pause() { target = 0; }
    };
  }
})();
