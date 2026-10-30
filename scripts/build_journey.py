"""Build journey.html ("My journey") and data/journey-timeline.json.

Edit the lists below, then run:  python scripts/build_journey.py

- MARKS: the landmarks painted into assets/journey/landscape-v5.webp. Each has a cut-out layer in
  assets/journey/marks/<key>.webp; x, y, w, h place that layer over the painting, in % of the painting's
  width and height (from the cut-out's pixel box in the 1672 x 941 painting).
- TAGS: the name tags that appear under a landmark when it grows. By default one tag, the landmark's name, under
  the middle of its box; TAG_OVERRIDES places them by hand (centre x and top y, in %) and can limit a tag to
  some stops (Sharif University shows only at the Sharif stops; Tehran at all five Tehran stops).
- LOGOS: the small logo shown on the timeline for each stop (an image in assets/journey/logos/, or a short text
  badge where no logo file is available yet).
- SKILLS: one coloured bar per skill: label, background, text colour (white or near-black, whichever reads
  at 4.5:1 on that background) and an optional second colour the bar fades to on the right (Python yellow to
  blue). With "split" (MATLAB), the bar is orange then blue with a short blend between, like MATLAB's logo.
  The label always sits on the first colour.
- WORK: papers, code, videos and talks, shown as small links under a stop's line. "href" may be None
  until there is a link; such items are left out of the page.
- STOPS: the timeline, in order: year, short name under the logo, place, landmark, skills first learned
  there, one line on what I did (without repeating the skills, which the bars already show), the work
  to link, pictures, and the logo (a key of LOGOS). Pictures fan out above the stop and open in a viewer with their caption; put
  photos in assets/journey/photos/ and list them as (file, caption) or (file, caption, credit).
"""
from pathlib import Path
import html
import json

ROOT = Path(__file__).resolve().parents[1]
V = "2026-10-30c"  # bump when the CSS, the JS, the painting or a cut-out changes, so browsers fetch the new files
PAINTING = "assets/journey/landscape-v5.webp"

MARKS = [
    # key, name on the map, x, y, w, h (% of the painting)
    ("sharif", "Tehran", 7.536, 43.996, 28.648, 23.061),
    ("startup", "My startup", 31.579, 66.419, 10.467, 10.414),
    ("italy", "CNR IRPI, Italy", 43.660, 41.339, 15.072, 17.322),
    ("michigan", "Michigan State University", 64.773, 36.663, 16.866, 31.137),
    ("gatech", "Georgia Tech", 83.373, 45.909, 10.048, 29.649),
    ("nasa", "NASA Goddard", 81.699, 15.834, 13.278, 25.292),
]

TAG_OVERRIDES = {
    # landmark: [(text, centre x %, top %, stops where it shows or None for all)]
    "sharif": [("Tehran", 13.64, 67.06, None), ("Sharif University", 27.33, 60.90, [0, 3, 4])],
    "michigan": [("Michigan State University", 68.78, 67.90, None)],
}

LOGOS = {
    # key: (kind, value, name)   kind: img (file in assets/journey/logos/) or text (a short badge)
    "sharif": ("img", "sharif.png", "Sharif University of Technology"),
    "sdk": ("img", "sdk.png", "SDK, Satellite Driven Knowledge"),
    "cnr": ("img", "cnr.png", "CNR IRPI, Research Institute for Geo-Hydrological Protection"),
    "aut": ("img", "aut.png", "Amirkabir University of Technology"),
    "ries": ("text", "RIES", "Research Institute for Earth Sciences"),
    "msu": ("img", "msu.png", "Michigan State University"),
    "gt": ("img", "gt.png", "Georgia Tech"),
    "nasa": ("img", "nasa.png", "NASA Goddard"),
}

SKILLS = {
    "arcgis": ("ArcGIS", "#2A74B8", "#FFFFFF"),
    "envi": ("ENVI", "#A1887F", "#172026"),
    "rs": ("Remote sensing", "#10806A", "#FFFFFF"),
    "matlab": ("MATLAB coding", "#C04A1B", "#FFFFFF", "#0076A8", "split"),
    "ux": ("UX design", "#D63384", "#FFFFFF"),
    "story": ("Storytelling", "#F7B6CF", "#172026"),
    "imgproc": ("Image processing", "#4FB3D9", "#172026"),
    "model": ("Model building", "#8B5A2B", "#FFFFFF"),
    "teach": ("Teaching", "#B39DDB", "#172026"),
    "linux": ("Linux", "#FCC624", "#172026"),
    "bash": ("Bash", "#4EAA25", "#172026"),
    "perl": ("Perl", "#39457E", "#FFFFFF"),
    "web": ("Website design", "#9CCC65", "#172026"),
    "lsm": ("Land surface models", "#557A1F", "#FFFFFF"),
    "da": ("Data assimilation", "#7B4FB0", "#FFFFFF"),
    "gee": ("Google Earth Engine", "#0B7A45", "#FFFFFF"),
    "youtube": ("YouTube", "#D9241C", "#FFFFFF"),
    "python": ("Python", "#FFD43B", "#172026", "#3776AB"),
    "hpc": ("HPC", "#546E7A", "#FFFFFF"),
    "git": ("Git", "#24292F", "#FFFFFF"),
    "lis": ("NASA LIS · Fortran", "#0B3D91", "#FFFFFF"),
    "pkg": ("Python packages", "#FFD43B", "#172026"),
    "geostack": ("Python geospatial stack", "#00796B", "#FFFFFF"),
    "ml": ("Machine learning", "#F7931E", "#172026"),
    "dl": ("Deep learning", "#EE4C2C", "#000000"),
    "geoml": ("Geospatial machine learning", "#C2185B", "#FFFFFF"),
    "gfm": ("Foundation models", "#3949AB", "#FFFFFF"),
    "agents": ("AI agents", "#00ACC1", "#172026"),
}

DOI = "https://doi.org/"
WORK = {
    # key: (kind, label, title, href)   kind: paper, code, video or talk
    "congress2015": ("paper", "Congress paper 2015", "Estimating the rate of evaporation from Lake Urmia in 1995 using satellite and gauge data",
                     "https://www.researchgate.net/publication/304498967"),
    # The two UX demos from the old site's UX Demo page. The videos stay on Google Drive (shared with anyone who has the
    # link) and play in the picture viewer; DRIVE_VIDEOS below gives each one's file id.
    "tourism": ("video", "UX demo: rural tourism map", "Interactive prototype of a map-based platform that connects city visitors with rural life (2017)", "drive:tourism"),
    "sugarcane": ("video", "UX demo: crop monitoring", "Interactive prototype of a satellite-based crop monitoring system for a sugarcane producer (2018)", "drive:sugarcane"),
    "jhydrol2018": ("paper", "J. Hydrol. 2018", "Estimating the drainage rate from surface soil moisture drydowns: application of the DfD model", DOI + "10.1016/j.jhydrol.2018.08.035"),
    "rse2019": ("paper", "RSE 2019", "Quantification of irrigation water using remote sensing of soil moisture in a semi-arid region", DOI + "10.1016/j.rse.2019.111226"),
    "jstars2021": ("paper", "IEEE JSTARS 2021", "Evaluation of SMAP/Sentinel-1 high-resolution soil moisture data to detect irrigation", DOI + "10.1109/JSTARS.2021.3119228"),
    "su2021": ("paper", "Sustainability 2021", "Estimating soil moisture and mapping irrigated cropland with Sentinel-1 and Sentinel-2", DOI + "10.3390/su132011355"),
    "wrr2023": ("paper", "WRR 2023", "Is it possible to quantify irrigation water-use by assimilating a high-resolution satellite soil moisture product?", DOI + "10.1029/2022WR033342"),
    "youtube": ("video", "Lessons on YouTube", "Recorded lessons: remote sensing and GIS in water resources", "https://www.youtube.com/channel/UC6SyjY2pXoI0UK1tfY7uxcw"),
    "compag2024": ("paper", "COMPAG 2024", "Yield estimation from SAR data using patch-based deep learning and machine learning techniques", DOI + "10.1016/j.compag.2024.109340"),
    "isprs2024": ("paper", "ISPRS J. 2024", "Review of synthetic aperture radar with deep learning in agricultural applications", DOI + "10.1016/j.isprsjprs.2024.08.018"),
    "frontiers2026": ("paper", "Front. Earth Sci. 2026", "Low-latency, high-resolution SMAP soil moisture retrievals for near-real-time applications", DOI + "10.3389/feart.2026.1854083"),
    "lisf": ("code", "NASA LIS on GitHub", "NASA-LIS/LISF: the Land Information System Framework (contributor)", "https://github.com/NASA-LIS/LISF"),
    "rse2026": ("paper", "RSE 2026 · AgroTrack", "Characterization of irrigation timing using thermal satellite observations, a data-driven approach", DOI + "10.1016/j.rse.2025.115153"),
    "agrotrack": ("code", "AgroTrack on GitHub", "AgroTrack: an open-source Python package for irrigation timing", None),
    "geostream": ("code", "GeoStreamPy on GitHub", "GeoStreamPy: stream Google Earth Engine data into xarray", "https://github.com/ejalilva/gee_tools"),
    "wrr2026": ("paper", "WRR 2026", "Beyond SMAP: can GNSS-R platforms ensure continuity of global soil moisture observations?", DOI + "10.1029/2026WR044944"),
    "agu2025": ("talk", "AGU 2025 talk", "Fine-tuning Prithvi-EO-2.0 for high-resolution irrigation mapping with limited labeled data", None),
    "climate2022": ("paper", "Climate 2022", "Using high-resolution climate models to identify climate change hotspots in the Middle East: a case study of Iran", DOI + "10.3390/cli10110161"),
    "agent": ("code", "Paper-finding agent", "The agent that finds new irrigation papers for this site's research library", "https://github.com/ejalilva/irrigation-studies/tree/main/agent"),
}

# Videos on Google Drive: key -> (file id, caption). They are shown as cards in the stop's fan, with Drive's thumbnail, and
# play in the viewer through Drive's embedded player.
DRIVE_VIDEOS = {
    "tourism": ("1HDr4X0e2PxtHK8sgbjbdeUqFbH-TXW7x", "UX demo, 2017: a map-based platform that connects city visitors with rural life, from baking bread and milking cows to harvesting honey, with local stories pinned to the landmarks."),
    "sugarcane": ("1gJ6TVFqfdKpTeg63eQYCED_izhKsZl43", "UX demo, 2018: a crop monitoring system for a sugarcane producer, tracking each plot’s growth through the season with Sentinel-2 and Landsat and flagging problems."),
}
def drive_embed(key): return f"https://drive.google.com/file/d/{DRIVE_VIDEOS[key][0]}/preview"
def drive_thumb(key): return f"https://drive.google.com/thumbnail?id={DRIVE_VIDEOS[key][0]}&sz=w800"

STUDY = "assets/studies/"
STOPS = [
    ("2013", "Sharif", "Sharif University", "sharif", ["arcgis", "envi", "rs", "matlab"],
     "PhD: an inverse water balance model (SM2RAIN-DfD) that estimates rainfall from satellite soil moisture alone, and soil hydraulic properties from soil-moisture drydowns.",
     ["congress2015"], [], "sharif"),
    ("2015–19", "Startup", "SDK, my startup", "startup", ["ux", "story"],
     "Co-founded a startup for environmental monitoring from satellite observations.",
     ["tourism", "sugarcane"], [("video:tourism",), ("video:sugarcane",)], "sdk"),
    ("2016–17", "Italy", "CNR IRPI, Italy", "italy", ["imgproc", "model"],
     "Visiting researcher, improving SM2RAIN, a bottom-up approach that estimates rainfall from satellite soil moisture.",
     ["jhydrol2018"], [], "cnr"),
    ("2019", "PhD · teaching", "Sharif University", "sharif", ["teach"],
     "Finished my PhD with my first irrigation study, and taught undergraduate hydrology.",
     ["rse2019"], [(STUDY + "irrigation-2019-study-area.webp", "Irrigated and non-irrigated pixels in the 2019 study area, south of Lake Urmia.")], "sharif"),
    ("2019–21", "1st postdoc", "First postdoc, Sharif University", "sharif", ["linux", "bash", "perl", "web", "lsm", "da", "ml"],
     "Detected the irrigation signal in SMAP soil moisture, and assimilated SMAP–Sentinel-1 soil moisture into the VIC model to estimate how much water farms applied.",
     ["jstars2021", "su2021", "wrr2023"],
     [(STUDY + "smap-sentinel-2021-irrigation-signal.webp", "The seasonal irrigation signal in SMAP–Sentinel-1 soil moisture."),
      (STUDY + "irrigation-assimilation-2023.webp", "Estimating irrigation with a particle batch smoother and a land surface model."),
      (STUDY + "rabiei-2021-figure13-original.webp", "Land-use classification from Sentinel-2 soil moisture.", "Rabiei et al. (2021), Figure 13, CC BY")], "sharif"),
    ("2021–22", "Amirkabir", "Amirkabir University", "sharif", ["gee", "youtube"],
     "Taught a graduate course on remote sensing and GIS in water resources, recorded for YouTube.",
     ["youtube"], [], "aut"),
    ("2021–22", "RIES", "Research Institute for Earth Sciences, Geological Survey of Iran", "sharif", [],
     "Assistant professor: a rainfall-triggered landslide risk map of Iran, and climate-change hotspots from high-resolution climate models.",
     ["climate2022"], [], "ries"),
    ("2022–23", "2nd postdoc", "Second postdoc, Michigan State University", "michigan", ["python", "hpc"],
     "Built high-resolution SMAP–Sentinel-1 soil moisture for northern latitudes and permafrost, brought human water use into Noah-MP through data assimilation, worked on NISAR soil moisture for field-scale irrigation, and joined NASA JPL’s SMAPVEX22 field campaign.",
     ["compag2024", "isprs2024", "frontiers2026"], [], "msu"),
    ("2023", "Georgia Tech", "Georgia Tech, online", "gatech", ["dl", "geoml"],
     "Began an online Master of Science in Analytics, and with it deep learning and applied, geospatial machine learning.",
     [], [], "gt"),
    ("2023", "NASA", "NASA Goddard", "nasa", ["git", "lis", "pkg", "geostack"],
     "Water cycle and Earth system modeling, bringing satellite observations and machine learning into the models.",
     ["lisf", "rse2026", "agrotrack", "geostream", "wrr2026"],
     [(STUDY + "agrotrack-2021.png", "AgroTrack: number of irrigated days in cropland, 2021."),
      (STUDY + "agrotrack-heatmap.webp", "Irrigation schedules of ten Nebraska fields in 2021, with the season AgroTrack detected from thermal data.", "Fig. 8a, Jalilvand et al. (2026), Remote Sensing of Environment"),
      (STUDY + "agrotrack-2022.png", "AgroTrack: number of irrigated days in cropland, 2022.")], "nasa"),
    ("2024", "Georgia Tech", "Georgia Tech, online", "gatech", [],
     "Kept going with the analytics master’s.",
     [], [], "gt"),
    ("Now", "NASA", "NASA Goddard", "nasa", ["gfm", "agents"],
     "Mapping irrigated land with few labels, and automating research work.",
     ["agu2025", "agent"], [], "nasa"),
]

esc = html.escape
N = len(STOPS)
last = N - 1
first_stop = {k: next(i for i, s in enumerate(STOPS) if s[3] == k) for k, *_ in MARKS}

ICON = {
    "paper": '<path d="M4 1.5h5.5L13 5v9.5H4z M9.5 1.5V5H13 M6 8h5 M6 10.5h5"/>',
    "code": '<path d="M5.5 4L2 8l3.5 4 M10.5 4L14 8l-3.5 4"/>',
    "video": '<path class="fill" d="M5 3l8 5-8 5z"/>',
    "talk": '<path d="M8 1.5a2 2 0 012 2v4a2 2 0 01-4 0v-4a2 2 0 012-2z M4 7.5a4 4 0 008 0 M8 11.5v3"/>',
}
def png_size(path):
    head = path.read_bytes()[16:24]
    return int.from_bytes(head[:4], "big"), int.from_bytes(head[4:], "big")

def logo_html(key):
    kind, val, name = LOGOS[key]
    if kind == "img":
        w, h = png_size(ROOT / "assets" / "journey" / "logos" / val)
        return f'<span class="jy-logo" aria-hidden="true"><img src="assets/journey/logos/{val}?v={V}" alt="" width="{w}" height="{h}" decoding="async"></span>'
    return f'<span class="jy-logo is-text" aria-hidden="true">{esc(val)}</span>'

scene = []
for k, name, x, y, w, h in MARKS:
    box = f"--x:{x}%;--y:{y}%;--w:{w}%;--h:{h}%"
    scene.append(f'<img class="jy-mark" data-mark="{k}" src="assets/journey/marks/{k}.webp?v={V}" alt="" aria-hidden="true" style="{box}">')
    for text, tx, ty, only in TAG_OVERRIDES.get(k, [(name, round(x + w / 2, 3), round(y + h, 3), None)]):
        stops_attr = f' data-stops="{",".join(map(str, only))}"' if only else ""
        scene.append(f'<span class="jy-tag" data-mark="{k}"{stops_attr} aria-hidden="true" style="--tx:{tx}%;--ty:{ty}%">{esc(text)}</span>')
for k, name, x, y, w, h in MARKS:
    box = f"--x:{x}%;--y:{y}%;--w:{w}%;--h:{h}%"
    scene.append(f'<button type="button" class="jy-hit" data-mark="{k}" data-stage="{first_stop[k]}" aria-label="{esc(name)}" style="{box}"></button>')

stops, stories, fans = [], [], []
for i, (year, short, place, mark, skills, line, work, pics, logo) in enumerate(STOPS):
    cur = ' aria-current="step"' if i == last else ""
    stops.append(f'<li><button type="button" class="jy-stop" data-stage="{i}" data-mark="{mark}" aria-label="{esc(year)}, {esc(place)}"{cur}>{logo_html(logo)}<span class="jy-year" aria-hidden="true">{esc(year)}</span><span class="jy-place" aria-hidden="true">{esc(short)}</span></button></li>')
    links = []
    for key in work:
        kind, label, title, href = WORK[key]
        if not href:
            continue
        extra = ""
        if href.startswith("drive:"):
            vk = href[6:]; extra = f' data-video="{vk}"'; href = f"https://drive.google.com/file/d/{DRIVE_VIDEOS[vk][0]}/view"
        links.append(f'<a class="jy-work" href="{esc(href)}" target="_blank" rel="noopener" title="{esc(title)}"{extra}><svg viewBox="0 0 16 16" aria-hidden="true">{ICON[kind]}</svg>{esc(label)}<span class="sr-only">: {esc(title)}</span></a>')
    work_html = f'<div class="jy-works">{"".join(links)}</div>' if links else ""
    stories.append(f'<div class="jy-story" data-stage="{i}"><p><strong>{esc(year)} · {esc(place)}.</strong> {esc(line)}</p>{work_html}</div>')
    if pics:
        cards = []
        for k, pic in enumerate(pics):
            if pic[0].startswith("video:"):
                vk = pic[0][6:]; caption = DRIVE_VIDEOS[vk][1]
                cards.append(f'<button type="button" class="jy-card is-video" data-stage="{i}" data-i="{k}" data-caption="{esc(caption)}" data-credit="" data-video="{vk}" data-embed="{esc(drive_embed(vk))}" style="--k:{k - (len(pics) - 1) / 2}" aria-label="Play video {k + 1} of {len(pics)} from {esc(year)}, {esc(place)}"><img src="{esc(drive_thumb(vk))}" alt="{esc(caption)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"><span class="jy-play" aria-hidden="true"></span></button>')
                continue
            src, caption, credit = (pic + (None,))[:3]
            cards.append(f'<button type="button" class="jy-card" data-stage="{i}" data-i="{k}" data-caption="{esc(caption)}" data-credit="{esc(credit or "")}" style="--k:{k - (len(pics) - 1) / 2}" aria-label="Open picture {k + 1} of {len(pics)} from {esc(year)}, {esc(place)}"><img src="{esc(src)}" alt="{esc(caption)}" loading="lazy" decoding="async"></button>')
        fans.append(f'<div class="jy-fan" data-stage="{i}" style="--col:{i}">{"".join(cards)}</div>')

bars, row = [], 0
for i, stop in enumerate(STOPS):
    for k in stop[4]:
        label, bg, fg, *to = SKILLS[k]
        # --solid: roughly the label's width, so the label always sits on the first colour
        to_css = f";--to:{to[0]};--solid:calc({len(label) * .62:.2f}em + 20px)" if to else ""
        fade = (" has-split" if to[1:] == ["split"] else " has-fade") if to else ""
        bars.append(f'<li class="jy-bar is-on{fade}{" at-end" if i == last else ""}" data-start="{i}" style="--row:{row};--start:{i};--bg:{bg};--fg:{fg}{to_css}"><span class="sr-only">{esc(stop[0])}: </span>{esc(label)}</li>')
        row += 1

out = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My journey | Ehsan Jalilvand</title>
<meta name="description" content="Ehsan Jalilvand's journey from Sharif University to NASA Goddard: what he worked on at each stop, the skills each added, and the papers and code behind them.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="icon" href="assets/ej-32.png?v=2026-10-30a" sizes="32x32" type="image/png">
<link rel="icon" href="assets/ej-64.png?v=2026-10-30a" sizes="64x64" type="image/png">
<link rel="apple-touch-icon" href="assets/ej-180.png?v=2026-10-30a">
<link rel="stylesheet" href="assets/site.css?v={V}">
<script src="assets/nav.js?v={V}" defer></script>
<link rel="stylesheet" href="assets/journey-page.css?v={V}">
<script src="assets/journey-page.js?v={V}" defer></script>
</head>
<body class="jy-page">
<a class="skip" href="#jy-path">Skip to the timeline</a>
<header class="jy-hero">
  <div class="jy-top">
    <div class="jy-brand"><h1 class="jy-title">My journey</h1></div>
    <nav class="jy-nav" aria-label="Main">
      <a href="about.html">About</a>
      <a href="index.html">Research</a>
      <a href="journey.html" aria-current="page">My journey</a>
      <a href="gallery.html">Gallery</a>
      <a href="blog.html">Blog</a>
      <a href="#contact">Contact</a>
    </nav>
  </div>
  <div class="jy-scene" id="jy-scene">
    <img class="jy-land" src="{PAINTING}?v={V}" width="1672" height="941" fetchpriority="high" alt="A painted landscape with the places of my journey: Sharif University and the Azadi tower in Tehran, a small startup office, the Colosseum for Italy, Michigan State's Beaumont Tower and Spartan statue, Georgia Tech's Tech Tower, and a NASA building and rocket, with the flags of Iran, Italy and the United States.">
    <div class="jy-veil" aria-hidden="true"></div>
    <div class="jy-scrim" aria-hidden="true"></div>
    {"".join(scene)}
  </div>
</header>
<main class="jy-path" id="jy-path" aria-label="Timeline, work and skills">
  <div class="jy-scroll">
    <div class="jy-inner" id="jy-inner" style="--n:{N};--last:{last};--end:{last}">
      <div class="jy-fans">{"".join(fans)}</div>
      <div class="jy-track" aria-hidden="true"><span class="jy-progress"></span></div>
      <ol class="jy-stops" aria-label="Timeline">{"".join(stops)}</ol>
      <div class="jy-stories" aria-live="polite">{"".join(stories)}</div>
      <div class="jy-lanes" style="--rows:{row}">
        <span class="jy-band" aria-hidden="true"></span>
        <ul class="jy-bars" aria-label="Skills, by the stop where each was learned">{"".join(bars)}</ul>
      </div>
    </div>
  </div>
</main>
<dialog class="jy-viewer" id="jy-viewer" aria-labelledby="jy-viewer-cap">
  <figure>
    <img id="jy-viewer-img" alt="">
    <div class="jy-viewer-video" id="jy-viewer-video" hidden></div>
    <figcaption><p id="jy-viewer-cap"></p><p class="jy-viewer-meta"><span id="jy-viewer-count"></span><span id="jy-viewer-credit"></span></p></figcaption>
  </figure>
  <button type="button" class="jy-viewer-btn jy-close" id="jy-viewer-close" aria-label="Close">×</button>
  <button type="button" class="jy-viewer-btn jy-prev" id="jy-viewer-prev" aria-label="Previous picture">‹</button>
  <button type="button" class="jy-viewer-btn jy-next" id="jy-viewer-next" aria-label="Next picture">›</button>
</dialog>
<div class="wrap">
  <footer class="site-foot">
    <p>All views expressed on this site are my own and do not reflect the opinions or positions of my employer or any affiliated organizations.</p>
    <nav class="foot-links" aria-label="Profiles">
      <a href="https://scholar.google.com/citations?user=RsLEzG0AAAAJ&amp;hl=en" aria-label="Google Scholar" title="Google Scholar"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-scholar"/></svg></a>
      <a href="https://www.researchgate.net/profile/Ehsan-Jalilvand" aria-label="ResearchGate" title="ResearchGate"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-researchgate"/></svg></a>
      <a href="https://github.com/ejalilva" aria-label="GitHub" title="GitHub"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-github"/></svg></a>
      <a href="https://www.linkedin.com/in/ehsan-jalilvand-1699534a/" aria-label="LinkedIn" title="LinkedIn"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-linkedin"/></svg></a>
      <a href="https://www.youtube.com/channel/UC6SyjY2pXoI0UK1tfY7uxcw" aria-label="YouTube" title="YouTube"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-youtube"/></svg></a>
      <a href="#contact" aria-label="Contact" title="Contact"><svg aria-hidden="true"><use href="assets/icons.svg?v=2026-10-28a#i-email"/></svg></a>
    </nav>
  </footer>
</div>
</body>
</html>
'''
(ROOT / "journey.html").write_text(out, encoding="utf-8")

record = {
    "painting": PAINTING,
    "landmarks": [dict(key=k, name=n, x=x, y=y, w=w, h=h) for k, n, x, y, w, h in MARKS],
    "skills": [dict(key=k, label=v[0], color=v[1], text=v[2], fades_to=(v[3] if len(v) > 3 else None), split=(v[4:] == ("split",))) for k, v in SKILLS.items()],
    "logos": {k: dict(kind=v[0], value=v[1], name=v[2]) for k, v in LOGOS.items()},
    "work": {k: dict(kind=v[0], label=v[1], title=v[2], href=v[3]) for k, v in WORK.items()},
    "stops": [dict(period=y, short=s, place=p, landmark=m, skills=sk, story=t, work=w, logo=lg,
                   pictures=[(dict(video=drive_embed(pc[0][6:]), caption=DRIVE_VIDEOS[pc[0][6:]][1]) if pc[0].startswith("video:") else dict(src=pc[0], caption=pc[1], credit=(pc[2] if len(pc) > 2 else None))) for pc in pics])
              for y, s, p, m, sk, t, w, pics, lg in STOPS],
}
(ROOT / "data" / "journey-timeline.json").write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"journey.html: {N} stops, {row} skills, {sum(len(s[7]) for s in STOPS)} pictures and videos")
