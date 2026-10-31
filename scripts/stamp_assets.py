"""Stamp every asset link with a fingerprint of the file's content.

Pages load their styles, scripts and pictures as `assets/<file>?v=<stamp>`. Browsers keep these files for a while, so
when a file changes its stamp must change too, or a returning visitor gets the old file on some pages and the new one
on others (that is how My journey once kept an old menu script). This script sets each stamp to the first 10
characters of the file's MD5, so every page that uses a file always asks for the same, current version.

Run it after changing anything in site/assets/:   python scripts/stamp_assets.py
scripts/build_journey.py runs it on journey.html by itself. Links to files that don't exist are left alone.
"""
from pathlib import Path
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[1] / "site"  # the published website
REF = re.compile(r'(assets/[A-Za-z0-9_./-]+?\.(?:css|js|svg|png|webp|jpe?g|gif|avif|json|woff2?))\?v=[A-Za-z0-9_.{}-]+')


def fingerprint(rel):
    p = ROOT / rel
    return hashlib.md5(p.read_bytes()).hexdigest()[:10] if p.is_file() else None


def stamp_text(text):
    def sub(m):
        fp = fingerprint(m.group(1))
        return f"{m.group(1)}?v={fp}" if fp else m.group(0)
    return REF.sub(sub, text)


def stamp(paths):
    changed = []
    for p in paths:
        p = Path(p)
        old = p.read_text(encoding="utf-8")
        new = stamp_text(old)
        if new != old:
            p.write_text(new, encoding="utf-8")
            changed.append(p.name)
    return changed


def main():
    # First the stylesheets and scripts (they name pictures and icons), then the pages, which name the stylesheets and
    # scripts by their final content.
    code = sorted((ROOT / "assets").glob("*.css")) + sorted((ROOT / "assets").glob("*.js"))
    done = []
    for _ in range(3):  # a second round settles a script that names another script
        step = stamp(code)
        done += step
        if not step:
            break
    done += stamp(sorted(ROOT.glob("*.html")))
    print("stamped:", ", ".join(sorted(set(done))) or "nothing changed")


if __name__ == "__main__":
    sys.exit(main())
