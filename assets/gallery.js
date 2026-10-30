/* Gallery (gallery.html): a map with a pin for every place in data/gallery.json. Picking a pin, or a place in the list under
   the map, opens that place's pictures in a panel beside the map; a picture opens large in the viewer, with its caption,
   previous/next and Escape to close. Leaflet is in assets/vendor/leaflet/; the map tiles are OpenStreetMap's standard tiles
   (no key needed; dark mode darkens them with a CSS filter in assets/gallery.css).
   Without JavaScript the place list still links to every picture. */
(() => {
  'use strict';
  const mapBox = document.getElementById('gl-map');
  const panel = document.getElementById('gl-panel');
  const list = document.getElementById('gl-places');
  const viewer = document.getElementById('gl-viewer');
  if (!mapBox || !panel || !list) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const src = (p, small) => `assets/gallery/${p.file}${small ? '-sm' : ''}.webp`;

  fetch('data/gallery.json', { cache: 'no-cache' }).then(r => r.json()).then(data => {
    const places = data.places || [];
    let current = null, map = null;
    const pins = new Map();

    // The list under the map: one button per place.
    list.innerHTML = places.map(p => `<li><button type="button" class="gl-place k-${esc(p.kind || 'field')}" data-id="${esc(p.id)}" aria-controls="gl-panel" aria-expanded="false"><span class="gl-place-dot" aria-hidden="true"></span><span class="gl-place-t">${esc(p.title)}</span><span class="gl-place-m">${esc(p.where)} · ${esc(p.date)} · ${p.photos.length} ${p.photos.length === 1 ? 'picture' : 'pictures'}</span></button></li>`).join('');

    if (window.L) {
      map = L.map(mapBox, { scrollWheelZoom: false, worldCopyJump: true, zoomSnap: .25, attributionControl: true });
      // CARTO's basemaps now answer with "API key required" tiles, so the map uses OpenStreetMap's own tiles.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
      places.forEach(p => {
        const icon = L.divIcon({ className: '', html: `<span class="gl-pin k-${esc(p.kind || 'field')}"><b>${p.photos.length}</b></span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
        const m = L.marker([p.lat, p.lon], { icon, title: `${p.title}, ${p.where}`, alt: `${p.title}, ${p.where}`, keyboard: true, riseOnHover: true }).addTo(map);
        m.on('click', () => open(p.id));
        m.bindTooltip(`<strong>${esc(p.title)}</strong><br>${esc(p.date)}`, { direction: 'top', offset: [0, -16] });
        pins.set(p.id, m);
      });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
      // All pins in view, leaving room on the right for the panel on wide screens, so opening it never hides a pin.
      const room = () => innerWidth > 760 ? Math.min(380, mapBox.clientWidth * .42) + 24 : 0;
      const fit = () => map.fitBounds(L.latLngBounds(places.map(p => [p.lat, p.lon])), { maxZoom: 5, paddingTopLeft: [60, 60], paddingBottomRight: [room() + 60, 60] });
      fit();
      new ResizeObserver(() => map.invalidateSize()).observe(mapBox);
    } else {
      mapBox.classList.add('is-off');
      mapBox.innerHTML = '<p>The map could not load. Pick a place below to see its pictures.</p>';
    }

    function open(id) {
      const p = places.find(x => x.id === id); if (!p) return;
      current = p;
      panel.innerHTML = `<button type="button" class="gl-close" aria-label="Close">×</button>
        <p class="gl-kick">${esc(p.date)} · ${esc(p.where)}</p><h2>${esc(p.title)}</h2>${p.text ? `<p class="gl-text">${esc(p.text)}</p>` : ''}
        <ul class="gl-grid${p.photos.length === 1 ? ' is-one' : ''}">${p.photos.map((ph, i) => `<li><button type="button" class="gl-thumb" data-i="${i}" aria-label="Open picture ${i + 1} of ${p.photos.length}: ${esc(ph.caption)}"><img src="${src(ph, true)}" alt="${esc(ph.caption)}" loading="lazy" decoding="async"></button></li>`).join('')}</ul>`;
      panel.hidden = false; panel.scrollTop = 0;
      panel.querySelector('.gl-close').addEventListener('click', close);
      panel.querySelectorAll('.gl-thumb').forEach(b => b.addEventListener('click', () => show(+b.dataset.i, b)));
      list.querySelectorAll('.gl-place').forEach(b => b.setAttribute('aria-expanded', String(b.dataset.id === id)));
      pins.forEach((m, k) => m.getElement()?.querySelector('.gl-pin')?.classList.toggle('is-on', k === id));
      if (map) {
        map.invalidateSize();
        // Keep the pin in the part of the map the panel does not cover.
        const wide = innerWidth > 760, pt = map.latLngToContainerPoint([p.lat, p.lon]), w = mapBox.clientWidth - (wide ? panel.offsetWidth + 24 : 0);
        if (pt.x < 40 || pt.x > w - 40 || pt.y < 40 || pt.y > mapBox.clientHeight - 40) {
          const target = map.containerPointToLatLng([wide ? w / 2 : mapBox.clientWidth / 2, mapBox.clientHeight / 2]), c = map.getCenter();
          map.panTo([c.lat + p.lat - target.lat, c.lng + p.lon - target.lng]);
        }
      }
      if (innerWidth <= 760) panel.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    function close() {
      panel.hidden = true; current = null;
      list.querySelectorAll('.gl-place').forEach(b => b.setAttribute('aria-expanded', 'false'));
      pins.forEach(m => m.getElement()?.querySelector('.gl-pin')?.classList.remove('is-on'));
    }
    list.addEventListener('click', e => { const b = e.target.closest('.gl-place'); if (b) open(b.dataset.id); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden && !viewer?.open) close(); });

    // The viewer
    let at = 0, opener = null;
    const vImg = document.getElementById('gl-viewer-img'), vCap = document.getElementById('gl-viewer-cap'), vMeta = document.getElementById('gl-viewer-meta');
    function show(i, from) {
      if (!viewer?.showModal || !current) return;
      const ph = current.photos; at = (i + ph.length) % ph.length; opener = from || opener;
      vImg.src = src(ph[at]); vImg.alt = ph[at].caption;
      vCap.textContent = ph[at].caption;
      vMeta.textContent = [current.title + ', ' + current.date, ph.length > 1 ? `${at + 1} / ${ph.length}` : '', ph[at].credit || ''].filter(Boolean).join(' · ');
      viewer.classList.toggle('is-single', ph.length < 2);
      if (!viewer.open) viewer.showModal();
    }
    if (viewer) {
      document.getElementById('gl-viewer-close').addEventListener('click', () => viewer.close());
      document.getElementById('gl-viewer-prev').addEventListener('click', () => show(at - 1));
      document.getElementById('gl-viewer-next').addEventListener('click', () => show(at + 1));
      viewer.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1); });
      viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
      viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }));
    }
    // Open a place from the address: gallery.html#smapvex22
    const fromHash = () => { const id = decodeURIComponent(location.hash.slice(1)); if (places.some(p => p.id === id)) open(id); };
    fromHash(); addEventListener('hashchange', fromHash);
  }).catch(() => { list.innerHTML = '<li class="gl-err">The gallery could not load. It reads data/gallery.json, which browsers block when the page is opened straight from a computer.</li>'; });
})();
