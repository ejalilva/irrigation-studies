/* Gallery (gallery.html): a map with a pin for every place in data/gallery.json. Resting the mouse on a pin (briefly, so
   passing over it does not count), clicking or tapping it, or picking a place in the list under the map, opens that
   place's pictures in a panel beside the map. The panel stays open when the mouse moves on, so its pictures can be
   reached; another pin replaces it, and × or Escape closes it. A picture opens large in the viewer, with its caption,
   previous/next and Escape to close; small pictures are enlarged at most 1.5 times. A photo with "wide": true spans the
   panel at its own shape, from its large file. Leaflet is in assets/vendor/leaflet/. The map has four basemaps (BASEMAPS below,
   none needs a key), switched with the layers button under the zoom buttons; data-basemap on #gl-map picks the default
   (Toner), and ?map=<name> in the address or a visitor's last choice overrides it. Toner is drawn by MapLibre
   (assets/vendor/maplibre/), which loads only when that map is shown.
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

  // Toner: Stamen's black-and-white map, drawn in the browser by MapLibre from OpenFreeMap's free vector tiles (no key,
  // no account, no limits). The style is adapted from MapTiler's open Toner GL style (licence in assets/vendor/maplibre/).
  // TONER.water is the colour of seas, lakes and rivers: a lighter black than Stamen's pure black, so the oceans don't
  // weigh down the world view. Roads, borders and labels stay pure black (TONER.ink).
  const TONER = { paper: '#FFFFFF', ink: '#000000', water: '#2E2E2E', waterText: '#FFFFFF' };
  const OFM = 'https://tiles.openfreemap.org/';
  const TONER_CREDIT = 'Toner style &copy; <a href="https://github.com/openmaptiles/maptiler-toner-gl-style">MapTiler</a>, after <a href="https://stamen.com">Stamen</a> | <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a>, data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  function tonerStyle(c) {
    const z = (...stops) => ['interpolate', ['linear'], ['zoom'], ...stops];
    const name = ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']];
    const REG = ['Noto Sans Regular'], BOLD = ['Noto Sans Bold'], ITAL = ['Noto Sans Italic'];
    const black = a => `rgba(0,0,0,${a})`;
    const halo = (w = 2) => ({ 'text-color': c.ink, 'text-halo-color': c.paper, 'text-halo-width': w });
    const land = (id, layer, filter, pattern, extra = {}) => ({ id, type: 'fill', source: 'omt', 'source-layer': layer, filter, paint: { 'fill-pattern': pattern }, ...extra });
    const line = (id, filter, paint, extra = {}) => ({ id, type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['all', ['==', ['geometry-type'], 'LineString'], filter], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint, ...extra });
    const label = (id, layer, filter, layout, paint, extra = {}) => ({ id, type: 'symbol', source: 'omt', 'source-layer': layer, filter, layout: { 'text-field': name, ...layout }, paint, ...extra });
    const notSea = ['!=', ['get', 'maritime'], 1];
    return {
      version: 8,
      sources: { omt: { type: 'vector', url: OFM + 'planet' } },
      glyphs: OFM + 'fonts/{fontstack}/{range}.pbf',
      layers: [
        { id: 'paper', type: 'background', paint: { 'background-color': c.paper } },
        // Stipple for national parks and protected land, then grass, woods and cemeteries close up.
        land('park', 'park', ['==', ['geometry-type'], 'Polygon'], 'toner-dots-sparse', { minzoom: 4, paint: { 'fill-pattern': 'toner-dots-sparse', 'fill-opacity': z(4, .45, 8, .8) } }),
        land('grass', 'landcover', ['==', ['get', 'class'], 'grass'], 'toner-dots', { minzoom: 10 }),
        land('wood', 'landcover', ['==', ['get', 'class'], 'wood'], 'toner-dots', { minzoom: 9 }),
        land('cemetery', 'landuse', ['==', ['get', 'class'], 'cemetery'], 'toner-cross', { minzoom: 12 }),
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', filter: ['all', ['!=', ['get', 'brunnel'], 'tunnel'], ['!=', ['get', 'intermittent'], 1]], paint: { 'fill-color': c.water } },
        { id: 'river', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 7, filter: ['all', ['==', ['get', 'class'], 'river'], ['!=', ['get', 'brunnel'], 'tunnel']], layout: { 'line-cap': 'round' }, paint: { 'line-color': c.water, 'line-width': z(7, .6, 12, 1.6, 16, 5) } },
        { id: 'stream', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 12, filter: ['!=', ['get', 'class'], 'river'], paint: { 'line-color': c.water, 'line-width': z(12, .5, 16, 1.5) } },
        line('rail', ['==', ['get', 'class'], 'rail'], { 'line-color': z(13, 'rgb(216,216,216)', 17, 'rgb(38,38,38)'), 'line-width': z(13, .85, 17, 2) }, { minzoom: 13 }),
        line('rail-hatch', ['==', ['get', 'class'], 'rail'], { 'line-color': 'rgb(38,38,38)', 'line-dasharray': [.2, 1], 'line-width': z(15, 2, 17, 6) }, { minzoom: 15 }),
        { id: 'bridge-area', type: 'fill', source: 'omt', 'source-layer': 'transportation', filter: ['all', ['==', ['geometry-type'], 'Polygon'], ['any', ['==', ['get', 'brunnel'], 'bridge'], ['==', ['get', 'class'], 'pier']]], paint: { 'fill-color': c.paper } },
        line('pier', ['==', ['get', 'class'], 'pier'], { 'line-color': c.paper, 'line-width': z(15, 1, 17, 4) }),
        line('path', ['==', ['get', 'class'], 'path'], { 'line-color': c.paper, 'line-width': z(14, 2, 17, 4) }, { minzoom: 15 }),
        line('road-minor', ['in', ['get', 'class'], ['literal', ['secondary', 'tertiary', 'minor', 'service']]], { 'line-color': z(10, black(.3), 12, black(.5), 15, c.ink), 'line-width': z(13, .5, 15, 3, 17, 8) }, { minzoom: 10 }),
        line('road-primary', ['==', ['get', 'class'], 'primary'], { 'line-color': z(8, black(.19), 10, black(.6), 17, c.ink), 'line-width': z(12, .75, 15, 6, 17, 8) }, { minzoom: 8 }),
        line('highway-casing', ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]], { 'line-color': z(6, 'rgb(219,219,219)', 10, c.paper), 'line-width': z(10, 4, 16, 16) }, { minzoom: 8 }),
        line('highway', ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]], { 'line-color': z(6, black(.02), 10, black(.6), 16, c.ink), 'line-width': z(7, 1, 10, 2, 16, 8) }, { minzoom: 6 }),
        { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14, paint: { 'fill-pattern': 'toner-hatch', 'fill-opacity': z(14, 0, 15, 1) } },
        { id: 'building-edge', type: 'line', source: 'omt', 'source-layer': 'building', minzoom: 15, paint: { 'line-color': c.ink, 'line-width': .75 } },
        { id: 'border-state', type: 'line', source: 'omt', 'source-layer': 'boundary', minzoom: 3, maxzoom: 14, filter: ['all', ['==', ['get', 'admin_level'], 4], notSea], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': z(5, 'rgb(80,80,80)', 6, c.ink), 'line-dasharray': [1, 2], 'line-width': ['interpolate', ['exponential', 1.3], ['zoom'], 5, 1, 7, 1.6, 14, 5] } },
        { id: 'border-country', type: 'line', source: 'omt', 'source-layer': 'boundary', minzoom: 1, filter: ['all', ['==', ['get', 'admin_level'], 2], notSea, ['!=', ['get', 'disputed'], 1]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': c.ink, 'line-width': z(1, .8, 4, 1.5, 7, 3, 22, 6) } },
        { id: 'border-disputed', type: 'line', source: 'omt', 'source-layer': 'boundary', minzoom: 1, filter: ['all', ['==', ['get', 'admin_level'], 2], notSea, ['==', ['get', 'disputed'], 1]], paint: { 'line-color': c.ink, 'line-dasharray': [2, 2], 'line-width': z(1, .8, 4, 1.5, 7, 2.5) } },
        label('water-line-label', 'water_name', ['==', ['geometry-type'], 'LineString'], { 'symbol-placement': 'line', 'symbol-spacing': 350, 'text-font': ITAL, 'text-size': 14, 'text-letter-spacing': .2 }, { 'text-color': c.waterText }, { minzoom: 7 }),
        label('river-label', 'waterway', ['==', ['geometry-type'], 'LineString'], { 'symbol-placement': 'line', 'symbol-spacing': 200, 'text-font': ITAL, 'text-size': z(14, 12, 18, 19) }, { 'text-color': c.waterText }, { minzoom: 14 }),
        label('sea-label', 'water_name', ['all', ['==', ['geometry-type'], 'Point'], ['!=', ['get', 'class'], 'ocean']], { 'text-font': ITAL, 'text-size': 14, 'text-letter-spacing': .1, 'text-max-width': 6 }, { 'text-color': c.waterText }, { minzoom: 4 }),
        label('ocean-label', 'water_name', ['all', ['==', ['geometry-type'], 'Point'], ['==', ['get', 'class'], 'ocean']], { 'text-font': ITAL, 'text-size': 14, 'text-letter-spacing': .2, 'text-max-width': 5, 'text-transform': 'uppercase' }, { 'text-color': c.waterText }, { minzoom: 1 }),
        label('road-label', 'transportation_name', ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'minor', 'service']]], { 'symbol-placement': 'line', 'text-font': BOLD, 'text-size': z(13, 12, 14, 13) }, halo(3), { minzoom: 14.5 }),
        label('park-label', 'park', ['==', ['geometry-type'], 'Point'], { 'text-font': ITAL, 'text-size': 12, 'text-max-width': 8 }, halo(2), { minzoom: 9 }),
        label('village-label', 'place', ['in', ['get', 'class'], ['literal', ['village', 'hamlet']]], { 'text-font': REG, 'text-size': z(12, 12, 16, 18), 'text-max-width': 10 }, halo(2), { minzoom: 12 }),
        label('town-label', 'place', ['==', ['get', 'class'], 'town'], { 'text-font': BOLD, 'text-size': z(8, 14, 16, 18), 'text-max-width': 10 }, halo(2), { minzoom: 9, maxzoom: 16 }),
        label('city-label', 'place', ['==', ['get', 'class'], 'city'], { 'text-font': BOLD, 'text-size': z(4, 13, 7, 15, 8, 18, 16, 22), 'text-max-width': 10 }, halo(2), { minzoom: 4, maxzoom: 16 }),
        label('state-label', 'place', ['==', ['get', 'class'], 'state'], { 'text-font': BOLD, 'text-size': 12, 'text-transform': 'uppercase', 'text-letter-spacing': .1, 'text-max-width': 10 }, halo(1.5), { minzoom: 4, maxzoom: 7 }),
        label('country-label', 'place', ['==', ['get', 'class'], 'country'], { 'text-font': BOLD, 'text-size': z(2, 12, 4, 16, 5, 20), 'text-max-width': 10, 'text-padding': 2 }, halo(2), { minzoom: 2 }),
        label('continent-label', 'place', ['==', ['get', 'class'], 'continent'], { 'text-font': BOLD, 'text-size': z(0, 16, 2, 22), 'text-max-width': 10 }, halo(2), { maxzoom: 2 })
      ]
    };
  }
  // Toner's fill patterns, drawn here instead of loaded from a sprite: stipple dots, a cross for cemeteries and hatching
  // for buildings, in ink on a clear background.
  const PATTERNS = {
    'toner-dots': [6, g => { g.arc(1.5, 1.5, .8, 0, 7); g.moveTo(5.3, 4.5); g.arc(4.5, 4.5, .8, 0, 7); g.fill(); }],
    'toner-dots-sparse': [8, g => { g.arc(2, 2, .7, 0, 7); g.moveTo(6.7, 6); g.arc(6, 6, .7, 0, 7); g.fill(); }],
    'toner-cross': [10, g => { g.fillRect(4.5, 2.5, 1, 5); g.fillRect(2.5, 4.5, 5, 1); }],
    'toner-hatch': [5, g => { g.lineWidth = 1; [-5, 0, 5].forEach(o => { g.moveTo(o, 5); g.lineTo(o + 5, 0); }); g.stroke(); }]
  };
  function pattern(id, ink) {
    const [size, draw] = PATTERNS[id], ratio = 2, canvas = document.createElement('canvas');
    canvas.width = canvas.height = size * ratio;
    const g = canvas.getContext('2d');
    g.scale(ratio, ratio); g.fillStyle = g.strokeStyle = ink; g.beginPath(); draw(g);
    return g.getImageData(0, 0, canvas.width, canvas.height);
  }
  // MapLibre and its Leaflet bridge load only when the Toner map is first shown. scripts/stamp_assets.py keeps their
  // version stamps current.
  let glReady = null;
  function loadGL() {
    const add = (tag, attrs) => new Promise((ok, fail) => {
      const el = Object.assign(document.createElement(tag), attrs);
      el.onload = ok; el.onerror = () => fail(new Error('Could not load ' + (attrs.src || attrs.href)));
      document.head.append(el);
    });
    if (!glReady) {
      add('link', { rel: 'stylesheet', href: 'assets/vendor/maplibre/maplibre-gl.css?v=9ec5b4801e' }).catch(() => {});
      glReady = add('script', { src: 'assets/vendor/maplibre/maplibre-gl.js?v=417d85083d' }).then(() => add('script', { src: 'assets/vendor/maplibre/leaflet-maplibre-gl.js?v=8508bc69c8' }));
      glReady.catch(() => { glReady = null; });
    }
    return glReady;
  }
  const webgl = () => { try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } };

  // Basemaps. labels: a layer of place names and borders laid over a basemap that has none of its own.
  // gl: a map drawn with MapLibre (Toner), which needs WebGL; without it the map falls back to Terrain.
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
  const PLACES = ESRI + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
  const BASEMAPS = {
    toner: { name: 'Toner (black and white)', gl: TONER },
    terrain: { name: 'Terrain', url: ESRI + 'World_Topo_Map/MapServer/tile/{z}/{y}/{x}', maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community' },
    bluemarble: { name: 'NASA Blue Marble relief', labels: PLACES, maxNativeZoom: 8, maxZoom: 12,
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=BlueMarble_ShadedRelief_Bathymetry&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible_Level8&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg',
      attribution: 'Blue Marble shaded relief and bathymetry from NASA <a href="https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api">GIBS</a>' },
    dark: { name: 'Dark gray', labels: ESRI + 'Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', maxNativeZoom: 16, maxZoom: 19,
      url: ESRI + 'Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community' }
  };
  // The remembered choice is stored under a new name since Toner became the default (November 2026), so every visitor
  // sees Toner once, whatever they picked before.
  const store = { get() { try { return localStorage.getItem('gallery-basemap-2'); } catch { return null; } },
    set(v) { try { localStorage.setItem('gallery-basemap-2', v); } catch { /* private mode */ } } };
  function addBasemaps(map) {
    map.createPane('labels'); map.getPane('labels').style.zIndex = 450; map.getPane('labels').style.pointerEvents = 'none';
    const layers = {}, byName = {};
    // Falls back to Terrain when a MapLibre map can't be drawn (no WebGL, or its scripts didn't load). The fallback is
    // not remembered, so the visitor gets Toner again on a device that can draw it.
    const fallBack = layer => {
      if (!map.hasLayer(layer)) return;
      map.removeLayer(layer); layers.terrain.addTo(map); mapBox.dataset.base = 'terrain';
    };
    // A MapLibre map behind a plain Leaflet layer, so the layers button can list it before MapLibre has loaded.
    const GLLayer = L.Layer.extend({
      initialize(options) { L.setOptions(this, options); },
      onAdd(m) {
        if (!webgl()) { setTimeout(() => fallBack(this)); return; }
        loadGL().then(() => {
          if (!this._map || this._gl) return;
          const colours = this.options.colours;
          this._gl = L.maplibreGL({ style: tonerStyle(colours), attributionControl: { customAttribution: TONER_CREDIT } }).addTo(m);
          const gl = this._gl.getMaplibreMap();
          gl.on('styleimagemissing', e => { if (PATTERNS[e.id] && !gl.hasImage(e.id)) gl.addImage(e.id, pattern(e.id, colours.ink), { pixelRatio: 2 }); });
        }).catch(err => { console.warn('The Toner map could not be drawn, so Terrain is shown instead.', err); fallBack(this); });
      },
      onRemove(m) { if (this._gl) { m.removeLayer(this._gl); this._gl = null; } }
    });
    Object.entries(BASEMAPS).forEach(([key, b]) => {
      const { name, url, labels, gl, ...opts } = b;
      let layer;
      if (gl) layer = new GLLayer({ colours: gl });
      else {
        const base = L.tileLayer(url, opts);
        layer = labels ? L.layerGroup([base, L.tileLayer(labels, { maxNativeZoom: opts.maxNativeZoom, maxZoom: opts.maxZoom, pane: 'labels' })]) : base;
      }
      layer.key = key; layers[key] = layer; byName[name] = layer;
    });
    const asked = new URLSearchParams(location.search).get('map');
    const start = [asked, store.get(), mapBox.dataset.basemap, 'toner'].find(k => k && layers[k]);
    layers[start].addTo(map); mapBox.dataset.base = start;
    const menu = L.control.layers(byName, null, { position: 'topleft', collapsed: true }).addTo(map); // top left: the photo panel covers the right
    // Leaflet also reports the first basemap and the fallback as a change; only a pick in the menu is remembered.
    map.on('baselayerchange', e => { mapBox.dataset.base = e.layer.key; if (menu._handlingClick) store.set(e.layer.key); });
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
