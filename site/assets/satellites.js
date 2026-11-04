/* Satellites behind my research: the data for satellites.html and its controller.

   Two arrangements of the same satellites, switched with Orbit and Spectrum on the sky:
   - Orbit: a ring around a turning Earth on the Milky Way. SATELLITES are in launch order around the ring; clicking
     one, dragging the ring or the arrow keys brings it to the front.
   - Spectrum: the Earth and the sky give way to the electromagnetic spectrum (long waves on the left, as on NASA's
     chart): the atmosphere's windows, a wave that gets shorter to the right, the bands and, under the scale, what
     each part of the spectrum shows (USES). Each satellite flies to the wavelength it measures.
   The panel under the sky lists the selected satellite's studies, as the paper cards of the water-cycle map
   (assets/journals.js). satellites.html#smap opens with SMAP selected; satellites.html?view=spectrum opens the
   spectrum.

   AGENCIES   name and the colour of its dot (light enough to read on the night sky)

   SATELLITES
     id        short id, used in the address (satellites.html#<id>)
     name      name on the ring
     full      full mission name (optional)
     agency    keys of AGENCIES, lead agency first
     launch    launch year, shown on the ring and in the panel as "Launched <year>"
     launchText replaces "Launched <year>" when that needs more words (optional)
     program   a programme shown beside the agency, e.g. "Copernicus" (optional)
     wave      the wavelength in metres where the satellite sits on the spectrum (the band my studies used)
     waveText  the wavelengths it measures, shown under its name on the spectrum
     img       picture in assets/satellites/ with a transparent background; without one, an outline is shown and
               the label says the picture is still needed. cygnss.webp is one CYGNSS picture repeated: the lead
               satellite and its seven companions; gosat-gw.svg is a drawing made for this site
     sensor    the instrument and what it observes, one line
     role      what this satellite gave my work, one sentence (kept for reference, not shown)
     papers    published studies, oldest first: { doi, note }. doi is the key of the paper in assets/journals.js
               (lowercase); note says what this satellite did in that study (kept for reference, not shown)
     work      ongoing or planned work: { title, status, text (not shown), planned, link (optional) }
     hidden    true keeps a satellite off the ring (its picture can stay in assets/satellites/)

   The sky: assets/satellites/space.webp, the Milky Way photo Ehsan chose. The Earth (assets/satellites/): earth-day.webp is NASA's Blue Marble, earth-lights.webp the city lights of NASA's
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
  { id: "terra", name: "Terra", agency: ["NASA"], launch: "1999", wave: 0.75e-6, waveText: "0.6–0.9 µm",
    img: "terra.webp", sensor: "MODIS: vegetation, land surface temperature and land cover",
    role: "MODIS on Terra describes the vegetation in my retrievals and models.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "MODIS NDVI from Terra gave the observed vegetation water content that strengthened the irrigation signal." },
      { doi: "10.1029/2022wr033342", note: "MODIS leaf area index and albedo, from Terra and Aqua, set the vegetation in the land surface model." },
      { doi: "10.3389/feart.2026.1854083", note: "MODIS land cover and NDVI set the vegetation and roughness parameters of the retrieval." }
    ] },
  { id: "aqua", name: "Aqua", agency: ["NASA"], launch: "2002", wave: 11e-6, waveText: "11 µm",
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
  { id: "smos", name: "SMOS", full: "Soil Moisture and Ocean Salinity", agency: ["ESA"], launch: "2009", wave: 0.21, waveText: "21 cm",
    img: "smos.webp", sensor: "L-band interferometric radiometer: soil moisture and ocean salinity",
    role: "SMAP's L-band predecessor, and a possible bridge if SMAP's record ends.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "Compared with SMAP for sampling and radio interference, and weighed as an anchor for GNSS-R during a SMAP gap." }
    ] },
  { id: "gcom-w", name: "GCOM-W", full: "Global Change Observation Mission – Water, “Shizuku”", agency: ["JAXA"], launch: "2012", wave: 0.03, waveText: "3 mm–4 cm",
    img: "gcom-w.webp", sensor: "AMSR2 microwave radiometer: soil moisture, snow and rain",
    role: "Where the irrigation work began: AMSR2 soil moisture rose in summers when no rain fell.",
    papers: [
      { doi: "10.1016/j.rse.2019.111226", note: "Inverting the water balance turned AMSR2's summer wetting into estimates of irrigation water." }
    ],
    work: [
      { title: "Snow depth from AMSR2", status: "Minor revision", text: "Coauthor of a machine learning, explainable-AI retrieval of near-real-time global snow depth from AMSR2, led by Kehan Yang." }
    ] },
  { id: "landsat", name: "Landsat 8 and 9", agency: ["NASA", "USGS"], launch: "2013", wave: 1e-6, waveText: "0.4–2.3 µm", launchText: "Launched 2013 and 2021",
    img: "landsat.webp", sensor: "OLI and TIRS: land imagery and thermal at 30 m",
    role: "With Sentinel-2, the imagery that Earth-observation foundation models learn from.",
    work: [FM_WORK] },
  { id: "gpm", name: "GPM", full: "Global Precipitation Measurement", agency: ["NASA", "JAXA"], launch: "2014", wave: 0.012, waveText: "8 mm and 2.2 cm",
    img: "gpm.webp", sensor: "Precipitation radar and microwave imager, the reference for IMERG rainfall",
    role: "Rainfall, so that soil wetting from irrigation can be told apart from wetting by rain.",
    papers: [
      { doi: "10.1109/jstars.2021.3119228", note: "IMERG precipitation showed which soil wetting rain could explain." },
      { doi: "10.1029/2022wr033342", note: "IMERG precipitation drove the VIC land surface model." }
    ] },
  { id: "sentinel-1", name: "Sentinel-1", agency: ["ESA"], launch: "2014", wave: 0.0555, waveText: "5.5 cm", program: "Copernicus",
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
  { id: "smap", name: "SMAP", full: "Soil Moisture Active Passive", agency: ["NASA"], launch: "2015", wave: 0.21, waveText: "21 cm",
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
  { id: "sentinel-2", name: "Sentinel-2", agency: ["ESA"], launch: "2015", wave: 0.8e-6, waveText: "0.4–2.2 µm", program: "Copernicus",
    img: "sentinel-2.webp", sensor: "Multispectral imager: vegetation and land at 10 m",
    role: "Optical detail at field scale, for soil moisture and crop properties.",
    papers: [
      { doi: "10.3390/su132011355", note: "A neural network estimated 10 m soil moisture from Sentinel-2 (R² 0.92), the best of the inputs tested." },
      { doi: "10.1016/j.rse.2025.114825", note: "Sentinel-2 NDVI, NDWI and red-edge bands were among the strongest drivers of crop water content." }
    ],
    work: [FM_WORK] },
  { id: "cygnss", name: "CYGNSS", full: "Cyclone Global Navigation Satellite System", agency: ["NASA"], launch: "2016", wave: 0.19, waveText: "19 cm",
    img: "cygnss.webp", sensor: "Eight microsatellites that read GPS signals reflected off the surface (GNSS-R)",
    role: "Sub-daily soil moisture from reflected navigation signals.",
    papers: [
      { doi: "10.1029/2026wr044944", note: "CYGNSS sub-daily soil moisture was the main GNSS-R case: it complements SMAP but relies on it for calibration." }
    ] },
  { id: "iss", name: "ISS", full: "International Space Station, with ECOSTRESS", agency: ["NASA"], launch: "2018", wave: 10e-6, waveText: "8–12 µm", launchText: "ECOSTRESS since 2018",
    img: "iss.webp", sensor: "ECOSTRESS: thermal images of plant temperature at about 70 m",
    role: "Finer thermal views, at changing times of day, for irrigation timing.",
    work: [
      { title: "AgroTrack with ECOSTRESS", status: "Planned for early 2027", planned: true,
        text: "An expanded AgroTrack release is to add ECOSTRESS and VIIRS, alongside formal NISAR support." }
    ] },
  { id: "gosat-gw", name: "GOSAT-GW", full: "Global Observing Satellite for Greenhouse gases and Water cycle", agency: ["JAXA"], launch: "2025", wave: 0.02, waveText: "1.6 mm–4 cm",
    img: "gosat-gw.svg", sensor: "AMSR3 microwave radiometer: soil moisture, snow and rain",
    role: "AMSR3 continues the AMSR2 record where the irrigation work began.",
    work: [
      { title: "AMSR3 retrieval and assimilation", status: "In development",
        text: "Machine learning AMSR3 soil moisture retrieval and assimilation for LIS 7.9. A paper is planned for 2027." }
    ] },
  { id: "nisar", name: "NISAR", full: "NASA–ISRO Synthetic Aperture Radar", agency: ["NASA", "ISRO"], launch: "2025", wave: 0.15, waveText: "9 and 24 cm",
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
  { id: "wsf-m", name: "WSF-M", full: "Weather System Follow-on – Microwave", agency: ["USSF"], hidden: true, launch: "2024", wave: 0.03, waveText: "3 mm–4 cm",
    sensor: "Microwave imager: soil moisture, ocean winds and more",
    role: "A new microwave source of soil moisture for NASA's Land Information System.",
    work: [
      { title: "WSF-M in NASA LIS", status: "Delivered, April 2026",
        text: "Machine learning soil moisture retrieval and the first WSF assimilation capability in NASA LIS, delivered with LIS 7.8." }
    ] },
  // Kept off the ring until a study of mine uses it.
  { id: "sentinel-3", name: "Sentinel-3", agency: ["ESA"], launch: "2016", wave: 0.6e-6, waveText: "0.4–12 µm", program: "Copernicus", hidden: true,
    img: "sentinel-3.webp", sensor: "SLSTR and OLCI: land surface temperature and colour", role: "" }
].filter(s => !s.hidden);

/* What each part of the spectrum shows in my work: the circles under the wavelength scale. */
const USES = [
  { label: "Soil moisture", wave: 0.21, icon: "soil" },
  { label: "Through clouds", wave: 0.0555, icon: "cloud" },
  { label: "Rain", wave: 0.012, icon: "rain" },
  { label: "Heat", wave: 11e-6, icon: "heat" },
  { label: "Vegetation", wave: 0.65e-6, icon: "leaf" }
];
/* How opaque the atmosphere is (0 clear, 1 opaque) from 1 m to 0.3 µm; approximate, after the usual
   transmission charts: the radio window, the water-vapour and oxygen lines, the thermal window, the optical window. */
const OPACITY = [[1, .03], [.3, .01], [.1, .01], [.03, .03], [.016, .1], [.0135, .2], [.011, .08], [.007, .12], [.005, .72],
  [.004, .28], [.003, .22], [.0025, .62], [.002, .38], [.0016, .86], [.001, .66], [5e-4, .95], [1e-4, 1], [3e-5, 1], [2e-5, .94],
  [1.5e-5, .7], [1.3e-5, .26], [1.05e-5, .14], [9.6e-6, .46], [9e-6, .2], [8e-6, .3], [7e-6, .95], [5.5e-6, .95], [5e-6, .58],
  [4.3e-6, .95], [4e-6, .3], [3.5e-6, .24], [3e-6, .9], [2.7e-6, .95], [2.4e-6, .3], [2e-6, .24], [1.9e-6, .88], [1.7e-6, .2],
  [1.4e-6, .84], [1.2e-6, .15], [1e-6, .1], [7e-7, .08], [5e-7, .12], [4e-7, .2], [3.2e-7, .8], [3e-7, .95]];
const ICONS = {
  soil: '<path d="M12 3.5c2.6 3.2 4.2 5.4 4.2 7.4a4.2 4.2 0 0 1-8.4 0c0-2 1.6-4.2 4.2-7.4z"/><path d="M3 18.5h18M6.5 21.5h11"/>',
  cloud: '<path d="M7 13.5a3.8 3.8 0 0 1 .5-7.55A5 5 0 0 1 17 6.6a3.4 3.4 0 0 1 .4 6.9H7z"/><path d="M12 16v6" stroke-dasharray="2 2.2"/>',
  rain: '<path d="M7 12.5a3.8 3.8 0 0 1 .5-7.55A5 5 0 0 1 17 5.6a3.4 3.4 0 0 1 .4 6.9H7z"/><path d="M9 15.5l-1 3.5M13 15.5l-1 3.5M17 15.5l-1 3.5"/>',
  heat: '<path d="M10 14.2V5a2 2 0 0 1 4 0v9.2a4 4 0 1 1-4 0z"/><path d="M12 9v7.5"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
  orbit: '<circle cx="12" cy="12" r="3.4"/><ellipse cx="12" cy="12" rx="9.6" ry="4.2" transform="rotate(-20 12 12)"/>',
  wave: '<path d="M2 12c1.6-6 3.2-6 4.8 0s3 6 4.4 0 2.6-5 3.8 0 2.2 4 3.1 0 1.6-3 2.4 0"/>',
  prev: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>'
};
const svgIcon = (k, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

/* ------------------------------------------------------------------------------------------------------------ */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stage = document.getElementById("orbit");
const panel = document.getElementById("sat-panel");
if (!stage || !panel) return;
const N = SATELLITES.length, STEP = 2 * Math.PI / N;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let mode = new URLSearchParams(location.search).get("view") === "spectrum" ? "spectrum" : "orbit";

/* ---- Build the stage ---- */
stage.innerHTML = `
  <div class="sky sky-space" aria-hidden="true"></div>
  <div class="sky sky-spectrum" aria-hidden="true"></div>
  <svg class="orbit-path orbit-back" aria-hidden="true"><path/></svg>
  <div class="orbit-earth" aria-hidden="true"><canvas></canvas></div>
  <svg class="orbit-path orbit-front" aria-hidden="true"><path/></svg>
  <svg class="spectrum" aria-hidden="true"></svg>
  <ul class="spectrum-uses" aria-label="What each part of the spectrum shows"></ul>
  <div class="orbit-ring" role="tablist" aria-label="Satellites"></div>
  <div class="orbit-modes" role="group" aria-label="Arrange the satellites">
    <button type="button" data-mode="orbit">${svgIcon("orbit")}Orbit</button>
    <button type="button" data-mode="spectrum">${svgIcon("wave")}Spectrum</button>
  </div>
  <div class="orbit-controls">
    <button class="orbit-step prev" type="button" aria-label="Previous satellite">${svgIcon("prev")}</button>
    <button class="orbit-step next" type="button" aria-label="Next satellite">${svgIcon("next")}</button>
  </div>
  <ul class="orbit-legend" aria-label="Agencies"></ul>`;
stage.dataset.mode = mode;
const ring = stage.querySelector(".orbit-ring");
const specSvg = stage.querySelector(".spectrum");
const usesList = stage.querySelector(".spectrum-uses");
const modeButtons = [...stage.querySelectorAll(".orbit-modes button")];
const used = [...new Set(SATELLITES.flatMap(s => s.agency))];
stage.querySelector(".orbit-legend").innerHTML = Object.keys(AGENCIES).filter(k => used.includes(k))
  .map(k => `<li><span class="ag-dot" style="--ag:${AGENCIES[k].color}"></span>${esc(AGENCIES[k].name)}</li>`).join("");
usesList.innerHTML = USES.map(u => `<li><span class="use-icon">${svgIcon(u.icon)}</span><span class="use-label">${esc(u.label)}</span></li>`).join("");
const useItems = [...usesList.children];

const dots = s => s.agency.map(a => `<span class="ag-dot" style="--ag:${AGENCIES[a].color}" title="${esc(AGENCIES[a].name)}"></span>`).join("");
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
  b.setAttribute("aria-label", `${s.name}, ${s.agency.map(a => AGENCIES[a].name).join(" and ")}, ${launched(s).toLowerCase()}, ${s.waveText}`);
  b.innerHTML = `<img class="sat-img" src="${S}${s.img || "placeholder.svg"}" alt="" draggable="false" decoding="async">
    <span class="sat-label">${dots(s)}<span class="sat-name">${esc(s.name)}</span></span>
    <span class="sat-sub sat-year">${esc(s.launch)}</span><span class="sat-sub sat-wave">${esc(s.waveText)}</span>`;
  b.addEventListener("click", e => { if (dragMoved) { e.preventDefault(); return; } select(i); });
  ring.appendChild(b);
  return b;
});

/* ---- Geometry ---- */
let W = 0, H = 0, cx = 0, cy = 0, Rx = 0, Ry = 0, ER = 0, BW = 0, LABEL = 0.6, EXP = 5, narrow = false;
let pos = 0, current = -1, anim = 0;
const cur = [];  // the last state drawn for each satellite: { x, y, s, o, z, label }
// the spectrum: x for a wavelength, the bar, and each satellite's slot
const LMAX = 1, LMIN = 3e-7, LOGSPAN = Math.log10(LMAX / LMIN);
let SX0 = 0, SX1 = 0, BAR = 0, BARH = 24, PH = 150, slots = [];
const lx = l => SX0 + Math.log10(LMAX / l) / LOGSPAN * (SX1 - SX0);
function spread(want, gap, lo, hi) {  // positions in order, at least gap apart, kept within [lo, hi]
  const n = want.length, p = want.slice();
  gap = Math.min(gap, (hi - lo) / Math.max(1, n - 1));
  for (let it = 0; it < 300; it++) {
    for (let k = 1; k < n; k++) if (p[k] - p[k - 1] < gap) { const m = (p[k] + p[k - 1]) / 2; p[k - 1] = m - gap / 2; p[k] = m + gap / 2; }
    for (let k = 0; k < n; k++) p[k] = Math.max(lo, Math.min(hi, p[k]));
  }
  return p;
}
function measure() {
  W = stage.clientWidth; H = stage.clientHeight;
  narrow = W < 700;
  cx = W / 2; cy = H * 0.40;
  Rx = narrow ? W * 0.42 : Math.min(W * 0.40, 540);
  Ry = Math.min(Rx * (narrow ? 0.52 : 0.30), H * 0.24);
  ER = Ry * (narrow ? 0.86 : 0.94);
  BW = narrow ? W * 0.36 : Math.max(150, Math.min(W * 0.19, 260));
  LABEL = narrow ? 0.95 : 0.6; EXP = narrow ? 8 : 5;
  stage.style.setProperty("--sw", BW + "px");
  const earth = stage.querySelector(".orbit-earth");
  Object.assign(earth.style, { width: 2 * ER + "px", height: 2 * ER + "px", left: cx - ER + "px", top: cy - ER + "px" });
  for (const [sel, sweep] of [[".orbit-back", 1], [".orbit-front", 0]]) {
    const svg = stage.querySelector(sel);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.querySelector("path").setAttribute("d", `M${cx - Rx} ${cy} A${Rx} ${Ry} 0 0 ${sweep} ${cx + Rx} ${cy}`);
  }
  // spectrum layout
  const m = narrow ? 16 : Math.max(32, (W - 1200) / 2);
  SX0 = m; SX1 = W - m;
  BAR = Math.round(H * (narrow ? 0.66 : 0.70)); BARH = narrow ? 20 : 24; PH = narrow ? 92 : 150;
  const rows = narrow ? 3 : 2, box = narrow ? 70 : 120;
  const rowY = narrow ? [0.16, 0.28, 0.40] : [0.17, 0.33];
  const order = SATELLITES.map((s, i) => i).sort((a, b) => SATELLITES[b].wave - SATELLITES[a].wave || a - b);
  const xs = spread(order.map(i => lx(SATELLITES[i].wave)), narrow ? (SX1 - SX0) / (N - 1) : 96, SX0 + box * 0.4, SX1 - box * 0.4);
  slots = [];
  order.forEach((i, k) => { slots[i] = { x: xs[k], y: H * rowY[k % rows], s: box / BW, row: k % rows }; });
  drawSpectrum();
  earthSetup();
}

/* ---- The spectrum drawing ---- */
function smoothPath(pts) {  // Catmull-Rom through the points, as cubic Béziers
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
function drawSpectrum() {
  // the atmosphere: where it is opaque the band fills up
  const prof = OPACITY.map(([l, o]) => [lx(l), BAR - o * PH * 0.92]);
  const profD = `M${SX0} ${BAR} L${prof[0][0].toFixed(1)} ${prof[0][1].toFixed(1)} ` + smoothPath(prof).slice(1).replace(/^[^C]*/, "") + ` L${SX1} ${BAR} Z`;
  // a wave whose wavelength shrinks from left to right
  const wy = BAR - PH * 0.48, amp = PH * 0.16, pL = narrow ? 90 : 190, pR = narrow ? 2.4 : 3.2;
  let ph = 0, wave = `M${SX0} ${wy.toFixed(1)}`;
  for (let x = SX0; x <= SX1; x += 1) {
    const t = (x - SX0) / (SX1 - SX0), per = pL * Math.pow(pR / pL, t);
    ph += 2 * Math.PI / per;
    wave += ` L${x} ${(wy - amp * Math.sin(ph)).toFixed(1)}`;
  }
  const vis0 = lx(7e-7), vis1 = lx(4e-7);
  const bands = [["Microwave", LMAX, 1e-3], ["Infrared", 1e-3, 7e-7], ["Visible", 7e-7, 4e-7]];
  const ticks = [[1, "1 m"], [0.1, "10 cm"], [0.01, "1 cm"], [1e-3, "1 mm"], [1e-4, "100 µm"], [1e-5, "10 µm"], [1e-6, "1 µm"]];
  const satLines = SATELLITES.map((s, i) => {
    const sl = slots[i], y0 = sl.y + BW * sl.s * 0.62, x1 = lx(s.wave);
    return `<path class="lead" data-i="${i}" d="M${sl.x.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${BAR - 2}"/><circle class="lead-dot" data-i="${i}" cx="${x1.toFixed(1)}" cy="${BAR}" r="3"/>`;
  }).join("");
  // what each part of the spectrum shows: circles under the scale
  const ur = narrow ? 22 : 30, uy = Math.round(H * (narrow ? 0.85 : 0.86));
  const ux = spread(USES.map(u => lx(u.wave)), narrow ? 82 : ur * 2 + 40, SX0 + (narrow ? 30 : ur), SX1 - (narrow ? 30 : ur));
  useItems.forEach((li, k) => { li.style.left = ux[k] + "px"; li.style.top = uy + "px"; li.style.setProperty("--ur", ur + "px"); });
  const useLines = USES.map((u, k) => `<path d="M${ux[k].toFixed(1)} ${uy - ur - 4} L${lx(u.wave).toFixed(1)} ${BAR + BARH + 22}"/>`).join("");
  specSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  specSvg.innerHTML = `
    <defs>
      <linearGradient id="sp-rainbow" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#ff3b30"/><stop offset=".2" stop-color="#ff9500"/><stop offset=".4" stop-color="#ffd60a"/>
        <stop offset=".6" stop-color="#34c759"/><stop offset=".8" stop-color="#0a84ff"/><stop offset="1" stop-color="#8e5cf7"/>
      </linearGradient>
      <linearGradient id="sp-fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
      <mask id="sp-beam"><rect x="0" y="0" width="${W}" height="${BAR}" fill="url(#sp-fade)"/></mask>
    </defs>
    <rect class="sp-beam" x="${vis0.toFixed(1)}" y="0" width="${(vis1 - vis0).toFixed(1)}" height="${BAR}" fill="url(#sp-rainbow)" mask="url(#sp-beam)"/>
    <path class="sp-atmos" d="${profD}"/>
    <path class="sp-wave" d="${wave}" pathLength="1"/>
    <g class="sp-leads">${satLines}</g>
    <rect class="sp-bar" x="${SX0}" y="${BAR}" width="${SX1 - SX0}" height="${BARH}" rx="3"/>
    <rect x="${vis0.toFixed(1)}" y="${BAR}" width="${(vis1 - vis0).toFixed(1)}" height="${BARH}" fill="url(#sp-rainbow)"/>
    ${bands.map(([name, a, b]) => {
      const x0 = lx(a), x1 = lx(b), w = x1 - x0;
      return w > 70 ? `<text class="sp-band" x="${((x0 + x1) / 2).toFixed(1)}" y="${BAR + BARH * 0.7}">${name}</text>`
        : `<text class="sp-band sp-band-out" x="${((x0 + x1) / 2).toFixed(1)}" y="${BAR - 8}">${name}</text>`;
    }).join("")}
    ${ticks.map(([l, t]) => `<path class="sp-tick" d="M${lx(l).toFixed(1)} ${BAR + BARH} v6"/><text class="sp-tickl" x="${lx(l).toFixed(1)}" y="${BAR + BARH + 20}">${t}</text>`).join("")}
    <g class="sp-uselines">${useLines}</g>`;
  markLeaders();
}
function markLeaders() {
  specSvg.querySelectorAll("[data-i]").forEach(el => el.classList.toggle("on", +el.dataset.i === current));
}

/* ---- Where each satellite is drawn ---- */
function orbitState(i) {
  let a = (i - pos) * STEP;
  a = Math.atan2(Math.sin(a), Math.cos(a));
  const d = Math.cos(a), t = (d + 1) / 2;
  return {
    x: cx + Rx * Math.sin(a), y: cy + Ry * d,
    s: (0.3 + 0.7 * Math.pow(t, EXP)) * (1 + 0.18 * Math.max(0, (d - 0.9) / 0.1)),
    o: 0.4 + 0.6 * t, z: 100 + Math.round(d * 90) + (d > 0 ? 2 : 0), label: d > LABEL
  };
}
function spectrumState(i) {
  const sl = slots[i], on = i === current;
  return { x: sl.x, y: sl.y, s: sl.s * (on ? 1.22 : 1), o: 1, z: on ? 260 : 200 + i, label: narrow ? on : true };  // on a phone only the chosen one is labelled
}
const stateFor = i => mode === "orbit" ? orbitState(i) : spectrumState(i);
function draw(i, st) {
  const b = buttons[i];
  b.style.transform = `translate3d(${(st.x - BW / 2).toFixed(1)}px, ${(st.y - BW * 0.4).toFixed(1)}px, 0) scale(${st.s.toFixed(3)})`;
  b.style.zIndex = String(st.z);
  b.style.opacity = st.o.toFixed(3);
  b.style.setProperty("--k", (1 / st.s).toFixed(3));
  b.classList.toggle("show-label", st.label);
  cur[i] = st;
}
function place() { buttons.forEach((b, i) => draw(i, stateFor(i))); }

/* ---- Turning the ring, and switching between the two arrangements ---- */
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function turnTo(target, ms) {
  cancelAnimationFrame(anim);
  if (reduced.matches || !ms || mode !== "orbit") { pos = target; place(); return; }
  const from = pos, t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / ms);
    pos = from + (target - from) * ease(k); place();
    if (k < 1) anim = requestAnimationFrame(tick);
  };
  anim = requestAnimationFrame(tick);
}
function setMode(m, animate = true) {
  if (m === mode && animate) return;
  mode = m; stage.dataset.mode = m;
  modeButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  const u = new URL(location.href);
  if (m === "spectrum") u.searchParams.set("view", "spectrum"); else u.searchParams.delete("view");
  history.replaceState(null, "", u);
  cancelAnimationFrame(anim);
  if (m === "orbit") startEarth();
  if (!animate || reduced.matches || !cur.length) { place(); return; }
  // each satellite flies from where it is to its place in the other arrangement, one after another from the left
  const from = cur.map(o => Object.assign({}, o)), to = buttons.map((b, i) => stateFor(i));
  const rank = to.map((t, i) => i).sort((a, b) => to[a].x - to[b].x).reduce((r, i, k) => (r[i] = k, r), []);
  const t0 = performance.now(), D = 950, LAG = 32;
  stage.classList.add("switching");
  const tick = now => {
    let done = true;
    buttons.forEach((b, i) => {
      const k = Math.max(0, Math.min(1, (now - t0 - LAG * rank[i]) / D));
      if (k < 1) done = false;
      const e = ease(k), f = from[i], g = to[i];
      draw(i, { x: f.x + (g.x - f.x) * e, y: f.y + (g.y - f.y) * e - Math.sin(Math.PI * e) * H * 0.06,
        s: f.s + (g.s - f.s) * e, o: f.o + (g.o - f.o) * e, z: g.z, label: k > 0.85 ? g.label : false });
    });
    if (!done) anim = requestAnimationFrame(tick); else { stage.classList.remove("switching"); place(); }
  };
  anim = requestAnimationFrame(tick);
}
modeButtons.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

function nearest(i) { return i + N * Math.round((pos - i) / N); }
function select(i, opts = {}) {
  i = ((i % N) + N) % N;
  const target = nearest(i), changed = i !== current;
  current = i;
  if (mode === "orbit") turnTo(target, opts.instant ? 0 : Math.min(900, 360 + 130 * Math.abs(target - pos)));
  else { pos = target; place(); }
  markLeaders();
  if (!changed) return;
  buttons.forEach((b, j) => { b.setAttribute("aria-selected", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
  if (opts.focus) buttons[i].focus({ preventScroll: true });
  renderPanel(SATELLITES[i], !opts.first);
  if (!opts.keepHash) history.replaceState(null, "", location.pathname + location.search + "#" + SATELLITES[i].id);
}
stage.querySelector(".prev").addEventListener("click", () => select(current - 1));
stage.querySelector(".next").addEventListener("click", () => select(current + 1));
ring.addEventListener("keydown", e => {
  const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
  if (k) { e.preventDefault(); select(current + k, { focus: true }); }
  else if (e.key === "Home") { e.preventDefault(); select(0, { focus: true }); }
  else if (e.key === "End") { e.preventDefault(); select(N - 1, { focus: true }); }
});

/* Dragging the ring (orbit only): the front follows the pointer; on release it settles on the nearest satellite. */
let dragX = null, dragPos = 0, dragMoved = false, lastX = 0, lastT = 0, vel = 0;
stage.addEventListener("pointerdown", e => {
  if (mode !== "orbit" || e.button !== 0 || e.target.closest(".orbit-controls, .orbit-modes")) return;
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
  const fling = Math.max(-2, Math.min(2, -vel * 220 / (Rx * STEP)));
  select(Math.round(pos + fling));
  setTimeout(() => { dragMoved = false; }, 0);
}
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

/* ---- The panel under the sky: the satellite, then its studies ---- */
function renderPanel(s, animate) {
  const P = window.Papers;
  const papers = (s.papers || []).map(p => P && P.paperFor(p.doi)).filter(Boolean);
  const work = s.work || [];
  const agencies = s.agency.map(a => `<span class="sp-ag"><span class="ag-dot" style="--ag:${AGENCIES[a].color}"></span>${esc(AGENCIES[a].name)}</span>`).join("");
  const html = `
    <div class="sp-head">
      <p class="sp-agency">${agencies}${s.program ? `<span class="sp-program">${esc(s.program)}</span>` : ""}<span class="sp-launch">${esc(launched(s))}</span></p>
      <h2 class="sp-name" id="sp-name">${esc(s.name)}</h2>
      ${s.full ? `<p class="sp-full">${esc(s.full)}</p>` : ""}
      <p class="sp-sensor">${esc(s.sensor)}</p>
    </div>
    <div class="sp-body">
      ${papers.length ? `<div class="sp-papers">${papers.map(p => P.paperCard(p)).join("")}</div>` : ""}
      ${work.length ? `<h3 class="sp-h">In progress</h3>
        <ul class="sp-work">${work.map(w => `<li><span class="sw-title">${w.link ? `<a href="${esc(w.link)}">${esc(w.title)}</a>` : esc(w.title)}</span><span class="sw-status">${esc(w.status)}</span></li>`).join("")}</ul>` : ""}
    </div>`;
  panel.setAttribute("aria-labelledby", "sat-tab-" + s.id);
  if (!animate || reduced.matches) { panel.innerHTML = html; return; }
  panel.classList.add("swap");
  setTimeout(() => { panel.innerHTML = html; panel.classList.remove("swap"); }, 160);
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
    if (visible && !document.hidden && mode === "orbit") {
      if (!eLast) eLast = now;
      if (now - eLast > 33) { espin += (now - eLast) * (2 * Math.PI / 150000); eLast = now; drawEarth(); }  // one turn in two and a half minutes
    } else eLast = 0;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---- Start ---- */
let resizeT = 0;
window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { measure(); place(); }, 120); });
window.addEventListener("hashchange", () => {
  const i = SATELLITES.findIndex(s => s.id === location.hash.slice(1));
  if (i >= 0) select(i, { keepHash: true });
});
if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
reduced.addEventListener && reduced.addEventListener("change", () => { if (reduced.matches) eRun = false; else startEarth(); });
modeButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
measure();
loadEarth();
const fromHash = SATELLITES.findIndex(s => s.id === location.hash.slice(1));
const start = fromHash >= 0 ? fromHash : SATELLITES.findIndex(s => s.id === "smap");
// One sweep on arrival in the orbit view: the ring turns a quarter of the way round to the first satellite.
pos = start - (reduced.matches || mode !== "orbit" ? 0 : N / 4);
current = start; place(); current = -1;
select(start, { keepHash: fromHash < 0, first: true });
})();
