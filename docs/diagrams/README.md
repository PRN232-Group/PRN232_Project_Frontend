# Diagrams (UML-standard)

## Source of truth

| Folder | Format | Tool |
|--------|--------|------|
| `plantuml/*.puml` | PlantUML | VS Code PlantUML / IntelliJ / Visual Paradigm import |
| `drawio/*.drawio` | Draw.io XML | **Draw.io / diagrams.net** (edit visually) |
| `export/*.png` | PNG render | Used in Report7 / docs |

## Regenerate PNG

```bash
cd docs/diagrams
python render_diagrams.py
python generate_drawio.py
```

`render_diagrams.py` uses the public PlantUML server to export UML diagrams (use case, sequence, state, activity, component, ER).

## Rules

- Diagrams must match real `router.jsx` / Controllers / Services (no invented modules).
- Prefer UML notation: actor stick-figure, use-case ellipse, sequence lifelines, state machine, layered components.
- **Do not put “Figure …” titles inside the image** — captions are written under the picture in the Word report.
- Do **not** use ad-hoc matplotlib boxes for SRS figures anymore.
- Production role/module is out of scope in the final delivery diagrams.
