# Ehsan Jalilvand

The source of my personal website. I'm a research scientist who brings human water use, above all irrigation, into water-cycle models, using satellite observations and machine learning. The site covers who I am, the research I do, and the path that led here.

**[Visit the website](https://ejalilva.github.io/irrigation-studies/about.html)**

## What's on the site

- **[About](https://ejalilva.github.io/irrigation-studies/about.html)**: who I am and what I work on, my experience, education and publications, and links to my profiles.
- **[Research](https://ejalilva.github.io/irrigation-studies/)**: an interactive water-cycle landscape. Each part (snow, rain, lakes, vegetation, soil moisture, drainage, rivers) opens a short note on my work there, with its papers. The farm leads to irrigation.
- **[Irrigation](https://ejalilva.github.io/irrigation-studies/irrigation.html)**: why irrigation is the human-driven process to model first, my studies on where, when and how much farms irrigate (told as six chapters), an essential reading list, and a research library of studies from across the field.
- **[My journey](https://ejalilva.github.io/irrigation-studies/journey.html)**: a painted timeline from Sharif University to NASA Goddard, with the work and skills from each stop.
- **[Gallery](https://ejalilva.github.io/irrigation-studies/gallery.html)**: field campaigns and talks on a map. Pick a pin to see its pictures.
- **[Blog](https://ejalilva.github.io/irrigation-studies/blog.html)**: *The Big Ratchet*, my permafrost "ice wall" article, and the NASA Early Career Scientist Spotlight interview.
- **Contact**: a message form on every page, alongside Google Scholar, ResearchGate, GitHub, LinkedIn and YouTube.

## The research library

The library on the Irrigation page keeps itself up to date. Every week a small program searches [OpenAlex](https://openalex.org) for new irrigation studies, and [Claude](https://www.anthropic.com/claude) reads each abstract and fills in the table: which questions the study answers, where and when it was done, and how. The new rows arrive as a pull request, and I review every one before anything is published. The descriptions are AI-assisted and reviewed by hand, so corrections are welcome.

The table is plain JSON in [`site/data/papers.json`](site/data/papers.json), and the page can download it as CSV. To suggest a paper or a correction, [open an issue](https://github.com/ejalilva/irrigation-studies/issues) or use the Contact form on the site.

## How this repository is organized

```
site/        the website itself: the pages, assets/ (styles, scripts, pictures) and data/
agent/       the program that finds new papers for the research library
scripts/     build helpers (the My journey page, asset versions)
docs/        notes for maintaining the site
.github/     workflows that publish the site, search for papers and apply reviews
```

Everything in `site/` is published to GitHub Pages whenever it changes on `main`. To preview locally, run `python -m http.server -d site` and open http://localhost:8000. After changing anything in `site/assets/`, run `python scripts/stamp_assets.py` so browsers pick up the new files. The details are in [docs/MAINTAINING.md](docs/MAINTAINING.md).

---

Views expressed here are my own and do not reflect those of my employer.
