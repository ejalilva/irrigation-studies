/* Journals and papers shared by the map pop-ups, the studies and related work.
   Each paper shows as a card: a band in its journal's colour with the journal's acronym, full name and year,
   then the title (linked to the paper) and the authors (first author et al., with the full list on click).

   JOURNALS: acr is the acronym on the band, color the band colour (dark enough for white text).
   logo: set to an image path (for example "assets/journals/rse.png", about 40 px tall, transparent background)
   once you have the journal's logo file; until then the band shows the acronym only.

   PAPERS: keyed by lowercase DOI. authors is the full list in order; if only some authors are known, end it
   with "et al." and the card will not offer the full list. */
(function () {
const ELSEVIER = "#b9520b", AGU = "#1c5d99", IEEE = "#00629b", MDPI = "#3f4c63", FRONTIERS = "#b8321d", SPRINGER = "#0f6a8b";
const JOURNALS = {
  "Remote Sensing of Environment": { acr: "RSE", color: ELSEVIER, logo: null },
  "Water Resources Research": { acr: "WRR", color: AGU, logo: null },
  "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing": { acr: "JSTARS", color: IEEE, logo: null },
  "Sustainability": { acr: "Sustainability", color: MDPI, logo: null },
  "Climate": { acr: "Climate", color: MDPI, logo: null },
  "Agricultural Water Management": { acr: "AGWAT", color: ELSEVIER, logo: null },
  "Journal of Hydrology": { acr: "J. Hydrol.", color: ELSEVIER, logo: null },
  "International Journal of Applied Earth Observation and Geoinformation": { acr: "JAG", color: ELSEVIER, logo: null },
  "Computers and Electronics in Agriculture": { acr: "COMPAG", color: ELSEVIER, logo: null },
  "ISPRS Journal of Photogrammetry and Remote Sensing": { acr: "ISPRS J.", color: ELSEVIER, logo: null },
  "Frontiers in Earth Science": { acr: "Front. Earth Sci.", color: FRONTIERS, logo: null },
  "Water Resources Management": { acr: "WARM", color: SPRINGER, logo: null }
};
const PAPERS = {
  "10.1016/j.jhydrol.2018.08.035": { year: 2018, journal: "Journal of Hydrology", details: "565, 489–501",
    title: "Estimating the drainage rate from surface soil moisture drydowns: Application of DfD model to in situ soil moisture data",
    authors: "Jalilvand, E., Tajrishy, M., Brocca, L., Massari, C., Ghazi Zadeh Hashemi, S., Ciabatta, L." },
  "10.1016/j.rse.2019.111226": { year: 2019, journal: "Remote Sensing of Environment", details: "231, 111226",
    title: "Quantification of irrigation water using remote sensing of soil moisture in a semi-arid region",
    authors: "Jalilvand, E., Tajrishy, M., Ghazi Zadeh Hashemi, S.A., Brocca, L." },
  "10.1007/s11269-020-02596-3": { year: 2020, journal: "Water Resources Management", details: "34(9), 2969–2988",
    title: "The Impact of Pavement Permeability on Time of Concentration in a Small Urban Watershed with a Semi-Arid Climate",
    authors: "Ghazi Zadeh Hashemi, M.S., Tajrishy, M., Jalilvand, E." },
  "10.1109/jstars.2021.3119228": { year: 2021, journal: "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing", details: "14, 10733–10747",
    title: "Evaluation of SMAP/Sentinel 1 high-resolution soil moisture data to detect irrigation over agricultural domain",
    authors: "Jalilvand, E., Abolafia-Rosenzweig, R., Tajrishy, M., Das, N.N." },
  "10.3390/su132011355": { year: 2021, journal: "Sustainability", details: "13(20), 11355",
    title: "A method to estimate surface soil moisture and map the irrigated cropland area using Sentinel-1 and Sentinel-2 data",
    authors: "Rabiei, S., Jalilvand, E., Tajrishy, M." },
  "10.3390/cli10110161": { year: 2022, journal: "Climate", details: "10(11), 161",
    title: "Using High-Resolution Climate Models to Identify Climate Change Hotspots in the Middle East: A Case Study of Iran",
    authors: "Sotoudeheian, S., Jalilvand, E., Kermanshah, A." },
  "10.1016/j.jag.2022.103047": { year: 2022, journal: "International Journal of Applied Earth Observation and Geoinformation", details: "114, 103047",
    title: "Assessing the impact of Sentinel-1 derived planting dates on rice crop yield modeling",
    authors: "Hashemi, M.G., Abhishek, A., Jalilvand, E., et al." },
  "10.1029/2022wr033342": { year: 2023, journal: "Water Resources Research", details: "59(4), e2022WR033342",
    title: "Is it possible to quantify irrigation water-use by assimilating a high-resolution satellite soil moisture product?",
    authors: "Jalilvand, E., Abolafia-Rosenzweig, R., Tajrishy, M., Kumar, S.V., Mohammadi, M.R., Das, N.N." },
  "10.1016/j.agwat.2024.108918": { year: 2024, journal: "Agricultural Water Management", details: "300, 108918",
    title: "Harnessing SMAP satellite soil moisture product to optimize soil properties to improve water resource management for agriculture",
    authors: "Nanda, A., Das, N.N., Jalilvand, E., et al." },
  "10.1016/j.compag.2024.109340": { year: 2024, journal: "Computers and Electronics in Agriculture", details: "226, 109340",
    title: "Yield estimation from SAR data using patch-based deep learning and machine learning techniques",
    authors: "Hashemi, M.G., Tan, P.N., Jalilvand, E., et al." },
  "10.1016/j.isprsjprs.2024.08.018": { year: 2024, journal: "ISPRS Journal of Photogrammetry and Remote Sensing", details: "218, 20–49",
    kind: "Review",
    title: "Review of synthetic aperture radar with deep learning in agricultural applications",
    authors: "Hashemi, M.G., Jalilvand, E., Alemohammad, H., Tan, P.N., Das, N.N." },
  "10.1016/j.rse.2025.114825": { year: 2025, journal: "Remote Sensing of Environment", details: "327, 114825",
    title: "Estimating crop biophysical parameters from satellite-based SAR and optical observations using self-supervised learning with geospatial foundation models",
    authors: "Hashemi, M.G., Alemohammad, H., Jalilvand, E., et al." },
  "10.1016/j.rse.2025.115153": { year: 2026, journal: "Remote Sensing of Environment", details: "333, 115153",
    title: "Characterization of irrigation timing using thermal satellite observations, a data-driven approach",
    authors: "Jalilvand, E., Kumar, S.V., Truong, C., Haacker, E., Mahanama, S." },
  "10.1029/2026wr044944": { year: 2026, journal: "Water Resources Research", details: "62(9), e2026WR044944", kind: "Commentary",
    title: "Beyond SMAP: Can GNSS-R Platforms Ensure Continuity of Global Soil Moisture Observations?",
    authors: "Jalilvand, E., Kumar, S.V., Bindlish, R., Wegiel, J.W., Kurum, M., Kim, H., Liu, P.-W., Navari, M." },
  "10.3389/feart.2026.1854083": { year: 2026, journal: "Frontiers in Earth Science", details: "14, 1854083",
    title: "Development of low latency, high resolution SMAP soil moisture retrievals in support of near-real-time applications",
    authors: "Kwon, Y., Liu, P.-W., Navari, M., Bindlish, R., Kemp, E.M., Wegiel, J.W., Jalilvand, E., Kumar, S.V." }
};
const ME = "Jalilvand, E.";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const doiOf = url => { const m = String(url || "").match(/doi\.org\/(10\.[^\s?#]+)/i); return m ? decodeURIComponent(m[1]).toLowerCase() : null; };
function paperFor(urlOrDoi) { const d = String(urlOrDoi || "").toLowerCase().startsWith("10.") ? String(urlOrDoi).toLowerCase() : doiOf(urlOrDoi); return d && PAPERS[d] ? Object.assign({ doi: d }, PAPERS[d]) : null; }
function authorsShort(a) {
  const parts = a.replace(/,?\s*et al\.?$/, "").split(/,\s*(?=[A-Z][^,]*,\s*[A-Z]\.)/);
  return parts.length > 2 || /et al\.?$/.test(a) ? parts[0] + ", et al." : a;
}
const bold = s => esc(s).replace(esc(ME), `<strong>${esc(ME)}</strong>`);
/* note: an optional line under the card (what this paper contributes to the topic). */
function paperCard(p, note) {
  const j = JOURNALS[p.journal] || { acr: p.journal, color: "#3f4c63" };
  const href = "https://doi.org/" + p.doi;
  const full = !/et al\.?$/.test(p.authors) && authorsShort(p.authors) !== p.authors;
  return `<article class="paper-card">
    <a class="pc-band" href="${href}" target="_blank" rel="noopener" style="--jc:${j.color}">${j.logo ? `<img class="pc-logo" src="${esc(j.logo)}" alt="">` : ""}<span class="pc-acr">${esc(j.acr)}</span>${j.acr !== p.journal ? `<span class="pc-journal">${esc(p.journal)}</span>` : ""}<span class="pc-year">${p.kind ? esc(p.kind) + " · " : ""}${p.year}</span></a>
    <div class="pc-body">
      <a class="pc-title" href="${href}" target="_blank" rel="noopener">${esc(p.title)}</a>
      <p class="pc-authors"><span class="pc-short">${bold(authorsShort(p.authors))}</span>${full ? `<span class="pc-full" hidden>${bold(p.authors)}</span> <button type="button" class="pc-more" aria-expanded="false">All authors</button>` : ""}</p>
      ${note ? `<p class="pc-note">${esc(note)}</p>` : ""}
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
