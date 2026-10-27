"""Build journey.html ("My journey") and data/journey-timeline.json.

Edit the lists below, then run:  python scripts/build_journey.py

- MARKS: the five landmarks painted into assets/journey/landscape-integrated-v2.webp. Each has a cut-out
  layer in assets/journey/marks/<key>.webp; x, y, w, h place that layer over the painting, in % of the
  painting's width and height (taken from the cut-out's pixel box in the 1672 x 941 painting).
- SKILLS: one coloured box per skill: label, background, text colour (white or near-black, whichever
  reads at 4.5:1 on that background).
- STOPS: the timeline, in order. Each stop names its landmark, the skills first learned there, and one
  line on what I did.
"""
from pathlib import Path
import html
import json

ROOT = Path(__file__).resolve().parents[1]
V = "2026-10-26j"  # bump when assets/journey-page.css or .js changes, so browsers fetch the new files

MARKS = [
    # key, name on the map, x, y, w, h (% of the painting)
    ("sharif", "Sharif University", 5.921, 41.339, 31.878, 25.717),
    ("startup", "My startup", 30.861, 61.743, 11.902, 15.197),
    ("italy", "CNR IRPI, Italy", 42.763, 39.320, 16.806, 19.341),
    ("michigan", "Michigan State", 67.943, 32.944, 7.656, 33.262),
    ("nasa", "NASA Goddard", 80.981, 12.965, 14.773, 28.162),
]

SKILLS = {
    "gis": ("GIS", "#2A74B8", "#FFFFFF"),
    "rs": ("Remote sensing", "#10806A", "#FFFFFF"),
    "matlab": ("MATLAB", "#E16737", "#172026"),
    "ux": ("UX design", "#D63384", "#FFFFFF"),
    "story": ("Storytelling", "#F7B6CF", "#172026"),
    "imgproc": ("Image processing", "#4FB3D9", "#172026"),
    "model": ("Model building", "#8B5A2B", "#FFFFFF"),
    "teach": ("Teaching", "#B39DDB", "#172026"),
    "linux": ("Linux", "#FCC624", "#172026"),
    "lsm": ("Land surface models", "#557A1F", "#FFFFFF"),
    "da": ("Data assimilation", "#7B4FB0", "#FFFFFF"),
    "gee": ("Earth Engine", "#0B7A45", "#FFFFFF"),
    "youtube": ("YouTube", "#D9241C", "#FFFFFF"),
    "python": ("Python", "#3776AB", "#FFFFFF"),
    "hpc": ("HPC", "#546E7A", "#FFFFFF"),
    "ml": ("Machine learning", "#F7931E", "#172026"),
    "dl": ("Deep learning", "#EE4C2C", "#000000"),
    "git": ("Git", "#24292F", "#FFFFFF"),
    "lis": ("NASA LIS · Fortran", "#0B3D91", "#FFFFFF"),
    "pkg": ("Python packages", "#FFD43B", "#172026"),
    "gfm": ("Foundation models", "#3949AB", "#FFFFFF"),
    "agents": ("AI agents", "#00ACC1", "#172026"),
}

STOPS = [
    # year, short place (under the dot), place (in the story line), landmark, skills learned, what I did
    ("2013", "Sharif", "Sharif University", "sharif", ["gis", "rs", "matlab"], "Began my PhD, mapping water with GIS and remote sensing."),
    ("2015–19", "Startup", "My startup", "startup", ["ux", "story"], "Co-founded a company: product ideas, website designs and videos."),
    ("2016–17", "Italy", "CNR IRPI, Italy", "italy", ["imgproc", "model"], "Turned MATLAB scripts into reusable models for satellite data."),
    ("2018", "Teaching", "Sharif University", "sharif", ["teach"], "Taught my first university course."),
    ("2019", "PhD", "Sharif University", "sharif", [], "Finished my PhD."),
    ("2020", "Postdoc", "First postdoc", "sharif", ["linux", "lsm", "da"], "Land surface models and data assimilation, on Linux."),
    ("2020–21", "Amirkabir", "Amirkabir University", "sharif", ["gee", "youtube"], "Taught Earth Engine and recorded the lessons for YouTube."),
    ("2022", "Michigan State", "Michigan State", "michigan", ["python", "hpc", "ml", "dl"], "Moved to Python, machine learning and supercomputers."),
    ("2023", "NASA", "NASA Goddard", "nasa", ["git", "lis", "pkg"], "Code for NASA LIS, the AgroTrack package and a global ML product."),
    ("Now", "NASA", "NASA Goddard", "nasa", ["gfm", "agents"], "Fine-tuning geospatial foundation models, and building agents."),
]

esc = html.escape
last = len(STOPS) - 1
first_stop = {k: next(i for i, s in enumerate(STOPS) if s[3] == k) for k, *_ in MARKS}

scene = []
for k, name, x, y, w, h in MARKS:
    box = f"--x:{x}%;--y:{y}%;--w:{w}%;--h:{h}%"
    scene.append(f'<img class="jy-mark" data-mark="{k}" src="assets/journey/marks/{k}.webp" alt="" aria-hidden="true" style="{box}">')
    scene.append(f'<span class="jy-tag" data-mark="{k}" aria-hidden="true" style="{box}">{esc(name)}</span>')
for k, name, x, y, w, h in MARKS:
    box = f"--x:{x}%;--y:{y}%;--w:{w}%;--h:{h}%"
    scene.append(f'<button type="button" class="jy-hit" data-mark="{k}" data-stage="{first_stop[k]}" aria-label="{esc(name)}" style="{box}"></button>')

stops, stories = [], []
for i, (year, short, place, mark, skills, line) in enumerate(STOPS):
    cur = ' aria-current="step"' if i == last else ""
    stops.append(f'<li><button type="button" class="jy-stop" data-stage="{i}" data-mark="{mark}"{cur}><span class="jy-dot" aria-hidden="true"></span><span class="jy-year">{esc(year)}</span><span class="jy-place">{esc(short)}</span></button></li>')
    stories.append(f'<p class="jy-story" data-stage="{i}"><strong>{esc(year)} · {esc(place)}.</strong> {esc(line)}</p>')

bars, row = [], 0
for i, (*_, skills, _line) in enumerate(STOPS):
    for k in skills:
        label, bg, fg = SKILLS[k]
        bars.append(f'<li class="jy-bar is-on{" jy-python" if k == "python" else ""}" data-start="{i}" style="--row:{row};--start:{i};--bg:{bg};--fg:{fg}"><span class="sr-only">{esc(STOPS[i][0])}: </span>{esc(label)}</li>')
        row += 1

out = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My journey | Ehsan Jalilvand</title>
<meta name="description" content="Ehsan Jalilvand's journey from Sharif University to NASA Goddard, and the skills each stop added.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css?v={V}">
<link rel="stylesheet" href="assets/journey-page.css?v={V}">
<script src="assets/journey-page.js?v={V}" defer></script>
</head>
<body class="jy-page">
<a class="skip" href="#jy-path">Skip to the timeline</a>
<header class="jy-hero">
  <div class="jy-top">
    <a class="jy-name" href="index.html">Ehsan Jalilvand</a>
    <nav class="jy-nav" aria-label="Main">
      <a href="index.html#explore">Water cycle</a>
      <a href="index.html#studies">Irrigation studies</a>
      <a href="index.html#landscape">Research library</a>
      <a href="journey.html" aria-current="page">My journey</a>
      <a href="https://www.ehsanjalilvand.com/cv-publications">CV &amp; publications</a>
      <a href="mailto:ehsan.jalilvand@gmail.com">Contact</a>
    </nav>
  </div>
  <div class="jy-scene" id="jy-scene">
    <img class="jy-land" src="assets/journey/landscape-integrated-v2.webp" width="1672" height="941" fetchpriority="high" alt="A painted landscape with the places of my journey: Sharif University and the Azadi tower in Tehran, a small startup workshop, the Colosseum for Italy, Michigan State's clock tower, and a NASA building and rocket.">
    <div class="jy-veil" aria-hidden="true"></div>
    <div class="jy-scrim" aria-hidden="true"></div>
    {"".join(scene)}
    <h1 class="jy-title">My journey</h1>
  </div>
</header>
<main class="jy-path" id="jy-path" aria-label="Timeline and skills">
  <div class="jy-scroll">
    <div class="jy-inner" id="jy-inner" style="--end:{last}">
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
<div class="wrap">
  <footer class="site-foot">
    <p>All views expressed on this site are my own and do not reflect the opinions or positions of my employer or any affiliated organizations.</p>
    <nav aria-label="Profiles">
      <a href="https://scholar.google.com/citations?user=RsLEzG0AAAAJ&amp;hl=en">Google Scholar</a>
      <a href="https://github.com/ejalilva">GitHub</a>
      <a href="https://www.linkedin.com/in/ehsan-jalilvand-1699534a/">LinkedIn</a>
      <a href="https://www.researchgate.net/profile/Ehsan-Jalilvand">ResearchGate</a>
      <a href="mailto:ehsan.jalilvand@gmail.com">Email</a>
    </nav>
  </footer>
</div>
</body>
</html>
'''
(ROOT / "journey.html").write_text(out, encoding="utf-8")

record = {
    "landmarks": [dict(key=k, name=n, x=x, y=y, w=w, h=h) for k, n, x, y, w, h in MARKS],
    "skills": [dict(key=k, label=l, color=bg, text=fg) for k, (l, bg, fg) in SKILLS.items()],
    "stops": [dict(period=y, short=s, place=p, landmark=m, skills=sk, story=t) for y, s, p, m, sk, t in STOPS],
}
(ROOT / "data" / "journey-timeline.json").write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"journey.html: {len(STOPS)} stops, {row} skills")
