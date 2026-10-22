(() => {
  'use strict';
  const dialog = document.getElementById('journey-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const stories = Array.from(document.querySelectorAll('.journey-stories article'));
  const stops = ['sharif', 'italy', 'michigan', 'nasa'];
  const viewBoxes = ['0 320 1254 710', '0 330 1254 820', '130 30 1020 1180', '70 40 1120 1180'];
  const landmarks = Array.from(document.querySelectorAll('.landmark'));
  let active = 0;
  let opener = null;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.getElementById('journey-motion');
  function setMotion(enabled) {
    document.body.classList.toggle('motion-paused', !enabled);
    motion.setAttribute('aria-pressed', String(enabled));
    motion.textContent = enabled ? 'Motion on' : 'Motion off';
  }
  setMotion(!reduceMotion.matches);
  motion.addEventListener('click', () => setMotion(motion.getAttribute('aria-pressed') !== 'true'));
  reduceMotion.addEventListener('change', event => setMotion(!event.matches));
  function render(index) {
    active = index;
    const source = stories[index];
    document.getElementById('story-title').textContent = source.querySelector('h2').textContent;
    document.getElementById('story-place').textContent = source.querySelector('.story-place').textContent;
    document.getElementById('story-copy').textContent = source.querySelector('.story-copy').textContent;
    document.getElementById('story-chapter').textContent = `Chapter ${String(index + 1).padStart(2, '0')} of 04`;
    const art = document.getElementById('story-illustration');
    art.setAttribute('viewBox', viewBoxes[index]);
    art.querySelector('image').setAttribute('href', `assets/journey/${stops[index]}.webp`);
    document.getElementById('story-previous').disabled = index === 0;
    document.getElementById('story-next').textContent = index === 3 ? 'Back to the map ↗' : 'Next chapter →';
    dialog.scrollTop = 0;
  }
  function open(index, trigger) {
    opener = trigger;
    render(index);
    dialog.showModal();
    document.getElementById('story-close').focus();
  }
  landmarks.forEach((landmark, index) => {
    landmark.addEventListener('click', () => open(index, landmark));
    landmark.setAttribute('aria-haspopup', 'dialog');
    landmark.setAttribute('aria-controls', 'journey-dialog');
  });
  document.querySelectorAll('.journey-route a').forEach((link, index) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => { event.preventDefault(); open(index, link); });
    link.addEventListener('mouseenter', () => landmarks[index].classList.add('is-hovered'));
    link.addEventListener('mouseleave', () => landmarks[index].classList.remove('is-hovered'));
    link.addEventListener('focus', () => landmarks[index].classList.add('is-hovered'));
    link.addEventListener('blur', () => landmarks[index].classList.remove('is-hovered'));
  });
  document.getElementById('story-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
  document.getElementById('story-previous').addEventListener('click', () => { if (active > 0) render(active - 1); });
  document.getElementById('story-next').addEventListener('click', () => {
    if (active === 3) dialog.close(); else render(active + 1);
  });
  document.querySelector('.journey-stories').hidden = true;
})();
