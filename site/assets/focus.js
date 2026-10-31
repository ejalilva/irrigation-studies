/* Three views of one qualitative relationship map. No quantitative spider/radar scores. */
(() => {
  'use strict';
  const root = document.getElementById('connections');
  if (!root) return;
  const stage = root.querySelector('.cx-stage');
  const svg = root.querySelector('.cx-lines');
  const nodes = [...root.querySelectorAll('.cx-item')];
  const detail = root.querySelector('.cx-detail');
  const views = [...root.querySelectorAll('.cx-views button')];
  let selected = 'irrigation';
  const NS = 'http://www.w3.org/2000/svg';
  root.classList.add('cx-ready');
  function draw() {
    svg.replaceChildren();
    if (root.dataset.view === 'grid') return;
    const bounds = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const byId = Object.fromEntries(nodes.map(n => [n.dataset.process,n]));
    function center(key) {
      const r = byId[key].querySelector('.cx-icon').getBoundingClientRect();
      return [r.left-bounds.left+r.width/2,r.top-bounds.top+r.height/2];
    }
    const links = root.dataset.view === 'network'
      ? nodes.filter(n => n.dataset.process !== 'irrigation').map(n=>['irrigation', n.dataset.process])
      : [['groundwater','irrigation'],['reservoir','irrigation'],['surface','irrigation'],['diversion','irrigation'],['irrigation','return'],['irrigation','drainage'],['return','quality'],['land','irrigation'],['urban','groundwater'],['urban','surface']];
    links.forEach(([from,to])=>{
      const [x1,y1]=center(from),[x2,y2]=center(to);
      const path=document.createElementNS(NS,'path');
      const group = byId[to==='irrigation'?from:to].className.split(' ').find(c=>/^cx-(source|field|return|shared)$/.test(c));
      const indirect=[from,to].some(k=>['land','urban'].includes(k));
      path.setAttribute('class',`${group}${indirect?' is-indirect':''}${[from,to].includes(selected)?' is-selected':''}`);
      const route = from === 'return' && to === 'quality'
        ? `M${x1},${y1} C${Math.min(x1+90,bounds.width-5)},${y1} ${Math.min(x2+90,bounds.width-5)},${y2} ${x2},${y2}`
        : `M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`;
      path.setAttribute('d',root.dataset.view==='network'?`M${x1},${y1} L${x2},${y2}`:route);
      svg.appendChild(path);
    });
  }
  nodes.forEach(n=>n.querySelector('button').addEventListener('click',()=>{
    selected=n.dataset.process;
    nodes.forEach(o=>o.querySelector('button').setAttribute('aria-pressed',String(o===n)));
    const group=n.className.split(' ').find(c=>/^cx-(source|field|return|shared)$/.test(c));
    detail.className=`cx-detail ${group}`;
    detail.querySelector('use').setAttribute('href',n.querySelector('use').getAttribute('href'));
    detail.querySelector('strong').textContent=n.querySelector('.cx-label').textContent;
    detail.querySelector('p > span').textContent=n.querySelector('.cx-caption').textContent;
    draw();
  }));
  function setView(view) {
    root.dataset.view=view;
    views.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
    draw();
  }
  views.forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  const requested = new URLSearchParams(location.search).get('connections');
  setView(['network','pathway','grid'].includes(requested)?requested:'network');
  new ResizeObserver(draw).observe(stage);
  document.fonts?.ready.then(draw);
})();
