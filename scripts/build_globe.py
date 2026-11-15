"""Inline the rotated geography into the globe template to produce globe.html.

Run from the repo root after `npm install`:
    node scripts/prep_globe_data.mjs
    python3 scripts/build_globe.py
"""
from pathlib import Path

root = Path(__file__).resolve().parent.parent
template = (root / "scripts" / "globe_template.html").read_text()
data = (root / "build" / "data.js").read_text()
(root / "globe.html").write_text(template.replace("/*__DATA__*/", data))
print("wrote globe.html")
