# My journey page

`journey.html` adds a separate illustrated career page. The header links from both existing pages. No changes to water-cycle research interactions are needed.

## Content and artwork

Four career summaries are adapted from Ehsan’s supplied NASA career spotlight:
https://science.gsfc.nasa.gov/600/ECSS/Ehsan-Jalilvand/
Accessed October 22, 2026. Sharif degrees, Italy collaboration, the 2019 PhD and 2022 move to Michigan State, and the NASA collaboration are supported there. No NASA start date is inferred from relative dates in the article.

The landscape is the supplied Gemini_Generated_Image_99x5m399x5m399x5.jpeg. Four supplied institutional illustrations were prepared with the built-in image-generation tool, using this prompt:

> Remove only the plain white background to create a clean transparent PNG cutout for an interactive website map. Keep all landmark objects, structure, colors, paint texture, proportions, logos and fine detail unchanged. Preserve white surfaces belonging to the buildings. No added objects or text. Frame the full cutout with a small transparent margin.

The generated cutouts are encoded as WebP in assets/journey with their alpha preserved. The map is symbolic; the NASA rocket artwork represents the NASA chapter, not a Goddard campus or the subject’s job. The cabin and alternative Colosseum are unused optional artwork.

## Editing

Career copy is in the four articles in journey.html. JavaScript reads those articles into the dialog so there is one source of truth and a readable no-JavaScript fallback. The mapping of stop IDs and SVG view boxes is in assets/journey.js. Position the landmarks using the percentage rules in assets/journey.css. Keep source dimensions at 1254 × 1254 when using these view boxes.

Personal career photographs have not been supplied. When available, they can replace or accompany the landmark illustration in each story panel, with an accurate caption and alt text. Do not invent photo captions or fetch personal photos from unrelated sources.

## Interaction

Hover/focus adds a lift, glow and brief hint. Clicking or tapping a landmark or chapter link opens a native dialog. Escape, the close button, outside click, and the last chapter’s return button close it and return focus. Previous/next move between chapters. Reduced-motion preferences and the Motion toggle disable movement. All four stories remain readable if JavaScript or native dialog support is unavailable.

Changes are for review on review/water-cycle-opening. Do not merge or deploy without explicit approval.
