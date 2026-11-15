import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.basemap import Basemap

P_LAT, P_LON = 21.5, 89.5          # new North Pole: head of the Bay of Bengal
R_ARCTIC = 90 - 66.5634            # 23.44 deg from the pole
EXTENT_DEG = 34                     # how far out the map reaches
EARTH_R = 6371000.0
half = np.radians(EXTENT_DEG) * EARTH_R

fig = plt.figure(figsize=(11, 11), facecolor="#0b1d2e")
ax = fig.add_axes([0.03, 0.06, 0.94, 0.86])
ax.set_facecolor("#0b1d2e")

m = Basemap(projection="aeqd", lat_0=P_LAT, lon_0=P_LON,
            width=2 * half, height=2 * half, resolution="l", ax=ax)

# Clip everything to a disc so it reads like a polar map
from matplotlib.patches import Circle
cx, cy = m(P_LON, P_LAT)
disc = Circle((cx, cy), half, transform=ax.transData)

m.drawmapboundary(fill_color="#cfe6f2", linewidth=0)
fills = m.fillcontinents(color="#f4efe3", lake_color="#cfe6f2")
cl = m.drawcoastlines(linewidth=0.6, color="#5b6b74")
co = m.drawcountries(linewidth=0.4, color="#9aa6ab")
for coll in [cl, co] + list(fills):
    coll.set_clip_path(disc)

# "New" latitude rings: concentric circles around the new pole (azimuthal equidistant -> true circles)
for d in range(5, EXTENT_DEG + 1, 5):
    r = np.radians(d) * EARTH_R
    ax.add_patch(Circle((cx, cy), r, fill=False, ec="#7f9aa8", lw=0.5, ls=(0, (2, 3)), zorder=3))
    ax.text(cx + r * np.cos(np.radians(-58)), cy + r * np.sin(np.radians(-58)),
            f"{90 - d}°N", fontsize=7, color="#4a6270", ha="center", va="center", zorder=4,
            bbox=dict(fc="#cfe6f2", ec="none", pad=0.5, alpha=0.8))

# New meridians: straight lines out from the pole
for b in range(0, 360, 30):
    ax.plot([cx, cx + half * np.sin(np.radians(b))], [cy, cy + half * np.cos(np.radians(b))],
            color="#7f9aa8", lw=0.4, ls=(0, (2, 3)), zorder=3)

# The new Arctic Circle
r_arc = np.radians(R_ARCTIC) * EARTH_R
ax.add_patch(Circle((cx, cy), r_arc, fill=True, fc="#4fa3d1", alpha=0.13, ec="none", zorder=4))
ax.add_patch(Circle((cx, cy), r_arc, fill=False, ec="#c0392b", lw=2.4, zorder=5))
ax.text(cx, cy - r_arc - 70000, "NEW ARCTIC CIRCLE  ·  66°34′N", color="#c0392b",
        fontsize=11, fontweight="bold", ha="center", va="top", zorder=6,
        bbox=dict(fc="#cfe6f2", ec="none", pad=1.5, alpha=0.85))

# Pole marker
ax.plot(cx, cy, marker="*", ms=16, color="#c0392b", mec="white", mew=1, zorder=7)
ax.text(cx + 60000, cy + 60000, "NORTH POLE", fontsize=9, fontweight="bold", color="#2b2b2b", zorder=7)

# Reference cities, with distance-from-pole check
def gc_deg(lat1, lon1, lat2, lon2):
    a, b, c, d = map(np.radians, [lat1, lon1, lat2, lon2])
    return np.degrees(np.arccos(np.clip(np.sin(a)*np.sin(c) + np.cos(a)*np.cos(c)*np.cos(d-b), -1, 1)))

cities = {
    "Dhaka": (23.81, 90.41), "Kolkata": (22.57, 88.36), "Yangon": (16.84, 96.17),
    "Kathmandu": (27.72, 85.32), "Lhasa": (29.65, 91.10), "Delhi": (28.61, 77.21),
    "Mumbai": (19.08, 72.88), "Chennai": (13.08, 80.27), "Colombo": (6.93, 79.86),
    "Bangkok": (13.76, 100.50), "Hanoi": (21.03, 105.85), "Kunming": (25.04, 102.71),
    "Chengdu": (30.57, 104.07), "Karachi": (24.86, 67.01), "Kuala Lumpur": (3.14, 101.69),
    "Hong Kong": (22.32, 114.17), "Kabul": (34.56, 69.21), "Ürümqi": (43.83, 87.62),
}
rows = []
for name, (la, lo) in cities.items():
    d = gc_deg(P_LAT, P_LON, la, lo)
    rows.append((name, d))
    x, y = m(lo, la)
    if np.hypot(x - cx, y - cy) > half * 0.97:
        continue
    inside = d <= R_ARCTIC
    ax.plot(x, y, "o", ms=4.5, color="#1f3b4d" if inside else "#7a8a93", mec="white", mew=0.6, zorder=7)
    ax.text(x + 45000, y + 25000, f"{name}\n{90 - d:.0f}°N", fontsize=7.5,
            color="#1f3b4d" if inside else "#5f6f78", zorder=7, linespacing=0.95)

# Outer frame ring
ax.add_patch(Circle((cx, cy), half, fill=False, ec="#0b1d2e", lw=3, zorder=8))
ax.set_xlim(cx - half * 1.01, cx + half * 1.01)
ax.set_ylim(cy - half * 1.01, cy + half * 1.01)
ax.set_aspect("equal"); ax.axis("off")

fig.text(0.5, 0.955, "THE ARCTIC CIRCLE, IF THE NORTH POLE SAT IN THE BAY OF BENGAL",
         color="white", fontsize=15, fontweight="bold", ha="center")
fig.text(0.5, 0.93, "Pole at 21.5°N, 89.5°E  ·  circle radius 23.44° ≈ 2,605 km  ·  azimuthal equidistant projection; labels show each city's new latitude",
         color="#a9bfcc", fontsize=8.5, ha="center")
fig.text(0.5, 0.03, "Shaded: inside the new Arctic Circle (midnight sun / polar night at least one day a year). Dotted rings: new parallels every 5°. Dotted spokes: new meridians.",
         color="#a9bfcc", fontsize=8, ha="center")

plt.savefig("assets/arctic_circle_bay_of_bengal.png", dpi=170, facecolor=fig.get_facecolor())
for n, d in sorted(rows, key=lambda r: r[1]):
    print(f"{n:13s} {d:5.1f}° from pole  new lat {90-d:4.1f}  {'INSIDE' if d <= R_ARCTIC else ''}")
