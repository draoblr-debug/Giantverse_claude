#!/usr/bin/env python3
"""Pre-builds the ~85-page static dossier body for every (archetype,
growth-branch) pair — the content that's safe to render once and reuse for
every participant sharing that archetype (see generate_dossier.py's tier
tagging on add()). Also emits the canonical page-recipe.json the Node
assembler (src/engines/dossier/pdf-assembler.ts) uses to know, in order,
which pages come from this pre-built PDF vs. get authored fresh per request
vs. get copied from a pre-built character page.

Two branches per archetype ("prev"/"next"), not one: buildPersonaPayload()'s
"growth" wheel-neighbour depends on the participant's own live quiz scores,
and that choice ripples into cast/team/journey-beat/wheel-diagram content
this feature treats as archetype-bound. See
scripts/dump-archetype-payloads.ts, which must be run first to produce the
JSON payloads this script reads from tools/dossier/archetype-payloads/.

Usage:
    npx tsx scripts/dump-archetype-payloads.ts   # from the repo root, once
    DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 prebuild.py [--only minshu__next]
"""
import argparse
import json
import sys
import time
from pathlib import Path

import generate_dossier as gd
from persona_builder import build_persona
from weasyprint import HTML

HERE = Path(__file__).parent
PAYLOADS_DIR = HERE / "archetype-payloads"
OUT_DIR = HERE.parent.parent / "public" / "dossier-prebuilt"
ARCHETYPES_OUT_DIR = OUT_DIR / "archetypes"


def render_one(payload_path: Path) -> None:
    payload = json.loads(payload_path.read_text())
    persona = build_persona(payload)
    html = gd.assemble_static_body(persona)
    out_path = ARCHETYPES_OUT_DIR / f"{payload_path.stem}.pdf"
    HTML(string=html).write_pdf(str(out_path))
    return len([pg for pg in gd.PAGES if pg["tier"] == "static"])


def write_page_recipe() -> None:
    # The relative tier sequence is identical for every archetype/branch —
    # computed once, from any one payload, with 5 placeholder visual
    # matches so every character slot appears.
    any_payload = json.loads(next(PAYLOADS_DIR.glob("*.json")).read_text())
    persona = build_persona(any_payload)
    recipe = gd.build_page_recipe(persona)
    (OUT_DIR / "page-recipe.json").write_text(json.dumps(recipe, indent=2))
    print(f"page-recipe.json: {len(recipe)} slots")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=None, help="Render a single payload stem (e.g. minshu__next) for a quick sanity check.")
    args = ap.parse_args()

    ARCHETYPES_OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not PAYLOADS_DIR.exists() or not any(PAYLOADS_DIR.glob("*.json")):
        sys.exit(f"No payloads found in {PAYLOADS_DIR} — run "
                  "`npx tsx scripts/dump-archetype-payloads.ts` from the repo root first.")

    write_page_recipe()

    payload_paths = sorted(PAYLOADS_DIR.glob(f"{args.only}.json" if args.only else "*.json"))
    if not payload_paths:
        sys.exit(f"No payloads matched --only={args.only!r}")

    t0 = time.time()
    for i, p in enumerate(payload_paths, 1):
        n_pages = render_one(p)
        print(f"[{i}/{len(payload_paths)}] {p.stem}.pdf — {n_pages} static pages "
              f"({time.time() - t0:.1f}s elapsed)")

    print(f"done: {len(payload_paths)} archetype bundles in {ARCHETYPES_OUT_DIR}")


if __name__ == "__main__":
    main()
