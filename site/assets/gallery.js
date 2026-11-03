/* Gallery (gallery.html): a map with a pin for every place in data/gallery.json. Resting the mouse on a pin (briefly, so
   passing over it does not count), clicking or tapping it, or picking a place in the list under the map, opens that
   place's pictures in a panel beside the map. The panel stays open when the mouse moves on, so its pictures can be
   reached; another pin replaces it, and × or Escape closes it. A picture opens large in the viewer, with its caption,
   previous/next and Escape to close; small pictures are enlarged at most 1.5 times. A photo with "wide": true spans the
   panel at its own shape, from its large file. Leaflet is in assets/vendor/leaflet/. The map has three basemaps (BASEMAPS below,
   none needs a key), switched with the layers button under the zoom buttons; data-basemap on #gl-map picks the default,
   and ?map=<name> in the address or a visitor's last choice overrides it.
   A place may have one video (p.video: an MP4 and its poster). It sits in its own box across the top of the panel and
   plays there, silently, while the panel is open and in view; it pauses when the panel closes or scrolls out of view,
   the tab is hidden or the viewer is open. A click opens it in the viewer with sound and controls. With reduced motion
   or data saver it never plays by itself: the poster shows with a play button.
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
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection && navigator.connection.saveData);
  // A place's items: its video first, then its pictures.
  const items = p => [...(p.video ? [{ video: p.video, caption: p.video.caption }] : []), ...p.photos];
  const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg>';
  // Shown over the playing video when the mouse is on it: a click plays it with sound.
  const SOUND = '<svg class="gl-sound" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6v4h2.6L8 13V3L4.6 6z"/><path d="M10.5 5.5a3.5 3.5 0 010 5M12.3 3.7a6 6 0 010 8.6" fill="none" stroke="#172026" stroke-width="1.4" stroke-linecap="round"/></svg>';
  // The pin of a place with a video and no pictures: a video camera.
  const CAMERA = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="13.5" height="12" rx="3"/><path d="M16.5 10.6l4.3-2.9c.6-.4 1.2 0 1.2.7v7.2c0 .7-.6 1.1-1.2.7l-4.3-2.9z"/></svg>';
  const HOVER_DWELL = 150; // ms the mouse rests on a pin before its panel opens
  const preview = v => `<video src="${esc(v.src)}" poster="${esc(v.poster)}" muted loop playsinline preload="none" aria-hidden="true"></video>`;
  const count = p => [p.video ? 'video' : '', p.photos.length ? `${p.photos.length} ${p.photos.length === 1 ? 'picture' : 'pictures'}` : ''].filter(Boolean).join(' and ');
  // Silent previews: each wants to play while it is shown (want()), and only then.
  const previews = new Set();
  function syncPreviews() {
    previews.forEach(pv => {
      const go = !quiet && !document.hidden && !viewer?.open && pv.want();
      if (go && pv.video.paused) pv.video.play().catch(() => {});
      else if (!go && !pv.video.paused) pv.video.pause();
    });
  }
  function addPreview(video, box, want) {
    const pv = { video, want }; previews.add(pv);
    video.addEventListener('playing', () => box.classList.add('is-playing'));
    video.addEventListener('pause', () => box.classList.remove('is-playing'));
    return pv;
  }
  document.addEventListener('visibilitychange', syncPreviews);

  // Basemaps. labels: a layer of place names and borders laid over a basemap that has none of its own.
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const PLACES = ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
  const BASEMAPS = {
    terrain: { name: 'Terrain', url: ESRI + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}', maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' },
    bluemarble: { name: 'NASA Blue Marble relief', labels: PLACES, maxNativeZoom: 8, maxZoom: 12,
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=BlueMarble_ShadedRelief_Bathymetry&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible_Level8&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg',
      attribution: 'Blue Marble shaded relief and bathymetry from NASA <a href="https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api">GIBS</a>' },
    dark: { name: 'Dark gray', labels: ESRI + 'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', maxNativeZoom: 16, maxZoom: 19,
      url: ESRI + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community' }
  };
  const store = { get() { try { return localStorage.getItem('gallery-basemap'); } catch { return null; } },
    set(v) { try { localStorage.setItem('gallery-basemap', v); } catch { /* private mode */ } } };
  function addBasemaps(map) {
    map.createPane('labels'); map.getPane('labels').style.zIndex = 450; map.getPane('labels').style.pointerEvents = 'none';
    const layers = {}, byName = {};
    Object.entries(BASEMAPS).forEach(([key, b]) => {
      const { name, url, labels, ...opts } = b;
      const base = L.tileLayer(url, opts);
      const layer = labels ? L.layerGroup([base, L.tileLayer(labels, { maxNativeZoom: opts.maxNativeZoom, maxZoom: opts.maxZoom, pane: 'labels' })]) : base;
      layer.key = key; layers[key] = layer; byName[name] = layer;
    });
    const asked = new URLSearchParams(location.search).get('map');
    const start = [asked, store.get(), mapBox.dataset.basemap, 'terrain'].find(k => k && layers[k]);
    layers[start].addTo(map); mapBox.dataset.base = start;
    L.control.layers(byName, null, { position: 'topleft', collapsed: true }).addTo(map); // top left: the photo panel covers the right
    map.on('baselayerchange', e => { mapBox.dataset.base = e.layer.key; store.set(e.layer.key); });
  }

  fetch('data/gallery.json', { cache: 'no-cache' }).then(r => r.json()).then(data => {
    const places = data.places || [];
    let current = null, map = null, hoverTimer = 0;
    const pins = new Map();

    // The list under the map: one button per place.
    list.innerHTML = places.map(p => `<li><button type="button" class="gl-place k-${esc(p.kind || 'field')}" data-id="${esc(p.id)}" aria-controls="gl-panel" aria-expanded="false"><span class="gl-place-dot" aria-hidden="true"></span><span class="gl-place-t">${esc(p.title)}</span><span class="gl-place-m">${esc(p.where)} · ${esc(p.date)} · ${count(p)}</span></button></li>`).join('');

    if (window.L) {
      map = L.map(mapBox, { scrollWheelZoom: false, worldCopyJump: true, zoomSnap: .25, attributionControl: true });
      addBasemaps(map);
      places.forEach(p => {
        const glyph = p.photos.length ? `<b>${p.photos.length}</b>` : CAMERA;
        const icon = L.divIcon({ className: '', html: `<span class="gl-pin k-${esc(p.kind || 'field')}${p.photos.length ? '' : ' is-video'}">${glyph}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
        const m = L.marker([p.lat, p.lon], { icon, title: `${p.title}, ${p.where}`, alt: `${p.title}, ${p.where}`, keyboard: true, riseOnHover: true }).addTo(map);
        m.on('click', () => { clearTimeout(hoverTimer); open(p.id); });
        // Resting the mouse on a pin opens its panel (a tap does the same on touch screens).
        m.on('mouseover', () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => open(p.id), HOVER_DWELL); });
        m.on('mouseout', () => clearTimeout(hoverTimer));
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

    // The panel's video plays while the panel is open and at least half of the video is on screen.
    let panelPreview = null, panelSeen = false;
    const panelIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => { panelSeen = es.some(e => e.isIntersecting); syncPreviews(); }, { threshold: 0.5 }) : null;
    function open(id) {
      const p = places.find(x => x.id === id); if (!p) return;
      if (current === p && !panel.hidden) return; // already open: keep its video playing
      current = p;
      const all = items(p);
      panel.innerHTML = `<button type="button" class="gl-close" aria-label="Close">×</button>
        <p class="gl-kick">${esc(p.date)} · ${esc(p.where)}</p><h2>${esc(p.title)}</h2>${p.text ? `<p class="gl-text">${esc(p.text)}</p>` : ''}
        <ul class="gl-grid${all.length === 1 ? ' is-one' : ''}">${all.map((it, i) => it.video
          ? `<li class="is-wide"><button type="button" class="gl-thumb is-video" data-i="${i}" aria-label="Play with sound: ${esc(it.caption)}">${preview(it.video)}<span class="gl-play" aria-hidden="true">${PLAY}${SOUND}</span><span class="gl-mute" aria-hidden="true"></span></button></li>`
          : `<li${it.wide ? ' class="is-wide"' : ''}><button type="button" class="gl-thumb" data-i="${i}" aria-label="Open picture ${i + 1} of ${all.length}: ${esc(it.caption)}"><img src="${src(it, !it.wide)}" alt="${esc(it.caption)}" loading="lazy" decoding="async"></button></li>`).join('')}</ul>`;
      panel.hidden = false; panel.scrollTop = 0;
      if (panelPreview) { previews.delete(panelPreview); panelPreview = null; }
      panelIO?.disconnect(); panelSeen = !panelIO;
      const pv = panel.querySelector('.gl-thumb.is-video');
      if (pv) { panelPreview = addPreview(pv.querySelector('video'), pv, () => current === p && !panel.hidden && panelSeen); panelIO?.observe(pv); }
      syncPreviews();
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
      panel.hidden = true; current = null; syncPreviews();
      list.querySelectorAll('.gl-place').forEach(b => b.setAttribute('aria-expanded', 'false'));
      pins.forEach(m => m.getElement()?.querySelector('.gl-pin')?.classList.remove('is-on'));
    }
    list.addEventListener('click', e => { const b = e.target.closest('.gl-place'); if (b) open(b.dataset.id); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden && !viewer?.open) close(); });

    // The viewer: a picture, or the video with sound and controls, from the start.
    let at = 0, opener = null;
    const vImg = document.getElementById('gl-viewer-img'), vCap = document.getElementById('gl-viewer-cap'), vMeta = document.getElementById('gl-viewer-meta');
    const vVideo = document.getElementById('gl-viewer-video');
    // A large picture fills the viewer (max-width in gallery.css); a small one, such as a crop from a collage, is enlarged
    // only 1.5 times, so it is not blown up into a blur.
    function fitSmall() { const n = vImg.naturalWidth; vImg.style.width = n && n < 700 ? `${Math.round(n * 1.5)}px` : ''; }
    vImg.addEventListener('load', fitSmall);
    const stopVideo = () => { if (vVideo) { vVideo.replaceChildren(); vVideo.hidden = true; } vImg.hidden = false; };
    function show(i, from) {
      if (!viewer?.showModal || !current) return;
      const ph = items(current); at = (i + ph.length) % ph.length; opener = from || opener;
      const it = ph[at];
      stopVideo();
      if (it.video && vVideo) {
        const v = document.createElement('video');
        v.src = it.video.src; v.poster = it.video.poster; v.controls = true; v.autoplay = true; v.playsInline = true;
        v.setAttribute('aria-label', it.caption);
        vVideo.append(v); vVideo.hidden = false; vImg.hidden = true; vImg.removeAttribute('src'); vImg.alt = '';
      } else { vImg.style.width = ''; vImg.src = src(it); vImg.alt = it.caption; if (vImg.complete) fitSmall(); }
      vCap.textContent = it.caption;
      vMeta.textContent = [current.title + ', ' + current.date, ph.length > 1 ? `${at + 1} / ${ph.length}` : '', it.credit || ''].filter(Boolean).join(' · ');
      viewer.classList.toggle('is-single', ph.length < 2);
      if (!viewer.open) viewer.showModal();
      syncPreviews();
    }
    if (viewer) {
      document.getElementById('gl-viewer-close').addEventListener('click', () => viewer.close());
      document.getElementById('gl-viewer-prev').addEventListener('click', () => show(at - 1));
      document.getElementById('gl-viewer-next').addEventListener('click', () => show(at + 1));
      viewer.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1); });
      viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
      viewer.addEventListener('close', () => { stopVideo(); syncPreviews(); opener?.focus({ preventScroll: true }); });
    }
    // Open a place from the address: gallery.html#smapvex22
    const fromHash = () => { const id = decodeURIComponent(location.hash.slice(1)); if (places.some(p => p.id === id)) open(id); };
    fromHash(); addEventListener('hashchange', fromHash);
  }).catch(() => { list.innerHTML = '<li class="gl-err">The gallery could not load. It reads data/gallery.json, which browsers block when the page is opened straight from a computer.</li>'; });
})();
