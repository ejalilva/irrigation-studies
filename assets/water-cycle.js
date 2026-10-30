/* Water-cycle explorer: project data and interaction controller. */
(() => {
const topics = {"snow": {"n": "01", "title": "Snow & frozen ground", "short": "Seasonal snow storage and the changing soils of cold regions.", "intro": "Snowpack and frozen ground are distinct parts of cold-region hydrology. My work includes satellite snow-depth retrieval and earlier investigations of northern-latitude soil moisture and permafrost landscapes.", "projects": [{"title": "AMSR2 snow depth retrieval", "status": "Minor revision", "text": "Coauthor of “Improving Near-Real-Time Global Snow Depth Retrieval from AMSR2 Data Using Machine Learning and Explainable AI,” led by Kehan Yang. The study combines passive microwave observations with reference snow information and examines the influence of different microwave channels. The manuscript is under minor revision at Remote Sensing of Environment."}, {"title": "Learning snow water equivalent", "status": "Ongoing research", "text": "Comparing deep learning approaches for estimating snow water equivalent from optical observations, terrain, canopy, and climate information."}, {"title": "Cold-region remote sensing", "status": "Earlier research", "text": "Earlier work at Michigan State University included high-resolution SMAP soil moisture for northern latitudes and radar observations of permafrost landscapes."}]}, "mapping": {"n": "01", "title": "Where is irrigation?", "short": "Mapping the human footprint in the water cycle with geospatial foundation models.", "intro": "Knowing where irrigation occurs is the first step toward representing agricultural water use. My NASA Earth Modeling Nexus work examines what foundation models learn about irrigated landscapes and how that knowledge supports mapping.", "projects": [{"title": "Detecting irrigated land", "status": "Published · 2021", "text": "Earlier work evaluated irrigation signals in SMAP–Sentinel-1 soil moisture and explored Sentinel-1/Sentinel-2 mapping.", "link": "https://doi.org/10.1109/JSTARS.2021.3119228", "linkText": "Read the study"}, {"title": "Irrigated fields from 10 m soil moisture", "status": "Published · 2021", "text": "Mapped irrigated fields from surface soil moisture estimated at 10 m with Sentinel-1 and Sentinel-2.", "link": "https://doi.org/10.3390/su132011355", "linkText": "Read the study"}, {"title": "Six geospatial foundation models", "status": "Active research", "text": "Comparing Prithvi-EO-2.0, TerraMind, Clay, AlphaEarth, Tessera, and OlmoEarth through embedding analysis and downstream fine-tuning. The embedding manuscript has an initial draft; fine-tuning comparisons remain in progress."}, {"title": "A common reference dataset", "status": "Dataset developed · evaluation ongoing", "text": "Coordinated reference information across 52 state-level sources or contacts and helped develop approximately 26,000 labeled image chips. Supervised a summer intern on label generation and model input preparation."}, {"title": "From representations to maps", "status": "Planned · 2027", "planned": true, "text": "Extend the model comparison to multi-year irrigated area mapping across the conterminous United States. Broader map generation is a next step, not a completed product."}]}, "timing": {"n": "02", "title": "When does irrigation happen?", "short": "Following the season with thermal observations, data-driven methods, and AgroTrack.", "intro": "An irrigated-area map does not tell us when farmers apply water. My work uses the changing thermal and moisture signals of agricultural landscapes to characterize irrigation timing.", "projects": [{"title": "Irrigation timing from thermal observations", "status": "Published · 2026", "text": "First-author research in Remote Sensing of Environment presents a data-driven approach to irrigation timing using thermal satellite observations.", "link": "https://doi.org/10.1016/j.rse.2025.115153", "linkText": "Read the paper"}, {"title": "AgroTrack", "status": "MODIS version released", "text": "An open-source Python package for satellite-based irrigation timing. MODIS-based timing is publicly released. Initial NISAR code has been added to the repository but is not yet part of a formal package release."}, {"title": "More ways to observe the season", "status": "Planned · Q1 2027", "planned": true, "text": "An expanded AgroTrack release is targeted for Q1 2027, including formal NISAR support and planned ECOSTRESS and VIIRS capabilities."}]}, "soil": {"n": "07", "title": "Soil moisture", "short": "Water held in the soil, from the surface to the root zone.", "intro": "My research connects observations of surface soil moisture with physical models of water stored deeper in the soil. Retrieval and assimilation are two complementary ways to understand this water store.", "projects": [{"title": "Thermal-inertia soil moisture", "status": "Conference contribution · 2015", "text": "Early work estimated surface soil moisture using MODIS land-surface temperature and albedo."}, {"title": "Sentinel-based soil moisture", "status": "Published · 2021", "text": "Research on surface soil moisture estimation using Sentinel-1 and Sentinel-2, alongside evaluation of SMAP–Sentinel-1 irrigation signals.", "link": "https://doi.org/10.3390/su132011355", "linkText": "Read the study"}, {"title": "Soil properties constrained by SMAP", "status": "Published · 2024", "text": "Collaborative work used SMAP soil moisture to optimize soil properties for agricultural water-resource modeling.", "link": "https://doi.org/10.1016/j.agwat.2024.108918", "linkText": "Read the study"}, {"title": "NISAR Kansas pilot", "status": "Active research", "text": "A NASA Headquarters-funded pilot aims to assimilate approximately 200 m NISAR soil moisture into LIS. Model setup and input preparation have progressed; assimilation development and evaluation are ongoing. A manuscript is in preparation."}, {"title": "Weather Satellite Follow-On", "status": "Delivered · April 2026", "text": "Developed machine learning soil moisture retrieval and the first Weather Satellite Follow-On (WSF) assimilation capability in NASA LIS. Both were delivered with LIS 7.8."}, {"title": "AMSR3 retrieval & assimilation", "status": "In development", "text": "Developing machine learning AMSR3 soil moisture retrieval and assimilation for LIS 7.9. A scientific paper is planned for 2027."}, {"title": "Continuity beyond SMAP", "status": "Published · 2026", "text": "My first-author Water Resources Research commentary examines GNSS-R and the continuity of global soil moisture observations. Complementary observing systems should not automatically be treated as interchangeable with SMAP.", "link": "https://doi.org/10.1029/2026WR044944", "linkText": "Read the commentary"}, {"title": "Low-latency SMAP retrievals", "status": "Published · 2026", "text": "Coauthored research on low-latency, enhanced 9 km SMAP soil moisture retrievals for near-real-time applications.", "link": "https://doi.org/10.3389/feart.2026.1854083", "linkText": "Read the paper"}]}, "flood": {"n": "04", "title": "Runoff, rivers & floods", "short": "How water moves across the land, and how wet soils shape floods.", "intro": "Flooding reflects both incoming rainfall and the condition of the land before a storm. My work connects satellite-constrained soil moisture, hydrological modeling, and landscape change.", "projects": [{"title": "Urban runoff and pavement permeability", "status": "Published · 2020", "text": "Experimental work examined how permeable pavements affect overland-flow travel time and runoff in a small semi-arid urban watershed.", "link": "https://doi.org/10.1007/s11269-020-02596-3", "linkText": "Read the study"}, {"title": "SMAP–Sentinel-1 assimilation", "status": "In development", "text": "Developing LIS assimilation support for the SMAP–Sentinel-1 soil moisture product, targeting approximately 1 km, sub-daily surface and root-zone estimates for selected U.S. HUC8 watersheds."}, {"title": "Satellite soil moisture in flood hydrology", "status": "Revision for resubmission", "text": "Coauthor of “Advancing Flood Analyses and Modeling with Remotely Sensed Soil Moisture.” The manuscript examines antecedent wetness, runoff generation, forecasting applications, and limitations of satellite observations."}, {"title": "Hurricane-driven land-cover change", "status": "Manuscript in preparation", "text": "Collaboration with Florida State University uses satellite imagery and deep learning to study land-cover changes following Hurricane Michael. An IGARSS 2026 contribution is being developed into a journal manuscript."}, {"title": "Future observing and forecasting systems", "status": "White paper submitted · proposal in preparation", "planned": true, "text": "Contributed to an Earth Science Decadal Survey white paper on flexible multi-source flood observations. Separate riverine flood forecasting proposal work combines NISAR, LIS, distributed rainfall, and machine learning; proposed fine-scale products remain research targets."}]}, "rain": {"n": "03", "title": "Precipitation", "short": "Reading rainfall from the changes it leaves in soil moisture.", "intro": "Rain connects atmospheric water with the land surface. My early research explored the inverse problem: what can the wetting and drying of soil tell us about the rainfall that occurred?", "projects": [{"title": "Rainfall from soil moisture", "status": "Research contribution · 2017", "text": "Applied the SM2RAIN approach to rainfall estimation in the Shabstar region using satellite soil moisture.", "link": "https://www.researchgate.net/publication/373755972_Rainfall_estimation_using_soil_moisture_satellite_data_and_SM2RAIN_model_Study_case_Shabstar_region", "linkText": "Read the study"}, {"title": "Drydowns, drainage and rainfall", "status": "Published · 2018", "text": "The DfD study estimated soil drainage from drydowns and examined its use with SM2RAIN to reconstruct rainfall.", "link": "https://doi.org/10.1016/j.jhydrol.2018.08.035", "linkText": "Read the study"}, {"title": "A changing climate", "status": "Published · 2022", "text": "Coauthored a study identifying climate-change hotspots in Iran using high-resolution climate models. This provides broader context for changes in water inputs.", "link": "https://doi.org/10.3390/cli10110161", "linkText": "Read the study"}]}, "drainage": {"n": "08", "title": "Soil drainage", "short": "Following water downward as the soil dries.", "intro": "Soil drainage is water leaving a soil layer. It links changes in soil moisture to deeper movement through the profile, but does not by itself establish how much water reaches groundwater.", "projects": [{"title": "Drainage from soil-moisture drydowns", "status": "Published · 2018", "text": "Developed the DfD approach to estimate drainage from the shape of soil-moisture recession. Earlier conference work in 2017 and 2018 explored drainage estimation from satellite observations.", "link": "https://doi.org/10.1016/j.jhydrol.2018.08.035", "linkText": "Read the study"}, {"title": "Groundwater budget of an over-exploited aquifer", "status": "Published · 2021", "text": "Coauthored a water budget for an over-exploited aquifer in arid Iran, calculating its inflow and outflow components.", "link": "https://doi.org/10.22059/ijswr.2021.321263.668924", "linkText": "Read the study"}, {"title": "Hydraulic properties and water movement", "status": "Published · 2024", "text": "SMAP-constrained soil-property estimation provides a related way to improve the representation of water movement in hydrological models.", "link": "https://doi.org/10.1016/j.agwat.2024.108918", "linkText": "Read the study"}]}, "lake": {"n": "05", "title": "Lakes & evaporation", "short": "Water stored in a lake, and the water it returns to the atmosphere.", "intro": "My early Lake Urmia work explored open-water evaporation and changing surface conditions in a saline lake. Evaporation is the direct water-cycle link; albedo connects the lake surface to its energy balance.", "projects": [{"title": "Lake Urmia evaporation", "status": "Conference contribution · 2015", "text": "Estimated monthly evaporation for Lake Urmia using satellite and gauge information, including the effect of salinity.", "link": "https://www.researchgate.net/publication/304498967_Estimating_the_rate_of_evaporation_from_Lake_Urmia_in_year_1995_with_highest_water_level_records_using_satellite_and_gauge_data_In_Persian", "linkText": "Read the study"}, {"title": "Lake-surface albedo", "status": "Conference contribution · 2017", "text": "Investigated changes in the albedo of Lake Urmia and its surroundings. This is a related surface-energy contribution rather than a current lake-modeling project."}]}, "vegetation": {"n": "06", "title": "Vegetation & water", "short": "Water in plants, with evaporation and transpiration linking land and air.", "intro": "Vegetation stores water and helps regulate its return to the atmosphere. My research directly estimates vegetation properties and uses thermal responses to investigate irrigation. These are related to evapotranspiration, but are not interchangeable with direct ET measurements.", "projects": [{"title": "Vegetation water content", "status": "Published · 2025", "text": "Coauthored work on vegetation water content and crop-height estimation from SAR and optical observations using self-supervised learning and geospatial foundation models.", "link": "https://doi.org/10.1016/j.rse.2025.114825", "linkText": "Read the study"}, {"title": "Thermal responses to irrigation", "status": "Published · 2026", "text": "AgroTrack uses irrigation-related differences in land-surface temperature to characterize timing. Its primary target is irrigation timing, not direct estimation of evapotranspiration.", "link": "https://doi.org/10.1016/j.rse.2025.115153", "linkText": "Read the study"}]}, "human": {"n": "02", "href": "irrigation.html", "hrefCue": "open the irrigation page", "title": "Human-driven processes", "short": "Groundwater pumping and river withdrawals supply irrigation. Where, when and how much do farms irrigate?", "intro": "Irrigation is the largest human intervention in the water cycle. Farms draw water from rivers and aquifers, and my work asks where they irrigate, when, and how much water they use.", "projects": [{"title": "Irrigation from soil-moisture changes", "status": "Published · 2019", "text": "Started as rainfall estimation: SM2RAIN applied to AMSR2 satellite soil moisture revealed irrigation and estimated how much water farms applied.", "link": "https://doi.org/10.1016/j.rse.2019.111226", "linkText": "Read the study"}, {"title": "Irrigation signal at 1 km", "status": "Published · 2021", "text": "Tested whether SMAP soil moisture sees irrigation, comparing the 9 km product with 1 km SMAP–Sentinel-1.", "link": "https://doi.org/10.1109/JSTARS.2021.3119228", "linkText": "Read the study"}, {"title": "Irrigated fields from 10 m soil moisture", "status": "Published · 2021", "text": "Mapped irrigated fields from surface soil moisture estimated at 10 m with Sentinel-1 and Sentinel-2.", "link": "https://doi.org/10.3390/su132011355", "linkText": "Read the study"}, {"title": "Assimilation and irrigation water use", "status": "Published · 2023", "text": "Estimated irrigation water use by assimilating 1 km SMAP–Sentinel-1 soil moisture into a land surface model with a particle batch smoother.", "link": "https://doi.org/10.1029/2022WR033342", "linkText": "Read the study"}, {"title": "Irrigation timing from thermal observations", "status": "Published · 2026", "text": "AgroTrack reads when fields are irrigated, from the start and end of the season to single events, in thermal satellite observations.", "link": "https://doi.org/10.1016/j.rse.2025.115153", "linkText": "Read the study"}, {"ref": "mapping:Six geospatial foundation models"}, {"ref": "mapping:A common reference dataset"}, {"ref": "timing:AgroTrack"}, {"ref": "soil:NISAR Kansas pilot"}, {"ref": "mapping:From representations to maps"}, {"ref": "timing:More ways to observe the season"}, {"ref": "amount:NISAR-informed AgLIS"}], "otherLabel": "Ongoing and planned"}, "amount": {"n": "03", "title": "How much water?", "short": "Connecting soil-water changes with irrigation water use.", "intro": "Irrigation adds water to the soil. My work investigates whether those changes, combined with physical models, can reveal how much irrigation water was applied.", "projects": [{"title": "Irrigation from soil-moisture changes", "status": "Published · 2019", "text": "Adapted a soil-water balance approach to quantify irrigation using satellite soil moisture in a semi-arid region.", "link": "https://doi.org/10.1016/j.rse.2019.111226", "linkText": "Read the study"}, {"title": "Assimilation and irrigation water use", "status": "Published · 2023", "text": "Used a particle batch smoother with SMAP–Sentinel-1 observations and a land surface model to evaluate irrigation water-use estimation.", "link": "https://doi.org/10.1029/2022WR033342", "linkText": "Read the study"}, {"title": "NISAR-informed AgLIS", "status": "Selectable proposal · not started", "planned": true, "text": "Co-Investigator on “Next Generation Agricultural-Hydrological System Modeling Using NISAR Observations,” led by Rajat Bindlish. Proposed contributions connect irrigation detection and season timing to water use estimation in AgLIS. This proposal is separate from the funded Kansas pilot and follow-on."}]}, "crops": {"n": "04", "title": "Crop response", "short": "How crop timing and vegetation states connect to agricultural modeling.", "intro": "Water availability and crop development are closely linked. These supporting studies examine planting dates, yield, and vegetation properties rather than direct water fluxes.", "projects": [{"title": "Planting dates and yield modeling", "status": "Published · 2022", "text": "Studied the impact of Sentinel-1-derived rice planting dates on crop-yield modeling.", "link": "https://doi.org/10.1016/j.jag.2022.103047", "linkText": "Read the study"}, {"title": "Crop yield from radar", "status": "Published · 2024", "text": "Collaborative work used patch-based deep learning and machine learning for SAR-based yield estimation.", "link": "https://doi.org/10.1016/j.compag.2024.109340", "linkText": "Read the study"}, {"title": "Radar and deep learning in agriculture", "status": "Published review · 2024", "text": "Coauthored a review of synthetic aperture radar and deep learning for agricultural applications.", "link": "https://doi.org/10.1016/j.isprsjprs.2024.08.018", "linkText": "Read the study"}, {"title": "Crop water content and height", "status": "Published · 2025", "text": "Coauthored work estimating vegetation water content and crop height from SAR and optical observations with geospatial foundation models.", "link": "https://doi.org/10.1016/j.rse.2025.114825", "linkText": "Read the study"}, {"title": "Agricultural modeling follow-on", "status": "Early-stage research", "text": "A separate funded, multiyear effort extends NISAR assimilation toward agricultural states and crop yield estimation. My contribution connects soil moisture assimilation with agricultural modeling."}]}};

const dialog=document.querySelector('#research-dialog');
const content=document.querySelector('#dialog-content');
const isHuman=document.body.classList.contains('human-page');
// Reframe the same SVG on small screens so the landscape remains legible.
const landscape = document.querySelector('.water-cycle .landscape');
const fullView = landscape.getAttribute('viewBox');
const smallScreen = window.matchMedia('(max-width: 750px)');
function frameLandscape() {
 landscape.setAttribute('viewBox', smallScreen.matches
  ? (isHuman ? '280 160 810 520' : '128 45 1000 662') : fullView);
}
smallScreen.addEventListener('change', frameLandscape);
frameLandscape();
const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
// The description: one line about the highlighted part and an explore cue, as left-aligned plain text in the white space just
// outside the drawing, close to the part. By default it sits right under the part's label and starts at the label's left edge;
// data-desc-right (map units) is where the drawing begins to the right of a label, and the text wraps to more lines to stay clear
// of it. data-desc="above" puts it above the label, and data-desc="x y start|end" pins its top-left (start) or top-right (end)
// corner to a point in map units.
// On phones it sits under the map. Clicking it opens the part.
const callout=document.querySelector('#callout');
const explorerBox=document.querySelector('#explore');
// How a part's research is shown, from data-popup on #explore (?popup=summary|hover|click in the address overrides it, to compare):
// summary: hovering plays the part's animation first; after SUMMARY_DELAY the text under the part's label (no box, transparent)
//   gives the one-line description, a chip per paper (journal and year, in the journal's colour) and counts of other work;
//   a click on the part or the text opens the dialog. The tour shows the same text and chips for each part it plays.
// hover: a panel with the full research opens over the side of the map (see Hover pop-ups below).
// click: the plain one-line description at once, and a click opens the dialog.
const popupMode=new URLSearchParams(location.search).get('popup')||explorerBox.dataset.popup||'click';
const summaryMode=popupMode==='summary',SUMMARY_DELAY=900;
let summaryTimer=0;
const hintPapers=document.createElement('div');hintPapers.className='hint-papers';hintPapers.id='hint-papers';
callout.insertBefore(hintPapers,document.querySelector('#hint-link'));
// A part with href opens another page (the farm opens irrigation.html); hrefCue says which.
function exploreCue(t,touch){return (touch?'Tap again to ':'Click to ')+(t.href&&t.hrefCue?t.hrefCue:'explore')+' →';}
function setHint(title,copy,link){document.querySelector('#hint-title').textContent=title;document.querySelector('#hint-copy').textContent=copy;document.querySelector('#hint-link').textContent=link;callout.classList.toggle('show',!!title);}
function mapPoint(x,y){const pt=landscape.createSVGPoint();pt.x=x;pt.y=y;return pt.matrixTransform(landscape.getScreenCTM());}
function placeCallout(key){
 callout.style.left=callout.style.top=callout.style.maxWidth='';callout.dataset.align='';
 if(smallScreen.matches||!key)return;
 const item=document.querySelector('.scene-item[data-topic="'+key+'"]');if(!item)return;
 const label=document.querySelector('.scene-item[data-topic="'+key+'"] .maplabel');
 const er=explorerBox.getBoundingClientRect(),spec=(item.dataset.desc||'').split(' ');
 const W=explorerBox.clientWidth,H=explorerBox.clientHeight,pad=8,gap=3;
 let x,y,end;
 if(spec.length===3){end=spec[2]==='end';callout.dataset.align=end?'end':'start';const q=mapPoint(+spec[0],+spec[1]);x=q.x-er.left-(end?callout.offsetWidth:0);y=q.y-er.top;}
 else{const r=(label||item).getBoundingClientRect();
  if(item.dataset.descRight){const limit=mapPoint(+item.dataset.descRight,0).x,rich=callout.classList.contains('rich');callout.style.maxWidth=Math.max(rich?160:120,Math.min(rich?220:190,limit-r.left-4))+'px';}
  const h=callout.offsetHeight;x=r.left-er.left;y=spec[0]==='above'?r.top-er.top-gap-h:r.bottom-er.top+gap;
  // With the paper chips the text is taller, so it tries spots under the label first (as designed), then above it, then beside
  // it, and takes the first that stays inside the map (it may hang up to 64px into the margin under the map) and covers no
  // other map label. A part whose drawing sits right under its label (Lakes) has data-desc="above", so its text goes above.
  if(callout.classList.contains('rich')){const below=64,w=callout.offsetWidth,g=10,L=r.left-er.left,T=r.top-er.top,R=r.right-er.left,B=r.bottom-er.top,M=(L+R-w)/2;
   const under=[[L,B+gap],[R-w,B+gap],[M,B+gap]],over=[[L,T-gap-h],[R-w,T-gap-h],[M,T-gap-h]];
   const cands=(spec[0]==='above'?[...over,...under]:[...under,...over]).concat([[L-g-w,T],[L-g-w,B-h],[R+g,T],[R+g,B-h]]);
   const box=q=>[q.left-er.left,q.top-er.top,q.right-er.left,q.bottom-er.top];
   const obs=[...landscape.querySelectorAll('.maplabel,.number,.process-label,.irrigation-label')].map(e=>e.getBoundingClientRect()).filter(q=>q.width).map(box);
   const ov=(a,b)=>Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
   let best=null;cands.forEach(([cx,cy],i)=>{const c=[cx,cy,cx+w,cy+h],out=Math.max(0,pad-cx)+Math.max(0,pad-cy)+Math.max(0,cx+w-W+pad)+Math.max(0,cy+h-H-below);
    const score=out*1000+obs.reduce((t,o)=>t+ov(c,o),0)*20+i*40;if(!best||score<best[0])best=[score,cx,cy];});
   x=best[1];y=best[2];}}
 x=Math.max(pad,Math.min(W-callout.offsetWidth-pad,x));y=Math.max(pad,Math.min(H-callout.offsetHeight+(callout.classList.contains('rich')?64:-pad),y));
 callout.style.left=x+'px';callout.style.top=y+'px';
}
let hideTimer=0;
function cancelHide(){clearTimeout(hideTimer);hideTimer=0;}
function scheduleHide(){cancelHide();hideTimer=setTimeout(()=>{hideTimer=0;if(tour)return;if(peekPinned){if(peekKey&&activeTopic!==peekKey)highlight(peekKey);return;}hidePeek();clearHighlight();},180);}
callout.addEventListener('pointerenter',cancelHide);
callout.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')scheduleHide();});
// Pressing the description blurs the focused part first; remember the press so the blur does not clear it.
let calloutPress=false;
callout.addEventListener('pointerdown',()=>{calloutPress=true;});
callout.addEventListener('click',()=>{calloutPress=false;if(activeTopic)openTopic(activeTopic);});
window.addEventListener('resize',()=>{if(activeTopic)placeCallout(activeTopic);});
smallScreen.addEventListener('change',()=>placeCallout(activeTopic));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let activeTopic=null,touchArmed=null,returnFocus=null,motionEnabled=!reduced.matches;
function updateMotion(){document.body.classList.toggle('motion-off',!motionEnabled);}
reduced.addEventListener('change',()=>{motionEnabled=!reduced.matches;updateMotion();});updateMotion();
// The summary card's papers and counts. Papers are projects listed in assets/journals.js; the rest is counted as ongoing,
// planned or earlier work from its status.
function partProjects(t){const resolve=item=>{if(!item.ref)return item;const [k,title]=item.ref.split(':');return ((topics[k]||{}).projects||[]).find(x=>x.title===title)||null;};
 return (t.groups?t.groups.flatMap(g=>g.projects||(topics[g.from]||{}).projects||[]):t.projects||[]).map(resolve).filter(Boolean);}
function fillSummary(t){hintPapers.replaceChildren();const P=window.Papers;if(!P)return;
 const papers=[],seen=new Set(),n={ongoing:0,planned:0,earlier:0};
 partProjects(t).forEach(item=>{const paper=item.link?P.paperFor(item.link):null;
  if(paper){const id=paper.doi||paper.href;if(!seen.has(id)){seen.add(id);papers.push(paper);}return;}
  const st=String(item.status||'');n[/planned|not started/i.test(st)?'planned':/earlier|contribution/i.test(st)?'earlier':'ongoing']++;});
 papers.sort((a,b)=>a.year-b.year);
 if(papers.length){const row=document.createElement('p');row.className='hp-chips';
  papers.forEach(p=>{const j=P.JOURNALS[p.journal]||{acr:'Paper',color:'#3f4c63'};const c=document.createElement('span');c.className='hp-chip';c.style.setProperty('--jc',j.color);c.textContent=j.acr+' '+p.year;c.title=p.title;row.append(c);});
  hintPapers.append(row);}
 const parts=[papers.length?papers.length+(papers.length>1?' papers':' paper'):'',n.ongoing?n.ongoing+' ongoing':'',n.planned?n.planned+' planned':'',n.earlier?n.earlier+' earlier':''].filter(Boolean);
 if(parts.length){const line=document.createElement('p');line.className='hp-count';line.textContent=parts.join(' · ');hintPapers.append(line);}
}
function highlight(key){const t=topics[key];if(!t)return;activeTopic=key;cancelHide();
 // The tour shows the same summary as a hover (paper chips and counts), without the explore cue.
 const rich=summaryMode;callout.classList.toggle('rich',rich);if(rich)fillSummary(t);else hintPapers.replaceChildren();
 if(!summaryTimer)callout.classList.remove('wait');
 setHint(t.title,t.short,tour?'':exploreCue(t,false));
 document.querySelectorAll('.scene-item').forEach(el=>el.classList.toggle('active',el.dataset.topic===key));
 setLinked(key);placeCallout(key);
}
// Elements whose data-link names the highlighted part run with it, wherever they sit on the map.
function linkedTo(el,key){const parts=el.dataset.link.split(' ');return !!key&&(tour?parts[0]===key:parts.includes(key));}
function setLinked(key){document.querySelectorAll('[data-link]').forEach(el=>el.classList.toggle('link-run',linkedTo(el,key)));}
function clearHighlight(){activeTopic=null;cancelHide();clearTimeout(summaryTimer);summaryTimer=0;callout.classList.remove('wait');hintPapers.replaceChildren();setHint('','','');document.querySelectorAll('.scene-item').forEach(el=>el.classList.remove('active'));setLinked(null);}
// The research shown for a part: eyebrow, title, intro, paper cards and other work. Used by the dialog and by the hover panel.
function fillTopic(key,content,titleId){const t=topics[key];
 const p=document.createElement('p');p.className='eyebrow';p.textContent=(isHuman?'Agricultural water use':'Water-cycle research')+' · '+t.n;
 const h=document.createElement('h2');if(titleId)h.id=titleId;h.textContent=t.title;
 const intro=document.createElement('p');intro.className='dialog-intro';intro.textContent=t.intro;content.append(p,h,intro);
 // Published papers (a project whose link is a paper listed in assets/journals.js) show as paper cards; other work follows as plain entries.
 // A part with groups (Human-driven processes) shows several sections, each taking its projects from another part or its own list.
 const P=window.Papers;
 const group=(label,cls)=>{const g=document.createElement('h3');g.className='dialog-group'+(cls?' '+cls:'');g.textContent=label;content.append(g);};
 // An item {"ref": "<part>:<title>"} reuses that project from another part, so ongoing work is written once.
 const resolve=item=>{if(!item.ref)return item;const [k,title]=item.ref.split(':');return ((topics[k]||{}).projects||[]).find(x=>x.title===title)||null;};
 const addProjects=(projects,labels)=>{
  const papers=[],other=[];
  projects.map(resolve).filter(Boolean).forEach(item=>{const paper=P&&item.link?P.paperFor(item.link):null;(paper?papers:other).push([item,paper]);});
  if(papers.length){if(labels)group(papers.length>1?'Papers':'Paper');const list=document.createElement('div');list.className='paper-list';list.innerHTML=papers.map(([item,paper])=>P.paperCard(paper,item.text)).join('');content.append(list);}
  if(labels&&papers.length&&other.length)group(t.otherLabel||'Other work');
  other.forEach(([item])=>{const article=document.createElement('article');article.className='project';const status=document.createElement('span');status.className='status'+(item.planned?' planned':'');status.textContent=item.status;const title=document.createElement('h3');title.textContent=item.title;const text=document.createElement('p');text.textContent=item.text;article.append(status,title,text);if(item.link){const a=document.createElement('a');a.href=item.link;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.linkText+' ↗';article.append(a);}content.append(article);});
 };
 if(t.groups)t.groups.forEach(g=>{const src=topics[g.from]||{};group(g.title||src.title,g.q?'q-'+g.q:'');addProjects(g.projects||src.projects||[],false);});
 else addProjects(t.projects,true);
 if(!isHuman&&['vegetation','soil','drainage','human'].includes(key)){const a=document.createElement('a');a.className='dialog-related';a.href='human.html';a.textContent='Explore the agricultural water cycle ↗';content.append(a);}
 const note=document.createElement('p');note.className='dialog-note';note.textContent='Research status as of October 2026. Landscape animations are illustrative, not quantitative simulations.';content.append(note);
}
function openTopic(key){const t=topics[key];if(!t)return;if(t.href){location.href=t.href;return;}
 hidePeek();returnFocus=document.activeElement;content.replaceChildren();fillTopic(key,content,'dialog-title');
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.body.classList.add('dialog-open');document.body.style.overflow='hidden';
 history.replaceState(null,'','#research/'+key);
}
function closeTopic(){dialog.close();}
// A mouse arriving on a part: its animation starts at once; in summary mode the card follows after SUMMARY_DELAY.
function hoverOn(key){const was=activeTopic;
 if(summaryMode&&was!==key){clearTimeout(summaryTimer);callout.classList.add('wait');summaryTimer=setTimeout(()=>{summaryTimer=0;callout.classList.remove('wait');if(activeTopic)placeCallout(activeTopic);},SUMMARY_DELAY);}
 highlight(key);queuePeek(key);}
// Hover pop-ups. With data-popup="hover" on the explorer (?popup=click or ?popup=hover in the address overrides it, to compare),
// a mouse resting on a part shows its research in a panel over the map, in place of the one-line description. The panel sits on
// the side of the map that covers the part least, so the part and its animation stay in view, and it fills the visible height of
// the map, scrolling inside. Moving into the panel keeps it open, a click on the part pins it, and Escape, the close button or a
// click elsewhere closes it; the expand button opens the usual dialog. Touch screens, small screens and the keyboard keep the
// click-to-open dialog.
const hoverPopups=popupMode==='hover';
const peek=document.createElement('aside');peek.id='peek';peek.className='peek';peek.setAttribute('aria-label','Research details');
peek.innerHTML='<div class="peek-tools"><button type="button" class="peek-expand" aria-label="Open in a larger window" title="Open in a larger window">⤢</button><button type="button" class="peek-close" aria-label="Close" title="Close">×</button></div><div class="peek-body"></div>';
const peekBody=peek.querySelector('.peek-body');
if(hoverPopups)explorerBox.append(peek);
let peekKey=null,peekPinned=false,peekTimer=0;
function peekAllowed(){return hoverPopups&&finePointer.matches&&!smallScreen.matches;}
function placePeek(key){
 const item=document.querySelector('.scene-item[data-topic="'+key+'"]');if(!item)return;
 const er=explorerBox.getBoundingClientRect(),ir=item.getBoundingClientRect(),pad=12;
 const W=Math.round(Math.min(400,Math.max(300,er.width*.3)));peek.style.width=W+'px';
 const top=Math.max(er.top+pad,pad),bottom=Math.min(er.bottom-pad,innerHeight-pad);
 peek.style.top=(top-er.top)+'px';peek.style.maxHeight=Math.max(280,bottom-top)+'px';
 const right=er.width-W-pad,left=pad,cover=x=>Math.max(0,Math.min(er.left+x+W,ir.right)-Math.max(er.left+x,ir.left));
 peek.style.left=(cover(right)<=cover(left)?right:left)+'px';
}
function showPeek(key,pin){const t=topics[key];if(!t||t.href||dialog.open)return;clearTimeout(peekTimer);peekTimer=0;
 if(peekKey!==key){peekBody.replaceChildren();fillTopic(key,peekBody,null);peek.scrollTop=0;peekKey=key;}
 if(pin)peekPinned=true;
 explorerBox.classList.add('peeking');placePeek(key);peek.classList.add('show');
}
function hidePeek(){clearTimeout(peekTimer);peekTimer=0;peekPinned=false;peekKey=null;peek.classList.remove('show');explorerBox.classList.remove('peeking');}
// A short pause before the panel opens, so moving the mouse across the map does not flash panels.
function queuePeek(key){if(!peekAllowed()||peekPinned)return;explorerBox.classList.add('peeking');clearTimeout(peekTimer);peekTimer=setTimeout(()=>showPeek(key),peekKey?160:320);}
peek.addEventListener('pointerenter',()=>{cancelHide();clearTimeout(peekTimer);peekTimer=0;});
peek.addEventListener('pointerleave',e=>{if((e.pointerType==='mouse'||e.pointerType==='pen')&&!peekPinned)scheduleHide();});
peek.querySelector('.peek-close').addEventListener('click',()=>{hidePeek();clearHighlight();});
peek.querySelector('.peek-expand').addEventListener('click',()=>{const k=peekKey;hidePeek();if(k)openTopic(k);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&peekKey&&!dialog.open){hidePeek();clearHighlight();}});
document.addEventListener('click',e=>{if(!peekPinned||!(e.target instanceof Element))return;if(peek.contains(e.target)||e.target.closest('.scene-item'))return;hidePeek();clearHighlight();});
addEventListener('resize',()=>{if(peekKey)placePeek(peekKey);});
addEventListener('scroll',()=>{if(peekKey)placePeek(peekKey);},{passive:true});
document.querySelectorAll('[data-topic]').forEach(el=>{
 el.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;if(tour){if(!deliberateHover())return;takeOver();}cancelHide();hoverOn(el.dataset.topic);});
 el.addEventListener('pointermove',e=>{if(tour&&(e.pointerType==='mouse'||e.pointerType==='pen')&&deliberateHover()){takeOver();hoverOn(el.dataset.topic);}});
 el.addEventListener('pointerleave',e=>{if(!tour&&(e.pointerType==='mouse'||e.pointerType==='pen'))scheduleHide();});
 el.addEventListener('focus',()=>{takeOver();highlight(el.dataset.topic);});el.addEventListener('blur',()=>{if(!dialog.open&&!calloutPress&&!peekKey)clearHighlight();});
 let pointerType='';el.addEventListener('pointerdown',e=>{pointerType=e.pointerType;});
 el.addEventListener('click',e=>{takeOver();const key=el.dataset.topic;if((e.pointerType==='touch'||pointerType==='touch')&&el.classList.contains('scene-item')&&touchArmed!==key){e.preventDefault();touchArmed=key;highlight(key);document.querySelector('#hint-link').textContent=exploreCue(topics[key],true);placeCallout(key);return;}if(el.tagName.toLowerCase()==='a')return;
  // Hover pop-ups: a mouse click pins the panel instead of opening the dialog.
  if(peekAllowed()&&el.classList.contains('scene-item')&&(e.pointerType==='mouse'||e.pointerType==='pen'||pointerType==='mouse'||pointerType==='pen')){highlight(key);showPeek(key,true);pointerType='';return;}
  openTopic(key);pointerType='';});
 if(el.tagName.toLowerCase()==='g')el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTopic(el.dataset.topic);}});
});
// Intro tour. When the page opens and the map is in view, each part plays briefly in turn (in badge order) and the map then waits.
// It plays once per visit (per browser tab session): coming back from another page of the site does not replay it, a new visit does.
// Until it has had its chance, body has class tour-pending, so the farm's "Start here" cues (assets/farm-cue.js) wait for it.
// A click, tap, key press or deliberate hover stops it at once. The Play tour button replays it; with reduced motion it only highlights.
const tourButton=document.querySelector('#tour-toggle');
const hintPanel=document.querySelector('.hint-panel');
const explorer=document.querySelector('#explore');
// Tour steps follow the badge numbers. A part with data-tour-with="key" plays inside that part's step instead of its own
// (the river rises during the Rain step), so each story is shown once.
const tourKeys=[...new Set([...document.querySelectorAll('.landscape .scene-item[data-topic]')].map(e=>e.dataset.topic))].filter(k=>topics[k]).sort((a,b)=>topics[a].n.localeCompare(topics[b].n));
const tourWith=k=>document.querySelector('.scene-item[data-topic="'+k+'"]')?.dataset.tourWith;
const tourSteps=tourKeys.filter(k=>!tourWith(k)).map(k=>[k,...tourKeys.filter(o=>tourWith(o)===k)]);
const tourSeenKey='water-cycle-tour-v3-'+(isHuman?'human':'main');
const minStep=Math.max(1600,4800/tourSteps.length),maxStep=3200,maxRate=3;
// autoDone: the automatic tour has had its chance on this page view. Seen: it finished or the visitor stopped it, so the rest of the visit skips it.
let tour=null,inView=false,autoPending=0,tourMoved=0,lastPointer=null,autoDone=(()=>{try{return sessionStorage.getItem(tourSeenKey)==='1';}catch(e){return false;}})();
let cuesHidden=null,cuesInTimer=0;
function syncTourPending(){
 const pending=!autoDone&&!tour&&motionEnabled&&!reduced.matches,hidden=pending||!!tour;
 document.body.classList.toggle('tour-pending',pending);
 // The cues were held back and now appear: let them arrive with a short entrance.
 if(cuesHidden&&!hidden){document.body.classList.add('cues-in');clearTimeout(cuesInTimer);cuesInTimer=setTimeout(()=>document.body.classList.remove('cues-in'),1400);}
 cuesHidden=hidden;
}
function markTourSeen(){autoDone=true;try{sessionStorage.setItem(tourSeenKey,'1');}catch(e){}syncTourPending();}
function cycleLength(a){const d=a.effect&&a.effect.getTiming().duration;return typeof d==='number'?d:0;}
function partAnimations(key){const els=[...document.querySelectorAll('.scene-item[data-topic="'+key+'"]'),...[...document.querySelectorAll('[data-link]')].filter(el=>linkedTo(el,key))];return [...new Set(els.flatMap(el=>el.getAnimations({subtree:true})))].filter(a=>'animationName' in a);}
function restoreSpeed(){if(!tour)return;tour.sped.forEach(a=>{a.playbackRate=1;});tour.sped=[];}
function playTourStep(i){
 restoreSpeed();
 if(i>=tourSteps.length){stopTour(false,true);return;}
 const step=tourSteps[i],key=step[0],anims=[...new Set(step.flatMap(partAnimations))];
 // A step lasts long enough for the part's slowest animation to finish most of a cycle at up to 3x speed; each animation restarts from its beginning.
 // A part can ask for a longer step (data-tour-step, in ms) when its story needs a full long cycle, such as the pivot's two turns.
 const fixed=+(document.querySelector('.scene-item[data-topic="'+key+'"]')?.dataset.tourStep||0);
 const ms=fixed||Math.min(maxStep,Math.max(minStep,Math.max(0,...anims.map(cycleLength))/maxRate));
 const rateCap=fixed?4:maxRate;
 anims.forEach(a=>{a.playbackRate=Math.min(rateCap,Math.max(1,cycleLength(a)/ms));a.currentTime=0;});
 tour.sped=anims;
 highlight(key);step.slice(1).forEach(k=>document.querySelectorAll('.scene-item[data-topic="'+k+'"]').forEach(el=>el.classList.add('active')));
 document.querySelector('#hint-link').textContent='';placeCallout(key);
 tour.timer=setTimeout(()=>playTourStep(i+1),ms);
}
function startTour(){
 if(tour||!tourSteps.length||dialog.open)return;
 clearTimeout(autoPending);autoPending=0;autoDone=true;touchArmed=null;tourMoved=0;lastPointer=null;
 tour={timer:0,sped:[]};
 document.body.classList.add('touring');
 hintPanel.setAttribute('aria-live','off');
 tourButton.textContent='Stop tour';tourButton.classList.add('on');
 syncTourPending();
 playTourStep(0);
}
// remember: the tour finished, or the visitor chose to stop it (not when it was cut short by scrolling away or switching tabs).
function stopTour(keepHighlight,remember){
 if(!tour)return;
 clearTimeout(tour.timer);restoreSpeed();tour=null;
 if(remember)markTourSeen();
 document.body.classList.remove('touring');
 hintPanel.setAttribute('aria-live','polite');
 tourButton.textContent='Play tour';tourButton.classList.remove('on');
 syncTourPending();
 if(!keepHighlight)clearHighlight();
}
// A resting or nudged mouse that happens to sit over the map should not cancel the tour; moving it across the map should.
window.addEventListener('pointermove',e=>{if(!tour||e.pointerType==='touch')return;if(lastPointer)tourMoved+=Math.hypot(e.clientX-lastPointer[0],e.clientY-lastPointer[1]);lastPointer=[e.clientX,e.clientY];},{capture:true,passive:true});
function deliberateHover(){return tourMoved>40;}
// The visitor is exploring the map themselves: end the tour and do not start it later.
function takeOver(){clearTimeout(autoPending);autoPending=0;if(tour)stopTour(true,true);else if(!autoDone)markTourSeen();}
function canAutoTour(){return !autoDone&&!tour&&inView&&motionEnabled&&!reduced.matches&&!dialog.open&&!document.hidden;}
function scheduleAutoTour(){clearTimeout(autoPending);autoPending=0;if(canAutoTour())autoPending=setTimeout(()=>{autoPending=0;if(canAutoTour())startTour();},500);}
function interruptTour(e){
 // Clicking the description during the tour opens what it shows.
 if(e.target instanceof Node&&callout.contains(e.target)){if(tour)stopTour(true,true);return;}
 if(e.target instanceof Node&&tourButton.contains(e.target)&&(e.type==='pointerdown'||e.key==='Enter'||e.key===' '))return;
 if(e.type==='keydown'&&['Shift','Control','Alt','Meta'].includes(e.key))return;
 if(tour)stopTour(false,true);else if(autoPending)takeOver();
}
['pointerdown','keydown'].forEach(type=>window.addEventListener(type,interruptTour,{capture:true,passive:true}));
tourButton.addEventListener('click',()=>{if(tour)stopTour(false,true);else startTour();});
if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{inView=entry.intersectionRatio>=.5;if(!inView&&tour)stopTour();scheduleAutoTour();},{threshold:[0,.5,1]}).observe(explorer);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&tour)stopTour();scheduleAutoTour();});
// Open the page with ?tour to replay the tour as a first-time visitor.
if(/[?&]tour\b/.test(location.search))autoDone=false;
syncTourPending();reduced.addEventListener('change',syncTourPending);
document.querySelector('#close-dialog').addEventListener('click',closeTopic);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeTopic();}});
dialog.addEventListener('close',()=>{scheduleAutoTour();document.body.style.overflow='';document.body.classList.remove('dialog-open');history.replaceState(null,'',location.pathname+location.search+'#explore');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
clearHighlight();const initial=location.hash.match(/^#research\/(\w+)$/);if(initial&&topics[initial[1]]&&!topics[initial[1]].href)openTopic(initial[1]);
// Links elsewhere on the page (such as the storyline's last step) open a part with href="#research/<key>".
addEventListener('hashchange',()=>{const m=location.hash.match(/^#research\/(\w+)$/);if(m&&topics[m[1]]&&!topics[m[1]].href&&!dialog.open)openTopic(m[1]);});

})();
