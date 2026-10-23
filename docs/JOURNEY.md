# Learning journey, version 2

Review-only revision of the journey page. Main navigation is not changed. Do not merge or publish without Ehsan’s approval; the previous journey page was taken offline at his request.

## Content

The ten stages follow Ehsan’s autobiographical account supplied October 22, 2026, including his corrections: VIC, Amirkabir University, NASA LIS and the AgroTrack Python package. Dates reflect the account: PhD 2013–2019; company 2015–2019; Italy 2016–2017; teaching at Sharif 2018; first postdoc 2020; teaching at Amirkabir 2020–2021; Research Institute for Earth Sciences faculty 2021; Michigan State 2022; NASA 2023–present.

Georgia Tech is discussed alongside the transition to Python, without claiming an enrollment or completion date. Recent foundation-model and agent work has no invented start year. The startup has a symbolic workshop because no company name or identifiable building was provided. Early postdoctoral and teaching stages reuse the Iran landmark as a regional anchor, not a claim that all those appointments were at Sharif.

Edit the chapter list in `scripts/build_journey.py`, then run `python scripts/build_journey.py`. It generates `journey.html` and the structured content record `data/journey-timeline.json`. Styles and interaction are isolated in `assets/journey-v2.css` and `assets/journey-v2.js`.

## Artwork

`assets/journey/landscape-integrated-v2.webp` is a new built-in imagegen composite based on the original supplied landscape and four landmark illustrations. The original files remain intact. It is a symbolic map; the Colosseum represents Italy, and the rocket represents NASA, not a literal CNR IRPI or Goddard campus. The startup building is illustrative.

Generation prompt: compositing; preserve the base landscape’s winding paths, river and bridge, mountains, dry left terrain and green right hills. Incorporate the recognizable Sharif/Tehran architecture, Italy Colosseum, Michigan clocktower and Spartan reference, NASA building/rocket, plus a small startup workshop into the same terrain. Match perspective, shared soft daylight, contact shadows and vegetation at each base; no floating cutouts, isolated cards or platforms. Wide 16:9 arrangement, Sharif at left, startup foreground, Italy center, Michigan right-center and NASA upper right. Use a quieter sage, terracotta, slate-blue and cream palette with subtle brush texture. No text, dates, UI or numbered markers; labels and timeline are accessible HTML. Output uses the Michigan clocktower as its principal Michigan landmark.

The new image is encoded as WebP for the page. Separate transparent HTML buttons over its landmark regions provide hover, focus, selection and touch interaction, so the buildings remain visually grounded in the unified landscape.

## Interaction and accessibility

Selecting a landmark or timeline stage updates an inline chapter and a cumulative toolkit, highlighting newly introduced skills. The timeline includes overlapping career chapters and is an ordered sequence, not a proportional date axis. Previous/next controls stop at either end. URL fragments identify the selected stage. All chapter articles remain readable without JavaScript. Native buttons support keyboard activation; selection is exposed through aria-current and aria-pressed; the step counter is a live region. Reduced-motion preferences disable animated scrolling and hover transitions.

The map is not presented as literal geography. Teaching at Amirkabir and the faculty role are described in the timeline rather than inventing extra institutional landmarks.
