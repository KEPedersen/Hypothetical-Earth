import fs from "fs";
import { feature, mesh } from "topojson-client";
import { geoRotation } from "d3-geo";

// Rotation that moves the head of the Bay of Bengal (21.5N, 89.5E) to the North Pole.
const rot = geoRotation([-89.5, 90 - 21.5]);
const r = (c) => { const p = rot(c); return [+p[0].toFixed(2), +p[1].toFixed(2)]; };

function rotGeom(g) {
  const map = (coords, depth) => depth === 0 ? r(coords) : coords.map((c) => map(c, depth - 1));
  const depth = { Polygon: 2, MultiPolygon: 3, LineString: 1, MultiLineString: 2 }[g.type];
  return { type: g.type, coordinates: map(g.coordinates, depth) };
}

const land = JSON.parse(fs.readFileSync("node_modules/world-atlas/land-50m.json"));
const countries = JSON.parse(fs.readFileSync("node_modules/world-atlas/countries-50m.json"));
const landGeom = rotGeom(feature(land, land.objects.land).features[0].geometry);
const borders = rotGeom(mesh(countries, countries.objects.countries, (a, b) => a !== b));

// Real-world reference lines, rotated: old equator and old poles
const oldEq = { type: "LineString", coordinates: Array.from({ length: 361 }, (_, i) => r([i - 180, 0])) };
const oldNP = r([0, 90]), oldSP = r([0, -90]);

const cities = {
  Kolkata: [88.36, 22.57], Dhaka: [90.41, 23.81], Kathmandu: [85.32, 27.72], Yangon: [96.17, 16.84],
  Delhi: [77.21, 28.61], Mumbai: [72.88, 19.08], Bangkok: [100.5, 13.76], Beijing: [116.4, 39.9],
  Tokyo: [139.69, 35.69], Moscow: [37.62, 55.76], Cairo: [31.24, 30.04], London: [-0.13, 51.51],
  Nuuk: [-51.7, 64.18], "New York": [-74.0, 40.71], "Mexico City": [-99.13, 19.43], Lima: [-77.04, -12.05],
  "Rio de Janeiro": [-43.17, -22.91], Honolulu: [-157.86, 21.31], Sydney: [151.21, -33.87],
  "Cape Town": [18.42, -33.92], Lagos: [3.38, 6.52], Singapore: [103.82, 1.35], Nairobi: [36.82, -1.29],
  Anchorage: [-149.9, 61.22], Reykjavík: [-21.94, 64.15], Chicago: [-87.63, 41.88], Santiago: [-70.67, -33.45],
  "Colorado Springs": [-104.82, 38.83], Nashville: [-86.78, 36.16], Knoxville: [-83.92, 35.96],
  "Rapid City": [-103.23, 44.08], Lubbock: [-101.86, 33.58], "Santa Fe": [-105.94, 35.69],
};
const cityOut = Object.entries(cities).map(([n, c]) => { const p = r(c); return [n, p[0], p[1]]; });

const data = { land: landGeom, borders, oldEq, oldNP, oldSP, cities: cityOut };
fs.writeFileSync("build/data.js", "const GEO=" + JSON.stringify(data) + ";");
for (const [n, , lat] of cityOut) console.log(n.padEnd(15), lat.toFixed(1));
console.log("Greenland S tip", r([-43.9, 59.8])[1], " N tip", r([-33, 83.6])[1]);
console.log("bytes", fs.statSync("build/data.js").size);
