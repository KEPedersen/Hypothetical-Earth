# Re-poled Earth

What would the world look like if the North Pole were at the head of the **Bay of Bengal** (21.5°N, 89.5°E)?

This project rotates the planet's coordinate system so that point becomes the North Pole, then redraws the geography. With the pole there, the new equator happens to run right through southern **Greenland**.

## What's here

| File | What it is |
|---|---|
| `index.html` | Landing page for the website |
| `globe.html` | Interactive 3D globe: drag to spin, scroll to zoom, hover over cities for their new latitude |
| `assets/arctic_circle_bay_of_bengal.png` | Map of the new Arctic Circle |
| `scripts/arctic_circle_map.py` | Draws the Arctic Circle map (matplotlib + basemap) |
| `scripts/prep_globe_data.mjs` | Rotates Natural Earth coastlines and borders into the new pole frame |
| `scripts/globe_template.html` | Globe page template (d3-geo orthographic, canvas) |
| `scripts/build_globe.py` | Inlines the rotated data into `globe.html` |

## Key findings

- **Arctic Circle** (23.44° from the pole, about 2,605 km): takes in all of India, Sri Lanka, Bangladesh, Nepal, Bhutan, Myanmar, Thailand, Laos, Cambodia, Vietnam, Tibet and much of western China. Karachi, Kabul, Ürümqi, Kuala Lumpur and Hong Kong sit just inside it.
- **Equator through Greenland**: Cape Farewell is at 0.3°S, Nuuk at 0.8°N, and the island's northern tip at about 18°N.
- **Elsewhere**: London 16.9°N, Reykjavík 10.5°N, New York 25.9°S, Mexico City 48.2°S, Lima 74.0°S, Singapore 65.5°N.

## The math

The pole rotation is `d3.geoRotation([-89.5, 68.5])`. It turns the globe 89.5° about the real polar axis, then tilts it 68.5° (90° − 21.5°), which carries 21.5°N, 89.5°E up to the top. A rotation keeps every shape and distance intact; only the latitude and longitude labels change. A place's new latitude is 90° minus its great-circle distance from the new pole.

## Rebuilding

```bash
npm install
pip install basemap matplotlib numpy
npm run build
```

## Data

The globe shows the 10 biggest cities on each inhabited continent, plus a handful of others. Rankings and populations come from the [UN World Urbanization Prospects 2025](https://population.un.org/wup/) (its "cities" under the Degree of Urbanization method). Oceania is the exception: only Sydney and Melbourne make the UN's global list, so its other eight come from Australian Bureau of Statistics and Stats NZ urban-area figures. Population is used only to decide which labels show when cities crowd together.

Coastlines and borders come from [Natural Earth](https://www.naturalearthdata.com/) (public domain), via [world-atlas](https://github.com/topojson/world-atlas) for the globe and basemap for the static map.
