(() => {
  'use strict';
  const chapters = [...document.querySelectorAll('.chapter')];
  const timeline = [...document.querySelectorAll('.time-stop')];
  const landmarks = [...document.querySelectorAll('.map-stop')];
  const toolkit = document.getElementById('accumulated-skills');
  let active = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function select(index, updateHash = true) {
    active = Math.max(0, Math.min(chapters.length - 1, index));
    chapters.forEach((chapter, i) => { chapter.hidden = i !== active; });
    timeline.forEach((button, i) => {
      if (i === active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    landmarks.forEach(button => {
      const on = button.dataset.landmark === chapters[active].dataset.landmark;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    });
    const newSkills = JSON.parse(chapters[active].dataset.skills);
    const allSkills = [...new Set(chapters.slice(0, active + 1).flatMap(c => JSON.parse(c.dataset.skills)))];
    toolkit.replaceChildren(...allSkills.map(skill => {
      const li = document.createElement('li'); li.textContent = skill;
      if (newSkills.includes(skill)) li.className = 'new-skill';
      return li;
    }));
    document.getElementById('previous').disabled = active === 0;
    document.getElementById('next').disabled = active === chapters.length - 1;
    document.getElementById('step-count').textContent = `${active + 1} / ${chapters.length}`;
    if (updateHash) history.replaceState(null, '', `#chapter-${active}`);
  }
  function scrollTimeline() {
    timeline[active].scrollIntoView({block:'nearest', inline:'nearest', behavior: reduce.matches ? 'instant' : 'smooth'});
  }
  timeline.forEach((button, i) => {
    button.addEventListener('click', () => select(i));
    const highlight = on => landmarks.forEach(l => l.classList.toggle('is-highlighted', on && l.dataset.landmark === chapters[i].dataset.landmark));
    button.addEventListener('mouseenter', () => highlight(true));
    button.addEventListener('mouseleave', () => highlight(false));
    button.addEventListener('focus', () => highlight(true));
    button.addEventListener('blur', () => highlight(false));
  });
  landmarks.forEach(button => button.addEventListener('click', () => {
    select(Number(button.dataset.stage));
    scrollTimeline();
    document.getElementById('timeline').scrollIntoView({block:'start', behavior: reduce.matches ? 'instant' : 'smooth'});
  }));
  document.getElementById('previous').addEventListener('click', () => {select(active - 1);scrollTimeline();});
  document.getElementById('next').addEventListener('click', () => {select(active + 1);scrollTimeline();});
  document.querySelector('.toolkit').hidden = false;
  document.querySelector('.step-controls').hidden = false;
  const readHash = () => {const m = location.hash.match(/^#chapter-(\d+)$/);select(m ? Number(m[1]) : 0, false);};
  window.addEventListener('hashchange', readHash);
  readHash();
})();
