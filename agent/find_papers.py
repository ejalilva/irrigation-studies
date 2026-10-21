#!/usr/bin/env python3
"""
Paper-finding agent for the irrigation research table.

What it does, in order:
  1. Reads the table (data/papers.json) and its settings (agent/config.json).
  2. Searches OpenAlex, a free index of scholarly papers that also covers
     preprint servers, for recent studies matching the search phrases.
  3. Keeps only papers about irrigation that use satellite data or models.
  4. Fills in the table columns for each new paper. With a Claude API key,
     Claude reads the abstract and fills every column. Without a key,
     simple keyword rules fill what they can and the row is marked
     "needs_review" so you can complete it.
  5. Checks whether any preprint already in the table now has a
     peer-reviewed version, and updates it if so.
  6. Saves the updated table and writes a short report.

It never publishes anything by itself. On GitHub, the workflow in
.github/workflows/find-papers.yml turns its changes into a pull request,
and nothing reaches your site until you approve (merge) it.

Try it on your own computer (Python 3.9 or newer, nothing to install):
    python agent/find_papers.py --dry-run
"""

import argparse
import datetime as dt
import difflib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "papers.json"
CONFIG_PATH = ROOT / "agent" / "config.json"
SEEN_PATH = ROOT / "agent" / "seen.json"

OPENALEX = "https://api.openalex.org/works"
ANTHROPIC = "https://api.anthropic.com/v1/messages"
USER_AGENT = "irrigation-table-agent/1.0 (+https://github.com)"

QUESTIONS = ("where", "when", "how_much")
METHODS = ("sm", "et", "imagery", "model", "da", "ml")
REGIONS = ("Global", "Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Multiple")
SCALES = ("field", "regional", "national", "continental", "global")

# DOI prefixes and host names that mean "not peer reviewed yet".
PREPRINT_HINTS = (
    "10.5194/egusphere", "egusphere", "/preprints/",                  # EGU discussion papers
    "10.22541/essoar", "essoar", "ess open archive",                  # ESS Open Archive
    "10.31223/", "eartharxiv",                                        # EarthArXiv
    "10.48550/arxiv", "arxiv",                                        # arXiv
    "10.21203/rs.", "research square",                                # Research Square
    "10.2139/ssrn", "ssrn",                                           # SSRN
    "10.20944/preprints", "preprints.org",                            # Preprints.org
    "authorea",
)

# Keyword rules, used only when no Claude API key is set.
Q_RULES = {
    "where": r"\bmap(s|ping|ped)?\b|\bextent\b|irrigated (area|land|cropland|fields?)|classif\w*|detect\w* (of )?irrigated",
    "when": r"\btiming\b|irrigation events?|event detection|\bfrequency\b|schedul\w*|dates? of irrigation|\bonset\b",
    "how_much": r"quantif\w*|\bamounts?\b|\bvolumes?\b|water use|withdrawals?|water requirements?|irrigation requirements?|consumptive|estimat\w* (of )?(the )?irrigation water",
}
METHOD_RULES = {
    "sm": r"soil moisture|\bsmap\b|\bsmos\b|\bascat\b|\bamsr",
    "et": r"evapotranspiration|land surface temperature|\bthermal\b|ecostress|energy balance",
    "imagery": r"\bndvi\b|landsat|sentinel-?2|sentinel-?1|\bmodis\b|backscatter|\bsar\b|optical",
    "model": r"land surface model|earth system model|hydrolog\w* model|noah|community land model|\bclm\b|\bvic\b|lpjml|jules|aquacrop|\bswat\b",
    "da": r"assimilat\w*",
    "ml": r"machine learning|random forest|neural network|deep learning|xgboost|support vector",
}
DATA_TERMS = ("SMAP", "SMOS", "ASCAT", "AMSR2", "AMSR-E", "Sentinel-1", "Sentinel-2", "Landsat", "MODIS",
              "ECOSTRESS", "GRACE", "Noah-MP", "CLM", "VIC", "LPJmL", "ERA5", "ESA CCI", "AquaCrop")


# --------------------------------------------------------------------- utils

def log(msg):
    print(msg, flush=True)


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def save_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def norm_title(t):
    return re.sub(r"[^a-z0-9]+", " ", (t or "").lower()).strip()


def http_json(url, body=None, headers=None, tries=3):
    """GET (or POST when body is given) a URL and return parsed JSON."""
    headers = dict(headers or {})
    headers.setdefault("User-Agent", USER_AGENT)
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers.setdefault("content-type", "application/json")
    for attempt in range(1, tries + 1):
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            # 400-level errors other than rate limits will not fix themselves.
            if e.code in (429, 500, 502, 503, 504, 529) and attempt < tries:
                time.sleep(5 * attempt)
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if attempt < tries:
                time.sleep(5 * attempt)
                continue
            raise


# ------------------------------------------------------------------ OpenAlex

def openalex_url(params, cfg):
    key = os.environ.get("OPENALEX_API_KEY", "").strip()
    if key:
        params["api_key"] = key
    return OPENALEX + "?" + urllib.parse.urlencode(params, safe=":,|")


def openalex_search(query, since, cfg):
    """Return every work matching the query since the given date, newest first."""
    per_page = 100
    max_pages = int(cfg.get("max_pages_per_query", 5))
    params = {
        "search": query,
        "filter": f"from_publication_date:{since},type:article|preprint|review",
        "sort": "publication_date:desc",
        "per_page": str(per_page),
    }
    results = []
    for page in range(1, max_pages + 1):
        params["page"] = str(page)
        try:
            batch = http_json(openalex_url(dict(params), cfg)).get("results", [])
        except urllib.error.HTTPError as e:
            if e.code != 400 or "type:" not in params["filter"]:
                raise
            # Retry without the type filter in case OpenAlex renamed a type.
            params["filter"] = f"from_publication_date:{since}"
            batch = http_json(openalex_url(dict(params), cfg)).get("results", [])
        results.extend(batch)
        if len(batch) < per_page:
            break
    return results


def abstract_text(inverted):
    if not inverted:
        return ""
    words = {}
    for word, positions in inverted.items():
        for p in positions:
            words[p] = word
    return " ".join(words[i] for i in sorted(words))


def doi_of(work):
    d = (work.get("doi") or "").strip()
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", d, flags=re.I) or None


def source_name(work):
    loc = work.get("primary_location") or {}
    src = loc.get("source") or {}
    return src.get("display_name") or ""


# Copernicus discussion papers look like 10.5194/hess-2024-123; final
# papers look like 10.5194/hess-28-1234-2024.
COPERNICUS_DISCUSSION = re.compile(r"^10\.5194/[a-z]+-(19|20)\d{2}-\d+$", re.I)


def is_preprint(work):
    if work.get("type") == "preprint":
        return True
    loc = work.get("primary_location") or {}
    doi = doi_of(work) or ""
    if COPERNICUS_DISCUSSION.match(doi):
        return True
    hay = " ".join([doi, source_name(work), loc.get("landing_page_url") or ""]).lower()
    return any(h in hay for h in PREPRINT_HINTS)


def authors_str(work, n=3):
    names = []
    for a in work.get("authorships") or []:
        name = ((a.get("author") or {}).get("display_name") or "").strip()
        if not name:
            continue
        parts = name.split()
        family = parts[-1]
        initials = "".join(p[0] + "." for p in parts[:-1] if p[:1].isalpha())
        names.append(f"{family}, {initials}" if initials else family)
    if not names:
        return "", ""
    shown = ", ".join(names[:n]) + (", et al." if len(names) > n else "")
    return shown, names[0].split(",")[0]


def candidate_from(work):
    doi = doi_of(work)
    authors, first = authors_str(work)
    pre = is_preprint(work)
    venue = source_name(work)
    if pre and venue and "preprint" not in venue.lower():
        venue += " (preprint)"
    loc = work.get("primary_location") or {}
    return {
        "id": (doi or work.get("id") or "").lower(),
        "title": re.sub(r"\s+", " ", work.get("title") or work.get("display_name") or "").strip(),
        "authors": authors,
        "first_author": first,
        "year": work.get("publication_year"),
        "date": work.get("publication_date"),
        "venue": venue or ("Preprint" if pre else ""),
        "doi": doi,
        "url": None if doi else (loc.get("landing_page_url") or work.get("id")),
        "status": "preprint" if pre else "published",
        "abstract": abstract_text(work.get("abstract_inverted_index")),
    }


# Copies of papers posted to general-purpose repositories, not the papers themselves.
SKIP_DOI_PREFIXES = ("10.5281/zenodo", "10.6084/m9.figshare")


def looks_relevant(c, cfg, strict):
    """Cheap first filter so only plausible papers reach the classifier.

    strict (used when there is no Claude key, so nothing else checks the
    paper) requires "irrigation" in the title itself.
    """
    if (c["doi"] or "").lower().startswith(SKIP_DOI_PREFIXES):
        return False
    title, text = c["title"].lower(), (c["title"] + " " + c["abstract"]).lower()
    if strict:
        if "irrigat" not in title:
            return False
    elif "irrigat" not in title and text.count("irrigat") < 2:
        return False
    return any(term in text for term in cfg.get("must_mention_any", []))


# --------------------------------------------------------------- classifying

PROMPT = """You maintain a public literature table of irrigation research that uses satellite observations and/or land surface, Earth system or hydrological models.

Read this paper's metadata and abstract, then answer with ONE JSON object and nothing else.

Title: {title}
Venue: {venue}
Year: {year}
Abstract: {abstract}

JSON keys:
- "relevant": true only if BOTH hold:
  (1) the study detects, maps, times or quantifies irrigation itself (where irrigation happens, when it happens, or how much water is applied, used or required), or represents irrigation in a land surface, Earth system or hydrological model; and
  (2) it uses satellite observations or such a model.
  Studies that only use irrigated land as a setting are NOT relevant: for example crop mapping or yield, soil salinity, irrigation suitability or site selection, canal or infrastructure monitoring, wastewater irrigation effects, glacier or snow water supply, or smart-irrigation sensor and IoT systems.
- "where": true if it maps the location or extent of irrigated land.
- "when": true if it detects the timing, dates or frequency of irrigation events or seasons.
- "how_much": true if it estimates irrigation amounts, water use or water requirements.
- "domain": study area in a few words (e.g. "Ebro basin, Spain"); "Global" if global; null if not stated.
- "region": one of {regions}, or null.
- "scale": one of {scales}, or null.
- "period_start", "period_end": first and last year of the data analysed, or null if not stated.
- "approach": at most 10 words describing the method.
- "methods": subset of ["sm","et","imagery","model","da","ml"] (sm = satellite soil moisture, et = evapotranspiration or thermal, imagery = optical or radar imagery, model = land surface / Earth system / hydrological model, da = data assimilation, ml = machine learning).
- "data": up to 6 satellites, products or models used.
- "keywords": up to 5 short keywords.
- "summary": one plain-language sentence, at most 30 words, no hype.
- "type": "article", "review" or "dataset".
Use null when the abstract does not say. Never guess numbers or places."""


# Tracks Claude API results for the run report.
CLAUDE_STATUS = {"ok": 0, "errors": [], "disabled": False}


def classify_with_claude(c, cfg, key):
    prompt = PROMPT.format(
        title=c["title"], venue=c["venue"], year=c["year"],
        abstract=(c["abstract"] or "(no abstract available)")[:6000],
        regions=", ".join(REGIONS), scales=", ".join(SCALES),
    )
    body = {
        "model": cfg.get("claude_model", "claude-haiku-5-5"),
        "max_tokens": 700,
        "messages": [{"role": "user", "content": prompt}],
    }
    if CLAUDE_STATUS["disabled"]:
        return None
    headers = {"x-api-key": key, "anthropic-version": "2023-06-01"}
    try:
        resp = http_json(ANTHROPIC, body=body, headers=headers)
        text = "".join(b.get("text", "") for b in resp.get("content", []) if b.get("type") == "text")
        CLAUDE_STATUS["ok"] += 1
        return json.loads(text[text.index("{"): text.rindex("}") + 1])
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode("utf-8", "replace").strip()[:300]
        except Exception:
            detail = ""
        msg = f"HTTP {e.code} from the Claude API: {detail or e.reason}"
        CLAUDE_STATUS["errors"].append(msg)
        # Key, billing or model problems affect every call, so stop trying.
        if e.code in (400, 401, 403, 404):
            CLAUDE_STATUS["disabled"] = True
        log(f"  {msg}")
        return None
    except Exception as e:
        msg = f"Claude call failed: {e}"
        CLAUDE_STATUS["errors"].append(msg)
        log(f"  {msg}")
        return None


def classify_with_rules(c):
    text = (c["title"] + " " + c["abstract"]).lower()
    years = re.findall(r"\b((?:19|20)\d{2})\s*(?:-|–|to)\s*((?:19|20)\d{2})\b", c["abstract"])
    period = (int(years[0][0]), int(years[0][1])) if years else (None, None)
    return {
        "relevant": True,
        **{q: bool(re.search(rx, text)) for q, rx in Q_RULES.items()},
        "domain": None, "region": None, "scale": None,
        "period_start": period[0], "period_end": period[1],
        "approach": None,
        "methods": [m for m, rx in METHOD_RULES.items() if re.search(rx, text)],
        "data": [d for d in DATA_TERMS if d.lower() in text][:6],
        "keywords": [],
        "summary": None,
        "type": "review" if re.search(r"\breview\b", c["title"].lower()) else "article",
        "_rules": True,
    }


def clean_str(v, n):
    if not isinstance(v, str):
        return None
    v = re.sub(r"\s+", " ", v).strip()
    return v[:n] or None


def build_entry(c, cls, today):
    this_year = dt.date.today().year

    def year_or_none(v):
        try:
            v = int(v)
            return v if 1950 <= v <= this_year else None
        except (TypeError, ValueError):
            return None

    start, end = year_or_none(cls.get("period_start")), year_or_none(cls.get("period_end"))
    if start and end and end < start:
        start, end = end, start
    questions = {q: bool(cls.get(q)) for q in QUESTIONS}
    by_rules = bool(cls.get("_rules"))
    entry = {
        "id": c["id"],
        "title": c["title"],
        "authors": c["authors"],
        "first_author": c["first_author"],
        "year": c["year"],
        "date": c["date"],
        "venue": c["venue"],
        "doi": c["doi"],
        "url": c["url"],
        "status": c["status"],
        "type": cls.get("type") if cls.get("type") in ("article", "review", "dataset") else "article",
        "questions": questions,
        "domain": clean_str(cls.get("domain"), 80),
        "region": cls.get("region") if cls.get("region") in REGIONS else None,
        "scale": cls.get("scale") if cls.get("scale") in SCALES else None,
        "period": {"start": start, "end": end or start} if start else None,
        "approach": clean_str(cls.get("approach"), 100),
        "methods": [m for m in (cls.get("methods") or []) if m in METHODS],
        "data": [clean_str(d, 40) for d in (cls.get("data") or []) if clean_str(d, 40)][:6],
        "keywords": [clean_str(k, 40) for k in (cls.get("keywords") or []) if clean_str(k, 40)][:5],
        "summary": clean_str(cls.get("summary"), 260),
        "added": today,
        "needs_review": by_rules or not any(questions.values()) or not cls.get("domain"),
        "source": "agent",
    }
    return entry


# ------------------------------------------------------- preprint follow-up

def find_published_version(p, cfg):
    """Look for a peer-reviewed article with (nearly) the same title."""
    params = {
        "search": p["title"],
        "filter": "type:article",
        "per_page": "5",
    }
    try:
        results = http_json(openalex_url(params, cfg)).get("results", [])
    except Exception as e:
        log(f"  Could not check '{p['title'][:60]}' ({e}).")
        return None
    want = norm_title(p["title"])
    for w in results:
        if is_preprint(w):
            continue
        ratio = difflib.SequenceMatcher(None, want, norm_title(w.get("title"))).ratio()
        _, first = authors_str(w)
        if ratio >= 0.9 and first.lower() == (p.get("first_author") or "").lower():
            return w
    return None


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="Find new irrigation papers for the research table.")
    ap.add_argument("--dry-run", action="store_true", help="show what would change without saving anything")
    ap.add_argument("--days", type=int, help="how many days back to search (overrides config.json)")
    args = ap.parse_args()

    cfg = load_json(CONFIG_PATH, {})
    data = load_json(DATA_PATH, {"updated": None, "papers": []})
    seen = set(load_json(SEEN_PATH, {"ids": []}).get("ids", []))
    papers = data.get("papers", [])

    today = dt.date.today().isoformat()
    days = args.days or int(os.environ.get("LOOKBACK_DAYS") or 0) or cfg.get("lookback_days", 60)
    since = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    claude_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()

    known_ids = {(p.get("id") or "").lower() for p in papers} | {(p.get("doi") or "").lower() for p in papers}
    known_ids.discard("")
    known_titles = {norm_title(p.get("title")) for p in papers}

    log(f"Searching OpenAlex for papers published since {since}.")
    log("Classifier: " + ("Claude (" + cfg.get("claude_model", "claude-haiku-5-5") + ")" if claude_key else "keyword rules (add ANTHROPIC_API_KEY for full classification)"))

    added, skipped, newly_seen, deferred = [], 0, set(), set()
    max_new = cfg.get("max_new_per_run", 20)
    for query in cfg.get("queries", []):
        try:
            works = openalex_search(query, since, cfg)
        except Exception as e:
            log(f"Search failed for '{query}': {e}")
            continue
        log(f"'{query}': {len(works)} results")
        for w in works:
            c = candidate_from(w)
            if not c["id"] or not c["title"] or not c["year"]:
                continue
            if c["id"] in known_ids or c["id"] in seen or c["id"] in newly_seen or norm_title(c["title"]) in known_titles:
                continue
            if not looks_relevant(c, cfg, strict=not claude_key):
                newly_seen.add(c["id"])
                skipped += 1
                continue
            if len(added) >= max_new:
                # Leave it unseen so a later run can propose it.
                deferred.add(c["id"])
                continue
            newly_seen.add(c["id"])
            cls = classify_with_claude(c, cfg, claude_key) if claude_key else None
            if cls is not None and not any(cls.get(q) for q in QUESTIONS):
                cls["relevant"] = False   # the table is organized by where / when / how much
            if cls is None:
                if claude_key and "irrigat" not in c["title"].lower():
                    # Claude was meant to judge this one but failed; leave it
                    # unseen so a later run with a working key can decide.
                    newly_seen.discard(c["id"])
                    continue
                cls = classify_with_rules(c)
            if not cls.get("relevant"):
                skipped += 1
                continue
            entry = build_entry(c, cls, today)
            added.append(entry)
            known_ids.add(entry["id"])
            known_titles.add(norm_title(entry["title"]))
            log(f"  + {entry['first_author']} {entry['year']}: {entry['title'][:80]}")

    # Preprints that have since been published.
    upgraded = []
    for p in papers:
        if p.get("status") != "preprint":
            continue
        w = find_published_version(p, cfg)
        if not w:
            continue
        c = candidate_from(w)
        old = p.get("doi") or p.get("url")
        p.update({
            "id": c["id"], "doi": c["doi"], "url": c["url"], "venue": c["venue"], "year": c["year"],
            "date": c["date"], "status": "published", "authors": c["authors"] or p.get("authors"),
            "note": f"Peer-reviewed version of a preprint previously listed ({old}).",
        })
        upgraded.append(p)
        log(f"  ^ now published: {p['title'][:80]}")

    # Report, used as the pull request description.
    lines = [f"## Paper agent report, {today}", ""]
    lines.append(f"Searched papers published since {since}. "
                 f"{len(added)} new, {len(upgraded)} preprint(s) now peer reviewed, {skipped} skipped as off-topic.")
    if claude_key and CLAUDE_STATUS["errors"]:
        lines += ["", f"**Claude classification failed** ({len(CLAUDE_STATUS['errors'])} error(s); "
                      f"{CLAUDE_STATUS['ok']} paper(s) classified by Claude). Rows without a study area or summary "
                      f"were filled with keyword rules. First error:", "", "```", CLAUDE_STATUS["errors"][0], "```"]
    elif not claude_key:
        lines += ["", "Classified with keyword rules (no `ANTHROPIC_API_KEY` secret was available to this run)."]
    if deferred:
        lines.append("")
        lines.append(f"{len(deferred)} more possibly relevant paper(s) were left for the next run "
                     f"(limit: {max_new} per run). Merge this pull request, then run the workflow again with the same number of days.")
    if added:
        lines += ["", "### New papers", ""]
        for e in added:
            flag = " (preprint)" if e["status"] == "preprint" else ""
            review = " **Please complete the empty columns.**" if e["needs_review"] else ""
            link = f"https://doi.org/{e['doi']}" if e["doi"] else e["url"]
            lines.append(f"- [{e['title']}]({link}), {e['first_author']} et al., {e['year']}{flag}.{review}")
    if upgraded:
        lines += ["", "### Preprints that are now published", ""]
        lines += [f"- {p['title']} ({p['venue']}, {p['year']})" for p in upgraded]
    lines += ["", "To approve, merge this pull request. To reject a paper, delete its block in "
              "`data/papers.json` before merging; it won't be suggested again."]
    report = "\n".join(lines) + "\n"
    print("\n" + report)
    if os.environ.get("REPORT_PATH"):
        Path(os.environ["REPORT_PATH"]).write_text(report, encoding="utf-8")

    changed = bool(added or upgraded)
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if changed else 'false'}\n")

    if args.dry_run or not changed:
        log("No files changed." if not changed else "Dry run: nothing saved.")
        return 0

    papers.extend(added)
    papers.sort(key=lambda p: (-(p.get("year") or 0), p.get("first_author") or ""))
    data["papers"] = papers
    data["updated"] = today
    save_json(DATA_PATH, data)
    save_json(SEEN_PATH, {"ids": sorted(seen | newly_seen)})
    log(f"Saved {DATA_PATH.relative_to(ROOT)} and {SEEN_PATH.relative_to(ROOT)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
