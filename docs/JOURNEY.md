# My journey

`journey.html` is linked as **My journey** in the header of `index.html` and `human.html`. Ehsan chose the design on October 26, 2026 (skill bars that grow along the timeline) and, on October 27, the way pictures and work are shown (option A: pictures fan out above the stop, with links to papers, code and videos under the stop's line).

`journey-initial.html` keeps the first design (October 21, 2026) for comparison: four landmark cut-outs that each open a short story in a pop-up, restored from commit `9e9a3bf`. It can be deleted, with `assets/journey.css`, `assets/journey.js`, `assets/journey/landscape.jpg` and the four `.webp` cut-outs in `assets/journey/`, once it is no longer wanted.

History: the first design was added in pull request #13 and taken offline on October 22, 2026 (commit `3236b23`). A second version came in #16 without a header link; #43 restored the link; #44 replaced it with the skill bars; #46 adds pictures, work links, Georgia Tech, smaller landmarks and the stops corrected from Ehsan's LinkedIn experience.

## How the page works

- **The painting** (`assets/journey/landscape-v4.webp`) fills the top of the page. The header and the title "My journey" sit on the sky, over a soft dark band so the white text reads; on phones the header moves above the painting.
- **Landmarks grow.** Each of the six landmarks has a cut-out layer in `assets/journey/marks/` that sits exactly over its painted self, so it is invisible until it is highlighted. The highlighted landmark scales up by 10% from its base and gets a soft shadow, while the rest of the painting is slightly desaturated and veiled. Its name appears in a small tag under it. There are no outlines or circles.
- **Map and timeline are linked.** Hovering or focusing a stop previews it: its landmark grows, its line shows and the skill bars move to it. Clicking selects it. Hovering a landmark grows it and darkens the dots of its stops; clicking it selects its first stop, and clicking again moves to its next stop (Tehran has five: Sharif, Amirkabir and RIES; Georgia Tech and NASA have two each). Arrow keys, Home and End move along the timeline.
- **Pictures fan out above the stop.** A stop with pictures shows them as a small fan of cards over the bottom of the painting. The pointer can move from the stop up to its cards without them closing. Clicking a card opens the viewer: the picture large, its caption (and credit), previous/next, Escape or a click outside to close. On phones the pictures sit in a row under the stop's line.
- **Work under the line.** Each stop's line names what Ehsan did there (never the skills, which the bars show) and is followed by small links to its papers, code, videos and talks.
- **Skill bars.** Each skill is a bar that starts under the stop where it was learned and reaches to the current stop, so the bars form a staircase that grows as you move along. Skills not yet reached are faint dashed outlines. A skill learned at the stop just reached gives one soft pulse. On phones the timeline shrinks to dots (only the current year is named) and the skills wrap as boxes.
- **First view.** The page opens at 2013. The first time the skills come into view, the timeline plays once through to now (about seven seconds), unless the visitor has already hovered or clicked something. With reduced motion there is no play and the page opens at now.
- **Without JavaScript** every stop's line and links are listed and all bars are shown at now.

## Editing

Everything is in `scripts/build_journey.py`; run `python scripts/build_journey.py` after editing. It writes `journey.html` and `data/journey-timeline.json` (a record of the same content).

- `STOPS`: the timeline, in order: year, short name under the dot, place for the line, landmark, skills first learned there, the line on what Ehsan did, the work to link (keys of `WORK`) and the pictures.
- **Pictures:** save each in `assets/journey/photos/` (JPEG or WebP, about 1200 px wide) and list it in the stop as `("assets/journey/photos/<file>", "Caption")`, or with a third item for a credit. Two to four per stop fan best. For now the fans hold figures from the papers (the 2019, 2019–21 and NASA stops); photos from LinkedIn and the gallery go in the same lists.
- `WORK`: one entry per paper, repository, video or talk: kind (`paper`, `code`, `video`, `talk`), the short label on the link, the full title (shown on hover and to screen readers) and the address. An entry whose address is `None` is left out of the page until it has one; today that is the two UX videos, the AgroTrack repository and the AGU 2025 talk.
- `SKILLS`: each skill's label, colour, text colour and an optional second colour the bar fades to on the right. Tools use their own colours (MATLAB dark orange fading to blue, Python yellow fading to blue, Linux yellow, YouTube red, NASA blue, Git dark grey); the rest have colours chosen so every bar is different. The label always sits on the first colour, and the text colour is white or near-black, whichever reads at 4.5:1 on it (white on MATLAB's dark orange is 5.0:1). Skills learned at the last stop grow leftward from the right edge so their labels stay on the page.
- `MARKS`: each landmark's name and the box of its cut-out over the painting, in % of the painting's width and height.
- Styles are in `assets/journey-page.css` and behaviour in `assets/journey-page.js`. Bump `V` in the script when either changes, or when the painting or a cut-out changes; it is added to every one of those addresses so browsers fetch the new files instead of showing old ones.

**Cut-outs.** Each landmark's layer is its pixels in the painting, saved with transparency in `assets/journey/marks/`, so it lines up exactly. The outlines were first found with box-prompted segmentation (Segment Anything, through the `rembg` package): one box per building (the Azadi tower and Sharif's building; the NASA building, dome and rocket separately), joined per landmark, cleaned of specks and given a 1 px soft edge. When the landmarks were made smaller (below), each layer was cut again from the new painting, leaving out anything that stands in front of it. If the painting changes, the cut-outs must be redone to match it.

**Logos.** The bars use each tool's colour but not its logo. Official logo files could be added inside the bars later.

## Artwork (the painting)

`assets/journey/landscape-v4.webp` is the earlier composite (`landscape-integrated-v2.webp`, described below) with these changes, made on October 27, 2026 at Ehsan's request:

- **The satellite dish is gone from the startup's roof.** It was painted out with LaMa, a learned inpainting model (the OpenCV model zoo's ONNX version, run in 512 px tiles at full resolution), which rebuilt the roof edge and the bushes behind it. Earlier attempts with classical inpainting left a blurred or patchy roof and were dropped.
- **The landmarks are smaller.** Each was lifted out, the ground behind it filled in with LaMa, and the landmark put back 10% smaller (Michigan State 12%), scaled about the middle of its base so it still stands where it stood.
- **Georgia Tech is Ehsan's own illustration** of the Tech Tower: cut out of its white background (with the white un-mixed from its edges and its pale ground patch faded into the grass), set to about Michigan State's height, warmed slightly to match the painting's light, and placed after the bridge, between Michigan State and NASA, on the spot of a large red rock that was painted out first. It has a soft contact shadow.

The earlier composite was a built-in imagegen composite based on the original supplied landscape and four landmark illustrations. It is a symbolic map; the Colosseum represents Italy, and the rocket represents NASA, not a literal CNR IRPI or Goddard campus. The startup building is illustrative.

Generation prompt: compositing; preserve the base landscape’s winding paths, river and bridge, mountains, dry left terrain and green right hills. Incorporate the recognizable Sharif/Tehran architecture, Italy Colosseum, Michigan clocktower and Spartan reference, NASA building/rocket, plus a small startup workshop into the same terrain. Match perspective, shared soft daylight, contact shadows and vegetation at each base; no floating cutouts, isolated cards or platforms. Wide 16:9 arrangement, Sharif at left, startup foreground, Italy center, Michigan right-center and NASA upper right. Use a quieter sage, terracotta, slate-blue and cream palette with subtle brush texture. No text, dates, UI or numbered markers; labels and timeline are accessible HTML. Output uses the Michigan clocktower as its principal Michigan landmark.

The image is encoded as WebP for the page. Transparent buttons over the landmark regions take hover, focus, clicks and taps.

## First design: content and editing

The four stories in `journey-initial.html` are adapted from Ehsan's NASA career spotlight (https://science.gsfc.nasa.gov/600/ECSS/Ehsan-Jalilvand/, accessed October 22, 2026). The landscape is `assets/journey/landscape.jpg`; the four landmark illustrations were cut out from their white backgrounds and saved with transparency as `assets/journey/sharif.webp`, `italy.webp`, `michigan.webp` and `nasa.webp`. The map is symbolic: the rocket stands for the NASA chapter, not the Goddard campus.

The story text lives in the four `<article>` elements near the end of `journey-initial.html`; `assets/journey.js` reads them into the pop-up, so there is one copy of each story and they stay readable without JavaScript. Landmark positions are percentage rules in `assets/journey.css`, and the crop of each cutout is its SVG `viewBox` in the HTML (source images are 1254 × 1254). Hover or focus lifts a landmark; clicking opens the pop-up with previous/next buttons; the Motion button and reduced-motion settings stop the movement.
