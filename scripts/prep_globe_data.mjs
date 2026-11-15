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

// [lon, lat, population in millions]. Population is used only to decide which labels win
// when space is tight. Continental top 10s: UN World Urbanization Prospects 2025 (cities,
// Degree of Urbanization), except Oceania beyond Sydney/Melbourne, which uses ABS / Stats NZ
// urban-area figures. Other cities: approximate metro populations.
const cities = {
  // Asia: top 10
  Jakarta: [106.85, -6.21, 41.9], Dhaka: [90.41, 23.81, 36.6], Tokyo: [139.69, 35.69, 33.4],
  Delhi: [77.21, 28.61, 30.2], Shanghai: [121.47, 31.23, 29.6], Guangzhou: [113.26, 23.13, 27.6],
  Manila: [120.98, 14.6, 24.7], Kolkata: [88.36, 22.57, 22.5], Seoul: [126.98, 37.57, 22.5],
  Karachi: [67.01, 24.86, 21.4],
  // Africa: top 10
  Cairo: [31.24, 30.04, 25.6], Lagos: [3.38, 6.52, 12.8], Luanda: [13.23, -8.84, 11.4],
  Kinshasa: [15.31, -4.32, 10.9], "Dar es Salaam": [39.21, -6.79, 7.8], Alexandria: [29.92, 31.2, 7.3],
  Johannesburg: [28.05, -26.2, 7.1], Khartoum: [32.56, 15.5, 6.8], "Addis Ababa": [38.74, 9.03, 6.7],
  Abidjan: [-4.01, 5.36, 6.6],
  // Europe: top 10
  Istanbul: [28.98, 41.01, 15.0], Moscow: [37.62, 55.76, 14.5], London: [-0.13, 51.51, 10.4],
  Paris: [2.35, 48.86, 9.4], Madrid: [-3.7, 40.42, 5.6], "Saint Petersburg": [30.34, 59.93, 4.7],
  Barcelona: [2.17, 41.39, 4.0], Berlin: [13.4, 52.52, 3.6], Athens: [23.73, 37.98, 3.1],
  Naples: [14.27, 40.85, 2.8],
  // North America: top 10
  "Mexico City": [-99.13, 19.43, 17.7], "New York": [-74.0, 40.71, 13.9], "Los Angeles": [-118.24, 34.05, 12.7],
  Toronto: [-79.38, 43.65, 5.5], "Santo Domingo": [-69.93, 18.49, 4.6], Guadalajara: [-103.35, 20.67, 4.1],
  Houston: [-95.37, 29.76, 4.0], Monterrey: [-100.32, 25.69, 3.9], Chicago: [-87.63, 41.88, 3.7],
  "Washington, D.C.": [-77.04, 38.91, 3.3],
  // South America: top 10
  "São Paulo": [-46.63, -23.55, 18.9], "Buenos Aires": [-58.38, -34.6, 14.0], "Bogotá": [-74.07, 4.71, 10.6],
  Lima: [-77.04, -12.05, 10.6], "Rio de Janeiro": [-43.17, -22.91, 9.5], Santiago: [-70.67, -33.45, 6.7],
  "Belo Horizonte": [-43.94, -19.92, 4.2], Recife: [-34.88, -8.05, 3.7], "Medellín": [-75.58, 6.24, 3.4],
  Fortaleza: [-38.52, -3.73, 3.2],
  // Oceania: top 10
  Sydney: [151.21, -33.87, 4.2], Melbourne: [144.96, -37.81, 3.6], Brisbane: [153.03, -27.47, 2.7],
  Perth: [115.86, -31.95, 2.3], Auckland: [174.76, -36.85, 1.7], Adelaide: [138.6, -34.93, 1.4],
  "Gold Coast": [153.4, -28.02, 0.7], Newcastle: [151.78, -32.93, 0.5], Canberra: [149.13, -35.28, 0.47],
  Wellington: [174.78, -41.29, 0.44],
  // Other cities kept from earlier versions
  Mumbai: [72.88, 19.08, 20.2], Bangkok: [100.5, 13.76, 18.2], Beijing: [116.4, 39.9, 17.0],
  Nairobi: [36.82, -1.29, 6.1], Yangon: [96.17, 16.84, 5.6], Singapore: [103.82, 1.35, 5.0],
  "Cape Town": [18.42, -33.92, 4.5], Kathmandu: [85.32, 27.72, 3.2], Nashville: [-86.78, 36.16, 2.1],
  Honolulu: [-157.86, 21.31, 1.0], Knoxville: [-83.92, 35.96, 0.9], "Colorado Springs": [-104.82, 38.83, 0.76],
  Anchorage: [-149.9, 61.22, 0.4], Lubbock: [-101.86, 33.58, 0.33], "Reykjavík": [-21.94, 64.15, 0.24],
  "Santa Fe": [-105.94, 35.69, 0.16], "Rapid City": [-103.23, 44.08, 0.15], Nuuk: [-51.7, 64.18, 0.02],
};
const cityOut = Object.entries(cities).map(([n, c]) => { const p = r(c); return [n, p[0], p[1], c[2]]; });

const data = { land: landGeom, borders, oldEq, oldNP, oldSP, cities: cityOut };
fs.writeFileSync("build/data.js", "const GEO=" + JSON.stringify(data) + ";");
for (const [n, , lat] of cityOut) console.log(n.padEnd(15), lat.toFixed(1));
console.log("Greenland S tip", r([-43.9, 59.8])[1], " N tip", r([-33, 83.6])[1]);
console.log("bytes", fs.statSync("build/data.js").size);
