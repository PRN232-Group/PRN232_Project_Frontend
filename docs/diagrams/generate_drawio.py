# -*- coding: utf-8 -*-
"""
Generate Draw.io (.drawio) sources with UML shapes (actor, usecase, swimlane, etc.).
Open in Draw.io / diagrams.net to edit further.
PNG for reports still come from PlantUML (UML-standard render).
"""
from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parent / "drawio"
OUT.mkdir(parents=True, exist_ok=True)

ID = 0


def nid() -> str:
    global ID
    ID += 1
    return str(ID)


def cell(cid, value, style, parent, x=None, y=None, w=None, h=None, edge=False, source=None, target=None):
    val = escape(value) if value else ""
    if edge:
        geo = '<mxGeometry relative="1" as="geometry" />'
        extra = f' edge="1" source="{source}" target="{target}"'
    else:
        geo = f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry" />'
        extra = ' vertex="1"'
    return (
        f'<mxCell id="{cid}" value="{val}" style="{style}" parent="{parent}"{extra}>\n'
        f'  {geo}\n'
        f'</mxCell>'
    )


def wrap(name, cells: list[str]) -> str:
    body = "\n".join(cells)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="2026-07-24T00:00:00.000Z" agent="InteriorStudio" version="22.0.0">
  <diagram id="{name}" name="{name}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
{body}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
'''


def save(name: str, cells: list[str]):
    global ID
    ID = 1
    path = OUT / f"{name}.drawio"
    # rebuild ids starting fresh inside each file
    path.write_text(wrap(name, cells), encoding="utf-8")
    print("Wrote", path.name)


ACTOR = "shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;"
UC = "ellipse;whiteSpace=wrap;html=1;aspect=fixed;"
SYS = "rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;fillColor=none;align=center;fontStyle=1"
EDGE = "endArrow=block;html=1;endFill=1;edgeStyle=orthogonalEdgeStyle;"
NOTE = "shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;"
STATE = "rounded=1;whiteSpace=wrap;html=1;arcSize=40;fillColor=#dae8fc;strokeColor=#6c8ebf;"
INIT = "ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#000000;"
# start solid
START = "ellipse;html=1;fillColor=#000000;strokeColor=#000000;"
RECT = "rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;"
COMP = "shape=component;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"


def fig_context():
    cells = []
    # system box
    cells.append(cell("sys", "Interior Studio System", SYS, "1", 320, 80, 360, 420))
    cells.append(cell("fe", "React SPA\n(Vite)", COMP, "1", 360, 140, 140, 70))
    cells.append(cell("api", "ASP.NET Core\nWeb API (JWT)", COMP, "1", 520, 140, 140, 70))
    cells.append(cell("db", "SQL Server\nInteriorStudio", RECT, "1", 760, 120, 150, 70))
    cells.append(cell("smtp", "SMTP\nEmail OTP", RECT, "1", 760, 230, 150, 70))
    actors = [("c", "Customer", 40, 100), ("s", "Sales", 40, 220), ("m", "Manager", 40, 340), ("a", "Admin", 40, 460)]
    for aid, name, x, y in actors:
        cells.append(cell(aid, name, ACTOR, "1", x, y, 40, 80))
        cells.append(cell(f"e_{aid}", "", EDGE, "1", edge=True, source=aid, target="sys"))
    cells.append(cell("e_fe_api", "HTTPS JSON", EDGE, "1", edge=True, source="fe", target="api"))
    cells.append(cell("e_api_db", "EF Core", EDGE, "1", edge=True, source="api", target="db"))
    cells.append(cell("e_api_smtp", "OTP", EDGE, "1", edge=True, source="api", target="smtp"))
    save("fig1_context", cells)


def fig_usecase():
    cells = []
    cells.append(cell("sys", "Interior Studio", SYS, "1", 260, 40, 520, 520))
    ucs = [
        ("u1", "Browse products / design / blog", 340, 80),
        ("u2", "Register / Login / Reset password", 340, 150),
        ("u3", "Cart, checkout, track orders", 340, 220),
        ("u4", "Chat, quotation, design request", 340, 290),
        ("u5", "Update order / quote / design request", 340, 360),
        ("u6", "Manage catalog, prices, concepts, analytics", 320, 430),
        ("u7", "Manage users, page ACL, CMS, system logs", 320, 500),
    ]
    for uid, label, x, y in ucs:
        cells.append(cell(uid, label, UC, "1", x, y, 200, 55))
    actors = [
        ("ag", "Guest", 40, 90, ["u1", "u2"]),
        ("ac", "Customer", 40, 200, ["u1", "u2", "u3", "u4"]),
        ("as", "Sales", 40, 320, ["u4", "u5"]),
        ("am", "Manager", 40, 410, ["u6"]),
        ("aa", "Admin", 40, 500, ["u7"]),
    ]
    for aid, name, x, y, links in actors:
        cells.append(cell(aid, name, ACTOR, "1", x, y, 40, 80))
        for t in links:
            cells.append(cell(f"e_{aid}_{t}", "", EDGE, "1", edge=True, source=aid, target=t))
    save("fig2_usecase", cells)


def fig_order_state():
    cells = []
    cells.append(cell("start", "", START, "1", 60, 40, 30, 30))
    ys = [("Pending", 40), ("Processing", 140), ("Shipping", 240), ("Completed", 340)]
    for name, y in ys:
        cells.append(cell(name, name, STATE, "1", 160, y, 140, 50))
    cells.append(cell("Cancelled", "Cancelled", STATE, "1", 400, 140, 140, 50))
    cells.append(cell("end", "", INIT, "1", 200, 430, 30, 30))
    cells.append(cell("e0", "checkout", EDGE, "1", edge=True, source="start", target="Pending"))
    cells.append(cell("e1", "Sales/Admin", EDGE, "1", edge=True, source="Pending", target="Processing"))
    cells.append(cell("e2", "Sales/Admin", EDGE, "1", edge=True, source="Processing", target="Shipping"))
    cells.append(cell("e3", "Sales/Admin", EDGE, "1", edge=True, source="Shipping", target="Completed"))
    cells.append(cell("e4", "", EDGE, "1", edge=True, source="Pending", target="Cancelled"))
    cells.append(cell("e5", "", EDGE, "1", edge=True, source="Processing", target="Cancelled"))
    cells.append(cell("e6", "", EDGE, "1", edge=True, source="Shipping", target="Cancelled"))
    cells.append(cell("e7", "", EDGE, "1", edge=True, source="Completed", target="end"))
    cells.append(cell("e8", "", EDGE, "1", edge=True, source="Cancelled", target="end"))
    cells.append(cell("note", "Forward-only happy path.\nIllegal jump rejected\n(orderStatus.js + OrderService)", NOTE, "1", 400, 240, 200, 90))
    save("fig5_order", cells)


def fig_arch():
    cells = []
    layers = [
        ("L1", "Presentation — React pages / DashboardShell", 80, 40),
        ("L2", "Application (FE) — services + apiClient + domain", 80, 120),
        ("L3", "WebApi — Controllers, JWT, Swagger, CORS", 80, 200),
        ("L4", "Services — business rules + Audit interceptor", 80, 280),
        ("L5", "Infrastructure — UnitOfWork / Repository → Entity / SQL Server", 80, 360),
    ]
    for lid, label, x, y in layers:
        cells.append(cell(lid, label, "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;align=center;", "1", x, y, 620, 55))
    for a, b in [("L1", "L2"), ("L2", "L3"), ("L3", "L4"), ("L4", "L5")]:
        cells.append(cell(f"e_{a}_{b}", "", EDGE, "1", edge=True, source=a, target=b))
    save("fig7_arch", cells)


def main():
    fig_context()
    fig_usecase()
    fig_order_state()
    fig_arch()
    print("Draw.io sources in", OUT)


if __name__ == "__main__":
    main()
