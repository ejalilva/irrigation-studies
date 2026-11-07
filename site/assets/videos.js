/* Videos on the Gallery page (gallery.html, the section under the pictures), from data/videos.json.

   A large player and, beside it (under it on phones), the list of videos. Resting the mouse on a video in the list
   plays a silent preview inside its small picture: a YouTube video or playlist through YouTube's own player (muted,
   so browsers let it start by itself), a video kept on the site as itself. Moving off stops it. A click, or a tap,
   plays that video in the large player with sound. Nothing loads from YouTube until a preview or a play, except a
   playlist with no picture of its own in the large player, which is YouTube's player from the start (it loads only as
   the section nears the screen). YouTube is reached through youtube-nocookie.com, which sets no cookies until a video
   plays. With reduced motion or data saver on there are no previews.

   Entries (see "_how_to_add" in data/videos.json): youtube (a video id), youtube_playlist (a playlist id) or src and
   poster (an MP4 in assets/media/), with title, kind, meta and length. */
(() => {
  'use strict';
  const box = document.getElementById('videos');
  if (!box) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection && navigator.connection.saveData);
  const YT = 'https://www.youtube-nocookie.com/embed/';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const MUTED = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6v4h2.6L8 13V3L4.6 6z"/><path d="M10.5 6l4 4M14.5 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const YT_MARK = '<svg class="glv-ytmark" viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 6v8l7-4z" fill="#fff"/></svg>';

  // YouTube's embedded player: a video (id) or a playlist (list). A silent preview starts by itself, without
  // controls, and loops; a play has sound and controls.
  function ytSrc(v, silent, start = true) {
    const p = new URLSearchParams({ playsinline: '1', rel: '0', modestbranding: '1', iv_load_policy: '3' });
    if (start) p.set('autoplay', '1');
    if (silent) { p.set('mute', '1'); p.set('controls', '0'); p.set('disablekb', '1'); }
    if (v.youtube) { if (silent) { p.set('loop', '1'); p.set('playlist', v.youtube); } return YT + encodeURIComponent(v.youtube) + '?' + p; }
    p.set('list', v.youtube_playlist);
    return YT + 'videoseries?' + p;
  }
  const isYT = v => Boolean(v.youtube || v.youtube_playlist);
  // A YouTube video's own picture (hqdefault is 4:3 with the 16:9 frame inside, so cropping to 16:9 removes the bands).
  const thumb = v => v.poster || (v.youtube ? `https://i.ytimg.com/vi/${encodeURIComponent(v.youtube)}/hqdefault.jpg` : '');
  const frame = (src, title, silent) => {
    const f = document.createElement('iframe');
    f.src = src; f.title = title; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
    if (silent) { f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); }
    return f;
  };
  const picture = (v, big) => thumb(v)
    ? `<img src="${esc(thumb(v))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : `<span class="glv-tile">${YT_MARK}${big ? `<span class="glv-tile-t">${esc(v.title)}</span>` : ''}</span>`;

  fetch('data/videos.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(data => {
    const videos = (data.videos || []).filter(v => v.title && (isYT(v) || v.src));
    if (!videos.length) return;
    const channel = data.channel || 'https://www.youtube.com/';
    box.innerHTML = `
      <div class="glv-head">
        <h2 id="glv-h">Videos</h2>
        <p>Lessons, talks and tutorials. ${matchMedia('(hover: hover)').matches ? 'Point at one to preview it without sound; click to play it here.' : 'Tap one to play it here.'}</p>
        <a class="glv-all" href="${esc(channel)}" target="_blank" rel="noopener">${YT_MARK}All my videos on YouTube <span aria-hidden="true">↗</span></a>
      </div>
      <div class="glv-body">
        <figure class="glv-main">
          <div class="glv-stage"></div>
          <figcaption><span class="glv-kind"></span><span class="glv-title"></span><span class="glv-meta"></span></figcaption>
        </figure>
        <ul class="glv-list" aria-label="Videos">${videos.map((v, i) => `
          <li><button type="button" class="glv-item" data-i="${i}" aria-label="Play ${esc(v.title)}">
            <span class="glv-thumb">${picture(v, false)}<span class="glv-live"></span>
              ${v.length ? `<span class="glv-len">${esc(v.length)}</span>` : ''}
              <span class="glv-preview" aria-hidden="true">${MUTED}Preview</span></span>
            <span class="glv-text"><span class="glv-t">${esc(v.title)}</span><span class="glv-k">${esc([v.kind, v.length].filter(Boolean).join(' · '))}</span></span>
          </button></li>`).join('')}
        </ul>
      </div>`;
    const stage = box.querySelector('.glv-stage'), items = [...box.querySelectorAll('.glv-item')];
    let cur = -1;

    // The large player: the chosen video, playing with sound when play is true.
    function choose(i, play) {
      cur = i;
      const v = videos[i];
      items.forEach((b, k) => b.toggleAttribute('aria-current', k === i));
      box.querySelector('.glv-kind').textContent = v.kind || '';
      box.querySelector('.glv-title').textContent = v.title;
      box.querySelector('.glv-meta').textContent = [v.meta, v.length].filter(Boolean).join(' · ');
      stage.replaceChildren();
      stage.classList.toggle('is-playing', play);
      if (isYT(v) && (play || !thumb(v))) {
        // A playlist without a picture shows YouTube's own player, waiting for a click; anything asked to play starts.
        const f = frame(ytSrc(v, false, play), v.title, false);
        if (!play) f.loading = 'lazy';
        stage.append(f);
      } else if (v.src && play) {
        const el = document.createElement('video');
        el.src = v.src; el.poster = v.poster || ''; el.controls = true; el.autoplay = true; el.playsInline = true;
        el.setAttribute('aria-label', v.title);
        stage.append(el);
      } else {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'glv-cover'; b.setAttribute('aria-label', `Play ${v.title}`);
        b.innerHTML = `${picture(v, true)}<span class="glv-big-play">${PLAY}</span>`;
        b.addEventListener('click', () => choose(i, true));
        stage.append(b);
      }
    }

    // Silent previews in the list: one at a time, after the mouse rests on a video for a moment.
    let previewing = null, dwell = 0;
    function stopPreview() {
      clearTimeout(dwell);
      if (!previewing) return;
      previewing.classList.remove('is-preview');
      previewing.querySelector('.glv-live').replaceChildren();
      previewing = null;
    }
    function startPreview(b) {
      const i = Number(b.dataset.i), v = videos[i];
      if (quiet || previewing === b || (i === cur && stage.classList.contains('is-playing'))) return;
      stopPreview();
      const live = b.querySelector('.glv-live');
      if (isYT(v)) live.append(frame(ytSrc(v, true), '', true));
      else {
        const el = document.createElement('video');
        el.src = v.src; el.muted = true; el.loop = true; el.playsInline = true; el.autoplay = true; el.setAttribute('aria-hidden', 'true');
        live.append(el); el.play().catch(() => {});
      }
      b.classList.add('is-preview');
      previewing = b;
    }
    items.forEach(b => {
      b.addEventListener('pointerenter', e => {
        if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        clearTimeout(dwell); dwell = setTimeout(() => startPreview(b), 220);
      });
      b.addEventListener('pointerleave', () => { if (previewing === b) stopPreview(); else clearTimeout(dwell); });
      b.addEventListener('click', () => {
        stopPreview(); choose(Number(b.dataset.i), true);
        if (matchMedia('(max-width: 760px)').matches) stage.scrollIntoView({ block: 'center', behavior: quiet ? 'auto' : 'smooth' });
      });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); });
    choose(0, false);
  }).catch(() => {});
})();
