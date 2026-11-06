// Builds site/assets/about/us-map.svg, the map of the United States behind the Gallery preview on the About page
// (site/assets/about-gallery.js places the pins on it).
//
// The map is us-atlas's states-albers-10m (US Census Bureau boundaries, ISC licence), already projected with d3's
// geoAlbersUsa at scale 1300 and translate [487.5, 305] into a 975 x 610 box, with Alaska and Hawaii drawn in the
// lower left. It is simplified to keep the file small. about-gallery.js projects each place's lat/lon the same way.
//
// To rebuild (Node 18+): copy this file into an empty folder outside the repository, and in that folder run
//   npm install us-atlas@3 topojson-client@3 topojson-simplify@3 d3-geo@3
//   node build_us_map.mjs /path/to/irrigation-studies/site/assets/about/us-map.svg
// (Node looks for the packages next to the script, so it has to run from that folder.)
import fs from 'fs';
import { geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';

const out = process.argv[2];
if (!out) { console.error('usage: node build_us_map.mjs <output.svg>'); process.exit(1); }
let us = JSON.parse(fs.readFileSync('node_modules/us-atlas/states-albers-10m.json', 'utf8'));
us = simplify(presimplify(us), 0.6);
const path = geoPath().digits(1);
const nation = path(feature(us, us.objects.nation));
const states = path(mesh(us, us.objects.states, (a, b) => a !== b));
// The colours here are for viewing the file on its own; on the About page assets/about.css colours the two classes.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 975 610" aria-hidden="true" focusable="false">' +
  `<path class="land" d="${nation}" fill="#EAF0EE" stroke="#9AA7AB" stroke-width="1" stroke-linejoin="round"/>` +
  `<path class="lines" d="${states}" fill="none" stroke="#C3CDCF" stroke-width="0.7" stroke-linejoin="round"/></svg>\n`;
fs.writeFileSync(out, svg);
console.log(`wrote ${out} (${svg.length} bytes)`);
