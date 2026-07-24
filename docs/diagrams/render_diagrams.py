# -*- coding: utf-8 -*-
"""
Render PlantUML (.puml) to PNG using the public PlantUML server.
Produces UML-standard diagrams (usecase, sequence, state, activity, component, ER).

Source of truth: docs/diagrams/plantuml/*.puml
Open/edit in VS Code PlantUML extension, IntelliJ, or Visual Paradigm (import).
For Draw.io: File → Import → PlantUML (plugin) or redraw from these specs.
"""
from __future__ import annotations

import shutil
import string
import zlib
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
PUML = ROOT / "plantuml"
OUT = ROOT / "export"
DESTS = [
    ROOT.parent / "diagram",
    ROOT.parent / "finalDoc" / "assets",
    ROOT.parent / "report_assets",
]

# PlantUML text encoding (same as plantuml.com)
_ALPHABET = string.digits + string.ascii_uppercase + string.ascii_lowercase + "-_"


def _encode6bit(b: int) -> str:
    if b < 0:
        return "?"
    return _ALPHABET[b & 0x3F]


def _append3bytes(b1: int, b2: int, b3: int) -> str:
    c1 = b1 >> 2
    c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
    c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
    c4 = b3 & 0x3F
    return _encode6bit(c1) + _encode6bit(c2) + _encode6bit(c3) + _encode6bit(c4)


def plantuml_encode(text: str) -> str:
    data = zlib.compress(text.encode("utf-8"))[2:-4]  # raw deflate
    res = []
    i = 0
    while i < len(data):
        if i + 2 < len(data):
            res.append(_append3bytes(data[i], data[i + 1], data[i + 2]))
        elif i + 1 < len(data):
            res.append(_append3bytes(data[i], data[i + 1], 0))
        else:
            res.append(_append3bytes(data[i], 0, 0))
        i += 3
    return "".join(res)


def render_one(src: Path, dest: Path) -> None:
    text = src.read_text(encoding="utf-8")
    enc = plantuml_encode(text)
    url = f"https://www.plantuml.com/plantuml/png/{enc}"
    req = Request(url, method="GET")
    req.add_header("User-Agent", "InteriorStudio-Diagrams/1.0")
    with urlopen(req, timeout=90) as resp:
        data = resp.read()
    if not data.startswith(b"\x89PNG"):
        # sometimes returns SVG/error page
        raise RuntimeError(f"Bad response for {src.name}: {data[:100]!r}")
    dest.write_bytes(data)
    print("OK", src.stem, f"({len(data)} bytes)")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(PUML.glob("*.puml"))
    if not files:
        raise SystemExit("No .puml in " + str(PUML))
    for src in files:
        out = OUT / f"{src.stem}.png"
        render_one(src, out)
        for d in DESTS:
            d.mkdir(parents=True, exist_ok=True)
            shutil.copy2(out, d / out.name)
    print("Done:", len(files), "→", OUT)
    print("Also copied to:", ", ".join(str(d) for d in DESTS))


if __name__ == "__main__":
    main()
