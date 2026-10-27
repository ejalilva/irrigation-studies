# My journey

`journey.html` is linked as **My journey** in the header of `index.html` and `human.html`. Ehsan chose this design on October 26, 2026 (option B of three): a white page, the painting edge to edge, as little text as possible, and the skills shown as coloured bars that grow along the timeline.

`journey-initial.html` keeps the first design (October 21, 2026) for comparison: four landmark cut-outs that each open a short story in a pop-up, restored from commit `9e9a3bf`. It can be deleted, with `assets/journey.css`, `assets/journey.js`, `assets/journey/landscape.jpg` and the four `.webp` cut-outs in `assets/journey/`, once it is no longer wanted.

History: the first design was added in pull request #13 and taken offline on October 22, 2026 (commit `3236b23`). A second version came in #16 without a header link; #43 restored the link; this design replaces the second version.

## How the page works

- **The painting** (`assets/journey/landscape-integrated-v2.webp`) fills the top of the page. The header and the title "My journey" sit on the sky, over a soft dark band so the white text reads; on phones the header moves above the painting.
- **Landmarks grow.** Each of the five landmarks has a cut-out layer in `assets/journey/marks/` that sits exactly over its painted self, so it is invisible until it is highlighted. The highlighted landmark scales up by 15% from its base and gets a soft shadow, while the rest of the painting is slightly desaturated and veiled. Its name appears in a small tag under it. There are no outlines or circles.
- **Map and timeline are linked.** Hovering or focusing a stop previews it: its landmark grows, its one-line story shows and the skill bars move to it. Clicking selects it. Hovering a landmark grows it and darkens the dots of its stops; clicking it selects its first stop, and clicking again moves to its next stop (Sharif has five). Arrow keys, Home and End move along the timeline.
- **Skill bars.** Each skill is a bar that starts under the stop where it was learned and reaches to the current stop, so the bars form a staircase that grows as you move along. Skills not yet reached are faint dashed outlines. A skill learned at the stop just reached gives one soft pulse. On phones the timeline shrinks to dots (only the current year is named) and the skills wrap as boxes.
- **First view.** The page opens at 2013. The first time the skills come into view, the timeline plays once through to now (about six seconds), unless the visitor has already hovered or clicked something. With reduced motion there is no play and the page opens at now.
- **Without JavaScript** every stop's line is listed and all bars are shown at now.

## Editing

Everything is in `scripts/build_journey.py`; run `python scripts/build_journey.py` after editing. It writes `journey.html` and `data/journey-timeline.json` (a record of the same content).

- `STOPS`: the timeline, in order: year, short name under the dot, place for the story line, landmark, skills first learned there, and the one line on what Ehsan did.
- `SKILLS`: each skill's label, colour and text colour. Tools use their own colours (MATLAB orange, Python blue with a yellow edge, Linux yellow, YouTube red, NASA blue, Git dark grey); the rest have colours chosen so every bar is different. The text colour is white or near-black, whichever reads at 4.5:1 on that colour. The Python bar's yellow edge is the `jy-python` rule in the CSS.
- `MARKS`: each landmark's name and the box of its cut-out over the painting, in % of the painting's width and height.
- Styles are in `assets/journey-page.css` and behaviour in `assets/journey-page.js`. Bump `V` in the script when either changes, so browsers fetch the new file.

**Cut-outs.** The five layers were cut from the painting itself with box-prompted segmentation (Segment Anything, through the `rembg` package), one box per building (the Azadi tower and Sharif's building, the workshop and its dish, the NASA building, dome and rocket separately), then joined per landmark, cleaned of specks and given a 1 px soft edge. If the painting changes, the cut-outs must be redone to match it.

**Logos.** The bars use each tool's colour but not its logo. Official logo files could be added inside the bars later.

## Artwork (the painting)

`assets/journey/landscape-integrated-v2.webp` is a new built-in imagegen composite based on the original supplied landscape and four landmark illustrations. The original files remain intact. It is a symbolic map; the Colosseum represents Italy, and the rocket represents NASA, not a literal CNR IRPI or Goddard campus. The startup building is illustrative.

Generation prompt: compositing; preserve the base landscape’s winding paths, river and bridge, mountains, dry left terrain and green right hills. Incorporate the recognizable Sharif/Tehran architecture, Italy Colosseum, Michigan clocktower and Spartan reference, NASA building/rocket, plus a small startup workshop into the same terrain. Match perspective, shared soft daylight, contact shadows and vegetation at each base; no floating cutouts, isolated cards or platforms. Wide 16:9 arrangement, Sharif at left, startup foreground, Italy center, Michigan right-center and NASA upper right. Use a quieter sage, terracotta, slate-blue and cream palette with subtle brush texture. No text, dates, UI or numbered markers; labels and timeline are accessible HTML. Output uses the Michigan clocktower as its principal Michigan landmark.

The image is encoded as WebP for the page. Transparent buttons over the landmark regions take hover, focus, clicks and taps.

## First design: content and editing

The four stories in `journey-initial.html` are adapted from Ehsan's NASA career spotlight (https://science.gsfc.nasa.gov/600/ECSS/Ehsan-Jalilvand/, accessed October 22, 2026). The landscape is `assets/journey/landscape.jpg`; the four landmark illustrations were cut out from their white backgrounds and saved with transparency as `assets/journey/sharif.webp`, `italy.webp`, `michigan.webp` and `nasa.webp`. The map is symbolic: the rocket stands for the NASA chapter, not the Goddard campus.

The story text lives in the four `<article>` elements near the end of `journey-initial.html`; `assets/journey.js` reads them into the pop-up, so there is one copy of each story and they stay readable without JavaScript. Landmark positions are percentage rules in `assets/journey.css`, and the crop of each cutout is its SVG `viewBox` in the HTML (source images are 1254 × 1254). Hover or focus lifts a landmark; clicking opens the pop-up with previous/next buttons; the Motion button and reduced-motion settings stop the movement.
