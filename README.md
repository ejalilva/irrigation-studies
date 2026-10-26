# Irrigation studies

A living guide to research that uses satellites and Earth system models to find **where**, **when** and **how much** farms irrigate. Curated by [Ehsan Jalilvand](https://www.ehsanjalilvand.com/home).

**Visit the page: [ejalilva.github.io/irrigation-studies](https://ejalilva.github.io/irrigation-studies/)**

## What's on the page

- **Interactive water-cycle landscape**: explore snow, rain, lakes, vegetation, soil moisture, drainage and rivers. Each part opens a short note with its papers shown as cards in each journal's own style, with the PDF where the publisher allows it. The farm opens all the irrigation papers, grouped by where, when and how much, and links to a separate human-driven processes view.
- **Why irrigation matters**, in three open-access figures: where farms are irrigated, what irrigation costs rivers, and what protecting rivers would cost in food.
- **My own irrigation studies**, from coarse satellite soil moisture down to field-scale thermal observations.
- **Essential reading**: an ordered list of the papers to start with if you are new to the field.
- **The research landscape**: a table of studies from across the field, filtered by the question each answers and sorted by clicking a column heading. Each row shows which questions a study answers (where, when, how much), its study area and period, whether it has been peer reviewed, and links to any dataset or code published with it. Preprints are clearly flagged. Select a title for the full details.
- **Essential**: papers on the essential reading list are tagged **Essential** in the table.

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

