# Maintaining the irrigation studies page

Technical notes for running the page, the paper-finding agent and the review workflow. The public overview is in the [README](../README.md).

## Repository layout

| Path | Contents |
|---|---|
| `index.html` | The page: overview, my studies, the research landscape table, related work. Self-contained HTML, CSS and JS. |
| `data/papers.json` | Rows of the research landscape table. |
| `data/editor_picks.json` | Rising papers (editor's picks) and their notes, shown above the table and tagged in it. |
| `data/reading_list.json` | The ordered essential reading list. |
| `agent/find_papers.py` | Paper-finding agent (Python 3.9+, standard library only). |
| `agent/config.json` | Search phrases and agent settings. |
| `agent/apply_review.py` | Applies the tickboxes in the agent's pull request: removes or restores papers, records Rising papers. |
| `agent/seen.json` | IDs of every paper Claude (or the keyword rules) has judged, so rejected papers are not proposed or paid for again. Created on the first run. |
| `agent/backfill.json` | Progress of the backfill of older papers: the next year to search and the year to stop after. |
| `agent/rejected.json` | Papers you unticked during review. Created on the first rejection. |
| `.github/workflows/find-papers.yml` | Weekly search and the year-by-year backfill; opens the review pull request. |
| `.github/workflows/apply-review.yml` | Runs when you tick or untick a paper in the pull request description. |

## Research landscape table

The page fetches `data/papers.json` at load time, so it must be served over HTTP. Opening the file directly (`file://`) leaves the table empty. To preview locally:

```bash
python -m http.server   # then open http://localhost:8000
```

Each paper is one object in `papers`:

```json
{
  "id": "10.1016/j.rse.2019.111226",
  "title": "Quantification of irrigation water using remote sensing of soil moisture in a semi-arid region",
  "authors": "Jalilvand, E., Tajrishy, M., Ghazi Zadeh Hashemi, S.A., Brocca, L.",
  "first_author": "Jalilvand",
  "year": 2019,
  "date": null,
  "venue": "Remote Sensing of Environment",
  "doi": "10.1016/j.rse.2019.111226",
  "url": null,
  "status": "published",
  "type": "article",
  "questions": { "where": false, "when": false, "how_much": true },
  "domain": "Agricultural plains south of Lake Urmia, Iran",
  "region": "Asia",
  "scale": "regional",
  "period": { "start": 2012, "end": 2015 },
  "approach": "SM2RAIN inversion of coarse satellite soil moisture",
  "methods": ["sm"],
  "data": ["AMSR2"],
  "keywords": ["SM2RAIN", "irrigation water use", "AMSR2", "semi-arid"],
  "summary": "One plain-language sentence.",
  "note": null,
  "resources": [
    { "type": "data", "label": "Zenodo", "url": "https://doi.org/10.5281/zenodo.0000000" },
    { "type": "code", "label": "GitHub", "url": "https://github.com/owner/repo" }
  ],
  "resources_checked": "2026-10-21",
  "added": null,
  "needs_review": false,
  "source": "seed"
}
```

| Field | Notes |
|---|---|
| `id` | Lowercase DOI, or the URL when there is no DOI. Used for de-duplication. |
| `status` | `published` or `preprint`. Preprints get a pulsing "not yet peer reviewed" badge. |
| `date` | `YYYY-MM-DD` publication or posting date. Rows within 90 days get a **New** badge. `null` if unknown. |
| `questions` | Whether the study maps where irrigation occurs, detects when it occurs, or estimates how much water is used. |
| `region` | `Global`, `Africa`, `Asia`, `Europe`, `North America`, `South America`, `Oceania` or `Multiple`. Drives the region filter. |
| `scale` | `field`, `regional`, `national`, `continental` or `global`. |
| `period` | First and last year of data analysed, or `null`. |
| `methods` | Any of `sm` (satellite soil moisture), `et` (ET or thermal), `imagery` (optical or radar), `model` (land surface or Earth system model), `da` (data assimilation), `ml` (machine learning). Drives the approach filter. |
| `note` | Optional extra line in the row's details, such as a preprint's earlier title. |
| `resources` | Optional list of datasets (`"type": "data"`) and software (`"type": "code"`) published with the paper, at most four. Shown as **Data** and **Code** links in the "Data & code" column, and listed in full in the row's details. Add, fix or remove entries by hand at any time. |
| `resources_checked` | Date the agent last looked for data and code links for this paper. Delete it to have the agent look again on its next run. |
| `added` | Date the agent added the row. The default "Rising and new first" order shows Rising papers first, then the most recently published ones. |
| `needs_review` | Set by the agent when it could not fill every column. Shown as "Check details" in the review preview only. |
| `source` | `seed` (added by hand) or `agent`. |

## Paper-finding agent

Each run, the agent:

1. Searches [OpenAlex](https://openalex.org) for works that match the phrases in `agent/config.json`, published in the last `lookback_days`, or since 14 days before the table's last update if that is earlier, so no stretch of time is ever skipped. In a backfill run it also searches one past year (see [Backfill](#backfill)). Every result is read, using cursor paging; `max_results_per_query` is only a safety limit, and the report says if it was reached.
2. Skips known and previously seen IDs, Zenodo and figshare copies, and papers that don't mention "irrigation" and any term in `must_mention_any`. Without an API key it also requires "irrigation" in the title; with a key, Claude judges relevance from the abstract. Papers dropped by this cheap check are not stored in `seen.json`, so they are re-checked for free on later runs.
3. Classifies each remaining paper. With `ANTHROPIC_API_KEY` set, Claude Haiku 5.5 reads the abstract and fills every column; papers Claude can't classify (for example after repeated rate-limit errors) are left for the next run, and the error is shown in the pull request description, or the run fails if nothing could be proposed. Without a key, keyword rules fill the questions, methods, data and period, and the row is marked `needs_review`.
4. Checks every preprint in the table for a peer-reviewed version with a near-identical title and the same first author. If it finds one, the row switches to the published DOI and venue, and a `note` records the change.
5. Looks for datasets and software linked to each new paper, and to existing papers not checked in the last `data_links_recheck_days`. Sources: [DataCite](https://datacite.org) records (Zenodo, PANGAEA, figshare, Mendeley Data and others) that cite the paper's DOI, the publisher's "is supplemented by" links in Crossref, and repository links (GitHub, Zenodo, HydroShare, Earth Engine and similar) written in the abstract. Links found for existing papers are listed in the pull request description so they can be checked before merging.
6. Writes `data/papers.json` and `agent/seen.json` only if something changed, and prints a Markdown report. A run that only re-checked papers for links and found none opens no pull request.

The workflow runs every Monday at 13:17 UTC, and can also be started from the Actions tab, with an optional `days` input and a **backfill** tickbox. When there are changes, it opens a pull request from `agent/new-papers`, with the report as its description. The Monday run is skipped while a review is still open, so edits on the review branch are never overwritten; a manual run always runs and replaces any open review. The report ends with how many abstracts Claude read and the approximate API cost.

### Backfill

The backfill fills the table with older papers, one publication year per pull request, newest year first. `agent/backfill.json` holds the next year to search (`next_year`) and the last one (`first_year`, 2015).

- **Start it** from the Actions tab: Find new irrigation papers > Run workflow > tick **backfill**.
- **Each run** searches the recent window as usual, plus all of `next_year`. A year with no new papers is skipped straight to the year before, up to `backfill_years_per_run` years per run.
- **Citation bar.** Papers from the current and previous year (`free_years`) are included whatever their citations. Older papers need at least `per_year` citations per year of age, up to `max`: with the defaults, 6 citations for a paper from 2024, 18 for 2020 and 33 for 2015. Change `citations_for_older_papers` in `agent/config.json` to raise or lower the bar.
- **Chaining.** Backfill pull requests carry the `backfill` label. Merging one starts the next year automatically, so you only review and merge. If a year has more than `backfill_max_per_year` relevant papers, it continues over several pull requests before moving on.
- **Restarting.** Edit `next_year` in `agent/backfill.json` to search a year again. Papers already judged are remembered in `seen.json`, so a repeat run costs little. When `next_year` is below `first_year`, the backfill is finished and stops.
- **Failures.** If a search fails and the run has nothing to propose, the run is marked failed, because no pull request means nothing would start the next year. Run the workflow again with backfill ticked.

### Reviewing a pull request

1. **Preview it.** The pull request description starts with a link to `https://ejalilva.github.io/irrigation-studies/?preview#landscape`. The preview shows the proposed papers on the real page, badged **Proposed**, with **Check details** on rows that have empty columns. Adding `?preview` to the page address works at any time; with no open review it shows the published table.
2. **Untick papers to reject them.** Each paper is a tickbox in the description. Unticking one makes `apply-review.yml` move it to `agent/rejected.json` within a minute; it stays in `seen.json` and is never proposed again. Ticking it again restores it. The preview can lag a few minutes behind because GitHub caches raw files.
3. **Mark Rising papers.** Under each paper is a **Rising** tickbox. Tick it to feature the paper as your pick. To add your note, edit the pull request description and type it after `Note:` on that line; it appears on the pick's card. Unticking removes the pick.
4. **Fix details if needed.** Edit `data/papers.json` on the `agent/new-papers` branch (the preview has an "Edit details on GitHub" link), and set `needs_review` to `false` on rows you complete.
5. **Merge.** The site updates about a minute later.

Run it locally:

```bash
python agent/find_papers.py --dry-run             # report only, no files written
python agent/find_papers.py --days 365            # wider window, writes files
python agent/find_papers.py --backfill            # also search the next backfill year
python agent/find_papers.py --year 2015 --dry-run # search one year without touching backfill.json
```

Environment variables: `ANTHROPIC_API_KEY` and `OPENALEX_API_KEY` (both optional), `LOOKBACK_DAYS` (overrides the config), `BACKFILL` (`true` to backfill), and `REPORT_PATH` (writes the report to a file).

### Configuration (`agent/config.json`)

| Key | Default | Purpose |
|---|---|---|
| `queries` | 9 phrases | OpenAlex search phrases, one request each. |
| `lookback_days` | 60 | Minimum search window for recent papers. |
| `max_results_per_query` | 20000 | Safety limit on results read per phrase and window. |
| `max_new_per_run` | 20 | Cap on recent papers proposed in one pull request. Extra relevant papers stay unseen and are proposed by the next run. |
| `backfill_max_per_year` | 120 | Cap on backfilled papers in one pull request. |
| `backfill_years_per_run` | 4 | How many empty years one backfill run may move through. |
| `citations_for_older_papers` | 1 free year, 3 per year, max 50 | Citation bar for backfilled papers (see [Backfill](#backfill)). |
| `max_classifications_per_run` | 2000 | Cap on Claude calls in one run, which bounds its cost and run time. |
| `must_mention_any` | satellite and model terms | A paper must mention at least one term. |
| `claude_model` | `claude-haiku-5-5` | Model used when an API key is set. |
| `claude_seconds_between_calls` | 1.5 | Pause between Claude requests, to stay under the API's per-minute rate limit. Lower it if your API tier allows more requests. |
| `find_data_links` | `true` | Look for data and code links (step 5). |
| `data_links_per_run` | 80 | Cap on existing papers checked for links in one run. |
| `data_links_recheck_days` | 180 | How long before an existing paper is checked for links again. |

## Essential and Rising

**Essential** comes from the reading list: every paper in `data/reading_list.json` that is also in the table gets a green Essential tag, an "Essential" status filter and a link to its place in the list. To tag a paper Essential, add it to the reading list.

**Rising** papers are your picks among recent work: not essential yet, but worth reading now.

Rising papers live in `data/editor_picks.json`, separate from the table data:

```json
{
  "picks": [
    { "id": "10.1016/j.agwat.2026.110866", "note": "Why this paper matters, in one or two sentences.", "picked": "2026-10-21" }
  ]
}
```

`id` must match a paper's `id` in `data/papers.json`. The six most recently picked appear as cards in the Rising section above the table. In the table, Rising papers come first in the default order, get a purple star **Rising** tag, show your note in their details, and can be filtered with "Rising" in the status menu. To mark a paper that is already in the table, add it to this file on `main` directly, or ask for it in a pull request.

## Essential reading list

`data/reading_list.json` holds the ordered reading path shown above the table. It is a list of `stages`, each with a `title` and `items`; items are numbered in order across stages. Each item needs `title`, `authors`, `year`, `venue`, `doi` (or `url`) and a one-sentence `why`. Reorder, add or remove items freely; the page renumbers itself.

## Repository settings

- **Pages:** Settings → Pages → Deploy from a branch → `main`, `/ (root)`.
- **Workflow permissions:** Settings → Actions → General → Read and write permissions, and tick "Allow GitHub Actions to create and approve pull requests". Without this, the pull request step fails.
- **Secrets (optional):**
  - `ANTHROPIC_API_KEY`: a weekly run of 10 to 20 abstracts costs well under a cent at current [Haiku 5.5 pricing](https://platform.claude.com/docs/en/about-claude/pricing).
  - `OPENALEX_API_KEY`: free, from openalex.org → Settings → API. A weekly run (about 15 to 20 requests) fits in the no-key allowance.
- GitHub disables scheduled workflows in public repositories after 60 days without activity. Re-enable from the Actions tab if that happens.

## Google Sites

The page is linked from the main site's navigation (Pages → New link → `https://ejalilva.github.io/irrigation-studies/`). To serve it at a subdomain such as `research.ehsanjalilvand.com`, add a CNAME record pointing to `ejalilva.github.io` and set the custom domain under Settings → Pages.

## Figures

Three figures in the Studies section load from Google Sites image URLs, which can change. To make them permanent, move them into `img/` and update each study's `image.src` in `index.html`. If an image fails to load, the page draws a resolution illustration instead.
