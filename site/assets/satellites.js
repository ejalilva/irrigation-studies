/* Satellites behind my research: the data for satellites.html and the orbit-ring controller.

   The ring shows SATELLITES in order, which is launch order, so going round the ring runs from 1999 to today. Clicking one (or dragging the ring,
   or the arrow keys) brings it to the front, and the panel under the ring lists the studies that used it, as the
   same paper cards the water-cycle map uses (assets/journals.js). satellites.html#smap opens with SMAP in front.

   AGENCIES   name and the colour of its dot (light enough to read on the night sky)

   SATELLITES
     id        short id, used in the address (satellites.html#<id>)
     name      name on the ring
     full      full mission name (optional)
     agency    keys of AGENCIES, lead agency first
     launch    launch year, shown on the ring and in the panel as "Launched <year>"
     launchText replaces "Launched <year>" when that needs more words (optional)
     program   a programme shown beside the agency, e.g. "Copernicus" (optional)
     img       picture in assets/satellites/ with a transparent background; without one, an outline is shown and
               the label says the picture is still needed. cygnss.webp is one CYGNSS picture repeated: the lead
               satellite and its seven companions; gosat-gw.svg is a drawing made for this site
     sensor    the instrument and what it observes, one line
     role      what this satellite gave my work, one sentence
     papers    published studies, oldest first: { doi, note }. doi is the key of the paper in assets/journals.js
               (lowercase); note says what this satellite did in that study and is shown on the card
     work      ongoing or planned work: { title, status, text, planned (dashed card), link (optional) }
     hidden    true keeps a satellite off the ring (its picture can stay in assets/satellites/)

   The Earth (assets/satellites/): earth-day.webp is NASA's Blue Marble, earth-lights.webp the city lights of NASA's
   Earth at Night, earth-clouds.webp a NASA cloud map (all public domain; equirectangular, 2048 x 1024, taken from the
   three-globe examples), and earth-land.png the share of land per half-degree cell (GLOBE land mask, NOAA), used for
   the sun's glint on the oceans. */
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
  { id: "terra", name: "Terra", agency: ["NASA"], launch: "1999",
    img: "terra.webp", sensor: "MODIS: vegetation, land surface temperature and land cover",
    role: "MODIS on Terra describes the vegetation in my retrievals and models.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "MODIS NDVI from Terra gave the observed vegetation water content that strengthened the irrigation signal." },
      { doi: "10.1029/2022wr033342", note: "MODIS leaf area index and albedo, from Terra and Aqua, set the vegetation in the land surface model." },
      { doi: "10.3389/feart.2026.1854083", note: "MODIS land cover and NDVI set the vegetation and roughness parameters of the retrieval." }
    ] },
  { id: "aqua", name: "Aqua", agency: ["NASA"], launch: "2002",
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
  { id: "smos", name: "SMOS", full: "Soil Moisture and Ocean Salinity", agency: ["ESA"], launch: "2009",
    img: "smos.webp", sensor: "L-band interferometric radiometer: soil moisture and ocean salinity",
    role: "SMAP's L-band predecessor, and a possible bridge if SMAP's record ends.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "Compared with SMAP for sampling and radio interference, and weighed as an anchor for GNSS-R during a SMAP gap." }
    ] },
  { id: "gcom-w", name: "GCOM-W", full: "Global Change Observation Mission – Water, “Shizuku”", agency: ["JAXA"], launch: "2012",
    img: "gcom-w.webp", sensor: "AMSR2 microwave radiometer: soil moisture, snow and rain",
    role: "Where the irrigation work began: AMSR2 soil moisture rose in summers when no rain fell.",
    papers: [
      { doi: "10.1016/j.rse.2019.111226", note: "Inverting the water balance turned AMSR2's summer wetting into estimates of irrigation water." }
    ],
    work: [
      { title: "Snow depth from AMSR2", status: "Minor revision", text: "Coauthor of a machine learning, explainable-AI retrieval of near-real-time global snow depth from AMSR2, led by Kehan Yang." }
    ] },
  { id: "landsat", name: "Landsat 8 and 9", agency: ["NASA", "USGS"], launch: "2013", launchText: "Launched 2013 and 2021",
    img: "landsat.webp", sensor: "OLI and TIRS: land imagery and thermal at 30 m",
    role: "With Sentinel-2, the imagery that Earth-observation foundation models learn from.",
    work: [FM_WORK] },
  { id: "gpm", name: "GPM", full: "Global Precipitation Measurement", agency: ["NASA", "JAXA"], launch: "2014",
    img: "gpm.webp", sensor: "Precipitation radar and microwave imager, the reference for IMERG rainfall",
    role: "Rainfall, so that soil wetting from irrigation can be told apart from wetting by rain.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "IMERG precipitation showed which soil wetting rain could explain." },
      { doi: "10.1029/2022wr033342", note: "IMERG precipitation drove the VIC land surface model." }
    ] },
  { id: "sentinel-1", name: "Sentinel-1", agency: ["ESA"], launch: "2014", program: "Copernicus",
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
  { id: "smap", name: "SMAP", full: "Soil Moisture Active Passive", agency: ["NASA"], launch: "2015",
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
  { id: "sentinel-2", name: "Sentinel-2", agency: ["ESA"], launch: "2015", program: "Copernicus",
    img: "sentinel-2.webp", sensor: "Multispectral imager: vegetation and land at 10 m",
    role: "Optical detail at field scale, for soil moisture and crop properties.",
    papers: [
      { doi: "10.3390/su132011355", note: "A neural network estimated 10 m soil moisture from Sentinel-2 (R² 0.92), the best of the inputs tested." },
      { doi: "10.1016/j.rse.2025.114825", note: "Sentinel-2 NDVI, NDWI and red-edge bands were among the strongest drivers of crop water content." }
    ],
    work: [FM_WORK] },
  { id: "cygnss", name: "CYGNSS", full: "Cyclone Global Navigation Satellite System", agency: ["NASA"], launch: "2016",
    img: "cygnss.webp", sensor: "Eight microsatellites that read GPS signals reflected off the surface (GNSS-R)",
    role: "Sub-daily soil moisture from reflected navigation signals.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "CYGNSS sub-daily soil moisture was the main GNSS-R case: it complements SMAP but relies on it for calibration." }
    ] },
  { id: "iss", name: "ISS", full: "International Space Station, with ECOSTRESS", agency: ["NASA"], launch: "2018", launchText: "ECOSTRESS since 2018",
    img: "iss.webp", sensor: "ECOSTRESS: thermal images of plant temperature at about 70 m",
    role: "Finer thermal views, at changing times of day, for irrigation timing.",
    work: [
      { title: "AgroTrack with ECOSTRESS", status: "Planned for early 2027", planned: true,
        text: "An expanded AgroTrack release is to add ECOSTRESS and VIIRS, alongside formal NISAR support." }
    ] },
  { id: "gosat-gw", name: "GOSAT-GW", full: "Global Observing Satellite for Greenhouse gases and Water cycle", agency: ["JAXA"], launch: "2025",
    img: "gosat-gw.svg", sensor: "AMSR3 microwave radiometer: soil moisture, snow and rain",
    role: "AMSR3 continues the AMSR2 record where the irrigation work began.",
    work: [
      { title: "AMSR3 retrieval and assimilation", status: "In development",
        text: "Machine learning AMSR3 soil moisture retrieval and assimilation for LIS 7.9. A paper is planned for 2027." }
    ] },
  { id: "nisar", name: "NISAR", full: "NASA–ISRO Synthetic Aperture Radar", agency: ["NASA", "ISRO"], launch: "2025",
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
  // Off the ring for now; delete "hidden: true" to bring it back.
  { id: "wsf-m", name: "WSF-M", full: "Weather System Follow-on – Microwave", agency: ["USSF"], hidden: true, launch: "2024",
    sensor: "Microwave imager: soil moisture, ocean winds and more",
    role: "A new microwave source of soil moisture for NASA's Land Information System.",
    work: [
      { title: "WSF-M in NASA LIS", status: "Delivered, April 2026",
        text: "Machine learning soil moisture retrieval and the first WSF assimilation capability in NASA LIS, delivered with LIS 7.8." }
    ] },
  // Kept off the ring until a study of mine uses it.
  { id: "sentinel-3", name: "Sentinel-3", agency: ["ESA"], launch: "2016", program: "Copernicus", hidden: true,
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
const launched = s => s.launchText || "Launched " + s.launch;
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
  b.setAttribute("aria-label", `${s.name}, ${s.agency.map(a => AGENCIES[a].name).join(" and ")}, ${launched(s).toLowerCase()}, ${tag}`);
  b.innerHTML = `<img class="sat-img" src="${S}${s.img || "placeholder.svg"}" alt="" draggable="false" decoding="async">
    <span class="sat-label">${dots(s)}<span class="sat-name">${esc(s.name)}</span><span class="sat-count${n ? "" : " is-work"}">${n || "in progress"}</span></span>
    <span class="sat-year">${esc(launched(s))}</span>
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
      <p class="sp-agency">${agencies}${s.program ? `<span class="sp-program">${esc(s.program)}</span>` : ""}<span class="sp-launch">${esc(launched(s))}</span></p>
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

/* ---- Night sky: the Milky Way across the stage, and stars of many brightnesses and colours ---- */
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s; }
function drawStars() {
  const c = stage.querySelector(".orbit-stars"), dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
  const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  // deep sky
  const bg = g.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.hypot(W, H) * 0.6);
  bg.addColorStop(0, "#0b1426"); bg.addColorStop(0.55, "#060b17"); bg.addColorStop(1, "#02040a");
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // the Milky Way: a soft band from lower left to upper right, mottled, with darker dust lanes along its middle
  const sc = 4, mw = Math.ceil(W / sc), mh = Math.ceil(H / sc), off = document.createElement("canvas");
  off.width = mw; off.height = mh;
  const og = off.getContext("2d"), im = og.createImageData(mw, mh), d = im.data;
  const x0 = -0.05 * mw, y0 = 0.95 * mh, x1 = 1.05 * mw, y1 = 0.02 * mh, len = Math.hypot(x1 - x0, y1 - y0);
  const nx = -(y1 - y0) / len, ny = (x1 - x0) / len, width = 0.15 * Math.hypot(mw, mh);
  const band = (x, y) => { const t = ((x - x0) * nx + (y - y0) * ny) / width; return Math.exp(-t * t * 1.6); };
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    const t = ((x - x0) * nx + (y - y0) * ny) / width, along = ((x - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / len / len;
    const core = Math.exp(-t * t * 1.6), n = fbm(x / 26, y / 26), n2 = fbm(x / 9 + 40, y / 9 - 7, 4);
    let dens = core * (0.4 + 1.05 * n * n) * (0.55 + 0.45 * Math.sin(along * Math.PI));
    const lane = Math.exp(-Math.pow((t + 0.12 * (n2 - 0.5)) * 3.2, 2)) * Math.max(0, n2 * 1.6 - 0.45);
    dens *= 1 - Math.min(0.85, lane);
    dens = Math.max(0, Math.min(1, dens));
    const warm = Math.exp(-t * t * 4);  // warmer, yellowish towards the middle of the band
    const k = (y * mw + x) * 4;
    d[k] = 150 + 95 * warm; d[k + 1] = 160 + 70 * warm; d[k + 2] = 215 - 25 * warm; d[k + 3] = 255 * dens * 0.42;
  }
  og.putImageData(im, 0, 0);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  g.drawImage(off, 0, 0, W, H);
  // stars: mostly faint, more of them inside the band, a few bright ones with a glow
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const COLORS = [[170, 191, 255], [202, 216, 255], [248, 247, 255], [255, 244, 234], [255, 229, 196], [255, 208, 160]];
  const WEIGHTS = [0.05, 0.12, 0.33, 0.27, 0.15, 0.08];
  const pick = () => { let r = rnd(), i = 0; while (i < WEIGHTS.length - 1 && (r -= WEIGHTS[i]) > 0) i++; return COLORS[i]; };
  const n = Math.round(W * H / 260);
  for (let i = 0; i < n; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (rnd() > 0.32 + 0.68 * band(x / sc, y / sc) * 1.15) continue;
    const m = Math.pow(rnd(), 4.2);  // brightness: most stars are faint
    const [r, gg, b] = pick(), a = 0.14 + 0.86 * m, rad = 0.25 + 1.05 * m;
    if (m > 0.62) {
      const gl = g.createRadialGradient(x, y, 0, x, y, rad * 5);
      gl.addColorStop(0, `rgba(${r},${gg},${b},${(0.26 * m).toFixed(2)})`); gl.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gl; g.beginPath(); g.arc(x, y, rad * 5, 0, 2 * Math.PI); g.fill();
    }
    g.fillStyle = `rgba(${r},${gg},${b},${a.toFixed(2)})`;
    g.beginPath(); g.arc(x, y, rad, 0, 2 * Math.PI); g.fill();
    if (m > 0.93) {  // the brightest few get faint diffraction spikes
      g.strokeStyle = `rgba(${r},${gg},${b},0.14)`; g.lineWidth = 0.5;
      g.beginPath(); g.moveTo(x - rad * 7, y); g.lineTo(x + rad * 7, y); g.moveTo(x, y - rad * 7); g.lineTo(x, y + rad * 7); g.stroke();
    }
  }
}

/* ---- The Earth: NASA's Blue Marble on an orthographic globe, sunlit from the upper left, with clouds, the
   sun's glint on the oceans, city lights on the night side and a thin atmosphere; it turns slowly west to east ---- */
let TW = 0, TH = 0, tDay = null, tCloud = null, tLight = null, tWater = null;
let ectx = null, eimg = null, eRun = false, visible = true, eLast = 0;
let pIdx, pRow, pCol, pShade, pSpec, pNight, pRim, pEdge;
let espin = -45 * Math.PI / 180;  // opens with Lake Urmia, where the irrigation work began, facing the viewer
const TILT = 22 * Math.PI / 180;
const LIGHT = (() => { const v = [-0.6, 0.38, 0.7], m = Math.hypot(...v); return v.map(x => x / m); })();
const HALF = (() => { const v = [LIGHT[0], LIGHT[1], LIGHT[2] + 1], m = Math.hypot(...v); return v.map(x => x / m); })();
function pixels(src, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(src, 0, 0, w, h);
  return g.getImageData(0, 0, w, h).data;
}
function loadImage(name) {
  return new Promise((ok, fail) => { const im = new Image(); im.onload = () => ok(im); im.onerror = fail; im.src = S + name; });
}
function loadEarth() {
  Promise.all(["earth-day.webp", "earth-clouds.webp", "earth-lights.webp", "earth-land.png"].map(loadImage)).then(([day, cl, li, land]) => {
    TW = day.width; TH = day.height;
    const dd = pixels(day, TW, TH), cd = pixels(cl, TW, TH), ld = pixels(li, TW, TH), wd = pixels(land, TW, TH);
    const n = TW * TH;
    tDay = new Uint8ClampedArray(n * 3); tCloud = new Uint8ClampedArray(n); tLight = new Uint8ClampedArray(n); tWater = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      tDay[i * 3] = dd[i * 4]; tDay[i * 3 + 1] = dd[i * 4 + 1]; tDay[i * 3 + 2] = dd[i * 4 + 2];
      tCloud[i] = cd[i * 4]; tLight[i] = ld[i * 4]; tWater[i] = 255 - wd[i * 4];
    }
    earthSetup(); startEarth();
  }).catch(() => {});
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function earthSetup() {
  const c = stage.querySelector(".orbit-earth canvas"), dpr = Math.min(2, window.devicePixelRatio || 1);
  const size = Math.max(2, Math.round(2 * ER * dpr));
  c.width = c.height = size; ectx = c.getContext("2d"); eimg = ectx.createImageData(size, size);
  if (!TW) return;
  // worked out once per pixel of the disc: where it is, its row and longitude in the maps, and its light
  const idx = [], row = [], col = [], shade = [], spec = [], night = [], rim = [], edge = [];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const u = (i + 0.5) / size * 2 - 1, v = 1 - (j + 0.5) / size * 2, rr = u * u + v * v;
    if (rr > 1) continue;
    const z = Math.sqrt(1 - rr);
    const yw = v * Math.cos(TILT) + z * Math.sin(TILT), zw = -v * Math.sin(TILT) + z * Math.cos(TILT);
    const lat = Math.asin(Math.max(-1, Math.min(1, yw))), lon = Math.atan2(u, zw);
    const dot = u * LIGHT[0] + v * LIGHT[1] + z * LIGHT[2], day = smooth(-0.12, 0.22, dot);
    idx.push((j * size + i) * 4);
    row.push(Math.min(TH - 1, Math.floor((Math.PI / 2 - lat) / Math.PI * TH)) * TW);
    col.push((lon + Math.PI) / (2 * Math.PI) * TW);
    shade.push(0.02 + day * (0.3 + 0.7 * Math.pow(Math.max(0, dot), 0.75)));
    spec.push(day * Math.pow(Math.max(0, u * HALF[0] + v * HALF[1] + z * HALF[2]), 60));
    night.push(1 - smooth(-0.3, 0.06, dot));
    rim.push(Math.pow(1 - z, 2.6) * (0.25 + 0.75 * day));
    edge.push(255 * Math.min(1, (1 - Math.sqrt(rr)) * size / 2.5));
  }
  pIdx = Int32Array.from(idx); pRow = Int32Array.from(row); pCol = Float32Array.from(col);
  pShade = Float32Array.from(shade); pSpec = Float32Array.from(spec); pNight = Float32Array.from(night);
  pRim = Float32Array.from(rim); pEdge = Uint8ClampedArray.from(edge);
  drawEarth();
}
function drawEarth() {
  if (!tDay || !pIdx) return;
  const d = eimg.data, shift = ((-espin / (2 * Math.PI)) % 1 + 1) % 1 * TW;
  for (let k = 0; k < pIdx.length; k++) {
    let c = pCol[k] + shift; if (c >= TW) c -= TW;
    const t = pRow[k] + (c | 0), t3 = t * 3, o = pIdx[k];
    const cl = tCloud[t] / 255, cw = cl * 0.92, sh = pShade[k];
    let r = (tDay[t3] * (1 - cw) + 240 * cw) * sh;
    let g = (tDay[t3 + 1] * (1 - cw) + 242 * cw) * sh;
    let b = (tDay[t3 + 2] * (1 - cw) + 248 * cw) * sh;
    const glint = pSpec[k] * (tWater[t] / 255) * (1 - cl) * 210;
    const lights = pNight[k] * (tLight[t] / 255) * (1 - cl * 0.85);
    const rim = pRim[k];
    d[o] = r + glint + lights * 255 + rim * 70;
    d[o + 1] = g + glint * 0.95 + lights * 196 + rim * 135;
    d[o + 2] = b + glint * 0.85 + lights * 120 + rim * 255;
    d[o + 3] = pEdge[k];
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
      if (now - eLast > 33) { espin += (now - eLast) * (2 * Math.PI / 150000); eLast = now; drawEarth(); }  // one turn in two and a half minutes
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
loadEarth();
const fromHash = SATELLITES.findIndex(s => s.id === location.hash.slice(1));
const start = fromHash >= 0 ? fromHash : SATELLITES.findIndex(s => s.id === "smap");
// One sweep on arrival: the ring turns a quarter of the way round to the first satellite.
pos = start - (reduced.matches ? 0 : N / 4); place();
select(start, { keepHash: fromHash < 0, first: true });
})();
