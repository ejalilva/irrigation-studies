# Maintaining the irrigation studies page

Technical notes for running the page, the paper-finding agent and the review workflow. The public overview is in the [README](../README.md).

## Repository layout

| Path | Contents |
|---|---|
| `index.html` | The water-cycle opening, irrigation studies, research landscape table and related work. |
| `human.html` | Human-driven processes landscape, linked from the farm on the main map. |
| `assets/site.css` | Shared page typography, layout and light/dark theme. |
| `assets/water-cycle.css` | Explorer layout and hover/focus animations. |
| `assets/water-cycle.js` | Map research descriptions and accessible interaction controller. |
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

`data/reading_list.json` holds the reading list, shown as a grid of small cards with tabs for each group. It is a list of `stages`, each with a `key` (`big`, `where`, `when` or `how_much`, which sets the group's color to match the question colors) and a `title`, plus its `items`. Items are numbered in order across stages. Each item needs `title`, `authors`, `year`, `venue`, a short journal name for the card (`venue_short`, for example `RSE` or `HESS`), a `doi` (or `url`) and a one-sentence `why`, which appears when the card is opened. Reorder, add or remove items freely; the page renumbers itself, and every item that is also in the table is tagged Essential there.

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

The personal irrigation studies use a compact two-column grid (one column on phones), styled by `assets/study-grid.css`. Figures remain uncropped, and clicking one opens a larger accessible dialog. Authors and findings are available under “Methods & findings.” Method filters and citation copying remain available.

Three figures were retrieved from Ehsan's personal irrigation page on October 22, 2026 and saved locally under `assets/studies/`. `data/study-figure-sources.json` records their DOI associations and source URLs. WebP conversion is lossless, with original pixels and transparency retained.

The Rabiei et al. (2021) figure was not found on the personal page. Its existing journal Figure 13 was retrieved successfully through the browser, saved locally, and credited to the paper (CC BY).

AgroTrack uses the original 2021 and 2022 irrigation-day maps from the Juxtapose comparison embedded on the personal irrigation page. Both are saved locally as original PNGs and displayed side by side, with individual enlargement controls. All five studies have figures. Use an `image` object (`src`, `alt`, `caption`, `source`) for one figure, or an `images` array for a comparison. Failed image loads are explicitly labeled instead of replaced by synthetic resolution illustrations.

The journey page and its navigation links were removed from the live site at Ehsan's request on October 22, 2026. Its implementation remains recoverable in Git history; do not restore it without a request.

## Water-cycle explorer

The two landscapes are inline SVG in `index.html` and `human.html`, so they work under the GitHub Pages repository path without an iframe or external hosting. Update project text and status labels in the `topics` object in `assets/water-cycle.js`. The controller is isolated from the existing studies and literature scripts. Animations run on hover or keyboard focus and respect reduced-motion settings. On touchscreens, one tap highlights a map area and a second tap opens it. The map is kept deliberately sparse: there is no instruction text, list of parts or touchscreen note around it. When a part is highlighted, a small callout card appears next to it with the part's title, its `short` line from `topics` and "Click to explore →" ("Tap again to explore" after a first tap on touchscreens); clicking or tapping the card opens the part. Each scene item's `data-callout="x y side"` gives the point the card's caret points at, in map units, and the side the card prefers (`left`, `right`, `top` or `bottom`); the card flips to the other side if it would leave the map, and parts without the attribute get a card to the right of their bounding box. The card stays up while the mouse moves onto it. On phones it sits under the map instead. With nothing highlighted, nothing is shown. The map parts stay keyboard-focusable, so the map is still usable without a mouse.

**Size.** On the main page the map's `viewBox` is cropped to the drawing (`0 65 1130 640`), and on screens wider than about 1140px the map extends into the page margins by up to 80px each side (`--bleed` in `assets/water-cycle.css`). Phones use their own framing (`frameLandscape` in `assets/water-cycle.js`).

**Updating CSS or JavaScript.** Both pages load `assets/*.css` and `assets/water-cycle.js` with a version query (currently `?v=2026-10-23f`). Change that value in `index.html` and `human.html` whenever you change those files. Browsers keep cached copies for a while, and without a new version a visitor can get the new page with the old styles and script: labels then show large and black, and animations and the tour do not run.

**Soil block.** Both faces of the block are split, in face-local units, into a surface layer (0–14, top 5 cm), a root zone (14–44, to about 1 m) with plant roots, an unsaturated layer (44–56), and groundwater (56–94) whose top is the water table. Each band is drawn in its face's own plane with a `matrix(...)` transform (left face `matrix(1 .51143 0 1 280 390)`, right face `matrix(1 -.39048 0 1 630 569)`), so bands, labels and arrows follow the isometric slope. On hover of Soil moisture the surface wets and dries quickly, a wetting front then fills the root zone and lingers, and water moves up the roots as it dries; keep the `surface-wet`, `wetting-front` and `uptake-show` timings equal so the stages stay in order. Drainage arrows run down the left face from the root zone to the water table. The river ends at a small sea on the front corner of the block (part of Runoff & rivers), shown in section on the block's edge as a shallow wedge rather than a fall down the soil face. The beach stops on either side of the river mouth and the sea starts in the river's colour, so the river runs straight into the sea.

**Linked parts.** Some animations belong to two parts: elements with a `data-link` attribute (for example `data-link="soil vegetation"`) run when either named part is highlighted, because the controller gives them the `link-run` class, and the tour restarts and speeds them with that part. Soil moisture and Vegetation share the 7-second soil cycle: the corn above the roots grows as the roots take up water, then forms tassels and yellow cobs. Rain and Runoff & rivers share a 6-second cycle: a shower falls, then the river swells (`river-swell`, a stroke on the river outline) and a plume spreads into the sea before both recede. Keep linked animations at the same duration so they stay in step.

**Farm (Human-driven processes).** The pivot rotates in the field plane about its central well, making two turns while the pump runs and resting while it is off. Its towers and falling spray ride the arm inside `.pivot-counter` groups, which counter-rotate and undo the field projection so they stay upright; keep the `pivot-turn` and `pivot-counter` timings identical or they drift apart. The well runs from the pivot down to a screen in the groundwater on the right face. The pivot and pump share a 16-second cycle: the pump runs for 12 seconds while the arm makes two 6-second turns (chevrons rise up the well, water in the aquifer moves toward the screen, the pivot sprays), then rests. On the first turn the pivot field goes from dry light brown to wet dark brown behind the arm, and on the second turn from dark brown to green; each layer is a circle whose stroke is as wide as its diameter, revealed with `stroke-dashoffset` so it draws a growing pie. The field returns to bare soil at the end of the cycle. While it runs, a cone of depression forms in the water table around the well. Its shape follows the steady-state Thiem profile, deepest at the well (24 units) and returning to the undisturbed water table 125 units away, and it deepens and widens quickly at first and then more slowly, roughly with the logarithm of time, before recovering the same way once the pump stops. The undisturbed water table shows as a dashed line while the cone is present. Keep `pivot-turn`, `pivot-counter`, `cone`, `pump-on`, `wt-original`, `pump-spray`, `footprint`, `field-wet` and `field-green` at 16 seconds with matching percentages. The farm's tour step is fixed at 5 seconds (`data-tour-step` on its group, up to 4x speed) so the tour shows both turns. The river-fed fields draw from a diversion dam (weir, intake gate and main canal) on the river bend. Each field has its own lateral canal and gets a 4-second turn in rotation (animation delays 0, -8 s and -4 s): its lateral fills and flows, water advances along the furrows, and the bare field turns dark brown or the cropped fields turn greener and their plants grow, then each field slowly dries until its next turn. A CSS animated `transform` replaces an element's SVG `transform` attribute, so animated elements that need a position sit inside a positioned group.

**Labels.** Map labels have a halo in the page colour (`paint-order: stroke`). Badge labels sit on the white margin around the landscape, except Runoff & rivers, which sits on the land beside the river and keeps dark text on a light halo in both themes (`.maplabel.on-map`).

**Intro tour.** When the page opens and the map is at least half in view, after half a second each map part plays briefly in turn, in badge order (01 to 08), and then the map waits (about 19 seconds on the main page, 5 on the human-driven page). Each step lasts between 1.6 and 3.2 seconds, long enough for the part's slowest animation to finish most of a cycle at up to 3x speed; speeds return to normal when the step ends. While the tour runs, only the part being shown animates. It stops at once if the visitor clicks or taps anywhere, presses a key, focuses a part, or moves the mouse across the map onto a part; a mouse resting or nudged over the map does not stop it. It also stops if the map is scrolled out of view or the tab is hidden. It does not run with reduced motion or when the page opens on a research dialog. Once it finishes or the visitor stops it, the browser remembers this in `localStorage` (`water-cycle-tour-v2-main` and `water-cycle-tour-v2-human`) and later visits skip it; a tour cut short by scrolling or switching tabs plays again on the next visit. Add `?tour` to the page address to replay it as a first-time visitor. The orange **Play tour** button above the map replays it at any time and reads **Stop tour** while it runs, which is also how a visitor stops the automatic tour without touching the map; with reduced motion it steps through the highlights without movement. There is no separate Motion button. The earlier resolution illustration is retained in the expandable “Seeing irrigation at different scales” section.

