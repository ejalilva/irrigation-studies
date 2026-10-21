# Irrigation studies

The irrigation research page for [ehsanjalilvand.com](https://www.ehsanjalilvand.com/home), served by GitHub Pages at `https://ejalilva.github.io/irrigation-studies/`.

The page includes a research landscape table of irrigation studies that use satellite data or Earth system models. A paper-finding agent proposes new studies for the table each week through a pull request.

## Repository layout

| Path | Contents |
|---|---|
| `index.html` | The page: overview, my studies, the research landscape table, related work. Self-contained HTML, CSS and JS. |
| `data/papers.json` | Rows of the research landscape table. |
| `agent/find_papers.py` | Paper-finding agent (Python 3.9+, standard library only). |
| `agent/config.json` | Search phrases and agent settings. |
| `agent/seen.json` | IDs of every paper the agent has evaluated, so rejected papers are not proposed again. Created on the first run. |
| `.github/workflows/find-papers.yml` | Weekly schedule and pull request step. |

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
| `needs_review` | Set by the agent when it could not fill every column. Not shown on the page. |
| `source` | `seed` (added by hand) or `agent`. |

## Paper-finding agent

Each run, the agent:

1. Searches [OpenAlex](https://openalex.org) for works published in the last `lookback_days` that match the phrases in `agent/config.json`.
2. Skips known and previously seen IDs, Zenodo and figshare copies, and papers that don't mention any term in `must_mention_any`. Without an API key it also requires "irrigation" in the title; with a key, Claude judges relevance from the abstract.
3. Classifies each remaining paper. With `ANTHROPIC_API_KEY` set, Claude Haiku 5.5 reads the abstract and fills every column. Without a key, keyword rules fill the questions, methods, data and period, and the row is marked `needs_review`.
4. Checks every preprint in the table for a peer-reviewed version with a near-identical title and the same first author. If it finds one, the row switches to the published DOI and venue, and a `note` records the change.
5. Writes `data/papers.json` and `agent/seen.json` only if something changed, and prints a Markdown report.

The workflow runs every Monday at 13:17 UTC, and can also be started from the Actions tab with an optional `days` input (for example `365` for a first backfill). When there are changes, it opens or updates a pull request from `agent/new-papers`, with the report as its description. To reject a paper, delete its object on that branch before merging; it stays in `seen.json` and won't be proposed again.

Run it locally:

```bash
python agent/find_papers.py --dry-run             # report only, no files written
python agent/find_papers.py --days 365            # wider window, writes files
```

Environment variables: `ANTHROPIC_API_KEY` and `OPENALEX_API_KEY` (both optional), `LOOKBACK_DAYS` (overrides the config), and `REPORT_PATH` (writes the report to a file).

### Configuration (`agent/config.json`)

| Key | Default | Purpose |
|---|---|---|
| `queries` | 9 phrases | OpenAlex search phrases, one request each. |
| `lookback_days` | 60 | Search window per run. |
| `max_pages_per_query` | 5 | Pages of 100 results read per phrase; enough for a one-year backfill. |
| `max_new_per_run` | 20 | Cap on papers proposed in one pull request. Extra relevant papers stay unseen and are proposed by the next run. |
| `must_mention_any` | satellite and model terms | A paper must mention at least one term. |
| `claude_model` | `claude-haiku-5-5` | Model used when an API key is set. |

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
