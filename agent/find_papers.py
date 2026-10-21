#!/usr/bin/env python3
"""
Paper-finding agent for the irrigation research table.

What it does, in order:
  1. Reads the table (data/papers.json) and its settings (agent/config.json).
  2. Searches OpenAlex, a free index of scholarly papers that also covers
     preprint servers, for recent studies matching the search phrases.
     In backfill mode it also searches one past year (agent/backfill.json),
     keeping only papers above a citation bar that rises with age.
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
BACKFILL_PATH = ROOT / "agent" / "backfill.json"

OPENALEX = "https://api.openalex.org/works"
DATACITE = "https://api.datacite.org/dois"
CROSSREF = "https://api.crossref.org/works/"
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
                wait = 5 * attempt
                try:
                    wait = max(wait, min(60, int(e.headers.get("retry-after", 0))))
                except (TypeError, ValueError, AttributeError):
                    pass
                time.sleep(wait)
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


# Only the fields the agent reads, to keep responses small.
OPENALEX_FIELDS = ("id,doi,title,display_name,publication_year,publication_date,type,"
                   "primary_location,authorships,abstract_inverted_index,cited_by_count")
SEARCH_STATUS = {"truncated": []}


def openalex_search(query, since, cfg, until=None, min_citations=0):
    """Return every work matching the query published between since and until.

    Uses cursor paging, so long result lists are read to the end. The only
    limit is max_results_per_query, a safety net; hitting it is reported.
    """
    per_page = 100
    limit = int(cfg.get("max_results_per_query", 20000))
    filters = [f"from_publication_date:{since}"]
    if until:
        filters.append(f"to_publication_date:{until}")
    if min_citations > 0:
        filters.append(f"cited_by_count:>{min_citations - 1}")
    params = {
        "search": query,
        "filter": ",".join(filters + ["type:article|preprint|review"]),
        "select": OPENALEX_FIELDS,
        "sort": "publication_date:desc",
        "per_page": str(per_page),
    }
    results, cursor = [], "*"
    while cursor:
        params["cursor"] = cursor
        try:
            resp = http_json(openalex_url(dict(params), cfg))
        except urllib.error.HTTPError as e:
            if e.code != 400 or "select" not in params:
                raise
            # Retry plainly in case OpenAlex renamed a work type or a field.
            params = {"search": query, "filter": ",".join(filters), "sort": "publication_date:desc", "per_page": str(per_page)}
            continue
        batch = resp.get("results", [])
        results.extend(batch)
        cursor = (resp.get("meta") or {}).get("next_cursor")
        if len(batch) < per_page:
            break
        if len(results) >= limit:
            SEARCH_STATUS["truncated"].append(f"'{query}' ({since} to {until or 'today'})")
            break
    return results


def citation_bar(year, cfg, this_year):
    """Minimum citations for a backfilled paper from the given year."""
    rule = cfg.get("citations_for_older_papers") or {}
    age = this_year - year
    if age <= int(rule.get("free_years", 1)):
        return 0
    return min(int(rule.get("max", 50)), int(rule.get("per_year", 3)) * age)


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


# OpenAlex spells a few journal names oddly.
VENUE_FIXES = {"Earth s Future": "Earth's Future"}


def candidate_from(work):
    doi = doi_of(work)
    authors, first = authors_str(work)
    pre = is_preprint(work)
    venue = VENUE_FIXES.get(source_name(work), source_name(work))
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

Read this paper's metadata and abstract, then record your answer with the record_classification tool.

Title: {title}
Venue: {venue}
Year: {year}
Abstract: {abstract}

Fields:
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
CLAUDE_STATUS = {"ok": 0, "errors": [], "disabled": False, "in_a_row": 0, "last_call": 0.0}
CLAUDE_MAX_FAILURES_IN_A_ROW = 3


# Claude answers through this tool, so the reply is always structured data.
# (Forcing the tool also skips Claude Haiku 5.5's default thinking step.)
CLASSIFY_TOOL = {
    "name": "record_classification",
    "description": "Record how this paper fits the irrigation literature table.",
    "input_schema": {
        "type": "object",
        "properties": {
            "relevant": {"type": "boolean"},
            "where": {"type": "boolean"},
            "when": {"type": "boolean"},
            "how_much": {"type": "boolean"},
            "domain": {"type": ["string", "null"]},
            "region": {"type": ["string", "null"], "enum": list(REGIONS) + [None]},
            "scale": {"type": ["string", "null"], "enum": list(SCALES) + [None]},
            "period_start": {"type": ["integer", "null"]},
            "period_end": {"type": ["integer", "null"]},
            "approach": {"type": ["string", "null"]},
            "methods": {"type": "array", "items": {"type": "string", "enum": list(METHODS)}},
            "data": {"type": "array", "items": {"type": "string"}},
            "keywords": {"type": "array", "items": {"type": "string"}},
            "summary": {"type": ["string", "null"]},
            "type": {"type": "string", "enum": ["article", "review", "dataset"]},
        },
        "required": ["relevant", "where", "when", "how_much", "domain", "region", "scale", "period_start",
                     "period_end", "approach", "methods", "data", "keywords", "summary", "type"],
    },
}


def parse_classification(resp):
    """Pull the classification out of a Messages API response."""
    for b in resp.get("content", []):
        if b.get("type") == "tool_use" and b.get("name") == CLASSIFY_TOOL["name"]:
            return b.get("input") or {}
    text = "".join(b.get("text", "") for b in resp.get("content", []) if b.get("type") == "text")
    if "{" in text and "}" in text:
        return json.loads(text[text.index("{"): text.rindex("}") + 1])
    raise ValueError(f"no classification in Claude's reply (stop_reason: {resp.get('stop_reason')})")


def classify_with_claude(c, cfg, key):
    prompt = PROMPT.format(
        title=c["title"], venue=c["venue"], year=c["year"],
        abstract=(c["abstract"] or "(no abstract available)")[:6000],
        regions=", ".join(REGIONS), scales=", ".join(SCALES),
    )
    body = {
        "model": cfg.get("claude_model", "claude-haiku-5-5"),
        "max_tokens": 2000,
        "tools": [CLASSIFY_TOOL],
        "tool_choice": {"type": "tool", "name": CLASSIFY_TOOL["name"]},
        "messages": [{"role": "user", "content": prompt}],
    }
    if CLAUDE_STATUS["disabled"]:
        return None
    # Pace requests to stay under the API's per-minute rate limit.
    gap = float(cfg.get("claude_seconds_between_calls", 1.5)) - (time.monotonic() - CLAUDE_STATUS["last_call"])
    if gap > 0:
        time.sleep(gap)
    CLAUDE_STATUS["last_call"] = time.monotonic()
    headers = {"x-api-key": key, "anthropic-version": "2023-06-01"}
    try:
        resp = http_json(ANTHROPIC, body=body, headers=headers, tries=5)
        result = parse_classification(resp)
        CLAUDE_STATUS["ok"] += 1
        CLAUDE_STATUS["in_a_row"] = 0
        return result
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode("utf-8", "replace").strip()[:300]
        except Exception:
            detail = ""
        msg = f"HTTP {e.code} from the Claude API: {detail or e.reason}"
        _claude_failed(msg, permanent=e.code in (400, 401, 403, 404))
        return None
    except Exception as e:
        _claude_failed(f"Claude call failed: {e}")
        return None


def _claude_failed(msg, permanent=False):
    CLAUDE_STATUS["errors"].append(msg)
    CLAUDE_STATUS["in_a_row"] += 1
    # Key, billing or model problems affect every call, and repeated failures
    # mean the service is unavailable for now: stop calling it this run.
    if permanent or CLAUDE_STATUS["in_a_row"] >= CLAUDE_MAX_FAILURES_IN_A_ROW:
        CLAUDE_STATUS["disabled"] = True
    log(f"  {msg}")


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

# --------------------------------------------------------- data and code

# DataCite resource types we show, and how.
RESOURCE_TYPES = {"dataset": "data", "datapaper": "data", "collection": "data",
                  "software": "code", "computationalnotebook": "code", "workflow": "code"}

# Links to data or code that authors often write into abstracts.
LINK_PATTERNS = [
    (r"(?:https?://)?github\.com/[\w.-]+/[\w.-]+", "code", "GitHub"),
    (r"(?:https?://)?gitlab\.com/[\w.-]+/[\w./-]+", "code", "GitLab"),
    (r"(?:https?://)?code\.earthengine\.google\.com/[\w?=&/.-]+", "code", "Earth Engine"),
    (r"(?:https?://)?(?:dx\.)?(?:doi\.org/)?10\.5281/zenodo\.\d+", "data", "Zenodo"),
    (r"(?:https?://)?zenodo\.org/(?:records?|doi)/[\w./-]+", "data", "Zenodo"),
    (r"(?:https?://)?(?:doi\.org/)?10\.6084/m9\.figshare\.[\w.]+", "data", "figshare"),
    (r"(?:https?://)?(?:doi\.org/)?10\.1594/pangaea\.\d+", "data", "PANGAEA"),
    (r"(?:https?://)?(?:doi\.org/)?10\.4211/hs\.\w+", "data", "HydroShare"),
    (r"(?:https?://)?(?:www\.)?hydroshare\.org/resource/\w+", "data", "HydroShare"),
    (r"(?:https?://)?(?:doi\.org/)?10\.17632/[\w.]+", "data", "Mendeley Data"),
    (r"(?:https?://)?osf\.io/\w{5}\b", "data", "OSF"),
]


def _plain_doi(x):
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", (x or "").strip(), flags=re.I).lower()


def _publisher(attrs):
    p = attrs.get("publisher")
    return (p.get("name") if isinstance(p, dict) else p) or "Repository"


def find_resources(doi, abstract=""):
    """Datasets, software and supplements linked to a paper.

    Looks in three places: DataCite records (Zenodo, figshare, PANGAEA and most
    other repositories register there) that list the paper as related; the
    paper's Crossref record ("is supplemented by"); and links written in the
    abstract. Returns up to four {"type": "data"|"code", "url", "label"}.
    """
    found = {}
    paper = _plain_doi(doi)

    def add(kind, url, label):
        url = url.rstrip(".,;)]")
        if not url.startswith("http"):
            url = "https://" + ("doi.org/" + url if url.startswith("10.") else url)
        if label in ("Supplement", "Repository"):
            label = next((lab for pat, _, lab in LINK_PATTERNS if re.search(pat, url, re.I)), label)
        key = re.sub(r"^https?://(www\.)?", "", url.lower())
        if paper and _plain_doi(url) == paper:
            return
        found.setdefault(key, {"type": kind, "url": url, "label": label})

    if paper:
        for form in (paper, "https://doi.org/" + paper):
            q = urllib.parse.urlencode({"query": f'relatedIdentifiers.relatedIdentifier:"{form}"', "page[size]": "25"})
            try:
                records = http_json(f"{DATACITE}?{q}").get("data", [])
            except Exception as e:
                log(f"  DataCite lookup failed for {paper}: {e}")
                break
            for rec in records:
                a = rec.get("attributes") or {}
                related = {_plain_doi(r.get("relatedIdentifier")) for r in a.get("relatedIdentifiers") or []}
                kind = RESOURCE_TYPES.get(((a.get("types") or {}).get("resourceTypeGeneral") or "").lower())
                if paper in related and kind and a.get("doi"):
                    add(kind, "https://doi.org/" + a["doi"], _publisher(a))
        try:
            msg = http_json(CROSSREF + urllib.parse.quote(paper, safe="/")).get("message", {})
            for rel in (msg.get("relation") or {}).get("is-supplemented-by", []):
                rid = rel.get("id") or ""
                if rid:
                    add("data", ("https://doi.org/" + rid) if rel.get("id-type") == "doi" else rid, "Supplement")
        except Exception as e:
            log(f"  Crossref lookup failed for {paper}: {e}")

    for pattern, kind, label in LINK_PATTERNS:
        for m in re.finditer(pattern, abstract or "", re.I):
            add(kind, m.group(0), label)

    items = list(found.values())
    items.sort(key=lambda r: (r["type"] != "data", r["label"] == "Supplement"))
    return items[:4]


def openalex_abstracts(dois, cfg):
    """Abstracts for a list of DOIs, fetched 50 at a time."""
    out = {}
    dois = [d for d in dois if d]
    for i in range(0, len(dois), 50):
        chunk = dois[i:i + 50]
        params = {"filter": "doi:" + "|".join(chunk), "per_page": "50"}
        try:
            for w in http_json(openalex_url(params, cfg)).get("results", []):
                out[_plain_doi(doi_of(w))] = abstract_text(w.get("abstract_inverted_index"))
        except Exception as e:
            log(f"  Could not fetch abstracts: {e}")
    return out


def resources_due(p, today, recheck_days):
    last = p.get("resources_checked")
    if not last:
        return True
    try:
        return (dt.date.fromisoformat(today) - dt.date.fromisoformat(last)).days >= recheck_days
    except ValueError:
        return True


def site_url(cfg):
    """Address of the published page, used for the preview link."""
    url = (cfg.get("site_url") or "").strip()
    if not url and "/" in os.environ.get("GITHUB_REPOSITORY", ""):
        owner, repo = os.environ["GITHUB_REPOSITORY"].split("/", 1)
        url = f"https://{owner.lower()}.github.io/{repo}/"
    return url and url.rstrip("/") + "/"


def checklist_line(e, ticked=True):
    """One paper in the review checklist: linked title, journal tag and year, authors underneath.

    Everything stays on one line, ending with the id comment that
    apply_review.py reads.
    """
    def clean(t):
        return re.sub(r"\s+", " ", str(t or "")).replace("<", "&lt;").replace(">", "&gt;").strip()
    link = f"https://doi.org/{e['doi']}" if e.get("doi") else (e.get("url") or "")
    title = clean(e.get("title")).replace("[", "(").replace("]", ")")
    venue = clean(e.get("venue")).replace("`", "'")
    if e.get("status") == "preprint" and "preprint" not in venue.lower():
        venue = f"{venue} (preprint)" if venue else "Preprint"
    meta = [f"`{venue}`" if venue else "", str(e.get("year") or ""), "*some details missing*" if e.get("needs_review") else ""]
    authors = clean(e.get("authors") or e.get("first_author"))
    return (f"- [{'x' if ticked else ' '}] **[{title}]({link})** " + " · ".join(m for m in meta if m)
            + (f"<br><sub>{authors}</sub>" if authors else "") + f" <!-- id:{e['id']} -->")


def main():
    ap = argparse.ArgumentParser(description="Find new irrigation papers for the research table.")
    ap.add_argument("--dry-run", action="store_true", help="show what would change without saving anything")
    ap.add_argument("--days", type=int, help="how many days back to search (overrides config.json)")
    ap.add_argument("--backfill", action="store_true", help="also search one past year (progress in agent/backfill.json)")
    ap.add_argument("--year", type=int, help="backfill this year instead of the one in agent/backfill.json")
    args = ap.parse_args()

    cfg = load_json(CONFIG_PATH, {})
    data = load_json(DATA_PATH, {"updated": None, "papers": []})
    seen = set(load_json(SEEN_PATH, {"ids": []}).get("ids", []))
    papers = data.get("papers", [])

    today_d = dt.date.today()
    today = today_d.isoformat()
    days = args.days or int(os.environ.get("LOOKBACK_DAYS") or 0)
    if days:
        since_d = today_d - dt.timedelta(days=days)
    else:
        since_d = today_d - dt.timedelta(days=int(cfg.get("lookback_days", 60)))
        # Never leave a gap after the last saved run. The overlap catches
        # papers that OpenAlex indexes a little after they are published.
        try:
            since_d = min(since_d, dt.date.fromisoformat(data.get("updated") or "") - dt.timedelta(days=14))
        except ValueError:
            pass
    since = since_d.isoformat()
    claude_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    backfill = bool(args.backfill or args.year or os.environ.get("BACKFILL", "").strip().lower() in ("1", "true", "yes"))
    bf_state = load_json(BACKFILL_PATH, {"next_year": today_d.year, "first_year": 2015})

    known_ids = {(p.get("id") or "").lower() for p in papers} | {(p.get("doi") or "").lower() for p in papers}
    known_ids.discard("")
    known_titles = {norm_title(p.get("title")) for p in papers}

    log("Classifier: " + ("Claude (" + cfg.get("claude_model", "claude-haiku-5-5") + ")" if claude_key else "keyword rules (add ANTHROPIC_API_KEY for full classification)"))

    stats = {"skipped": 0, "classified": 0}
    newly_seen, unclassified, handled = set(), set(), set()
    max_calls = int(cfg.get("max_classifications_per_run", 2000))

    def collect(since, until, cap, min_citations=0):
        """Search one date window. Returns (added, deferred, complete)."""
        added, deferred, complete = [], set(), True
        failed_before = len(unclassified)
        for query in cfg.get("queries", []):
            try:
                works = openalex_search(query, since, cfg, until=until, min_citations=min_citations)
            except Exception as e:
                log(f"Search failed for '{query}': {e}")
                SEARCH_STATUS.setdefault("failed", []).append(query)
                complete = False
                continue
            log(f"'{query}': {len(works)} results")
            for w in works:
                c = candidate_from(w)
                if not c["id"] or not c["title"] or not c["year"] or c["id"] in handled:
                    continue
                if c["id"] in known_ids or c["id"] in seen or norm_title(c["title"]) in known_titles:
                    continue
                handled.add(c["id"])
                if not looks_relevant(c, cfg, strict=not claude_key):
                    # Not marked as seen: this check is free to repeat, and an
                    # abstract added to OpenAlex later may change the answer.
                    stats["skipped"] += 1
                    continue
                if len(added) >= cap or (claude_key and stats["classified"] >= max_calls):
                    # Leave it unseen so a later run can propose it.
                    deferred.add(c["id"])
                    continue
                newly_seen.add(c["id"])
                cls = None
                if claude_key:
                    stats["classified"] += 1
                    cls = classify_with_claude(c, cfg, claude_key)
                if cls is not None and not any(cls.get(q) for q in QUESTIONS):
                    cls["relevant"] = False   # the table is organized by where / when / how much
                if cls is None:
                    if claude_key:
                        # Claude was meant to judge this one but failed; leave it
                        # unseen so a later run can classify it properly.
                        newly_seen.discard(c["id"])
                        unclassified.add(c["id"])
                        continue
                    cls = classify_with_rules(c)
                if not cls.get("relevant"):
                    stats["skipped"] += 1
                    continue
                entry = build_entry(c, cls, today)
                if cfg.get("find_data_links", True):
                    entry["resources"] = find_resources(entry["doi"], c["abstract"])
                    entry["resources_checked"] = today
                added.append(entry)
                known_ids.add(entry["id"])
                known_titles.add(norm_title(entry["title"]))
                log(f"  + {entry['first_author']} {entry['year']}: {entry['title'][:80]}")
        if deferred or len(unclassified) > failed_before:
            complete = False
        return added, deferred, complete

    # Recent papers.
    log(f"Searching OpenAlex for papers published since {since}.")
    max_new = int(cfg.get("max_new_per_run", 20))
    added, deferred, _ = collect(since, None, max_new)

    # Backfill: one past year per pull request, newest first.
    years, backfill_added = [], []
    first_year = int(bf_state.get("first_year", 2015))
    next_year = int(bf_state.get("next_year", today_d.year))
    if backfill:
        year = args.year or next_year
        per_year = int(cfg.get("backfill_max_per_year", 120))
        while year >= first_year and len(years) < int(cfg.get("backfill_years_per_run", 4)):
            bar = citation_bar(year, cfg, today_d.year)
            log(f"Backfill: papers from {year}" + (f" with at least {bar} citations." if bar else ", all citation counts."))
            got, left, complete = collect(f"{year}-01-01", f"{year}-12-31", per_year, bar)
            years.append({"year": year, "bar": bar, "added": got, "left": len(left), "complete": complete})
            backfill_added += got
            if not complete or got:
                break      # one year of papers per pull request
            year -= 1      # nothing found that year: move straight on to the next
        if years and not args.year:
            last = years[-1]
            next_year = last["year"] - 1 if last["complete"] else last["year"]
    backfill_moved = backfill and not args.year and next_year != int(bf_state.get("next_year", today_d.year))
    backfill_more = next_year >= first_year

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

    # Data and code links for papers already in the table.
    linked = []
    if cfg.get("find_data_links", True):
        due = [p for p in papers if p.get("doi") and resources_due(p, today, int(cfg.get("data_links_recheck_days", 180)))]
        due = due[: int(cfg.get("data_links_per_run", 80))]
        if due:
            log(f"Looking for data and code links for {len(due)} paper(s) already in the table.")
            abstracts = openalex_abstracts([_plain_doi(p["doi"]) for p in due], cfg)
            for p in due:
                before = {r["url"] for r in p.get("resources") or []}
                found = find_resources(p["doi"], abstracts.get(_plain_doi(p["doi"]), ""))
                merged = (p.get("resources") or []) + [r for r in found if r["url"] not in before]
                if merged:
                    p["resources"] = merged[:4]
                p["resources_checked"] = today
                if len(merged) > len(before):
                    linked.append(p)
                time.sleep(0.2)

    # Report, used as the pull request description.
    all_added = added + backfill_added
    preview = site_url(cfg)
    lines = [f"## Paper agent report, {today}", ""]
    if all_added and preview:
        lines += [f"**[Preview these papers on the page]({preview}?preview#landscape)**", ""]
    lines.append(f"Searched papers published since {since}: {len(added)} new. "
                 f"{len(upgraded)} preprint(s) now peer reviewed. {stats['skipped']} skipped as off-topic in total.")
    for y in years:
        bar = f"with at least {y['bar']} citations" if y["bar"] else "with any number of citations"
        lines += ["", f"**Backfill, {y['year']}:** searched papers from {y['year']} {bar}. {len(y['added'])} found."]
        if y["left"]:
            lines.append(f"{y['left']} more possibly relevant paper(s) from {y['year']} are waiting "
                         f"(limit: {cfg.get('backfill_max_per_year', 120)} per pull request). Merging this pull request continues with {y['year']}.")
        elif not y["complete"]:
            lines.append(f"Some searches for {y['year']} did not finish, so {y['year']} will be searched again.")
    if backfill and not args.year:
        if backfill_more:
            lines += ["", f"Merging this pull request starts the backfill of **{next_year}** automatically."]
        elif years or backfill_moved:
            lines += ["", f"**The backfill is complete:** every year back to {first_year} has been searched."]
        else:
            lines += ["", f"The backfill was already complete (back to {first_year}). To run it again, lower `first_year` or raise `next_year` in `agent/backfill.json`."]
    if SEARCH_STATUS["truncated"]:
        lines += ["", f"Some searches reached the safety limit of {cfg.get('max_results_per_query', 20000)} results and were cut short: "
                  + "; ".join(SEARCH_STATUS["truncated"]) + ". Raise `max_results_per_query` in `agent/config.json` if this matters."]
    if claude_key and CLAUDE_STATUS["errors"]:
        lines += ["", f"**Claude could not classify {len(unclassified)} paper(s)** "
                      f"({CLAUDE_STATUS['ok']} classified successfully). They were not added and will be tried "
                      f"again on the next run. First error:", "", "```", CLAUDE_STATUS["errors"][0], "```"]
    elif not claude_key:
        lines += ["", "Classified with keyword rules (no `ANTHROPIC_API_KEY` secret was available to this run)."]
    if claude_key and stats["classified"]:
        # Haiku 5.5 at about 1,300 input and 250 output tokens per abstract.
        lines += ["", f"Claude read {stats['classified']} abstract(s) in this run, roughly ${stats['classified'] * 0.00026:.2f} of API credit."]
    if claude_key and stats["classified"] >= max_calls:
        lines += ["", f"This run reached its limit of {max_calls} Claude classifications; the rest wait for the next run."]
    if deferred:
        lines += ["", f"{len(deferred)} more possibly relevant recent paper(s) were left for the next run "
                      f"(limit: {max_new} per run)."]

    def checklist(heading, entries):
        out = ["", f"### {heading}", ""]
        for e in entries:
            out.append(checklist_line(e))
            out.append(f"  - [ ] Rising. Note: <!-- pick:{e['id']} -->")
        return out

    if all_added:
        lines += ["", "### How to review", "",
                  "Untick a paper to reject it. It is removed from this pull request within a minute "
                  "and won't be suggested again. Tick it again to bring it back.", "",
                  "To mark a paper as Rising (your pick: worth reading now), tick **Rising** under it. To add your note, "
                  "edit this description and type it after `Note:` on that line."]
    if added:
        lines += checklist("New papers", added)
    for y in years:
        if y["added"]:
            lines += checklist(f"Papers from {y['year']}", y["added"])
    if upgraded:
        lines += ["", "### Preprints that are now published", ""]
        lines += [f"- {p['title']} ({p['venue']}, {p['year']})" for p in upgraded]
    if linked:
        lines += ["", "### Data and code links found for papers already in the table", ""]
        for p in linked:
            links = ", ".join(f"[{r['label']} ({r['type']})]({r['url']})" for r in p["resources"])
            lines.append(f"- {p['title']}: {links}")
        lines += ["", "To drop a wrong link, delete it from the paper's `resources` list in `data/papers.json` before merging."]
    lines += ["", "Merge this pull request to publish the ticked papers."]
    report = "\n".join(lines) + "\n"
    print("\n" + report)
    if os.environ.get("REPORT_PATH"):
        Path(os.environ["REPORT_PATH"]).write_text(report, encoding="utf-8")

    # Check dates are saved along with other changes; a run that only re-checked
    # papers and found no links does not open a pull request.
    changed = bool(all_added or upgraded or linked or backfill_moved)
    chain = backfill and not args.year and backfill_more
    if years:
        span = f"{years[0]['year']}" if len(years) == 1 else f"{years[-1]['year']}–{years[0]['year']}"
        title = f"Papers from {span}" + (" and new papers" if added else "") + " found by the agent"
    else:
        title = "New irrigation papers found by the agent"
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if changed else 'false'}\n")
            f.write(f"title={title}\n")
            f.write(f"labels={'paper-agent,backfill' if chain else 'paper-agent'}\n")

    if args.dry_run or not changed:
        log("No files changed." if not changed else "Dry run: nothing saved.")
        if claude_key and CLAUDE_STATUS["errors"] and not changed:
            log("Failing the run so the Claude error is visible: " + CLAUDE_STATUS["errors"][0])
            return 1
        if years and not years[-1]["complete"] and not changed:
            # No pull request means nothing would start the next backfill run.
            log(f"Failing the run: the backfill of {years[-1]['year']} did not finish. Run the workflow again with backfill ticked.")
            return 1
        return 0

    papers.extend(all_added)
    papers.sort(key=lambda p: (-(p.get("year") or 0), p.get("first_author") or ""))
    data["papers"] = papers
    data["updated"] = today
    save_json(DATA_PATH, data)
    save_json(SEEN_PATH, {"ids": sorted(seen | newly_seen)})
    if backfill_moved:
        bf_state["next_year"] = next_year
        save_json(BACKFILL_PATH, bf_state)
    log(f"Saved {DATA_PATH.relative_to(ROOT)} and {SEEN_PATH.relative_to(ROOT)}"
        + (f", and set the next backfill year to {next_year}." if backfill_moved else "."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
