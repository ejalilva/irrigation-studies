"""List Ehsan's YouTube channel for the website: every video and every playlist, into site/data/youtube.json.

The Gallery's Videos section (site/assets/videos.js) shows them: all videos, newest first, and one tab per playlist.
It runs every week from .github/workflows/youtube.yml, so new uploads and playlists appear by themselves.

It uses the YouTube Data API v3 and needs a key in the environment variable YOUTUBE_API_KEY (a GitHub secret of the
same name for the workflow). Without one it changes nothing and says how to get one. The channel is "channel_id" in
site/data/videos.json. A run costs a handful of the API's 10,000 free daily units.

    YOUTUBE_API_KEY=... python agent/fetch_youtube.py          (Python 3.9+, standard library only)
"""
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import datetime as dt
import json
import os
import re
import sys

SITE = Path(__file__).resolve().parents[1] / "site"
OUT = SITE / "data" / "youtube.json"
API = "https://www.googleapis.com/youtube/v3/"


def get(path, **params):
    params["key"] = os.environ["YOUTUBE_API_KEY"]
    req = Request(API + path + "?" + urlencode(params), headers={"Accept": "application/json"})
    try:
        with urlopen(req, timeout=30) as r:
            return json.load(r)
    except HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:400]
        sys.exit(f"YouTube API {path}: HTTP {e.code}: {detail}")


def pages(path, **params):
    """Every item of a paged list."""
    token = None
    while True:
        data = get(path, maxResults=50, **params, **({"pageToken": token} if token else {}))
        yield from data.get("items", [])
        token = data.get("nextPageToken")
        if not token:
            return


def length(iso):
    """ISO 8601 duration (PT1H2M3S) as 1:02:03 or 2:03."""
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return ""
    d, h, mi, s = (int(x or 0) for x in m.groups())
    h += 24 * d
    return f"{h}:{mi:02d}:{s:02d}" if h else f"{mi}:{s:02d}"


def thumb(snippet):
    t = snippet.get("thumbnails", {})
    for k in ("maxres", "standard", "high", "medium", "default"):
        if k in t:
            return t[k]["url"]
    return ""


def main():
    if not os.environ.get("YOUTUBE_API_KEY"):
        print("No YOUTUBE_API_KEY: site/data/youtube.json is left as it is.\n"
              "To list the channel: in Google Cloud Console, create a project, enable \"YouTube Data API v3\", create an\n"
              "API key (restrict it to that API), and add it to the repository as the Actions secret YOUTUBE_API_KEY.")
        return
    channel_id = json.loads((SITE / "data" / "videos.json").read_text(encoding="utf-8"))["channel_id"]

    ch = get("channels", part="snippet,contentDetails", id=channel_id).get("items", [])
    if not ch:
        sys.exit(f"No channel {channel_id}")
    ch = ch[0]
    uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]

    # Every public upload, then the details that only videos.list has (length, whether it may be embedded).
    ids = [it["contentDetails"]["videoId"] for it in pages("playlistItems", part="contentDetails", playlistId=uploads)]
    videos = {}
    for k in range(0, len(ids), 50):
        for v in get("videos", part="snippet,contentDetails,status", id=",".join(ids[k:k + 50]), maxResults=50).get("items", []):
            st = v.get("status", {})
            if st.get("privacyStatus") != "public" or st.get("uploadStatus") not in (None, "processed"):
                continue
            sn = v["snippet"]
            videos[v["id"]] = {
                "id": v["id"],
                "title": sn["title"],
                "published": sn["publishedAt"][:10],
                "length": length(v["contentDetails"].get("duration")),
                "thumb": thumb(sn),
                "embeddable": st.get("embeddable", True),
                "language": sn.get("defaultAudioLanguage") or sn.get("defaultLanguage") or "",
            }
    order = sorted(videos.values(), key=lambda v: v["published"], reverse=True)

    # Playlists, as on the channel, each with its videos in the playlist's own order (public videos only).
    playlists = []
    for pl in pages("playlists", part="snippet,contentDetails", channelId=channel_id):
        items = [it["contentDetails"]["videoId"] for it in pages("playlistItems", part="contentDetails", playlistId=pl["id"])]
        items = [i for i in items if i in videos]
        if items:
            playlists.append({"id": pl["id"], "title": pl["snippet"]["title"], "count": len(items), "videos": items})

    data = {
        "_about": "Made by agent/fetch_youtube.py from the YouTube Data API; it is rewritten every week, so edit "
                  "site/data/videos.json instead.",
        "channel": {"id": channel_id, "title": ch["snippet"]["title"], "uploads": uploads,
                    "url": f"https://www.youtube.com/channel/{channel_id}"},
        "videos": order,
        "playlists": playlists,
    }
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if {k: v for k, v in old.items() if k != "updated"} == data:
        print(f"No change: {len(order)} videos, {len(playlists)} playlists.")
        return
    data["updated"] = dt.date.today().isoformat()
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(SITE.parent)}: {len(order)} videos, {len(playlists)} playlists.")
    for p in playlists:
        print(f"  {p['title']}: {p['count']}")


if __name__ == "__main__":
    main()
