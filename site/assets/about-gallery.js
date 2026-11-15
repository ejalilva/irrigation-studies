/* Gallery preview on the About page (index.html, the "Gallery" section): a small sample of the gallery, the places in
   data/gallery.json marked "about": true, as a map of the United States with a numbered pin per place and a card per
   place below it, newest first. Places without "about" are on the gallery page only. A pin or a card opens that place in
   the gallery (gallery.html#<id>); pointing at one highlights the other.

   The map is assets/about/us-map.svg (made by scripts/build_us_map.mjs), drawn inline so assets/about.css can colour it
   for light and dark themes. It is projected with d3's geoAlbersUsa (scale 1300, translate 487.5, 305), Alaska and Hawaii
   in the lower left; albersUsa() below projects a place's lat/lon the same way. A place outside the United States still
   gets a card, without a pin.

   From a place in gallery.json the card uses: title; "place", a short location for the card, else "where"; then the
   date, with month names shortened, and the number of photos and the video; and as its picture the photo named in "cover", else the
   first photo that is not "wide", else the video's poster, cropped at the photo's "position" if it has one.

   Pins closer together than NEAR (in the map's 975 x 610 units) sit side by side, west to
   east, centred on their place: each gets --dx, its step left or right, and assets/about.css moves it by --dx pin widths. */
(() => {
  'use strict';
  const box = document.getElementById('ab-gl');
  if (!box) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const W = 975, H = 610;

  // d3-geo's geoAlbersUsa at scale 1300 and translate [487.5, 305]: three conic equal-area projections, each used where
  // its point falls inside its box. Returns [x, y] in the map's 975 x 610 box, or null outside the United States.
  const albersUsa = (() => {
    const R = Math.PI / 180, k = 1300, tx = 487.5, ty = 305;
    const part = (p0, p1, rot, c0, c1, scale, t, ext) => {
      const s0 = Math.sin(p0 * R), n = (s0 + Math.sin(p1 * R)) / 2, c = 1 + s0 * (2 * n - s0), r0 = Math.sqrt(c) / n;
      const raw = (l, p) => { const r = Math.sqrt(c - 2 * n * Math.sin(p)) / n; return [r * Math.sin(l * n), r0 - r * Math.cos(l * n)]; };
      const [cx, cy] = raw(c0 * R, c1 * R);
      return (lon, lat) => {
        let l = (lon + rot) * R;
        if (l > Math.PI) l -= 2 * Math.PI; else if (l < -Math.PI) l += 2 * Math.PI;
        const [x0, y0] = raw(l, lat * R), x = t[0] + scale * (x0 - cx), y = t[1] - scale * (y0 - cy);
        return x >= ext[0] && x <= ext[2] && y >= ext[1] && y <= ext[3] ? [x, y] : null;
      };
    };
    const e = 1e-6;
    const parts = [
      part(29.5, 45.5, 96, -0.6, 38.7, k, [tx, ty], [tx - .455 * k, ty - .238 * k, tx + .455 * k, ty + .238 * k]),
      part(55, 65, 154, -2, 58.5, .35 * k, [tx - .307 * k, ty + .201 * k], [tx - .425 * k + e, ty + .120 * k + e, tx - .214 * k - e, ty + .234 * k - e]),
      part(8, 18, 157, -3, 19.9, k, [tx - .205 * k, ty + .212 * k], [tx - .214 * k + e, ty + .166 * k + e, tx - .115 * k - e, ty + .234 * k - e])
    ];
    return (lon, lat) => { for (const f of parts) { const xy = f(lon, lat); if (xy) return xy; } return null; };
  })();

  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const short = d => String(d || '').replace(/\b(January|February|March|April|June|July|August|September|October|November|December)\b/g, m => m.slice(0, 3));
  // For ordering, newest first: the date's year and its last month ("July–September 2022" counts as September 2022).
  const when = d => {
    const s = String(d || '').toLowerCase(), y = +(s.match(/\d{4}(?!.*\d{4})/) || [0])[0];
    let m = 0; MONTHS.forEach((name, i) => { if (s.includes(name)) m = i + 1; });
    return y * 12 + m;
  };
  // "7 photos and 3 videos" (clips among the photos count as videos); a place with one video and nothing else: "Video".
  const count = p => {
    const n = p.photos.filter(f => !f.video).length, v = (p.video ? 1 : 0) + p.photos.filter(f => f.video).length;
    const photos = n ? `${n} ${n === 1 ? 'photo' : 'photos'}` : '', videos = v ? `${v} ${v === 1 ? 'video' : 'videos'}` : '';
    return !n && v === 1 ? 'Video' : [photos, videos].filter(Boolean).join(' and ');
  };
  const coverPhoto = p => (p.cover && p.photos.find(f => f.file === p.cover)) || p.photos.find(f => !f.wide) || p.photos[0];
  const cover = p => { const photo = coverPhoto(p); return photo ? `assets/gallery/${photo.file}-sm.webp` : (p.video && p.video.poster) || ''; };
  const coverPos = p => { const photo = coverPhoto(p); return photo && photo.position ? ` style="object-position:${esc(photo.position)}"` : ''; };
  const NEAR = 20;
  const PLAY = '<span class="ab-gl-play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M5 3l8 5-8 5z"/></svg></span>';
  const KINDS = { field: 'Field campaign', visit: 'Research visit', talk: 'Talk' };
  const kind = p => (KINDS[p.kind] ? p.kind : 'field');

  Promise.all([
    fetch('data/gallery.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    fetch('assets/about/us-map.svg').then(r => r.ok ? r.text() : '')
  ]).then(([data, svg]) => {
    const places = (data.places || []).map((p, i) => ({ ...p, photos: p.photos || [], i })).filter(p => p.about)
      .sort((a, b) => when(b.date) - when(a.date) || a.i - b.i);
    if (!places.length) return;
    const kinds = Object.keys(KINDS).filter(k => places.some(p => kind(p) === k));
    const at = places.map(p => albersUsa(+p.lon, +p.lat));
    const dx = places.map(() => 0), groups = [];
    at.forEach((xy, i) => {
      if (!xy) return;
      const g = groups.find(g => g.some(j => Math.hypot(at[j][0] - xy[0], at[j][1] - xy[1]) < NEAR));
      g ? g.push(i) : groups.push([i]);
    });
    groups.forEach(g => g.sort((a, b) => at[a][0] - at[b][0]).forEach((i, k) => { dx[i] = k - (g.length - 1) / 2; }));
    const pins = places.map((p, n) => {
      const xy = at[n];
      if (!xy) return '';
      return `<a class="ab-gl-pin k-${kind(p)}" href="gallery.html#${encodeURIComponent(p.id)}" data-id="${esc(p.id)}" ` +
        `style="left:${(xy[0] / W * 100).toFixed(2)}%;top:${(xy[1] / H * 100).toFixed(2)}%${dx[n] ? `;--dx:${dx[n]}` : ''}" ` +
        `aria-label="${n + 1}. ${esc(p.title)}, ${esc(p.place || p.where)}">${n + 1}</a>`;
    }).join('');
    const cards = places.map((p, n) => `<li><a class="ab-gl-card" href="gallery.html#${encodeURIComponent(p.id)}" data-id="${esc(p.id)}">` +
      `<span class="ab-gl-pic"><img src="${esc(cover(p))}" alt=""${coverPos(p)} loading="lazy" decoding="async">` +
      `<span class="ab-gl-num k-${kind(p)}" aria-hidden="true">${n + 1}</span>${p.photos.length ? '' : PLAY}</span>` +
      `<span class="ab-gl-text"><span class="ab-gl-title">${esc(p.title)}</span>` +
      `<span class="ab-gl-meta">${esc(p.place || p.where)}<br>${[esc(short(p.date)), count(p)].filter(Boolean).join(' · ')}</span></span></a></li>`).join('');
    box.innerHTML = `<div class="ab-gl-panel"><ul class="ab-gl-key" aria-label="Pins">${kinds.map(k =>
        `<li><span class="ab-gl-dot k-${k}" aria-hidden="true"></span>${KINDS[k]}</li>`).join('')}</ul>` +
      `<div class="ab-gl-map">${svg}${pins}</div></div><ol class="ab-gl-places">${cards}</ol>`;
    // Pointing at a pin highlights its card, and the other way round.
    const mark = (id, on) => box.querySelectorAll(`[data-id="${CSS.escape(id)}"]`).forEach(el => el.classList.toggle('is-on', on));
    box.addEventListener('pointerover', e => { const el = e.target.closest('[data-id]'); if (el) mark(el.dataset.id, true); });
    box.addEventListener('pointerout', e => { const el = e.target.closest('[data-id]'); if (el && !el.contains(e.relatedTarget)) mark(el.dataset.id, false); });
    box.addEventListener('focusin', e => { const el = e.target.closest('[data-id]'); if (el) mark(el.dataset.id, true); });
    box.addEventListener('focusout', e => { const el = e.target.closest('[data-id]'); if (el) mark(el.dataset.id, false); });
  }).catch(() => { /* the section keeps its text and the Open the gallery link */ });
})();
