# Irrigation research page

This folder holds the irrigation research page for ehsanjalilvand.com, including the **research landscape table** and the **paper-finding agent** that keeps it up to date.

## How it works, in plain words

- **Your website is just files.** On GitHub, files live in a *repository*: a project folder that remembers every change. **GitHub Pages** shows those files as a website, for free.
- **The table reads one file.** Every row in the table comes from `data/papers.json`. Change that file and the table changes.
- **The agent is a small program** (`agent/find_papers.py`). GitHub can run programs for you on a schedule; this feature is called **GitHub Actions**, and the schedule lives in `.github/workflows/find-papers.yml`.
- **Every Monday**, GitHub starts a temporary computer and runs the agent. The agent:
  1. searches [OpenAlex](https://openalex.org), a free index of scholarly papers and preprints, for recent irrigation studies;
  2. drops papers that aren't about irrigation, or that don't use satellite data or models;
  3. fills in the columns (where/when/how much, study area, period, approach, keywords);
  4. checks whether any preprint in the table now has a peer-reviewed version.
- **The agent never changes your live site.** It opens a **pull request**: a proposed edit that you can read, fix or reject. Your site updates only when you click **Merge**.

```
Monday ─► GitHub runs the agent ─► agent searches OpenAlex ─► agent writes new rows
                                                                      │
       your site updates ◄─ you click Merge ◄─ you review ◄─ pull request
```

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The page itself. |
| `data/papers.json` | The table's rows. The agent adds to it; you can edit it too. |
| `agent/find_papers.py` | The agent. |
| `agent/config.json` | The agent's settings, including the search phrases. |
| `agent/seen.json` | Created after the first run. Remembers every paper the agent has looked at, so it never suggests the same one twice. |
| `.github/workflows/find-papers.yml` | Tells GitHub when to run the agent and to open a pull request with the results. |

## One-time setup (about 15 minutes)

### 1. Create the repository
On github.com, click **+** (top right) and choose **New repository**. Name it `irrigation-studies` (if you type a space, GitHub turns it into a hyphen), choose **Public**, and click **Create repository**. The name becomes part of your page's address, so any short name works.

### 2. Upload the files
On the new repository's page, click **uploading an existing file** and drag in everything from this folder, keeping the folders. Then click **Commit changes**.

> **Watch out for the hidden folder.** `.github` starts with a dot, so Mac hides it by default; press `Cmd + Shift + .` in Finder to show it. If it still doesn't upload, create the file by hand: **Add file → Create new file**, type `.github/workflows/find-papers.yml` as the name (the slashes make the folders), paste the file's contents, and commit.

### 3. Turn on the website
**Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, and click **Save**. After a minute or two the page is live at `https://ejalilva.github.io/irrigation-studies/`.

### 4. Let the agent open pull requests
**Settings → Actions → General**. Under "Workflow permissions", choose **Read and write permissions**, tick **Allow GitHub Actions to create and approve pull requests**, and click **Save**. Without this, the agent can't propose changes.

### 5. (Optional) Give the agent a Claude API key for better results
Without a key, the agent sorts papers with keyword rules. It can tell where/when/how much fairly well, but it leaves the study area, approach and summary empty for you to fill in. With a key, Claude reads each abstract and fills every column.

1. Create a key at [platform.claude.com](https://platform.claude.com) (API keys). New accounts get a small amount of free credit.
2. In the repository: **Settings → Secrets and variables → Actions → New repository secret**. Name: `ANTHROPIC_API_KEY`. Value: your key. Click **Add secret**.

A *secret* is stored encrypted, and GitHub never shows it on the page or in logs. The agent uses Claude Haiku 5.5, which at current [pricing](https://platform.claude.com/docs/en/about-claude/pricing) ($0.10 per million input tokens, $0.50 per million output tokens) costs well under a cent for a typical week of 10 to 20 new papers.

### 6. (Optional) Add a free OpenAlex key
OpenAlex works without a key for light use; a weekly run makes about 15 to 20 searches, well within the no-key allowance. If you ever widen the search a lot, make a free account at openalex.org, copy your key from **Settings → API**, and add it as a secret named `OPENALEX_API_KEY`.

### 7. Run the agent for the first time
Open the **Actions** tab, click **Find new irrigation papers**, then **Run workflow**. In the box, type `365` to search the past year, and click the green **Run workflow** button. After a couple of minutes, a pull request appears under **Pull requests**.

From then on it runs by itself every Monday.

## Every week: reviewing the agent's suggestions

GitHub emails you when a pull request opens. To review it:

1. Open the pull request. The description lists each new paper with a link.
2. Click **Files changed** to see the new rows in green.
3. **To fix a row**, click **⋯ → Edit file** on `data/papers.json`, correct the fields, and click **Commit changes** (keep "Commit directly to the agent/new-papers branch").
4. **To reject a paper**, delete its whole `{ ... }` block in the same way. It won't be suggested again.
5. **To approve**, click **Merge pull request**, then **Confirm merge**. Your site updates in about a minute.

Rows with `"needs_review": true` have columns the agent couldn't fill. Fill them in and set it to `false`; the page shows the row either way.

## Editing the table by hand

Each paper is one block in `data/papers.json`:

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
  "added": null,
  "needs_review": false,
  "source": "seed"
}
```

| Field | Meaning |
|---|---|
| `status` | `"published"` (peer reviewed) or `"preprint"` (shows the pulsing dot). |
| `date` | Publication or posting date, `YYYY-MM-DD`. Rows less than 90 days old get the **New** badge. Use `null` if unknown. |
| `questions` | Which questions the study answers: where irrigation happens, when, and how much water. |
| `region` | One of: Global, Africa, Asia, Europe, North America, South America, Oceania, Multiple. Used by the region filter. |
| `scale` | field, regional, national, continental or global. |
| `methods` | Any of `sm` (satellite soil moisture), `et` (evapotranspiration or thermal), `imagery` (optical or radar imagery), `model` (land surface or Earth system model), `da` (data assimilation), `ml` (machine learning). Used by the approach filter. |
| `url` | Only for papers without a DOI. |

Commas matter in JSON: every field except the last in a block ends with a comma, and so does every block except the last. If the table stops loading after an edit, a missing or extra comma is the usual cause; paste the file into [jsonlint.com](https://jsonlint.com) to find it.

## Changing what the agent looks for

Edit `agent/config.json`:

- `queries`: the search phrases. Add one per line, in quotes, with commas between them.
- `lookback_days`: how far back each run searches (default 60 days).
- `max_new_per_run`: the most papers it will suggest at once (default 20).
- `must_mention_any`: a paper must mention at least one of these terms to be considered, which keeps out irrigation papers that use neither satellites nor models.

## Link it from Google Sites

1. In the Google Sites editor, open the **Pages** panel.
2. Choose **+ → New link** and add `https://ejalilva.github.io/irrigation-studies/` under Research, named "Irrigation".
3. Hide or delete the old Irrigation page, then publish.

Optional: to serve it at `research.ehsanjalilvand.com`, add a **CNAME** record at your domain registrar (host `research`, value `ejalilva.github.io`), then enter the domain under **Settings → Pages → Custom domain** and tick **Enforce HTTPS** once the check passes.

## Troubleshooting

- **The table says it could not load.** You opened `index.html` straight from your computer, and browsers block it from reading `data/papers.json` that way. It works on GitHub Pages. To preview on your computer, open a terminal in this folder, run `python -m http.server`, and visit `http://localhost:8000`.
- **The workflow fails with "GitHub Actions is not permitted to create or approve pull requests".** Redo step 4.
- **The agent stopped running.** GitHub pauses scheduled workflows in public repositories after 60 days without any activity, and emails you when it does. Open the **Actions** tab and click **Enable workflow**.
- **Check what the agent would do, without changing anything.** On your computer, run `python agent/find_papers.py --dry-run` (Python 3.9 or newer, nothing to install).

## Figures

Three figures in the "Studies" section load from Google Sites image links, which can change. To make them permanent, save them in an `img` folder here and change each study's `image.src` in `index.html` to the new path, for example `img/agrotrack.png`. If a figure fails to load, the page shows a small illustration instead.

## Glossary

- **Repository (repo):** a project folder on GitHub that keeps the full history of changes.
- **Commit:** one saved change, with a short message.
- **Branch:** a separate copy of the files where changes are prepared. The agent works on a branch called `agent/new-papers`.
- **Pull request (PR):** a proposal to bring a branch's changes into the main site. You review it, then merge or close it.
- **Merge:** accept a pull request, so its changes go live.
- **GitHub Actions / workflow:** GitHub running a program for you, on a schedule or when you press a button.
- **Secret:** a password or key stored encrypted in the repository settings, readable only by workflows.
- **Preprint:** a paper shared publicly before peer review.
