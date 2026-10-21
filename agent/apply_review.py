#!/usr/bin/env python3
"""
Apply the tickboxes in the agent's pull request description.

Runs on the agent/new-papers branch whenever the pull request description is
edited (see .github/workflows/apply-review.yml). Each proposed paper is a line
like

    - [x] [Title](link), Author et al., 2026. <!-- id:10.1234/abcd -->

Unticked papers are moved from data/papers.json to agent/rejected.json; their
IDs stay in agent/seen.json, so the agent never proposes them again. Ticking a
paper again moves it back.

Under each paper is a nested line

      - [ ] Editor's pick. Note: <your note> <!-- pick:10.1234/abcd -->

Ticking it adds the paper (and the note, if any) to data/editor_picks.json;
unticking it removes the pick.

Reads the description from the PR_BODY environment variable.
"""

import datetime as dt
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "papers.json"
SEEN_PATH = ROOT / "agent" / "seen.json"
REJECTED_PATH = ROOT / "agent" / "rejected.json"
PICKS_PATH = ROOT / "data" / "editor_picks.json"

LINE = re.compile(r"^\s*[-*]\s+\[( |x|X)\]\s.*<!--\s*id:(.+?)\s*-->\s*$")
PICK = re.compile(r"^\s*[-*]\s+\[( |x|X)\]\s*Editor'?s pick\.?\s*(?:Note:)?(.*?)<!--\s*pick:(.+?)\s*-->\s*$", re.I)


def load(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return default


def save(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse(body):
    ticked, unticked = set(), set()
    for line in (body or "").splitlines():
        m = LINE.match(line)
        if m:
            (unticked if m.group(1) == " " else ticked).add(m.group(2).strip().lower())
    return ticked, unticked


def parse_picks(body):
    """Return {id: note} for ticked picks and a set of unticked pick IDs."""
    picked, unpicked = {}, set()
    for line in (body or "").splitlines():
        m = PICK.match(line)
        if m:
            pid = m.group(3).strip().lower()
            if m.group(1) == " ":
                unpicked.add(pid)
            else:
                picked[pid] = re.sub(r"\s+", " ", m.group(2)).strip()
    return picked, unpicked


def apply_picks(body, rejected_ids, today):
    """Update data/editor_picks.json from the checklist. Returns True if it changed."""
    picked, unpicked = parse_picks(body)
    if not picked and not unpicked:
        return False
    store = load(PICKS_PATH, {"picks": []})
    before = json.dumps(store, sort_keys=True)
    picks = {k["id"].lower(): k for k in store.get("picks", []) if k.get("id")}
    for pid in unpicked | set(rejected_ids):
        picks.pop(pid, None)
    for pid, note in picked.items():
        if pid in rejected_ids:
            continue
        entry = picks.get(pid, {"id": pid, "picked": today})
        entry["note"] = note
        picks[pid] = entry
    store["picks"] = sorted(picks.values(), key=lambda k: k.get("picked", ""), reverse=True)
    if json.dumps(store, sort_keys=True) == before:
        return False
    save(PICKS_PATH, store)
    for pid in picked:
        if pid in picks:
            print(f"Editor's pick: {pid}" + (f" ({picked[pid]})" if picked[pid] else ""))
    return True


def main():
    body = os.environ.get("PR_BODY", "")
    ticked, unticked = parse(body)
    if not ticked and not unticked:
        print("No paper checklist found in the pull request description.")
        return 0
    today = dt.date.today().isoformat()
    picks_changed = apply_picks(body, unticked, today)

    data = load(DATA_PATH, {"papers": []})
    rejected = load(REJECTED_PATH, {"papers": []})
    seen = load(SEEN_PATH, {"ids": []})

    papers = data.get("papers", [])
    held = rejected.get("papers", [])
    removed = [p for p in papers if p.get("id", "").lower() in unticked and p.get("source") == "agent"]
    restored = [p for p in held if p.get("id", "").lower() in ticked]

    if not removed and not restored:
        if not picks_changed:
            print("The table already matches the checklist.")
        return 0

    removed_ids = {p["id"] for p in removed}
    restored_ids = {p["id"] for p in restored}
    papers = [p for p in papers if p["id"] not in removed_ids] + restored
    papers.sort(key=lambda p: (-(p.get("year") or 0), p.get("first_author") or ""))
    held = [p for p in held if p["id"] not in restored_ids] + removed
    ids = set(seen.get("ids", [])) | removed_ids | restored_ids

    data["papers"] = papers
    save(DATA_PATH, data)
    save(REJECTED_PATH, {"papers": held})
    save(SEEN_PATH, {"ids": sorted(ids)})
    for p in removed:
        print(f"Rejected: {p['title']}")
    for p in restored:
        print(f"Restored: {p['title']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
