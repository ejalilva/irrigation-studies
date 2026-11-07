/* Videos on the Gallery page (gallery.html, the section under the pictures).

   Where they come from: data/youtube.json lists every public video on the YouTube channel, newest first, and every
   playlist with its videos; agent/fetch_youtube.py rewrites it every week (.github/workflows/youtube.yml). Videos
   that are not on the channel, such as the AGU24 clip kept on the site, and ids to hide come from data/videos.json.
   Until data/youtube.json exists, the channel is shown as one playlist.

   What it looks like: tabs for All videos and each playlist; a large player; beside it (under it on phones) the
   videos of the chosen tab, in a list that scrolls, about five in view. Resting the mouse on a video in the list
   plays a silent preview in its small picture (YouTube's player, muted, so browsers let it start by itself; a clip
   kept on the site as itself); moving off stops it. A click, or a tap, plays it in the large player with sound. On a
   playlist's tab, "Play the whole playlist" plays it in order in the large player.

   YouTube is reached through youtube-nocookie.com and loads only for a preview or a play. With reduced motion or data
   saver on there are no previews. */
(() => {
  'use strict';
  const box = document.getElementById('videos');
  if (!box) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection && navigator.connection.saveData);
  const canHover = matchMedia('(hover: hover)').matches;
  const YT = 'https://www.youtube-nocookie.com/embed/';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const MUTED = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6v4h2.6L8 13V3L4.6 6z"/><path d="M10.5 6l4 4M14.5 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const YT_MARK = '<svg class="glv-ytmark" viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" rx="5" fill="#FF0000"/><path d="M11 6v8l7-4z" fill="#fff"/></svg>';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const when = d => { const m = /^(\d{4})-(\d{2})/.exec(d || ''); return m ? `${MONTHS[+m[2] - 1]} ${m[1]}` : ''; };

  // YouTube's embedded player for a video (youtube) or a playlist (list). A silent preview starts by itself, without
  // controls, and loops; a play has sound and controls.
  function ytSrc(v, silent, start = true) {
    const p = new URLSearchParams({ playsinline: '1', rel: '0', modestbranding: '1', iv_load_policy: '3' });
    if (start) p.set('autoplay', '1');
    if (silent) { p.set('mute', '1'); p.set('controls', '0'); p.set('disablekb', '1'); }
    if (v.youtube) { if (silent) { p.set('loop', '1'); p.set('playlist', v.youtube); } return YT + encodeURIComponent(v.youtube) + '?' + p; }
    p.set('list', v.list);
    return YT + 'videoseries?' + p;
  }
  const isYT = v => Boolean(v.youtube || v.list);
  // A YouTube video's picture: hqdefault is 4:3 with the 16:9 frame inside, so cropping to 16:9 removes the bands.
  const thumb = v => v.poster || v.thumb || (v.youtube ? `https://i.ytimg.com/vi/${encodeURIComponent(v.youtube)}/hqdefault.jpg` : '');
  const frame = (src, title, silent) => {
    const f = document.createElement('iframe');
    f.src = src; f.title = title; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
    if (silent) { f.tabIndex = -1; f.setAttribute('aria-hidden', 'true'); }
    return f;
  };
  const picture = (v, big) => thumb(v)
    ? `<img src="${esc(thumb(v))}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`
    : `<span class="glv-tile">${YT_MARK}${big ? `<span class="glv-tile-t">${esc(v.title)}</span>` : v.count ? `<span class="glv-tile-n">${v.count} ${v.count === 1 ? 'video' : 'videos'}</span>` : ''}</span>`;
  const json = url => fetch(url, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : null)).catch(() => null);

  Promise.all([json('data/videos.json'), json('data/youtube.json')]).then(([cfg, yt]) => {
    cfg = cfg || {};
    const hide = new Set(cfg.hide || []);
    const channel = cfg.channel || 'https://www.youtube.com/';
    const extras = (cfg.videos || []).filter(v => v.title && (v.src || v.youtube)).map(v => ({ ...v, key: 'x:' + (v.id || v.youtube || v.src) }));
    let tabs;
    if (yt && Array.isArray(yt.videos) && yt.videos.length) {
      const byId = new Map(yt.videos.filter(v => !hide.has(v.id)).map(v => [v.id, {
        key: 'yt:' + v.id, youtube: v.id, title: v.title, date: v.published, length: v.length, thumb: v.thumb, embeddable: v.embeddable !== false
      }]));
      const all = [...byId.values(), ...extras].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      tabs = [{ id: 'all', title: 'All videos', items: all, note: 'newest first' }];
      (yt.playlists || []).filter(p => !hide.has(p.id)).forEach(p => {
        const items = p.videos.map(id => byId.get(id)).filter(Boolean);
        if (items.length) tabs.push({ id: p.id, title: p.title, items, list: p.id, note: 'in the playlist’s order' });
      });
    } else {
      // No list of the channel yet: the channel's uploads and each playlist in data/videos.json, each played by
      // YouTube's own player (which shows its videos), then the extras.
      const uploads = 'UU' + String(cfg.channel_id || '').slice(2);
      const pls = (cfg.playlists || []).filter(p => p.id && !hide.has(p.id)).map(p => ({
        key: 'pl:' + p.id, list: p.id, title: p.title, kind: 'Playlist', count: p.count, meta: p.count ? `${p.count} ${p.count === 1 ? 'video' : 'videos'}` : '' }));
      tabs = [{ id: 'all', title: 'All videos', items: [
        { key: 'uploads', list: uploads, title: 'All my videos on YouTube', kind: 'Channel', meta: 'Every video, newest first' }, ...pls, ...extras] }];
    }
    if (!tabs[0].items.length) return;

    box.innerHTML = `
      <div class="glv-head">
        <h2 id="glv-h">Videos</h2>
        <p>Lessons, talks and tutorials. ${canHover ? 'Point at one to preview it without sound; click to play it here.' : 'Tap one to play it here.'}</p>
        <a class="glv-all" href="${esc(channel)}" target="_blank" rel="noopener">${YT_MARK}My channel on YouTube <span aria-hidden="true">↗</span></a>
      </div>
      ${tabs.length > 1 ? `<div class="glv-tabs" role="group" aria-label="Playlists">${tabs.map((t, k) =>
        `<button type="button" class="glv-tab" data-t="${k}" aria-pressed="${k === 0}">${esc(t.title)}<span class="glv-n">${t.items.length}</span></button>`).join('')}</div>` : ''}
      <div class="glv-body">
        <figure class="glv-main">
          <div class="glv-stage"></div>
          <figcaption><span class="glv-kind"></span><span class="glv-title"></span><span class="glv-meta"></span>
            <button type="button" class="glv-playall" hidden>${PLAY}<span></span></button></figcaption>
        </figure>
        <div class="glv-side">
          <p class="glv-count" aria-live="polite"></p>
          <ul class="glv-list" aria-label="Videos"></ul>
        </div>
      </div>`;
    const stage = box.querySelector('.glv-stage'), list = box.querySelector('.glv-list'), main = box.querySelector('.glv-main');
    const playAll = box.querySelector('.glv-playall');
    let tab = tabs[0], cur = null;

    // The large player: a video (or a whole playlist), playing with sound when play is true.
    function choose(v, play) {
      cur = v;
      list.querySelectorAll('.glv-item').forEach(b => b.toggleAttribute('aria-current', b.dataset.key === v.key));
      box.querySelector('.glv-kind').textContent = v.kind || (v.list && !v.youtube ? 'Playlist' : '');
      box.querySelector('.glv-title').textContent = v.title;
      box.querySelector('.glv-meta').textContent = [v.meta, when(v.date), v.length].filter(Boolean).join(' · ');
      stage.replaceChildren();
      stage.classList.toggle('is-playing', play);
      if (isYT(v) && v.embeddable === false) {
        const a = document.createElement('a');
        a.className = 'glv-cover'; a.href = `https://www.youtube.com/watch?v=${encodeURIComponent(v.youtube)}`; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = `${picture(v, true)}<span class="glv-big-play">${PLAY}</span><span class="glv-away">Plays on YouTube ↗</span>`;
        stage.append(a);
      } else if (isYT(v) && (play || !thumb(v))) {
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
        b.addEventListener('click', () => choose(v, true));
        stage.append(b);
      }
    }

    // The list for a tab.
    function showTab(t) {
      stopPreview();
      tab = t;
      box.querySelectorAll('.glv-tab').forEach((b, k) => b.setAttribute('aria-pressed', String(tabs[k] === t)));
      const lists = t.items.filter(v => v.list && !v.youtube).length;
      box.querySelector('.glv-count').textContent = lists
        ? (() => { const pl = t.items.filter(v => v.key.startsWith('pl:')).length, more = t.items.length - lists;
            return `All my videos, ${pl} ${pl === 1 ? 'playlist' : 'playlists'}${more ? ` and ${more} more ${more === 1 ? 'video' : 'videos'}` : ''}`; })()
        : `${t.items.length} ${t.items.length === 1 ? 'video' : 'videos'}${t.note ? ' · ' + t.note : ''}`;
      list.innerHTML = t.items.map(v => `
        <li><button type="button" class="glv-item" data-key="${esc(v.key)}" aria-label="Play ${esc(v.title)}">
          <span class="glv-thumb">${picture(v, false)}<span class="glv-live"></span>
            ${v.length ? `<span class="glv-len">${esc(v.length)}</span>` : ''}
            <span class="glv-preview" aria-hidden="true">${MUTED}Preview</span></span>
          <span class="glv-text"><span class="glv-t">${esc(v.title)}</span><span class="glv-k">${esc([v.kind, when(v.date) || (v.list && !v.youtube ? v.meta : '')].filter(Boolean).join(' · '))}</span></span>
        </button></li>`).join('');
      list.scrollTop = 0;
      list.querySelectorAll('.glv-item').forEach(b => {
        const v = t.items.find(x => x.key === b.dataset.key);
        if (cur && v.key === cur.key) b.setAttribute('aria-current', '');
        b.addEventListener('pointerenter', e => {
          if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
          clearTimeout(dwell); dwell = setTimeout(() => startPreview(b, v), 220);
        });
        b.addEventListener('pointerleave', () => { if (previewing === b) stopPreview(); else clearTimeout(dwell); });
        b.addEventListener('click', () => {
          stopPreview(); choose(v, true);
          if (!matchMedia('(min-width: 761px)').matches) main.scrollIntoView({ block: 'start', behavior: quiet ? 'auto' : 'smooth' });
        });
      });
      playAll.hidden = !t.list;
      if (t.list) playAll.querySelector('span').textContent = `Play the whole playlist (${t.items.length})`;
      fade();
    }
    playAll.addEventListener('click', () => choose({ key: 'pl:' + tab.list, list: tab.list, title: tab.title, kind: 'Playlist', meta: `${tab.items.length} videos` }, true));

    // Silent previews in the list: one at a time, after the mouse rests on a video for a moment.
    let previewing = null, dwell = 0;
    function stopPreview() {
      clearTimeout(dwell);
      if (!previewing) return;
      previewing.classList.remove('is-preview');
      previewing.querySelector('.glv-live').replaceChildren();
      previewing = null;
    }
    function startPreview(b, v) {
      if (quiet || previewing === b || v.embeddable === false || (cur && v.key === cur.key && stage.classList.contains('is-playing'))) return;
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

    // The list is as tall as the player beside it and scrolls; a soft edge shows there is more below or above.
    const fade = () => {
      const more = list.scrollHeight - list.clientHeight;
      list.classList.toggle('fade-end', more > 4 && list.scrollTop < more - 4);
      list.classList.toggle('fade-start', list.scrollTop > 4);
    };
    list.addEventListener('scroll', fade, { passive: true });
    new ResizeObserver(() => { box.style.setProperty('--glv-h', main.offsetHeight + 'px'); fade(); }).observe(main);
    box.querySelectorAll('.glv-tab').forEach(b => b.addEventListener('click', () => showTab(tabs[+b.dataset.t])));
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); });
    showTab(tabs[0]);
    choose(tabs[0].items[0], false);
  });
})();
