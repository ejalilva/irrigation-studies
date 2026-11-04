/* Satellites behind my research: the data for satellites.html and the orbit-ring controller.

   The ring shows SATELLITES in order, the order in which each entered my work. Clicking one (or dragging the ring,
   or the arrow keys) brings it to the front, and the panel under the ring lists the studies that used it, as the
   same paper cards the water-cycle map uses (assets/journals.js). satellites.html#smap opens with SMAP in front.

   AGENCIES   name and the colour of its dot (light enough to read on the night sky)

   SATELLITES
     id        short id, used in the address (satellites.html#<id>)
     name      name on the ring
     full      full mission name (optional)
     agency    keys of AGENCIES, lead agency first
     launched  text after the agency in the panel, e.g. "Launched 2015"
     img       picture in assets/satellites/ with a transparent background; without one, an outline is shown and
               the label says the picture is still needed
     sensor    the instrument and what it observes, one line
     role      what this satellite gave my work, one sentence
     papers    published studies, oldest first: { doi, note }. doi is the key of the paper in assets/journals.js
               (lowercase); note says what this satellite did in that study and is shown on the card
     work      ongoing or planned work: { title, status, text, planned (dashed card), link (optional) }
     hidden    true keeps a satellite off the ring (its picture can stay in assets/satellites/)

   Land outline of the Earth: assets/satellites/earth-land.png, the share of land in each half-degree cell
   (from the GLOBE land mask, NOAA, public domain). */
(function () {
'use strict';

const AGENCIES = {
  NASA: { name: "NASA", color: "#6b9bff" },
  ESA: { name: "ESA", color: "#3fd0c8" },
  JAXA: { name: "JAXA", color: "#cfa8ff" },
  ISRO: { name: "ISRO", color: "#ffa64d" },
  USGS: { name: "USGS", color: "#a6d785" },
  USSF: { name: "U.S. Space Force", color: "#d3d9e0" }
};

const S = "assets/satellites/";
const FM_WORK = { title: "Irrigation maps from foundation models", status: "Active research",
  text: "Benchmarking six geospatial foundation models for mapping irrigated land with few labels. Prithvi-EO-2.0, the first I fine-tuned, was pre-trained on Harmonized Landsat and Sentinel-2 imagery." };
const LIS_S1_WORK = { title: "SMAP–Sentinel-1 in NASA LIS", status: "In development",
  text: "Assimilation of the SMAP–Sentinel-1 product in NASA's Land Information System, aiming at about 1 km, sub-daily surface and root-zone soil moisture for selected U.S. watersheds." };

const SATELLITES = [
  { id: "terra", name: "Terra", agency: ["NASA"], launched: "Launched 1999",
    sensor: "MODIS: vegetation, land surface temperature and land cover",
    role: "MODIS on Terra describes the vegetation in my retrievals and models.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "MODIS NDVI from Terra gave the observed vegetation water content that strengthened the irrigation signal." },
      { doi: "10.1029/2022wr033342", note: "MODIS leaf area index and albedo, from Terra and Aqua, set the vegetation in the land surface model." },
      { doi: "10.3389/feart.2026.1854083", note: "MODIS land cover and NDVI set the vegetation and roughness parameters of the retrieval." }
    ] },
  { id: "gcom-w", name: "GCOM-W", full: "Global Change Observation Mission – Water, “Shizuku”", agency: ["JAXA"], launched: "Launched 2012",
    img: "gcom-w.webp", sensor: "AMSR2 microwave radiometer: soil moisture, snow and rain",
    role: "Where the irrigation work began: AMSR2 soil moisture rose in summers when no rain fell.",
    papers: [
      { doi: "10.1016/j.rse.2019.111226", note: "Inverting the water balance turned AMSR2's summer wetting into estimates of irrigation water." }
    ],
    work: [
      { title: "Snow depth from AMSR2", status: "Minor revision", text: "Coauthor of a machine learning, explainable-AI retrieval of near-real-time global snow depth from AMSR2, led by Kehan Yang." }
    ] },
  { id: "smap", name: "SMAP", full: "Soil Moisture Active Passive", agency: ["NASA"], launched: "Launched 2015",
    img: "smap.webp", sensor: "L-band radiometer: soil moisture and freeze–thaw",
    role: "The thread through most of my soil moisture work, from detecting irrigation to assimilation and what should follow SMAP.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "SMAP's 9 km soil moisture missed irrigation on small plots; the 1 km and 3 km SMAP–Sentinel-1 product showed it." },
      { doi: "10.3390/su132011355", note: "The 1 km SMAP–Sentinel-1 product was the satellite reference for the new 10 m soil moisture." },
      { doi: "10.1029/2022wr033342", note: "1 km SMAP–Sentinel-1 soil moisture was assimilated into the VIC model to estimate irrigation water use." },
      { doi: "10.1016/j.agwat.2024.108918", note: "Six years of SMAP soil moisture tuned soil properties in the VIC model for the Lower Mekong." },
      { doi: "10.1016/j.rse.2025.115153", note: "SMAP enhanced soil moisture is one of AgroTrack's inputs, alongside MODIS." },
      { doi: "10.1029/2026wr044944", note: "Can GNSS-R carry global soil moisture on if SMAP ends? As a complement to an L-band mission, not a replacement." },
      { doi: "10.3389/feart.2026.1854083", note: "A low-latency, enhanced 9 km SMAP retrieval for near-real-time applications." }
    ],
    work: [LIS_S1_WORK] },
  { id: "sentinel-1", name: "Sentinel-1", agency: ["ESA"], launched: "Copernicus, since 2014",
    img: "sentinel-1.webp", sensor: "C-band radar: images through cloud, day and night",
    role: "Radar that resolves fields: it sharpened SMAP to 1 km and mapped crops, planting dates and yield.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "Sentinel-1 radar sharpens SMAP to 1–3 km, but its 6–12-day revisit misses irrigation between passes." },
      { doi: "10.3390/su132011355", note: "A neural network estimated 10 m soil moisture from Sentinel-1 backscatter (R² 0.84) to map irrigated fields." },
      { doi: "10.1016/j.jag.2022.103047", note: "Sentinel-1A mapped rice paddies in Cambodia and retrieved their planting dates." },
      { doi: "10.1029/2022wr033342", note: "Sentinel-1's roughly weekly passes set the windows of the particle batch smoother." },
      { doi: "10.1016/j.compag.2024.109340", note: "Sentinel-1 VH backscatter and climate variables predicted corn, soybean and winter wheat yield in Michigan." },
      { doi: "10.1016/j.isprsjprs.2024.08.018", note: "Reviews deep learning with radar such as Sentinel-1 for crop mapping, monitoring and yield." },
      { doi: "10.1016/j.rse.2025.114825", note: "Sentinel-1A VH backscatter fed geospatial foundation models of crop water content and height." }
    ],
    work: [LIS_S1_WORK] },
  { id: "sentinel-2", name: "Sentinel-2", agency: ["ESA"], launched: "Copernicus, since 2015",
    img: "sentinel-2.webp", sensor: "Multispectral imager: vegetation and land at 10 m",
    role: "Optical detail at field scale, for soil moisture and crop properties.",
    papers: [
      { doi: "10.3390/su132011355", note: "A neural network estimated 10 m soil moisture from Sentinel-2 (R² 0.92), the best of the inputs tested." },
      { doi: "10.1016/j.rse.2025.114825", note: "Sentinel-2 NDVI, NDWI and red-edge bands were among the strongest drivers of crop water content." }
    ],
    work: [FM_WORK] },
  { id: "gpm", name: "GPM", full: "Global Precipitation Measurement", agency: ["NASA", "JAXA"], launched: "Launched 2014",
    sensor: "Precipitation radar and microwave imager, the reference for IMERG rainfall",
    role: "Rainfall, so that soil wetting from irrigation can be told apart from wetting by rain.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "IMERG precipitation showed which soil wetting rain could explain." },
      { doi: "10.1029/2022wr033342", note: "IMERG precipitation drove the VIC land surface model." }
    ] },
  { id: "aqua", name: "Aqua", agency: ["NASA"], launched: "Launched 2002",
    img: "aqua.webp", sensor: "MODIS and AMSR-E: land surface temperature, vegetation and soil moisture",
    role: "Land surface temperature from MODIS: irrigated fields run cooler than the natural land around them.",
    papers: [
      { doi: "10.1029/2022wr033342", note: "MODIS EVI from Aqua, with leaf area index and albedo from Terra and Aqua, set the model's vegetation." },
      { doi: "10.1016/j.rse.2025.115153", note: "MODIS land surface temperature shows irrigated fields cooling against a hydrologically similar natural pixel nearby." }
    ],
    work: [
      { title: "AgroTrack", status: "MODIS version released", link: "https://github.com/deepcharles/AgroTrack",
        text: "An open-source Python package for irrigation timing from satellites. The MODIS version is public." }
    ] },
  { id: "smos", name: "SMOS", full: "Soil Moisture and Ocean Salinity", agency: ["ESA"], launched: "Launched 2009",
    img: "smos.webp", sensor: "L-band interferometric radiometer: soil moisture and ocean salinity",
    role: "SMAP's L-band predecessor, and a possible bridge if SMAP's record ends.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "Compared with SMAP for sampling and radio interference, and weighed as an anchor for GNSS-R during a SMAP gap." }
    ] },
  { id: "cygnss", name: "CYGNSS", full: "Cyclone Global Navigation Satellite System", agency: ["NASA"], launched: "Launched 2016",
    sensor: "Eight microsatellites that read GPS signals reflected off the surface (GNSS-R)",
    role: "Sub-daily soil moisture from reflected navigation signals.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "CYGNSS sub-daily soil moisture was the main GNSS-R case: it complements SMAP but relies on it for calibration." }
    ] },
  { id: "landsat", name: "Landsat 8 and 9", agency: ["NASA", "USGS"], launched: "Launched 2013 and 2021",
    img: "landsat.webp", sensor: "OLI and TIRS: land imagery and thermal at 30 m",
    role: "With Sentinel-2, the imagery that Earth-observation foundation models learn from.",
    work: [FM_WORK] },
  { id: "nisar", name: "NISAR", full: "NASA–ISRO Synthetic Aperture Radar", agency: ["NASA", "ISRO"], launched: "Launched 2025",
    img: "nisar.webp", sensor: "L- and S-band radar: soil moisture and crops at about 200 m",
    role: "Where, when and how much come together in NASA's Land Information System with NISAR.",
    work: [
      { title: "NISAR soil moisture in Kansas", status: "Active research",
        text: "A NASA Headquarters-funded pilot to assimilate about 200 m NISAR soil moisture into NASA's Land Information System. A manuscript is in preparation." },
      { title: "AgroTrack with NISAR", status: "Initial code",
        text: "The first NISAR code is in the AgroTrack repository; formal support is planned for the release in early 2027." },
      { title: "NISAR-informed AgLIS", status: "Selectable proposal, not started", planned: true,
        text: "Co-Investigator on a proposal led by Rajat Bindlish that links irrigation detection and timing to water use in AgLIS." },
      { title: "Coming full circle", status: "Next", planned: true, link: "irrigation.html#studies",
        text: "Where from the foundation-model maps, when from AgroTrack and how much from the particle batch smoother, together in NASA LIS with NISAR." }
    ] },
  { id: "gosat-gw", name: "GOSAT-GW", full: "Global Observing Satellite for Greenhouse gases and Water cycle", agency: ["JAXA"], launched: "Launched 2025",
    sensor: "AMSR3 microwave radiometer: soil moisture, snow and rain",
    role: "AMSR3 continues the AMSR2 record where the irrigation work began.",
    work: [
      { title: "AMSR3 retrieval and assimilation", status: "In development",
        text: "Machine learning AMSR3 soil moisture retrieval and assimilation for LIS 7.9. A paper is planned for 2027." }
    ] },
  { id: "wsf-m", name: "WSF-M", full: "Weather System Follow-on – Microwave", agency: ["USSF"], launched: "Launched 2024",
    sensor: "Microwave imager: soil moisture, ocean winds and more",
    role: "A new microwave source of soil moisture for NASA's Land Information System.",
    work: [
      { title: "WSF-M in NASA LIS", status: "Delivered, April 2026",
        text: "Machine learning soil moisture retrieval and the first WSF assimilation capability in NASA LIS, delivered with LIS 7.8." }
    ] },
  { id: "iss", name: "ISS", full: "International Space Station, with ECOSTRESS", agency: ["NASA"], launched: "ECOSTRESS since 2018",
    img: "iss.webp", sensor: "ECOSTRESS: thermal images of plant temperature at about 70 m",
    role: "Finer thermal views, at changing times of day, for irrigation timing.",
    work: [
      { title: "AgroTrack with ECOSTRESS", status: "Planned for early 2027", planned: true,
        text: "An expanded AgroTrack release is to add ECOSTRESS and VIIRS, alongside formal NISAR support." }
    ] },
  // Kept off the ring until a study of mine uses it.
  { id: "sentinel-3", name: "Sentinel-3", agency: ["ESA"], launched: "Copernicus, since 2016", hidden: true,
    img: "sentinel-3.webp", sensor: "SLSTR and OLCI: land surface temperature and colour", role: "" }
].filter(s => !s.hidden);

/* ------------------------------------------------------------------------------------------------------------ */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stage = document.getElementById("orbit");
const panel = document.getElementById("sat-panel");
if (!stage || !panel) return;
const N = SATELLITES.length, STEP = 2 * Math.PI / N;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarse = window.matchMedia("(pointer: coarse)");

/* ---- Build the stage ---- */
stage.innerHTML = `
  <canvas class="orbit-stars" aria-hidden="true"></canvas>
  <svg class="orbit-path orbit-back" aria-hidden="true"><path/></svg>
  <div class="orbit-earth" aria-hidden="true"><canvas></canvas></div>
  <svg class="orbit-path orbit-front" aria-hidden="true"><path/></svg>
  <div class="orbit-ring" role="tablist" aria-label="Satellites"></div>
  <div class="orbit-controls">
    <button class="orbit-step prev" type="button" aria-label="Previous satellite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
    <p class="orbit-hint" aria-hidden="true"></p>
    <button class="orbit-step next" type="button" aria-label="Next satellite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>
  </div>
  <ul class="orbit-legend" aria-label="Agencies"></ul>`;
const ring = stage.querySelector(".orbit-ring");
const used = [...new Set(SATELLITES.flatMap(s => s.agency))];
stage.querySelector(".orbit-legend").innerHTML = Object.keys(AGENCIES).filter(k => used.includes(k))
  .map(k => `<li><span class="ag-dot" style="--ag:${AGENCIES[k].color}"></span>${esc(AGENCIES[k].name)}</li>`).join("");
stage.querySelector(".orbit-hint").textContent = coarse.matches ? "Swipe the ring, or tap a satellite" : "Drag the ring, or use the arrow keys";

const dots = s => s.agency.map(a => `<span class="ag-dot" style="--ag:${AGENCIES[a].color}" title="${esc(AGENCIES[a].name)}"></span>`).join("");
const count = s => (s.papers || []).length;
const buttons = SATELLITES.map((s, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sat" + (s.img ? "" : " is-placeholder");
  b.id = "sat-tab-" + s.id;
  b.setAttribute("role", "tab");
  b.setAttribute("aria-controls", "sat-panel");
  b.setAttribute("aria-selected", "false");
  b.tabIndex = -1;
  const n = count(s);
  const tag = n ? `${n} ${n === 1 ? "study" : "studies"}` : "in progress";
  b.setAttribute("aria-label", `${s.name}, ${s.agency.map(a => AGENCIES[a].name).join(" and ")}, ${tag}`);
  b.innerHTML = `<img class="sat-img" src="${S}${s.img || "placeholder.svg"}" alt="" draggable="false" decoding="async">
    <span class="sat-label">${dots(s)}<span class="sat-name">${esc(s.name)}</span><span class="sat-count${n ? "" : " is-work"}">${n || "in progress"}</span></span>
    ${s.img ? "" : `<span class="sat-missing">Picture needed</span>`}`;
  b.addEventListener("click", e => { if (dragMoved) { e.preventDefault(); return; } select(i, { focus: false }); });
  ring.appendChild(b);
  return b;
});

/* ---- Geometry: satellite i sits at angle (i - pos) * STEP on a tilted ellipse around the Earth; 0 is the front ---- */
let W = 0, H = 0, cx = 0, cy = 0, Rx = 0, Ry = 0, ER = 0, BW = 0, LABEL = 0.6, EXP = 5;
let pos = 0, current = -1, anim = 0;
function measure() {
  W = stage.clientWidth; H = stage.clientHeight;
  const narrow = W < 700;
  cx = W / 2; cy = H * (narrow ? 0.40 : 0.40);
  Rx = narrow ? W * 0.42 : Math.min(W * 0.40, 540);
  Ry = Math.min(Rx * (narrow ? 0.52 : 0.30), H * 0.24);
  ER = Ry * (narrow ? 0.86 : 0.94);
  BW = narrow ? W * 0.36 : Math.max(150, Math.min(W * 0.19, 260));
  LABEL = narrow ? 0.95 : 0.6; EXP = narrow ? 8 : 5;
  stage.style.setProperty("--sw", BW + "px");
  const earth = stage.querySelector(".orbit-earth");
  Object.assign(earth.style, { width: 2 * ER + "px", height: 2 * ER + "px", left: cx - ER + "px", top: cy - ER + "px" });
  // the orbit: the far half is drawn behind the Earth, the near half in front of it
  for (const [sel, sweep] of [[".orbit-back", 1], [".orbit-front", 0]]) {
    const svg = stage.querySelector(sel);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.querySelector("path").setAttribute("d", `M${cx - Rx} ${cy} A${Rx} ${Ry} 0 0 ${sweep} ${cx + Rx} ${cy}`);
  }
  drawStars(); earthSetup();
}
function place() {
  const front = ((Math.round(pos) % N) + N) % N;
  buttons.forEach((b, i) => {
    let a = (i - pos) * STEP;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    const d = Math.cos(a), t = (d + 1) / 2;
    const x = cx + Rx * Math.sin(a), y = cy + Ry * d;
    // far satellites shrink; the one at the front gets a little extra, so it reads as brought forward
    const s = (0.3 + 0.7 * Math.pow(t, EXP)) * (1 + 0.18 * Math.max(0, (d - 0.9) / 0.1));
    b.style.transform = `translate3d(${(x - BW / 2).toFixed(1)}px, ${(y - BW * 0.4).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
    b.style.zIndex = String(100 + Math.round(d * 90) + (d > 0 ? 2 : 0));
    b.style.opacity = (0.4 + 0.6 * t).toFixed(3);
    b.classList.toggle("show-label", d > LABEL);
    b.classList.toggle("is-front", i === front && Math.abs(a) < STEP / 2);
  });
}

/* ---- Turning the ring ---- */
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function turnTo(target, ms) {
  cancelAnimationFrame(anim);
  if (reduced.matches || !ms) { pos = target; place(); return; }
  const from = pos, t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / ms);
    pos = from + (target - from) * ease(k); place();
    if (k < 1) anim = requestAnimationFrame(tick);
  };
  anim = requestAnimationFrame(tick);
}
function nearest(i) {  // the closest copy of index i to the current position, so the ring turns the short way
  return i + N * Math.round((pos - i) / N);
}
function select(i, opts = {}) {
  i = ((i % N) + N) % N;
  const target = nearest(i);
  turnTo(target, opts.instant ? 0 : Math.min(900, 360 + 130 * Math.abs(target - pos)));
  if (i === current) return;
  current = i;
  buttons.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
  if (opts.focus) buttons[i].focus({ preventScroll: true });
  renderPanel(SATELLITES[i], !opts.instant && !opts.first);
  if (!opts.keepHash) history.replaceState(null, "", "#" + SATELLITES[i].id);
}
stage.querySelector(".prev").addEventListener("click", () => select(current - 1));
stage.querySelector(".next").addEventListener("click", () => select(current + 1));
ring.addEventListener("keydown", e => {
  const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
  if (k) { e.preventDefault(); select(current + k, { focus: true }); }
  else if (e.key === "Home") { e.preventDefault(); select(0, { focus: true }); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, { focus: true }); }
});

/* Dragging: the front of the ring follows the pointer; on release it settles on the nearest satellite. */
let dragX = null, dragPos = 0, dragMoved = false, lastX = 0, lastT = 0, vel = 0;
stage.addEventListener("pointerdown", e => {
  if (e.button !== 0 || e.target.closest(".orbit-controls")) return;
  dragX = e.clientX; dragPos = pos; dragMoved = false; lastX = e.clientX; lastT = e.timeStamp; vel = 0;
});
stage.addEventListener("pointermove", e => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (!dragMoved && Math.abs(dx) < 6) return;
  if (!dragMoved) { dragMoved = true; stage.classList.add("dragging"); cancelAnimationFrame(anim); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
  pos = dragPos - dx / (Rx * STEP);
  const dt = e.timeStamp - lastT;
  if (dt > 0) { vel = (e.clientX - lastX) / dt; lastX = e.clientX; lastT = e.timeStamp; }
  place();
});
function endDrag() {
  if (dragX === null) return;
  dragX = null;
  if (!dragMoved) return;
  stage.classList.remove("dragging");
  const fling = Math.max(-2, Math.min(2, -vel * 220 / (Rx * STEP)));  // a quick swipe carries on a little
  select(Math.round(pos + fling));
  setTimeout(() => { dragMoved = false; }, 0);
}
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

/* ---- The panel under the ring ---- */
function renderPanel(s, animate) {
  const P = window.Papers;
  const papers = (s.papers || []).map(p => ({ p: P && P.paperFor(p.doi), note: p.note })).filter(x => x.p);
  const work = s.work || [];
  const agencies = s.agency.map(a => `<span class="sp-ag"><span class="ag-dot" style="--ag:${AGENCIES[a].color}"></span>${esc(AGENCIES[a].name)}</span>`).join("");
  const html = `
    <div class="sp-head">
      <p class="sp-agency">${agencies}<span class="sp-launch">${esc(s.launched || "")}</span></p>
      <h2 class="sp-name" id="sp-name">${esc(s.name)}</h2>
      ${s.full ? `<p class="sp-full">${esc(s.full)}</p>` : ""}
      <p class="sp-sensor">${esc(s.sensor)}</p>
      <p class="sp-role">${esc(s.role)}</p>
      ${s.img ? "" : `<p class="sp-missing">This satellite's picture is still needed.</p>`}
    </div>
    <div class="sp-body">
      ${papers.length ? `<h3 class="sp-h">Published studies <span class="sp-n">${papers.length}</span></h3>
        <div class="sp-papers">${papers.map(x => P.paperCard(x.p, x.note)).join("")}</div>` : ""}
      ${work.length ? `<h3 class="sp-h">${papers.length ? "Ongoing and planned" : "My work with " + esc(s.name) + " is under way"}</h3>
        <ul class="sp-work">${work.map(w => `<li class="${w.planned ? "is-planned" : ""}">
          <p class="sw-status">${esc(w.status)}</p>
          <p class="sw-title">${w.link ? `<a href="${esc(w.link)}">${esc(w.title)}</a>` : esc(w.title)}</p>
          <p class="sw-text">${esc(w.text)}</p></li>`).join("")}</ul>` : ""}
    </div>`;
  panel.setAttribute("aria-labelledby", "sat-tab-" + s.id);
  if (!animate || reduced.matches) { panel.innerHTML = html; return; }
  panel.classList.add("swap");
  setTimeout(() => { panel.innerHTML = html; panel.classList.remove("swap"); }, 160);
}

/* ---- Night sky ---- */
function drawStars() {
  const c = stage.querySelector(".orbit-stars"), dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = W * dpr; c.height = H * dpr;
  const g = c.getContext("2d"); g.scale(dpr, dpr); g.clearRect(0, 0, W, H);
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = Math.round(W * H / 1500);
  for (let i = 0; i < n; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() < 0.93 ? 0.35 + rnd() * 0.6 : 0.9 + rnd() * 0.7;
    const tint = rnd();
    g.fillStyle = tint < 0.1 ? "rgba(255,214,170," : tint < 0.22 ? "rgba(180,205,255," : "rgba(235,240,255,";
    g.fillStyle += (0.25 + rnd() * 0.65).toFixed(2) + ")";
    g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fill();
  }
}

/* ---- The Earth: an orthographic globe lit from the upper left, turning slowly west to east ---- */
let tex = null, LW = 0, LH = 0, ectx = null, eimg = null, eRun = false, visible = true, eLast = 0;
let pIdx = null, pRow = null, pCol = null, pShade = null, pEdge = null;
let espin = -45 * Math.PI / 180;  // opens with Lake Urmia, where the irrigation work began, facing the viewer
const TILT = 22 * Math.PI / 180, LIGHT = (() => { const v = [-0.62, 0.42, 0.66], m = Math.hypot(...v); return v.map(x => x / m); })();
function surface(latd, lond, f) {  // colour of a half-degree cell: ocean, land (sage, ochre deserts, ice), mixed on coasts
  const ocean = [26, 74, 128];
  if (!f) return ocean;
  // sage, drier (ochre) towards the subtropics and the big deserts, ice at the poles and over Greenland
  const a = Math.abs(latd);
  let dry = 0.55 * Math.exp(-Math.pow((a - 24) / 9, 2));
  if (latd > 12 && latd < 36 && lond > -18 && lond < 62) dry += 0.4 * Math.sin((latd - 12) / 24 * Math.PI);
  if (latd < -16 && latd > -34 && lond > 116 && lond < 146) dry += 0.35 * Math.sin((-latd - 16) / 18 * Math.PI);
  dry = Math.min(1, dry);
  let ice = Math.max(0, Math.min(1, (a - 66) / 8));
  if (latd > 60 && lond > -70 && lond < -15) ice = Math.max(ice, Math.min(1, (latd - 60) / 4));
  const sage = [100, 134, 84], ochre = [178, 142, 92], snow = [226, 233, 240];
  const l = sage.map((v, k) => (v * (1 - dry) + ochre[k] * dry) * (1 - ice) + snow[k] * ice);
  return ocean.map((o, k) => o * (1 - f) + l[k] * f);
}
function loadLand() {
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas"); c.width = LW = im.width; c.height = LH = im.height;
    const g = c.getContext("2d"); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, LW, LH).data; tex = new Uint8ClampedArray(LW * LH * 3);
    for (let r = 0; r < LH; r++) for (let q = 0; q < LW; q++) {
      const k = r * LW + q, rgb = surface(90 - (r + 0.5) * 180 / LH, (q + 0.5) * 360 / LW - 180, d[k * 4] / 255);
      tex[k * 3] = rgb[0]; tex[k * 3 + 1] = rgb[1]; tex[k * 3 + 2] = rgb[2];
    }
    earthSetup(); startEarth();
  };
  im.src = S + "earth-land.png";
}
function earthSetup() {
  const c = stage.querySelector(".orbit-earth canvas"), dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = Math.max(2, Math.round(2 * ER * dpr));
  c.width = c.height = size; ectx = c.getContext("2d"); eimg = ectx.createImageData(size, size);
  if (!LW) return;
  // per pixel of the disc, worked out once: where it is, its row in the map, its longitude column, light and rim
  const idx = [], row = [], col = [], shade = [], edge = [];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = (i + 0.5) / size * 2 - 1, v = 1 - (j + 0.5) / size * 2, rr = u * u + v * v;
    if (rr > 1) continue;
    const z = Math.sqrt(1 - rr);
    const yw = v * Math.cos(TILT) + z * Math.sin(TILT), zw = -v * Math.sin(TILT) + z * Math.cos(TILT);
    const lat = Math.asin(Math.max(-1, Math.min(1, yw))), lon = Math.atan2(u, zw);
    const lit = Math.max(0, u * LIGHT[0] + v * LIGHT[1] + z * LIGHT[2]);
    idx.push((j * size + i) * 4);
    row.push(Math.min(LH - 1, Math.floor((Math.PI / 2 - lat) / Math.PI * LH)) * LW);
    col.push((lon + Math.PI) / (2 * Math.PI) * LW);
    shade.push(0.06 + 0.94 * Math.pow(lit, 0.85));
    edge.push(255 * Math.min(1, (1 - Math.sqrt(rr)) * size / 3));
  }
  pIdx = Int32Array.from(idx); pRow = Int32Array.from(row); pCol = Float32Array.from(col);
  pShade = Float32Array.from(shade); pEdge = Uint8ClampedArray.from(edge);
  drawEarth();
}
function drawEarth() {
  if (!tex || !pIdx) return;
  const d = eimg.data, shift = ((-espin / (2 * Math.PI)) % 1 + 1) % 1 * LW;
  for (let k = 0; k < pIdx.length; k++) {
    let c = pCol[k] + shift; if (c >= LW) c -= LW;
    const t = (pRow[k] + (c | 0)) * 3, sh = pShade[k], o = pIdx[k];
    d[o] = tex[t] * sh; d[o + 1] = tex[t + 1] * sh; d[o + 2] = tex[t + 2] * sh; d[o + 3] = pEdge[k];
  }
  ectx.putImageData(eimg, 0, 0);
}
function startEarth() {
  drawEarth();
  if (eRun || reduced.matches) return;
  eRun = true;
  const tick = now => {
    if (!eRun) return;
    if (visible && !document.hidden) {
      if (!eLast) eLast = now;
      if (now - eLast > 33) { espin += (now - eLast) * (2 * Math.PI / 120000); eLast = now; drawEarth(); }  // one turn in two minutes
    } else eLast = 0;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
reduced.addEventListener && reduced.addEventListener("change", () => { if (reduced.matches) eRun = false; else startEarth(); });

/* ---- Start ---- */
let resizeT = 0;
window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { measure(); place(); }, 120); });
window.addEventListener("hashchange", () => {
  const i = SATELLITES.findIndex(s => s.id === location.hash.slice(1));
  if (i >= 0) select(i, { keepHash: true });
});
measure();
loadLand();
const fromHash = SATELLITES.findIndex(s => s.id === location.hash.slice(1));
const start = fromHash >= 0 ? fromHash : SATELLITES.findIndex(s => s.id === "smap");
// One sweep on arrival: the ring turns a quarter of the way round to the first satellite.
pos = start - (reduced.matches ? 0 : N / 4); place();
select(start, { keepHash: fromHash < 0, first: true });
})();
