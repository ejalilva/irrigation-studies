/* Journals and papers shared by the map pop-ups and the study cards.
   Each paper shows as a card topped by a small masthead in its journal's own style (the marks are taken from the
   first page of the papers themselves), a rule and an acronym chip in a colour from the journal's cover, then the
   title (linked to the paper), the authors (first author et al., with the full list on click) and, where the
   publisher allows it, a link to the PDF.

   JOURNALS
     acr    acronym on the chip
     color  colour from the journal's cover or logo, dark enough for white text (at least 4.5:1)
     mast   the masthead, one of:
            { type: "elsevier", cover }            Elsevier tree, grey title box, cover thumbnail (cover optional)
            { type: "logos", left, lh, right, rh, text }   a mark on the left (height lh px), optional text, a mark on the right
            { type: "ieee" }                        IEEE running-header line
            { type: "banner", src }                 one wide header image
            Without a mast the card falls back to a plain band in the journal colour.
     Images live in assets/journals/.

   PAPERS: keyed by lowercase DOI, or by the address of the paper when it has no DOI (set url).
     authors  full list in order; if only some authors are known, end it with "et al." (no "All authors" then)
     pdf      a copy hosted on this site; only for papers whose license or publisher allows it (see docs/MAINTAINING.md)
     license  as printed on the paper */
(function () {
const J = "assets/journals/";
const JOURNALS = {
  "Remote Sensing of Environment": { acr: "RSE", color: "#123927", mast: { type: "elsevier", cover: J + "cover-rse.webp" } },
  "Journal of Hydrology": { acr: "J. Hydrol.", color: "#4f6762", mast: { type: "elsevier", cover: J + "cover-jhydrol.webp" } },
  "ISPRS Journal of Photogrammetry and Remote Sensing": { acr: "ISPRS J.", color: "#10283a", mast: { type: "elsevier", cover: J + "cover-isprs.webp" } },
  "Computers and Electronics in Agriculture": { acr: "COMPAG", color: "#2a6fb0", mast: { type: "elsevier", cover: J + "cover-compag.webp" } },
  "International Journal of Applied Earth Observation and Geoinformation": { acr: "JAG", color: "#475637", mast: { type: "elsevier", cover: J + "cover-jag.webp" } },
  "Agricultural Water Management": { acr: "AGWAT", color: "#3f5f3a", mast: { type: "elsevier" } },
  "Water Resources Research": { acr: "WRR", color: "#01465d", mast: { type: "logos", left: J + "wrr.png", lh: 20, right: J + "agu.png", rh: 26 } },
  "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing": { acr: "JSTARS", color: "#00629b", mast: { type: "ieee" } },
  "Sustainability": { acr: "Sustainability", color: "#36657a", mast: { type: "logos", left: J + "sustainability.png", lh: 36, right: J + "mdpi.png", rh: 28 } },
  "Climate": { acr: "Climate", color: "#2b53a4", mast: { type: "logos", left: J + "climate.png", lh: 36, right: J + "mdpi.png", rh: 28 } },
  "Frontiers in Earth Science": { acr: "Front. Earth Sci.", color: "#007a78", mast: { type: "logos", left: J + "frontiers.png", lh: 36 } },
  "Iranian Journal of Soil and Water Research": { acr: "IJSWR", color: "#4a7a2c", mast: { type: "banner", src: J + "ijswr.webp" } },
  "10th International Congress on Civil Engineering": { acr: "ICCE", color: "#3c3c3c", mast: { type: "logos", left: J + "congress-left.png", lh: 40, text: "10th International Congress on Civil Engineering · University of Tabriz, Iran", right: J + "congress-right.png", rh: 40 } },
  "Water Resources Management": { acr: "WARM", color: "#0f6a8b" }
};
const PAPERS = {
  "https://www.researchgate.net/publication/304498967": { year: 2015, journal: "10th International Congress on Civil Engineering", details: "Tabriz, July 2015", kind: "Conference paper",
    url: "https://www.researchgate.net/publication/304498967_Estimating_the_rate_of_evaporation_from_Lake_Urmia_in_year_1995_with_highest_water_level_records_using_satellite_and_gauge_data_In_Persian",
    title: "Estimating the rate of evaporation from Lake Urmia in year 1995 with highest water level records using satellite and gauge data",
    authors: "Fazel Mojtahedi, S.F., Saravani, S., Jalilvand, E., Sima, S., Tajrishy, M." },
  "10.1016/j.jhydrol.2018.08.035": { year: 2018, journal: "Journal of Hydrology", details: "565, 489–501", license: "© Elsevier",
    title: "Estimating the drainage rate from surface soil moisture drydowns: Application of DfD model to in situ soil moisture data",
    authors: "Jalilvand, E., Tajrishy, M., Brocca, L., Massari, C., Ghazi Zadeh Hashemi, S.A., Ciabatta, L." },
  "10.1016/j.rse.2019.111226": { year: 2019, journal: "Remote Sensing of Environment", details: "231, 111226", license: "© Elsevier",
    title: "Quantification of irrigation water using remote sensing of soil moisture in a semi-arid region",
    authors: "Jalilvand, E., Tajrishy, M., Ghazi Zadeh Hashemi, S.A., Brocca, L." },
  "10.1007/s11269-020-02596-3": { year: 2020, journal: "Water Resources Management", details: "34(9), 2969–2988",
    title: "The Impact of Pavement Permeability on Time of Concentration in a Small Urban Watershed with a Semi-Arid Climate",
    authors: "Ghazi Zadeh Hashemi, M.S., Tajrishy, M., Jalilvand, E." },
  "10.1109/jstars.2021.3119228": { year: 2021, journal: "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing", details: "14, 10733–10747", license: "CC BY 4.0",
    pdf: "assets/papers/2021-jstars-jalilvand.pdf",
    title: "Evaluation of SMAP/Sentinel 1 high-resolution soil moisture data to detect irrigation over agricultural domain",
    authors: "Jalilvand, E., Abolafia-Rosenzweig, R., Tajrishy, M., Das, N.N." },
  "10.3390/su132011355": { year: 2021, journal: "Sustainability", details: "13(20), 11355", license: "CC BY 4.0",
    pdf: "assets/papers/2021-sustainability-rabiei.pdf",
    title: "A method to estimate surface soil moisture and map the irrigated cropland area using Sentinel-1 and Sentinel-2 data",
    authors: "Rabiei, S., Jalilvand, E., Tajrishy, M." },
  "10.22059/ijswr.2021.321263.668924": { year: 2021, journal: "Iranian Journal of Soil and Water Research", details: "52(6), 1543–1556",
    title: "Groundwater budget estimation of an over-exploited aquifer located in the arid climate of Iran (Part two: Calculation of different water budget components)",
    authors: "Ketabchi, H., Mahmoodzadeh, D., Jalilvand, E." },
  "10.3390/cli10110161": { year: 2022, journal: "Climate", details: "10(11), 161", license: "CC BY 4.0",
    pdf: "assets/papers/2022-climate-sotoudeheian.pdf",
    title: "Using High-Resolution Climate Models to Identify Climate Change Hotspots in the Middle East: A Case Study of Iran",
    authors: "Sotoudeheian, S., Jalilvand, E., Kermanshah, A." },
  "10.1016/j.jag.2022.103047": { year: 2022, journal: "International Journal of Applied Earth Observation and Geoinformation", details: "114, 103047", license: "CC BY-NC-ND 4.0",
    pdf: "assets/papers/2022-jag-hashemi.pdf",
    title: "Assessing the impact of Sentinel-1 derived planting dates on rice crop yield modeling",
    authors: "Hashemi, M.G.Z., Abhishek, A., Jalilvand, E., Jayasinghe, S., Andreadis, K.M., Siqueira, P., Das, N.N." },
  "10.1029/2022wr033342": { year: 2023, journal: "Water Resources Research", details: "59(4), e2022WR033342", license: "© American Geophysical Union",
    pdf: "assets/papers/2023-wrr-jalilvand.pdf",
    title: "Is it possible to quantify irrigation water-use by assimilating a high-resolution satellite soil moisture product?",
    authors: "Jalilvand, E., Abolafia-Rosenzweig, R., Tajrishy, M., Kumar, S.V., Mohammadi, M.R., Das, N.N." },
  "10.1016/j.agwat.2024.108918": { year: 2024, journal: "Agricultural Water Management", details: "300, 108918",
    title: "Harnessing SMAP satellite soil moisture product to optimize soil properties to improve water resource management for agriculture",
    authors: "Nanda, A., Das, N.N., Jalilvand, E., et al." },
  "10.1016/j.compag.2024.109340": { year: 2024, journal: "Computers and Electronics in Agriculture", details: "226, 109340", license: "© Elsevier",
    title: "Yield estimation from SAR data using patch-based deep learning and machine learning techniques",
    authors: "Hashemi, M.G.Z., Tan, P.-N., Jalilvand, E., Wilke, B., Alemohammad, H., Das, N.N." },
  "10.1016/j.isprsjprs.2024.08.018": { year: 2024, journal: "ISPRS Journal of Photogrammetry and Remote Sensing", details: "218, 20–49", kind: "Review", license: "© ISPRS, published by Elsevier",
    title: "Review of synthetic aperture radar with deep learning in agricultural applications",
    authors: "Hashemi, M.G.Z., Jalilvand, E., Alemohammad, H., Tan, P.-N., Das, N.N." },
  "10.1016/j.rse.2025.114825": { year: 2025, journal: "Remote Sensing of Environment", details: "327, 114825", license: "© Elsevier",
    title: "Estimating crop biophysical parameters from satellite-based SAR and optical observations using self-supervised learning with geospatial foundation models",
    authors: "Hashemi, M.G.Z., Alemohammad, H., Jalilvand, E., Tan, P.-N., Judge, J., Cosh, M., Das, N.N." },
  "10.1016/j.rse.2025.115153": { year: 2026, journal: "Remote Sensing of Environment", details: "333, 115153", license: "© Elsevier",
    title: "Characterization of irrigation timing using thermal satellite observations, a data-driven approach",
    authors: "Jalilvand, E., Kumar, S.V., Truong, C., Haacker, E., Mahanama, S." },
  "10.1029/2026wr044944": { year: 2026, journal: "Water Resources Research", details: "62(9), e2026WR044944", kind: "Commentary",
    title: "Beyond SMAP: Can GNSS-R Platforms Ensure Continuity of Global Soil Moisture Observations?",
    authors: "Jalilvand, E., Kumar, S.V., Bindlish, R., Wegiel, J.W., Kurum, M., Kim, H., Liu, P.-W., Navari, M." },
  "10.3389/feart.2026.1854083": { year: 2026, journal: "Frontiers in Earth Science", details: "14, 1854083", license: "CC BY",
    pdf: "assets/papers/2026-frontiers-kwon.pdf",
    title: "Development of low latency, high resolution SMAP soil moisture retrievals in support of near-real-time applications",
    authors: "Kwon, Y., Liu, P.-W., Navari, M., Bindlish, R., Kemp, E.M., Wegiel, J.W., Jalilvand, E., Kumar, S.V." }
};
const ME = "Jalilvand, E.";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const doiOf = url => { const m = String(url || "").match(/doi\.org\/(10\.[^\s?#]+)/i); return m ? decodeURIComponent(m[1]).toLowerCase() : null; };
function paperFor(urlOrDoi) {
  const s = String(urlOrDoi || ""), d = s.toLowerCase().startsWith("10.") ? s.toLowerCase() : doiOf(s);
  if (d && PAPERS[d]) return Object.assign({ doi: d, href: "https://doi.org/" + d }, PAPERS[d]);
  const key = Object.keys(PAPERS).find(k => k.startsWith("http") && s.startsWith(k));
  return key ? Object.assign({ href: PAPERS[key].url || key }, PAPERS[key]) : null;
}
/* Short author line: three authors or fewer are listed in full; otherwise the first author and always Ehsan,
   e.g. "Jalilvand, E., et al.", "Hashemi, M.G.Z., Jalilvand, E., et al." or "Kwon, Y., … Jalilvand, E., et al." */
function authorsShort(a) {
  const etal = /,?\s*et al\.?$/.test(a);
  const list = a.replace(/,?\s*et al\.?$/, "").split(/,\s*(?=[A-Z][^,]*,\s*[A-Z]\.)/);
  if (list.length <= 3 && !etal) return a;
  const me = list.indexOf(ME);
  if (me <= 0) return list[0] + ", et al.";
  return list[0] + (me === 1 ? ", " : ", … ") + ME + (etal || me < list.length - 1 ? ", et al." : "");
}
/* The masthead: decorative (the chip and journal name below carry the same information for screen readers). */
function masthead(p, j) {
  const m = j.mast, img = (src, h, cls) => `<img class="${cls}" src="${esc(src)}" alt="" style="--h:${h}px" loading="lazy" decoding="async">`;
  if (!m) return "";
  let inner = "";
  if (m.type === "elsevier") inner = `${img(J + "elsevier.webp", 52, "mh-tree")}<span class="mh-box">${esc(p.journal)}</span>${m.cover ? img(m.cover, 52, "mh-cover") : ""}`;
  else if (m.type === "logos") inner = `${img(m.left, m.lh, "mh-l")}${m.text ? `<span class="mh-text">${esc(m.text)}</span>` : ""}${m.right ? img(m.right, m.rh, "mh-r") : ""}`;
  else if (m.type === "ieee") inner = `<span class="mh-ieee">${esc(p.journal)}, Vol. ${esc(String(p.details).split(",")[0])}, ${p.year}</span>`;
  else if (m.type === "banner") inner = img(m.src, 52, "mh-banner");
  return `<a class="pc-mast mh-${m.type}" href="${esc(p.href)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${inner}</a>`;
}
/* note: an optional line under the card (what this paper contributes to the topic). */
function paperCard(p, note) {
  const j = JOURNALS[p.journal] || { acr: p.journal, color: "#3f4c63" };
  const full = !/et al\.?$/.test(p.authors) && authorsShort(p.authors) !== p.authors;
  // With a masthead the journal's name is already shown there, so the meta line keeps it for screen readers only.
  const name = j.mast ? `<span class="sr-only">${esc(p.journal)}</span>` : j.acr !== p.journal ? `<span class="pc-jname">${esc(p.journal)}</span>` : "";
  const meta = `<span class="pc-acr">${esc(j.acr)}</span>${name}<span class="pc-year">${p.kind ? esc(p.kind) + " · " : ""}${p.year}</span>`;
  return `<article class="paper-card${j.mast ? " has-mast" : ""}" style="--jc:${j.color}">
    ${j.mast ? masthead(p, j) + `<p class="pc-meta">${meta}</p>` : `<a class="pc-band" href="${esc(p.href)}" target="_blank" rel="noopener">${meta}</a>`}
    <div class="pc-body">
      <a class="pc-title" href="${esc(p.href)}" target="_blank" rel="noopener">${esc(p.title)}</a>
      <p class="pc-authors"><span class="pc-short">${esc(authorsShort(p.authors))}</span>${full ? `<span class="pc-full" hidden>${esc(p.authors)}</span> <button type="button" class="pc-more" aria-expanded="false">All authors</button>` : ""}</p>
      ${note ? `<p class="pc-note">${esc(note)}</p>` : ""}
      ${p.pdf ? `<p class="pc-links"><a class="pc-pdf" href="${esc(p.pdf)}" target="_blank" rel="noopener">PDF</a>${p.license ? `<span>${esc(p.license)}</span>` : ""}</p>` : ""}
    </div>
  </article>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest(".pc-more");
  if (!b) return;
  const p = b.closest(".pc-authors"), open = b.getAttribute("aria-expanded") !== "true";
  p.querySelector(".pc-short").hidden = open; p.querySelector(".pc-full").hidden = !open;
  b.setAttribute("aria-expanded", String(open)); b.textContent = open ? "Fewer authors" : "All authors";
});
window.Papers = { JOURNALS, PAPERS, paperFor, paperCard, authorsShort };
})();
