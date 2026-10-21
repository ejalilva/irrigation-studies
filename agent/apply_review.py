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

Reads the description from the PR_BODY environment variable.
"""

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "papers.json"
SEEN_PATH = ROOT / "agent" / "seen.json"
REJECTED_PATH = ROOT / "agent" / "rejected.json"

LINE = re.compile(r"^\s*[-*]\s+\[( |x|X)\]\s.*<!--\s*id:(.+?)\s*-->\s*$")


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


def main():
    ticked, unticked = parse(os.environ.get("PR_BODY", ""))
    if not ticked and not unticked:
        print("No paper checklist found in the pull request description.")
        return 0

    data = load(DATA_PATH, {"papers": []})
    rejected = load(REJECTED_PATH, {"papers": []})
    seen = load(SEEN_PATH, {"ids": []})

    papers = data.get("papers", [])
    held = rejected.get("papers", [])
    removed = [p for p in papers if p.get("id", "").lower() in unticked and p.get("source") == "agent"]
    restored = [p for p in held if p.get("id", "").lower() in ticked]

    if not removed and not restored:
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
