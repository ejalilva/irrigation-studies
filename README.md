# Irrigation studies

A living guide to research that uses satellites and Earth system models to find **where**, **when** and **how much** farms irrigate. Curated by [Ehsan Jalilvand](https://ejalilva.github.io/irrigation-studies/about.html).

**Visit the page: [ejalilva.github.io/irrigation-studies](https://ejalilva.github.io/irrigation-studies/)**

## What's on the page

- **Research** ([index.html](https://ejalilva.github.io/irrigation-studies/)): an interactive water-cycle landscape. Each part (snow, rain, lakes, vegetation, soil moisture, drainage, rivers) opens a short note with its papers as cards in each journal's own style. The farm, marked so it is the first thing to click, opens the irrigation page.
- **Human-driven processes & irrigation** ([irrigation.html](https://ejalilva.github.io/irrigation-studies/irrigation.html)): why irrigation is the human-driven process to model first; why it matters and what is missing, in two compact sections; my own studies, told as six chapters ("Every answer revealed another question"); an essential reading list; and the research library below.
- **The research library**: a table of studies from across the field, filtered by the question each answers (where, when, how much) and sorted by clicking a column heading, with study area, period, review status and links to data and code. Papers on the essential reading list are tagged **Essential**.
- **My journey**: a painted timeline from Sharif University to NASA Goddard, with the work and skills from each stop.
- **Gallery**: field campaigns and talks on a map; pick a pin to see its pictures.

## How the table stays up to date

1. **Search.** Every week a small program searches [OpenAlex](https://openalex.org), an open index of scholarly papers and preprints, for new irrigation studies. It is also working back through earlier years, one year at a time, to 2015. For older years it keeps papers that have been cited a reasonable number of times for their age, so the table favors studies the field has taken up.
2. **Read and sort.** For each candidate, [Claude](https://www.anthropic.com/claude), an AI model by Anthropic, reads the abstract and fills in the table's columns: is it really about detecting or measuring irrigation, which questions it answers, where and when the study was done, and how.
3. **Human review.** The program proposes new rows as a pull request. I check each one and reject what doesn't belong, and only then publish. Nothing appears in the table without that review.
4. **Follow-up.** Preprints are checked every week, and a row switches to the peer-reviewed version once it appears. The program also looks for datasets and software linked to each paper in open registries such as [DataCite](https://datacite.org) and [Crossref](https://www.crossref.org).

The descriptions are AI-assisted and reviewed by hand, but mistakes can slip through. Corrections are welcome.

## Suggest a paper or a correction

[Open an issue](https://github.com/ejalilva/irrigation-studies/issues) or email ehsan.jalilvand@gmail.com.

## Data

The table is plain JSON in [`data/papers.json`](data/papers.json), with the reading list in [`data/reading_list.json`](data/reading_list.json). You can also download the table as CSV from the page.

---

Views expressed here are my own and do not reflect those of my employer. Maintenance notes are in [docs/MAINTAINING.md](docs/MAINTAINING.md).

