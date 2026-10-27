/* My journey (journey.html): links the painting, the timeline, the pictures and the skill bars.
   - Hovering or focusing a stop previews it; clicking selects it. Arrow keys, Home and End move along the timeline.
   - Hovering or focusing a landmark makes it grow; clicking it selects its first stop, and clicking again moves to
     its next stop (Sharif has several).
   - Pictures for the current stop fan out above it. Moving from a stop up to its pictures keeps them open; clicking
     one opens the viewer, with its caption, previous/next and Escape to close.
   - The first time the skills come into view, the timeline plays once from 2013 to now, unless the visitor has
     already touched it. With reduced motion the page simply opens at now. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const scene = document.getElementById('jy-scene');
  const inner = document.getElementById('jy-inner');
  if (!scene || !inner) return;
  const stops = [...inner.querySelectorAll('.jy-stop')];
  const stories = [...inner.querySelectorAll('.jy-story')];
  const bars = [...inner.querySelectorAll('.jy-bar')];
  const fans = [...inner.querySelectorAll('.jy-fan')];
  const marks = [...scene.querySelectorAll('.jy-mark')];
  const tags = [...scene.querySelectorAll('.jy-tag')];
  const hits = [...scene.querySelectorAll('.jy-hit')];
  const last = stops.length - 1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let sel = reduce ? last : 0, preview = null, previewMark = null, shown = null, timer = 0, touched = false, leaveTimer = 0;

  function render() {
    const active = preview ?? sel;
    const mark = previewMark || stops[active].dataset.mark;
    inner.style.setProperty('--end', active);
    stops.forEach((b, i) => {
      b.classList.toggle('is-past', i <= active);
      b.classList.toggle('is-now', i === active);
      b.classList.toggle('is-same', b.dataset.mark === mark);
      if (i === sel) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    stories.forEach((p, i) => p.classList.toggle('is-active', i === active));
    fans.forEach(f => f.classList.toggle('is-on', Number(f.dataset.stage) === active));
    bars.forEach(bar => {
      const start = Number(bar.dataset.start), on = start <= active;
      bar.classList.toggle('is-on', on);
      if (on && start === active && shown !== null && shown !== active && !reduce) {
        bar.classList.remove('is-new'); void bar.offsetWidth; bar.classList.add('is-new');
      }
    });
    shown = active;
    scene.classList.add('has-mark');
    marks.forEach(m => m.classList.toggle('is-on', m.dataset.mark === mark));
    tags.forEach(t => t.classList.toggle('is-on', t.dataset.mark === mark));
  }
  bars.forEach(bar => bar.addEventListener('animationend', () => bar.classList.remove('is-new')));

  function stopTour() { touched = true; clearTimeout(timer); timer = 0; }
  function select(i) { sel = Math.max(0, Math.min(last, i)); render(); }
  // Leaving a stop clears its preview after a moment, so the pointer can travel up to the stop's pictures.
  function endPreview() { clearTimeout(leaveTimer); leaveTimer = setTimeout(() => { preview = null; render(); }, 220); }
  function holdPreview() { clearTimeout(leaveTimer); }

  stops.forEach((b, i) => {
    b.addEventListener('pointerenter', () => { stopTour(); holdPreview(); preview = i; render(); });
    b.addEventListener('pointerleave', endPreview);
    b.addEventListener('focus', () => { stopTour(); holdPreview(); preview = i; render(); });
    b.addEventListener('blur', endPreview);
    b.addEventListener('click', () => { stopTour(); holdPreview(); preview = null; select(i); });
  });
  fans.forEach(f => {
    f.addEventListener('pointerenter', () => { stopTour(); holdPreview(); });
    f.addEventListener('pointerleave', endPreview);
    f.addEventListener('focusin', holdPreview);
  });
  inner.querySelector('.jy-stops').addEventListener('keydown', e => {
    const i = stops.indexOf(document.activeElement);
    if (i < 0) return;
    const to = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to === null) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(last, to));
    stops[j].focus(); select(j);
  });

  hits.forEach(h => {
    const key = h.dataset.mark;
    const enter = () => { stopTour(); previewMark = key; render(); };
    const leave = () => { previewMark = null; render(); };
    h.addEventListener('pointerenter', enter);
    h.addEventListener('pointerleave', leave);
    h.addEventListener('focus', enter);
    h.addEventListener('blur', leave);
    h.addEventListener('click', () => {
      stopTour();
      const here = stops.map((b, i) => b.dataset.mark === key ? i : -1).filter(i => i >= 0);
      const next = stops[sel].dataset.mark === key ? here.find(i => i > sel) ?? here[0] : here[0];
      preview = null; select(next);
      const r = inner.getBoundingClientRect();
      if (r.top > innerHeight - 160) inner.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // Picture viewer
  const viewer = document.getElementById('jy-viewer');
  if (viewer && viewer.showModal) {
    const img = document.getElementById('jy-viewer-img');
    const cap = document.getElementById('jy-viewer-cap');
    const count = document.getElementById('jy-viewer-count');
    const credit = document.getElementById('jy-viewer-credit');
    let list = [], at = 0, opener = null;
    const show = k => {
      at = (k + list.length) % list.length;
      const card = list[at], pic = card.querySelector('img'), story = stories[Number(card.dataset.stage)];
      img.src = pic.currentSrc || pic.src; img.alt = pic.alt;
      const head = story ? story.querySelector('strong').textContent.replace(/\.$/, '') : '';
      cap.textContent = ''; const b = document.createElement('strong'); b.textContent = head + '. '; cap.append(b, card.dataset.caption);
      count.textContent = list.length > 1 ? `${at + 1} / ${list.length}` : '';
      credit.textContent = card.dataset.credit || '';
    };
    fans.forEach(f => {
      const cards = [...f.querySelectorAll('.jy-card')];
      cards.forEach((c, k) => c.addEventListener('click', () => {
        stopTour(); list = cards; opener = c;
        viewer.classList.toggle('is-single', cards.length < 2);
        show(k); viewer.showModal();
      }));
    });
    document.getElementById('jy-viewer-close').addEventListener('click', () => viewer.close());
    document.getElementById('jy-viewer-prev').addEventListener('click', () => show(at - 1));
    document.getElementById('jy-viewer-next').addEventListener('click', () => show(at + 1));
    viewer.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && list.length > 1) { e.preventDefault(); show(at + 1); }
      if (e.key === 'ArrowLeft' && list.length > 1) { e.preventDefault(); show(at - 1); }
    });
    viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => { if (opener) opener.focus(); });
  }

  // Play the timeline once when the skills first come into view.
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (!entries.some(e => e.isIntersecting)) return;
      io.disconnect();
      if (touched) return;
      const step = i => { if (touched) return; select(i); if (i < last) timer = setTimeout(() => step(i + 1), 650); };
      timer = setTimeout(() => step(1), 500);
    }, { threshold: 0.35 });
    io.observe(inner.querySelector('.jy-lanes'));
  }
  render();
})();
