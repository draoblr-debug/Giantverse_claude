#!/usr/bin/env python3
"""GIANTVERSE DOSSIER 2.0 — Premium Collector's Edition generator.

Usage:
    DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 generate_dossier.py [--out PATH]
    DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib python3 generate_dossier.py --persona-json PATH --out PATH

With no --persona-json, renders the Dossier 1.0 sample persona (Toyuho
Kagemori). With --persona-json, renders a live participant's book from a
JSON *payload* file (identity + archetype + wheel data, produced by the
Next.js app's persona-payload.ts) — this file expands that payload into
the full persona via persona_builder.build_persona() before rendering.

Renders the full personalized book (Dossier 1.0 content preserved, plus the
2.0 premium education layer) to PDF via WeasyPrint.
"""
import argparse
import html as html_mod
import json
from pathlib import Path

from content_book import (CHAPTER_QUOTES, PRO_SECRETS, MASTER_STUDIES, DESIGN_LIKE,
                          INDUSTRY, ENGINE_PIPELINE, ENGINE_WHY, EXERCISE_LADDER,
                          SPARKS, COMMENTARY, MASTERCLASS, WORKBOOK_SHEETS)
from persona_toyuho import PERSONA as P

GOLD = "#C9A24B"
INK = "#12100E"
PAPER = "#F2EDE2"

esc = html_mod.escape


def fmt(s: str) -> str:
    """Fill persona placeholders in universal content strings."""
    return s.format(
        name=P["legacy_name"], archetype=P["archetype"],
        shape=P["blueprint"]["shape_word"], accent_name=P["blueprint"]["accent_name"],
        shadow=P["shadow_name"].lower(), realm_name=P["realm_name"],
    )


# ── page assembly ─────────────────────────────────────────────────────
PAGES: list[dict] = []          # {cls, section, body, spark:bool}
_spark_i = 0


def add(section: str, body: str, cls: str = "dark", spark: bool = True, center: bool = True, glyph: bool = True):
    PAGES.append({"cls": cls, "section": section, "body": body, "spark": spark, "center": center, "glyph": glyph})


def next_spark() -> str:
    global _spark_i
    s = SPARKS[_spark_i % len(SPARKS)]
    _spark_i += 1
    return s


def kicker(a: str, b: str = "") -> str:
    sep = ' <span class="dot">·</span> ' if b else ""
    return f'<p class="kicker">{esc(a)}{sep}{esc(b) if b else ""}</p>'


def blocks(items, label_cls="lab") -> str:
    out = []
    for lab, txt in items:
        out.append(f'<p class="{label_cls}">{esc(lab)}</p><p class="body">{esc(txt)}</p>')
    return "\n".join(out)


def commentary(text: str) -> str:
    return f'<div class="comm"><p>{esc(fmt(text))}</p></div>'


# ── FRONT MATTER ──────────────────────────────────────────────────────
def build_front():
    add("COVER", f"""
      <div class="cover">
        <p class="cover-order">{esc(P['order_short'].replace('', ' ').strip())}</p>
        <h1 class="cover-name">{esc(P['legacy_name'])}</h1>
        <p class="cover-sub">born {esc(P['birth_name'])} · the {esc(P['archetype'])}</p>
        <div class="cover-rule"></div>
        <p class="cover-title">CHARACTER GENESIS DOSSIER</p>
        <p class="cover-ed">PREMIUM COLLECTOR'S EDITION · 2.0</p>
        <p class="cover-meta">The Giant Hunt · Giantverse Record {esc(P['gv_id'])}</p>
      </div>""", spark=False, center=True, glyph=False)

    add("COLLECTOR'S PLATE", f"""
      <div class="plate">
        <p class="kicker">FOUNDING COHORT · FIRST PRINTING</p>
        <h2 class="serif">This record belongs to</h2>
        <p class="plate-name">{esc(P['legacy_name'])}</p>
        <p class="plate-line">known before the Hunt as {esc(P['real_name'])}</p>
        <div class="cover-rule"></div>
        <p class="body dim center">One identity. One record. One entry in the world-record attempt.<br/>
        No other copy of this book contains this name.</p>
        <p class="plate-id">{esc(P['gv_id'])}</p>
      </div>""", spark=False, center=True, glyph=False)

    toc = [
        ("I", "Identity", "Who arrived, and who was revealed"),
        ("II", "Archetype Analysis", "The Survivor, measured and mirrored on screen"),
        ("III", "The Wheel of Thirty-Two", "Your position — and the engine beneath it"),
        ("IV", "Giantverse Lore", "The realm and guild that raised your character"),
        ("V", "The Cast Around You", "Eight design briefs derived from your seat"),
        ("VI", "Hero Journey", "Seven beats of your personal Hunt"),
        ("VII", "Character Design Blueprint", "Your professional design brief"),
        ("VIII", "Design Masterclass", "Nine lessons, four studios, three pipelines"),
        ("IX", "Drawing Workbook", "The exercise ladder and thirteen sheets"),
        ("X", "The Giant Hunt", "Submission, judging, and the record"),
        ("XI", "Founding Creator", "Your place in the first cohort"),
    ]
    rows = "\n".join(
        f'<div class="toc-row"><span class="toc-n">{n}</span>'
        f'<span class="toc-t">{esc(t)}</span><span class="toc-d">{esc(d)}</span></div>'
        for n, t, d in toc)
    add("CONTENTS", f"""
      {kicker('CHARACTER GENESIS DOSSIER', 'SECOND EDITION')}
      <h2 class="serif">Contents</h2>
      <div class="toc">{rows}</div>
      <p class="body dim" style="margin-top:8mm">Throughout this book: <span class="gold">MASTER STUDY</span> pages analyse legendary
      characters, <span class="gold">PROFESSIONAL SECRET</span> pages carry industry wisdom, and every page closes with a
      design spark — one hundred of them, no two alike. Read cover to cover, or raid it like a reference shelf. Both are correct.</p>
    """, spark=False)


def quote_page(key: str, section: str):
    q = CHAPTER_QUOTES[key]
    label = "" if q["kind"] == "verified" else '<p class="q-para">— paraphrased, as labelled</p>'
    add(section, f"""
      <div class="quotepage">
        <div class="q-mark">“</div>
        <p class="q-text">{esc(q['quote'])}</p>
        <p class="q-author">{esc(q['author'])}</p>{label}
        <div class="cover-rule"></div>
        <p class="q-why"><span class="gold">WHY THIS OPENS THE CHAPTER</span><br/>{esc(fmt(q['why']))}</p>
      </div>""", spark=False, center=True, glyph=False)
    PAGES[-1]["quote"] = True


def secret_page(i: int):
    s = PRO_SECRETS[i]
    add("PROFESSIONAL SECRET", f"""
      <div class="secret">
        <p class="kicker">PROFESSIONAL SECRET · No. {i + 1}</p>
        <p class="secret-text">{esc(s['secret'])}</p>
        <div class="cover-rule"></div>
        <p class="secret-gloss">{esc(s['gloss'])}</p>
      </div>""", cls="black", spark=False, center=True, glyph=False)


def master_study(i: int):
    m = MASTER_STUDIES[i]
    add("MASTER STUDY", f"""
      {kicker('MASTER STUDY · No. ' + str(i + 1), m['principle'].upper())}
      <h2 class="serif">{esc(m['character'])}</h2>
      <p class="sub">{esc(m['source'])}</p>
      <div class="rule"></div>
      {blocks(m['blocks'])}
      <div class="comm"><p><span class="gold">APPLIED TO YOUR RECORD</span> — {esc(fmt(m['apply']))}</p></div>
      <p class="fineprint">Master studies teach principles, never imitation. Study why it works; design your own answer.</p>
    """)


# ── CH I — IDENTITY ───────────────────────────────────────────────────
def build_identity():
    quote_page("identity", "IDENTITY")
    add("IDENTITY", f"""
      {kicker('IDENTITY', 'RECORD ONE')}
      <h2 class="serif">The Name You Were Given</h2>
      <p class="sub">Every citizen of the Giantverse carries two names. The first is given. The second is earned.</p>
      <div class="rule"></div>
      <p class="lab">BIRTH NAME</p><p class="bigname">{esc(P['birth_name'])}</p>
      <p class="lab">LEGACY NAME</p><p class="bigname">{esc(P['legacy_name'])}</p>
      <p class="lab">THE MOTTO</p><p class="motto">“{esc(P['motto'])}”</p>
      <p class="body dim">The Legacy Name is not a replacement of the Birth Name — it is the Birth Name, kept.
      {esc(P['birth_name'])} is who arrived at the Hunt. {esc(P['legacy_name'])} is who the Hunt revealed.
      Both are entered in this record, and both are yours.</p>
    """)
    rows = [("Giantverse ID", P['gv_id']), ("Real Name", P['real_name']), ("Birth Name", P['birth_name']),
            ("Legacy Name", P['legacy_name']), ("Order", P['order']),
            ("Primary Archetype", f"{P['archetype']} · {P['archetype_jp']} ({P['archetype_kanji']})"),
            ("Secondary Archetype", f"{P['secondary']} · {P['secondary_jp']}"),
            ("Home Realm", f"{P['realm_name']} · {P['realm_jp']}"),
            ("Calling", P['guild']), ("Personal Symbol", P['symbol'])]
    table = "\n".join(f'<div class="id-row"><span class="id-k">{esc(k)}</span><span class="id-v">{esc(v)}</span></div>' for k, v in rows)
    add("IDENTITY", f"""
      {kicker('IDENTITY', 'RECORD TWO')}
      <h2 class="serif">Official Identity Record</h2>
      <div class="rule"></div>
      <div class="id-table">{table}</div>
      <p class="lab">SYMBOL MEANING</p><p class="body">{esc(P['symbol_meaning'])}</p>
      <p class="lab">GUILD TAGLINE</p><p class="body">{esc(P['guild_tagline'])}</p>
      <p class="lab">REALM</p><p class="body dim">{esc(P['realm_desc'])}</p>
    """)
    add("IDENTITY", f"""
      {kicker('IDENTITY', 'RECORD THREE')}
      <h2 class="serif">The Four Traits</h2>
      <p class="sub">Four words the record-keepers chose for the {esc(P['archetype'])} — and what each one means when it is yours.</p>
      <div class="rule"></div>
      {blocks(P['traits'])}
      {commentary(COMMENTARY['traits'])}
    """)
    secret_page(0)


# ── CH II — ARCHETYPE ─────────────────────────────────────────────────
def bar(pct: int) -> str:
    return f'<div class="bar"><div class="bar-fill" style="width:{pct}%"></div><span class="bar-pct">{pct}%</span></div>'


def build_archetype():
    quote_page("archetype", "ARCHETYPE ANALYSIS")
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'ANALYSIS')}
      <h2 class="serif">The {esc(P['archetype'])}</h2>
      <p class="sub">{esc(P['archetype_desc'])}</p>
      <div class="rule"></div>
      <p class="lab">Primary · {esc(P['archetype'])}</p>{bar(P['confidence'])}
      <p class="body dim">Confidence — how consistently your answers converged on this archetype.</p>
      <p class="lab">Secondary · {esc(P['secondary'])}</p>{bar(P['secondary_pct'])}
      <p class="body dim">The current running underneath the primary.</p>
      <p class="lab">GROWTH ARCHETYPE</p><p class="body">{esc(P['growth_note'])}</p>
      <p class="lab">SHADOW ARCHETYPE</p><p class="body">{esc(P['shadow_name'])} — {esc(P['shadow_desc'])}</p>
    """)
    strengths = blocks(P['traits'])
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'PROFILE')}
      <h2 class="serif">Strengths &amp; Weaknesses</h2>
      <div class="rule"></div>
      <div class="cols2">
        <div><p class="lab">STRENGTHS</p>{strengths}</div>
        <div><p class="lab">THE WATCH-LIST</p>
          <p class="body"><span class="gold">{esc(P['shadow_name'])}</span><br/>{esc(P['shadow_desc'])}</p>
          <p class="body dim">A shadow is not a flaw list — it is your signature strength with the brakes removed.
          The watch-list exists because every entry on the left column can become the entry on the right.</p>
        </div>
      </div>
    """)
    facet_rows = "\n".join(f'<p class="lab">{esc(n)}</p>{bar(v)}' for n, v in P['facets'])
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'INFOGRAPHIC')}
      <h2 class="serif">Behavioural Facets</h2>
      <p class="sub">Five working modes, scored from the archetype's underlying dimension weights.</p>
      <div class="rule"></div>
      {facet_rows}
    """)
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'FIELD NOTES')}
      <h2 class="serif">Under Pressure &amp; In Study</h2>
      <div class="rule"></div>
      {blocks(P['field_notes'])}
      <p class="fineprint">Field notes are directional, not diagnostic — drawn from the archetype model, not from
      psychology. Use them the way a character designer would: as acting notes.</p>
    """)
    # NEW — the archetype on screen
    screen = "\n".join(
        f'<p class="lab">{esc(n)} <span class="dim-inline">· {esc(src)}</span></p><p class="body">{esc(t)}</p>'
        for n, src, t in P['screen_examples'])
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'ON SCREEN · NEW IN 2.0')}
      <h2 class="serif">The {esc(P['archetype'])} on Screen</h2>
      <p class="sub">Five characters the world already loves, built from your archetype — study what their designers did with it.</p>
      <div class="rule"></div>
      {screen}
    """)
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'ON SCREEN · SYNTHESIS')}
      <h2 class="serif">What Their Designers Knew</h2>
      <div class="rule"></div>
      <p class="body">{esc(P['screen_synthesis'])}</p>
      <div class="comm"><p><span class="gold">THE PATTERN</span> — Survival is never drawn as muscle. It is drawn as
      evidence: what the character keeps, repairs, refuses to put down. Your symbol — {esc(P['symbol'])} — is that
      evidence, pre-designed. The pages ahead tell you where to put it.</p></div>
    """)
    w = P['wound_page']
    add("ARCHETYPE ANALYSIS", f"""
      {kicker('ARCHETYPE', 'PSYCHOLOGY · NEW IN 2.0')}
      <h2 class="serif">{esc(w['title'])}</h2>
      <p class="sub">{esc(w['intro'])}</p>
      <div class="rule"></div>
      {blocks(w['blocks'])}
    """)
    master_study(0)  # Tanjiro


# ── CH III — WHEEL + ENGINE ───────────────────────────────────────────
def wheel_svg() -> str:
    import math
    w = P['wheel']
    names = w['order32']
    cx, cy, r_lab, r_dot = 250, 250, 205, 168
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{r_dot}" fill="none" stroke="{GOLD}" stroke-opacity="0.25"/>']
    for i, nm in enumerate(names):
        ang = (i / 32) * 2 * math.pi - math.pi / 2
        x, y = cx + r_dot * math.cos(ang), cy + r_dot * math.sin(ang)
        lx, ly = cx + r_lab * math.cos(ang), cy + r_lab * math.sin(ang)
        if i == w['you_idx']:
            col, rr, fw = GOLD, 7, "700"
        elif i in w['neighbour_idxs']:
            col, rr, fw = "#E4D9B8", 4.5, "600"
        elif i in w['guild_idxs']:
            col, rr, fw = "#7B8FA3", 4, "400"
        elif i == w['opposite_idx']:
            col, rr, fw = "#B4543F", 4.5, "600"
        else:
            col, rr, fw = "#5A554C", 2.5, "300"
        deg = math.degrees(ang)
        anchor = "start" if -90 < deg < 90 else "end"
        rot = deg if -90 < deg < 90 else deg + 180
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rr}" fill="{col}"/>')
        parts.append(f'<text x="{lx:.1f}" y="{ly:.1f}" fill="{col}" font-size="11" font-weight="{fw}" '
                     f'text-anchor="{anchor}" transform="rotate({rot:.1f} {lx:.1f} {ly:.1f})" '
                     f'dominant-baseline="middle" font-family="Georgia,serif">{esc(names[i])}</text>')
    ya = (w['you_idx'] / 32) * 2 * math.pi - math.pi / 2
    ga = (w['neighbour_idxs'][0] / 32) * 2 * math.pi - math.pi / 2
    x1, y1 = cx + (r_dot - 22) * math.cos(ya), cy + (r_dot - 22) * math.sin(ya)
    x2, y2 = cx + (r_dot - 22) * math.cos(ga), cy + (r_dot - 22) * math.sin(ga)
    parts.append(f'<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{GOLD}"/></marker></defs>')
    parts.append(f'<path d="M {x1:.0f} {y1:.0f} Q {cx} {cy} {x2:.0f} {y2:.0f}" fill="none" stroke="{GOLD}" stroke-dasharray="2 5" stroke-width="1.6" marker-end="url(#arr)"/>')
    parts.append(f'<text x="{cx}" y="{cy - 8}" fill="{GOLD}" font-size="16" font-weight="700" text-anchor="middle" font-family="Georgia,serif">{esc(P["archetype"])}</text>')
    parts.append(f'<text x="{cx}" y="{cy + 12}" fill="#8A8478" font-size="10" text-anchor="middle" font-family="Georgia,serif">confidence {P["confidence"]}%</text>')
    return f'<svg viewBox="0 0 500 500" width="150mm" height="150mm" style="display:block;margin:4mm auto">{"".join(parts)}</svg>'


def build_wheel():
    quote_page("wheel", "THE WHEEL OF THIRTY-TWO")
    add("THE WHEEL OF THIRTY-TWO", f"""
      {kicker('ARCHETYPE', 'MAP')}
      <h2 class="serif">The Wheel of Thirty-Two</h2>
      <p class="sub">Your position among all thirty-two archetypes. Gold — you. Pale gold — your wheel neighbours.
      Blue-grey — your Guild. Red — your Opposite. The arrow marks your growth direction.</p>
      {wheel_svg()}
    """, spark=False, glyph=False, center=False)
    w = P['wheel']
    add("THE WHEEL OF THIRTY-TWO", f"""
      {kicker('ARCHETYPE', 'MAP')}
      <h2 class="serif">Reading Your Position</h2>
      <div class="rule"></div>
      {blocks([("CURRENT POSITION", w['position_note']), ("NEIGHBOURING ARCHETYPES", w['neighbours']),
               ("COMPATIBLE ARCHETYPES", w['compatible']), ("OPPOSITE", w['opposite']),
               ("THE CENTRAL QUESTION", w['question']), ("GROWTH DIRECTION", w['growth'])])}
    """)
    steps = "\n".join(
        f'<div class="pipe-row"><span class="pipe-n">{i+1:02d}</span><span class="pipe-k">{esc(k)}</span>'
        f'<span class="pipe-t">{esc(t)}</span></div>' for i, (k, t) in enumerate(ENGINE_PIPELINE))
    add("BEHIND THE ENGINE", f"""
      {kicker('BEHIND THE GIANTVERSE ENGINE', 'NEW IN 2.0')}
      <h2 class="serif">How This Book Was Computed</h2>
      <p class="sub">Every recommendation in this dossier is traceable to a decision below. No page is arbitrary.</p>
      <div class="rule"></div>
      <div class="pipeline">{steps}</div>
    """, spark=False)
    add("BEHIND THE ENGINE", f"""
      {kicker('BEHIND THE GIANTVERSE ENGINE', 'DESIGN DECISIONS')}
      <h2 class="serif">Why the Engine Works This Way</h2>
      <div class="rule"></div>
      {blocks(ENGINE_WHY)}
      <div class="comm"><p><span class="gold">THE HONEST FRAME</span> — The engine is a model, and models are
      arguments, not oracles. Its job is to hand you a defensible starting point and show its working — yours is to
      overrule it wherever your own evidence is stronger.</p></div>
    """)
    secret_page(1)


# ── CH IV — LORE ──────────────────────────────────────────────────────
def build_lore():
    quote_page("lore", "GIANTVERSE LORE")
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'HOME REALM')}
      <h2 class="serif">{esc(P['realm_name'])} ({esc(P['realm_jp'])})</h2>
      <p class="sub">Where survival becomes renewal. This is the ground that shaped {esc(P['legacy_name'])} —
      read it as a designer reads a character's childhood.</p>
      <div class="rule"></div>
      {blocks(P['lore_realm'])}
    """)
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'HOME REALM')}
      <h2 class="serif">{esc(P['realm_name'])}: Craft &amp; Arms</h2>
      <div class="rule"></div>
      {blocks(P['lore_craft'])}
      {commentary(COMMENTARY['lore_craft'])}
    """)
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'HOME REALM')}
      <h2 class="serif">Legends of {esc(P['realm_name'])}</h2>
      <div class="rule"></div>
      <p class="body">{esc(P['lore_legend'][0])}</p>
      <p class="body dim">{esc(P['lore_legend'][1])}</p>
    """)
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'CALLING')}
      <h2 class="serif">{esc(P['guild'])}</h2>
      <p class="sub">{esc(P['guild_tagline'])}</p>
      <div class="rule"></div>
      {blocks(P['lore_guild'])}
    """)
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'CALLING')}
      <h2 class="serif">Rites &amp; Reputation</h2>
      <div class="rule"></div>
      {blocks(P['lore_guild2'])}
      <p class="body dim">{esc(P['legacy_name'])} has taken this oath, passed this rite, and carries this reputation
      into every room. Decide how comfortably it sits — a character wearing their Guild loosely is as interesting as
      one wearing it proudly.</p>
    """)
    st = P['lore_story']
    add("GIANTVERSE LORE", f"""
      {kicker('LORE', 'THE ' + P['archetype'].upper() + 'S')}
      <h2 class="serif">{esc(st['title'])}</h2>
      <p class="sub">{esc(st['sub'])}</p>
      <div class="rule"></div>
      <p class="body">{esc(st['body'])}</p>
      <p class="lab">CULTURAL NOTE</p><p class="body">{esc(st['cultural'])}</p>
      <p class="lab">YOUR SYMBOL</p><p class="body">{esc(P['symbol'])} — {esc(P['symbol_meaning'])}</p>
      <p class="body dim">{esc(st['closing'])}</p>
    """)
    master_study(1)  # Totoro


# ── CH V — CAST ───────────────────────────────────────────────────────
def build_cast():
    quote_page("cast", "THE CAST AROUND YOU")
    roles = [(r, t) for r, t, *_ in P['cast']]
    listing = "\n".join(f'<div class="toc-row"><span class="toc-n" style="width:26mm">{esc(r.title())}</span><span class="toc-t">{esc(t)}</span></div>' for r, t in roles)
    add("THE CAST AROUND YOU", f"""
      {kicker('RELATIONSHIPS')}
      <h2 class="serif">The Cast Around You</h2>
      <p class="sub">No character exists alone. These eight figures are derived from {esc(P['legacy_name'])}'s exact
      position on the wheel — each one is a design brief for a supporting character in your story.</p>
      <div class="rule"></div>
      <div class="toc">{listing}</div>
      {commentary(COMMENTARY['cast'])}
    """)
    for role, title, sub, sym, why, how, lesson in P['cast']:
        add("THE CAST AROUND YOU", f"""
          {kicker('RELATIONSHIPS', role)}
          <h2 class="serif">{esc(title)}</h2>
          <p class="sub">{esc(sub)}</p>
          <p class="cast-sym">{esc(sym)}</p>
          <div class="rule"></div>
          {blocks([("WHY THEY ARE IN YOUR STORY", why), ("HOW YOU INTERACT", how), ("THE GROWTH LESSON", lesson)])}
          <p class="fineprint">Design brief — give this character a silhouette that contrasts yours, one visual element
          borrowed from your palette, and one they could never wear.</p>
        """)
    team = "\n".join(f'<p class="lab">{esc(jp)} · {esc(nm)}</p><p class="body">{esc(t)}</p>' for jp, nm, t in P['team'])
    add("THE CAST AROUND YOU", f"""
      {kicker('RELATIONSHIPS', 'ROSTER')}
      <h2 class="serif">The Perfect Team</h2>
      <p class="sub">If {esc(P['legacy_name'])} could choose any three companions for the Hunt, the wheel recommends these.</p>
      <div class="rule"></div>
      {team}
    """)
    secret_page(2)


# ── CH VI — JOURNEY ───────────────────────────────────────────────────
def build_journey():
    quote_page("journey", "HERO JOURNEY")
    beats = "\n".join(f'<div class="toc-row"><span class="toc-n">{i+1:02d}</span><span class="toc-t">{esc(t)}</span></div>'
                      for i, (t, _) in enumerate(P['journey']))
    add("HERO JOURNEY", f"""
      {kicker('HERO JOURNEY')}
      <h2 class="serif">The Hunt of {esc(P['legacy_name'])}</h2>
      <p class="sub">Seven beats of a personal Giant Hunt narrative — generated from your identity, your shadow, and
      your position on the wheel. Use it as the spine of your character's story, or argue with it. Both are canon.</p>
      <div class="rule"></div>
      <div class="toc">{beats}</div>
    """)
    for i, (title, body) in enumerate(P['journey']):
        add("HERO JOURNEY", f"""
          <div class="beat">
            {kicker('HERO JOURNEY', f'BEAT {i+1} OF 7')}
            <h2 class="serif">{esc(title)}</h2>
            <div class="rule" style="width:36mm;margin-left:auto;margin-right:auto"></div>
            <p class="beat-text">{esc(body)}</p>
          </div>
        """, center=True)
    master_study(2)  # Luffy


# ── CH VII — BLUEPRINT ────────────────────────────────────────────────
def build_blueprint():
    quote_page("blueprint", "CHARACTER DESIGN BLUEPRINT")
    b = P['blueprint']
    add("CHARACTER DESIGN BLUEPRINT", f"""
      {kicker('BLUEPRINT')}
      <h2 class="serif">Character Design Blueprint</h2>
      <p class="sub">A professional design brief for drawing {esc(P['legacy_name'])} — derived from Order, Realm,
      Calling and archetype. Recommendations, not rules: your hand makes the final call.</p>
      <div class="rule"></div>
      {blocks([("SHAPE LANGUAGE", f"{b['shape']} — {b['shape_note']}"), ("WHY", b['shape_why']),
               ("HEIGHT & BUILD", b['build']), ("SILHOUETTE", b['silhouette'])])}
      {commentary(COMMENTARY['blueprint_shape'])}
    """)
    chips = "\n".join(
        f'<div class="chip"><div class="chip-swatch" style="background:{hx}"></div>'
        f'<p class="chip-name">{esc(nm)}</p><p class="chip-hex">{esc(hx)}</p><p class="chip-role">{esc(role)}</p></div>'
        for nm, hx, role in b['palette'])
    add("CHARACTER DESIGN BLUEPRINT", f"""
      {kicker('BLUEPRINT', 'COLOUR')}
      <h2 class="serif">Colour Palette</h2>
      <p class="sub">{esc(b['palette_note'])}</p>
      <div class="rule"></div>
      <div class="chips">{chips}</div>
      <p class="fineprint">{esc(b['print_note'])}</p>
    """, center=False)
    add("CHARACTER DESIGN BLUEPRINT", f"""
      {kicker('BLUEPRINT', 'HEAD')}
      <h2 class="serif">Face, Eyes &amp; Hair</h2>
      <div class="rule"></div>
      {blocks(b['head'])}
      <p class="body dim">{esc(b['head_note'])}</p>
    """)
    add("CHARACTER DESIGN BLUEPRINT", f"""
      {kicker('BLUEPRINT', 'WARDROBE')}
      <h2 class="serif">Costume, Accessories &amp; Arms</h2>
      <div class="rule"></div>
      {blocks(b['wardrobe'])}
    """)
    add("CHARACTER DESIGN BLUEPRINT", f"""
      {kicker('BLUEPRINT', 'PERFORMANCE')}
      <h2 class="serif">Motion &amp; Acting</h2>
      <div class="rule"></div>
      {blocks(b['motion'])}
      <p class="body dim">{esc(b['motion_note'])}</p>
    """)
    master_study(3)  # Spider-Man
    secret_page(3)


# ── CH VIII — MASTERCLASS ─────────────────────────────────────────────
def build_masterclass():
    quote_page("masterclass", "DESIGN MASTERCLASS")
    for i, (title, sub, items) in enumerate(MASTERCLASS):
        add("DESIGN MASTERCLASS", f"""
          {kicker('MASTERCLASS', f'LESSON {i+1} OF 9')}
          <h2 class="serif">{esc(title)}</h2>
          <p class="sub">{esc(sub)}</p>
          <div class="rule"></div>
          {blocks(items)}
        """)
    for d in DESIGN_LIKE:
        add("DESIGN MASTERCLASS", f"""
          {kicker('DESIGN LIKE…', d['studio'].upper())}
          <h2 class="serif">Design Like {esc(d['studio'])}</h2>
          <p class="sub">{esc(d['philosophy'])}</p>
          <div class="rule"></div>
          {blocks(d['blocks'])}
          <div class="comm"><p><span class="gold">FOR YOUR SHEET</span> — {esc(fmt(d['apply']))}</p></div>
          <p class="fineprint">Philosophy, never imitation — these pages teach how a studio thinks, not how it renders.</p>
        """)
    for ind in INDUSTRY:
        add("DESIGN MASTERCLASS", f"""
          {kicker('INDUSTRY BREAKDOWN')}
          <h2 class="serif">{esc(ind['title'])}</h2>
          <p class="sub">{esc(ind['intro'])}</p>
          <div class="rule"></div>
          {blocks(ind['stages'])}
          <div class="comm"><p><span class="gold">THE LESSON</span> — {esc(ind['lesson'])}</p></div>
        """)
    master_study(4)  # Naruto
    secret_page(4)


# ── CH IX — WORKBOOK ──────────────────────────────────────────────────
def figure_sheet(caption: str) -> str:
    marks = "".join(f'<div class="wb-mark" style="top:{12 + i * 13.2}%"><span>{i + 1}</span></div>' for i in range(6))
    return f"""
      <div class="wb-area">
        <div class="wb-headunit">1 head unit</div>
        {marks}
        <div class="wb-centerline"></div>
        <div class="wb-ground"><span>ground line</span></div>
      </div>
      <p class="wb-caption">{esc(caption)}</p>"""


def grid_sheet(cells, cols, tall=False, eyeline=False) -> str:
    # Fixed total height (matches .wb-area) with rows sized 1fr each, so a
    # sheet with only one or two rows still fills the full sheet instead of
    # leaving the rest of the cream page empty.
    import math
    rows = math.ceil(len(cells) / cols)
    eye = '<div class="wb-eye">eye line</div>' if eyeline else ""
    cell_html = "".join(
        f'<div class="wb-cell">{eye}<span class="wb-cell-lab">{esc(c)}</span></div>' for c in cells)
    return (f'<div class="wb-grid" style="height:218mm;'
            f'grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({rows},1fr)">{cell_html}</div>')


def build_workbook():
    quote_page("workbook", "GIANT HUNT WORKBOOK")
    ladder = "\n".join(
        f'<p class="lab">{esc(n)}</p><p class="body"><em>{esc(task)}</em> — {esc(why)}</p>'
        for n, task, why in EXERCISE_LADDER)
    add("GIANT HUNT WORKBOOK", f"""
      {kicker('WORKBOOK', 'THE EXERCISE LADDER · NEW IN 2.0')}
      <h2 class="serif">Seven Drills Before the Sheets</h2>
      <p class="sub">Run this ladder once on scrap paper before the formal worksheets. Each rung removes a crutch —
      what survives all seven is your actual design.</p>
      <div class="rule"></div>
      {ladder}
    """)
    for sh in WORKBOOK_SHEETS:
        body = figure_sheet(sh.get("caption", "")) if sh["type"] == "figure" else \
            grid_sheet(sh["cells"], sh["cols"], sh.get("tall", False), sh.get("eyeline", False))
        add("GIANT HUNT WORKBOOK", f"""
          <div class="wb-head">
            <div><p class="kicker">GIANT HUNT WORKBOOK</p><h2 class="serif wb-title">{esc(sh['title'])}</h2></div>
            <p class="wb-note">{esc(sh['note'])}</p>
          </div>
          {body}
        """, cls="cream", spark=False, center=False)
    master_study(5)  # Violet Evergarden
    secret_page(5)


# ── CH X — HUNT + XI FOUNDER ─────────────────────────────────────────
def build_hunt():
    quote_page("hunt", "THE GIANT HUNT")
    add("THE GIANT HUNT", f"""
      {kicker('THE GIANT HUNT', 'GUIDE')}
      <h2 class="serif">Designing Your Character</h2>
      <p class="sub">Everything in this dossier converges here: turning {esc(P['legacy_name'])} into a finished,
      hand-drawn character.</p>
      <div class="rule"></div>
      {blocks([
          ("STEP 1 — READ YOUR BRIEF", "Your Blueprint pages are the design brief: shape language, proportions, palette, costume logic. Read them twice before touching paper."),
          ("STEP 2 — THUMBNAIL", "Ten small silhouettes using the workflow lesson. Choose the one that passes the fill test at thumbnail size."),
          ("STEP 3 — BUILD ON THE SHEETS", "Work through the workbook in order: head grid → eyes → expressions → poses → costume → turnaround. Each sheet feeds the next."),
          ("STEP 4 — FINAL TURNAROUND", "Present front, side and back on the turnaround sheet at a consistent head count. Flat colour from your palette page. This is your submission artwork."),
      ])}
    """)
    add("THE GIANT HUNT", f"""
      {kicker('THE GIANT HUNT', 'GUIDE')}
      <h2 class="serif">Submission Guidelines</h2>
      <div class="rule"></div>
      {blocks([
          ("WHAT TO SUBMIT", "One hand-drawn character design of your Giantverse identity — traditional or digital, drawn by you. AI-generated artwork is not eligible; this dossier deliberately contains recommendations, never images, for that reason."),
          ("FORMAT", f"A clear photograph or scan of your artwork. Include your Giantverse ID and Legacy Name exactly as printed on your Identity Record page."),
          ("ORIGINALITY", "The design must be your own work, created for the Hunt. Reference is encouraged; tracing and copying are not."),
          ("ONE IDENTITY, ONE ENTRY", "Each Giantverse identity submits once. Iterate privately on the worksheets — submit only your best turnaround."),
      ])}
      <p class="fineprint">Full and current terms are published on the official Giant Hunt submission portal; where this
      page and the portal differ, the portal governs.</p>
    """)
    phases = [("Phase 1", "Identity discovery — complete (you are holding the proof)"),
              ("Phase 2", "Design window — worksheets, iterations, final turnaround"),
              ("Phase 3", "Submission window — upload via the official portal"),
              ("Phase 4", "Verification & record attempt — see next page"),
              ("Phase 5", "Judging, gallery & honours")]
    ph = "\n".join(f'<div class="id-row"><span class="id-k">{esc(a)}</span><span class="id-v">{esc(b)}</span></div>' for a, b in phases)
    add("THE GIANT HUNT", f"""
      {kicker('THE GIANT HUNT', 'GUIDE')}
      <h2 class="serif">Timeline &amp; Judging</h2>
      <div class="rule"></div>
      <div class="id-table">{ph}</div>
      {blocks([
          ("JUDGING CRITERIA", "Silhouette clarity, shape-language discipline, palette control, costume logic, and — weighted heaviest — how convincingly the design expresses the identity in this dossier. Judges receive your archetype, not your name."),
          ("WHO JUDGES", "A panel of working artists and educators from the Image Group's design faculty and invited industry professionals."),
      ])}
      <p class="fineprint">Exact dates are announced on the portal and by email to registered participants.</p>
    """)
    add("THE GIANT HUNT", f"""
      {kicker('THE GIANT HUNT', 'GUIDE')}
      <h2 class="serif">The World Record Attempt</h2>
      <div class="rule"></div>
      {blocks([
          ("THE ATTEMPT", "The Giant Hunt is organised as an official Guinness World Records attempt for original character designs created within a single campaign. Every verified, guideline-compliant submission counts toward the total."),
          ("WHAT VERIFICATION MEANS", "Independent adjudication requires each entry to be an original, individually-created character design with a verifiable creator. Your Giantverse ID is your verification key — keep this dossier."),
          ("YOUR PART", f"{P['legacy_name']} is one name in the attempt. If the record stands, every counted participant is part of a world record — permanently, and provably."),
          ("AFTER SUBMISSION", "You'll receive confirmation of receipt, then verification status, then — record or not — your entry joins the public Giantverse gallery unless you opt out. Selected designs are featured; all verified designs are counted."),
      ])}
    """)
    add("FOUNDING CREATOR", f"""
      {kicker("FOUNDER'S PASS")}
      <h2 class="serif">Founding Creator Benefits</h2>
      <p class="sub">The Giant Hunt Founder's Pass makes {esc(P['real_name'])} a founding creator of the Giantverse
      platform — the first cohort, permanently marked as such.</p>
      <div class="rule"></div>
      {blocks([
          ("YOURS NOW", "Lifetime access to this Giantverse identity profile and dossier — view online and re-download anytime. Founding Creator badge on your identity record. Verified entry in the Giant Hunt and the world record attempt."),
          ("PLANNED PLATFORM BENEFITS", "As the Giantverse platform grows, founding creators are first in line for: a public creator profile, access to future platform updates and creator tools, eligibility for a future creator marketplace, and priority entry to future competitions and events."),
          ("THE HONEST PRINT", "Items listed as planned are exactly that — planned platform benefits and future features under active development, not guaranteed outcomes and not financial returns of any kind. What you are buying today is fully delivered today: this dossier, the masterclass, the workbook, and your verified place in the Hunt."),
      ])}
    """)
    add("FOUNDING CREATOR", f"""
      <div class="godraw">
        {kicker("FOUNDER'S PASS")}
        <h2 class="serif">Go Draw</h2>
        <div class="rule" style="width:36mm;margin-left:auto;margin-right:auto"></div>
        <p class="beat-text">Everything before this page was analysis. Everything after it is craft — and craft only
        happens on paper.</p>
        <p class="beat-text">You have a name, a realm, a calling, a cast, a story, a brief, a masterclass, six master
        studies, three studio pipelines and fourteen sheets of guides. You have, without noticing, completed a
        character design course. The Giantverse has done its part.</p>
        <p class="beat-text gold" style="font-size:15pt">The Hunt is waiting, {esc(P['legacy_name'])}.</p>
      </div>
    """, spark=False, center=True, glyph=False)
    add("COLOPHON", f"""
      <div class="plate">
        <p class="kicker">COLOPHON</p>
        <h2 class="serif">About This Edition</h2>
        <div class="cover-rule"></div>
        <p class="body dim center" style="max-width:120mm;margin:4mm auto">
        Character Genesis Dossier 2.0 — Premium Collector's Edition. Composed for {esc(P['legacy_name'])}, record
        {esc(P['gv_id'])}, from the Giantverse identity engine. One hundred design sparks are scattered through these
        pages; the first is on the Identity record, the last is below. All studio and character analyses are
        educational commentary; all rights in the works discussed remain with their creators. Quotes are verbatim
        where attributed plainly and labelled where paraphrased.</p>
        <div class="cover-rule"></div>
        <p class="q-text" style="font-size:15pt">{esc(SPARKS[-1])}</p>
      </div>
    """, spark=False, center=True, glyph=False)


# ── CSS + assembly ───────────────────────────────────────────────────
CSS = f"""
@page {{ size: A4; margin: 0; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{ font-family: Helvetica, Arial, sans-serif; }}
.sheet {{ width: 210mm; height: 297mm; page-break-after: always; position: relative;
         padding: 20mm 20mm 22mm 20mm; overflow: hidden;
         display: flex; flex-direction: column; }}
.sheet.dark  {{ background: {INK}; color: #D8D2C4; }}
.sheet.black {{ background: #060504; color: #D8D2C4; }}
.sheet.cream {{ background: {PAPER}; color: #3A362E; }}
.content {{ flex: 1 1 auto; display: flex; flex-direction: column; justify-content: flex-start;
           min-height: 0; padding-bottom: 14mm; position: relative; z-index: 1; }}
/* Vertical centering only — text stays left-aligned by default, since most
   centered pages carry multi-line body paragraphs that read better ragged-
   left. Templates that DO want centred text (quotepage/secret/beat/plate/
   cover) declare text-align:center on their own wrapper div. */
.content.centered {{ justify-content: center; }}
.glyph {{ position: absolute; right: -6mm; bottom: -34mm; font-family: Georgia, serif;
         font-size: 210pt; color: {GOLD}; opacity: 0.05; line-height: 1; letter-spacing: -0.05em;
         pointer-events: none; z-index: 0; }}
.serif {{ font-family: Georgia, 'Times New Roman', serif; font-weight: 400; }}
h2.serif {{ font-size: 24pt; color: #EFE9DA; margin: 2mm 0 2.5mm; }}
.cream h2.serif {{ color: #2E2A22; }}
.kicker {{ font-size: 7.5pt; letter-spacing: 0.28em; color: {GOLD}; text-transform: uppercase; }}
.kicker .dot {{ color: #6A6458; }}
.sub {{ font-size: 10pt; color: #9A948A; line-height: 1.6; max-width: 150mm; }}
.rule {{ height: 0.4mm; background: linear-gradient(90deg, {GOLD}, rgba(201,162,75,0.08)); margin: 4.5mm 0 5.5mm; }}
.lab {{ font-size: 7.5pt; letter-spacing: 0.22em; color: {GOLD}; text-transform: uppercase; margin: 4.5mm 0 1.3mm; }}
.body {{ font-size: 10pt; line-height: 1.65; color: #C9C3B6; max-width: 158mm; }}
.cream .body {{ color: #4A463C; }}
.body.dim, .dim {{ color: #8A8478; }}
.dim-inline {{ color: #8A8478; letter-spacing: 0.05em; }}
.gold {{ color: {GOLD}; }} .center {{ text-align: center; }}
.fineprint {{ font-size: 7.5pt; color: #6E695F; line-height: 1.5; margin-top: 5.5mm; font-style: italic; }}
.comm {{ border-left: 0.6mm solid {GOLD}; background: rgba(201,162,75,0.06);
        padding: 4mm 4.5mm; margin-top: 5.5mm; }}
.comm p {{ font-size: 9pt; line-height: 1.6; color: #BDB7A9; }}
.footer {{ position: absolute; bottom: 9mm; left: 20mm; right: 20mm; display: flex;
          justify-content: space-between; font-size: 6.5pt; letter-spacing: 0.2em;
          color: #6A6458; text-transform: uppercase; z-index: 2; }}
.cream .footer {{ color: #8F897B; }}
.sparkline {{ position: absolute; bottom: 15mm; left: 20mm; right: 20mm; text-align: center;
             font-family: Georgia, serif; font-style: italic; font-size: 8.5pt; color: {GOLD};
             opacity: 0.8; z-index: 2; }}
/* cover & plates */
.cover {{ text-align: center; }}
.cover-order {{ font-size: 8pt; letter-spacing: 0.6em; color: {GOLD}; }}
.cover-name {{ font-family: Georgia, serif; font-size: 34pt; color: #EFE9DA; margin: 5mm 0 2mm; }}
.cover-sub {{ font-size: 9pt; color: #9A948A; letter-spacing: 0.12em; }}
.cover-rule {{ width: 40mm; height: 0.3mm; background: {GOLD}; margin: 9mm auto; opacity: 0.7; }}
.cover-title {{ font-size: 9pt; letter-spacing: 0.45em; color: {GOLD}; }}
.cover-ed {{ font-size: 7pt; letter-spacing: 0.35em; color: #B4543F; margin-top: 2mm; }}
.cover-meta {{ font-size: 7.5pt; letter-spacing: 0.18em; color: #6A6458; margin-top: 3mm; }}
.plate {{ text-align: center; }}
.plate-name {{ font-family: Georgia, serif; font-size: 26pt; color: {GOLD}; margin: 4mm 0 1mm; }}
.plate-line {{ font-size: 9pt; color: #9A948A; }}
.plate-id {{ font-size: 10pt; letter-spacing: 0.4em; color: #6A6458; margin-top: 10mm; }}
/* toc */
.toc {{ margin-top: 2mm; }}
.toc-row {{ display: flex; gap: 5mm; padding: 2.6mm 0; border-bottom: 0.2mm solid rgba(201,162,75,0.18);
           align-items: baseline; }}
.toc-n {{ width: 10mm; color: {GOLD}; font-size: 9pt; font-family: Georgia, serif; flex-shrink: 0; }}
.toc-t {{ font-size: 10.5pt; color: #D8D2C4; font-family: Georgia, serif; flex-shrink: 0; }}
.toc-d {{ font-size: 8pt; color: #7C766A; margin-left: auto; text-align: right; }}
/* quote pages */
.quotepage {{ text-align: center; }}
.q-mark {{ font-family: Georgia, serif; font-size: 72pt; color: {GOLD}; line-height: 0.5; opacity: 0.85; }}
.q-text {{ font-family: Georgia, serif; font-size: 22pt; line-height: 1.5; color: #EFE9DA;
          max-width: 140mm; margin: 7mm auto 7mm; }}
.q-author {{ font-size: 9pt; letter-spacing: 0.25em; color: {GOLD}; text-transform: uppercase; }}
.q-para {{ font-size: 7pt; color: #6A6458; letter-spacing: 0.15em; margin-top: 1.5mm; }}
.q-why {{ font-size: 9.5pt; color: #9A948A; line-height: 1.65; max-width: 128mm; margin: 6mm auto 0; text-align: center; }}
/* secrets */
.secret {{ text-align: center; }}
.secret-text {{ font-family: Georgia, serif; font-size: 27pt; line-height: 1.42; color: #EFE9DA;
               max-width: 150mm; margin: 9mm auto; }}
.secret-gloss {{ font-size: 10pt; color: #9A948A; max-width: 120mm; margin: 0 auto; line-height: 1.65; }}
/* identity */
.bigname {{ font-family: Georgia, serif; font-size: 24pt; color: #EFE9DA; margin-bottom: 3mm; }}
.motto {{ font-family: Georgia, serif; font-size: 13pt; color: {GOLD}; line-height: 1.5;
         margin-bottom: 4mm; max-width: 150mm; }}
.id-table {{ margin: 2mm 0 4mm; }}
.id-row {{ display: flex; padding: 2.4mm 0; border-bottom: 0.2mm solid rgba(201,162,75,0.16); }}
.id-k {{ width: 52mm; font-size: 8pt; letter-spacing: 0.12em; color: #8A8478; text-transform: uppercase; flex-shrink: 0; }}
.id-v {{ font-size: 10pt; color: #D8D2C4; font-family: Georgia, serif; }}
/* bars */
.bar {{ position: relative; height: 2.6mm; background: rgba(201,162,75,0.12); margin: 1.5mm 0 2mm;
       max-width: 150mm; }}
.bar-fill {{ height: 100%; background: linear-gradient(90deg, #8A6E2F, {GOLD}); }}
.bar-pct {{ position: absolute; right: -1mm; top: -4.6mm; font-size: 8pt; color: {GOLD};
           font-family: Georgia, serif; }}
.cols2 {{ display: flex; gap: 10mm; }} .cols2 > div {{ flex: 1; }}
/* engine pipeline */
.pipeline {{ margin-top: 2mm; }}
.pipe-row {{ display: flex; gap: 4mm; padding: 2.5mm 0; border-bottom: 0.2mm solid rgba(201,162,75,0.15);
            align-items: baseline; }}
.pipe-n {{ font-family: Georgia, serif; color: {GOLD}; font-size: 9pt; width: 8mm; flex-shrink: 0; }}
.pipe-k {{ font-size: 7.5pt; letter-spacing: 0.18em; color: #D8D2C4; width: 36mm; flex-shrink: 0; }}
.pipe-t {{ font-size: 8.5pt; color: #8A8478; line-height: 1.45; }}
/* cast */
.cast-sym {{ font-size: 8pt; letter-spacing: 0.4em; color: {GOLD}; margin-top: 2mm; text-transform: uppercase; }}
/* journey */
.beat, .godraw {{ text-align: center; }}
.beat .kicker, .beat .rule, .godraw .kicker {{ text-align: center; margin-left: auto; margin-right: auto; }}
.beat-text {{ font-family: Georgia, serif; font-size: 15pt; line-height: 1.75; color: #D8D2C4;
             max-width: 140mm; margin: 4mm auto 0; }}
/* palette chips */
.chips {{ display: flex; gap: 6mm; margin: 5mm 0; }}
.chip {{ flex: 1; }}
.chip-swatch {{ height: 78mm; border: 0.3mm solid rgba(255,255,255,0.12); }}
.chip-name {{ font-size: 10pt; color: #D8D2C4; font-family: Georgia, serif; margin-top: 3mm; }}
.chip-hex {{ font-size: 8pt; color: {GOLD}; letter-spacing: 0.08em; }}
.chip-role {{ font-size: 8pt; color: #8A8478; line-height: 1.45; margin-top: 1.5mm; }}
/* workbook */
.wb-head {{ display: flex; justify-content: space-between; gap: 10mm; align-items: flex-start; }}
.wb-title {{ font-size: 17pt; }}
.wb-note {{ font-size: 7.5pt; color: #8F897B; max-width: 55mm; line-height: 1.5; text-align: right; }}
.wb-area {{ position: relative; height: 218mm; margin-top: 6mm;
           border-top: 0.25mm solid #C9C2B0; border-bottom: 0.25mm solid #8F897B; }}
.wb-headunit {{ position: absolute; top: 2mm; left: 0; width: 24mm; height: 24mm;
               border: 0.3mm solid #8F897B; font-size: 6.5pt; color: #8F897B;
               display: flex; align-items: flex-end; justify-content: center; padding-bottom: 1mm; }}
.wb-mark {{ position: absolute; left: 0; right: 0; border-bottom: 0.2mm dashed #C9C2B0; }}
.wb-mark span {{ position: absolute; left: -6mm; top: -2mm; font-size: 6.5pt; color: #A29B8B; }}
.wb-centerline {{ position: absolute; top: 0; bottom: 0; left: 50%; width: 0.2mm; background: #D6CFBD; }}
.wb-ground {{ position: absolute; bottom: 0; left: 0; right: 0; }}
.wb-ground span {{ position: absolute; right: 0; bottom: 1mm; font-size: 6.5pt; color: #8F897B; }}
.wb-caption {{ text-align: center; font-size: 8pt; letter-spacing: 0.35em; color: #6E695F;
              margin-top: 4mm; text-transform: uppercase; }}
.wb-grid {{ display: grid; gap: 4mm; margin-top: 8mm; }}
.wb-cell {{ border: 0.25mm solid #B9B2A0; position: relative; }}
.wb-cell-lab {{ position: absolute; bottom: 2mm; left: 0; right: 0; text-align: center;
               font-size: 6.5pt; letter-spacing: 0.25em; color: #8F897B; }}
.wb-eye {{ position: absolute; top: 45%; left: 0; right: 0; border-top: 0.2mm dashed #B9B2A0;
          font-size: 6pt; color: #A29B8B; padding-left: 1mm; }}
"""


def assemble() -> str:
    build_front()
    build_identity()
    build_archetype()
    build_wheel()
    build_lore()
    build_cast()
    build_journey()
    build_blueprint()
    build_masterclass()
    build_workbook()
    build_hunt()

    total = len(PAGES)
    sheets = []
    for i, pg in enumerate(PAGES):
        n = i + 1
        spark = f'<p class="sparkline">{esc(next_spark())}</p>' if pg["spark"] and n > 1 else ""
        footer = "" if n == 1 else (
            f'<div class="footer"><span>{esc(P["legacy_name"])} · {esc(P["gv_id"])}</span>'
            f'<span>{esc(pg["section"])} · {n} / {total}</span></div>')
        glyph = f'<div class="glyph">{esc(P["archetype_kanji"])}</div>' if pg["glyph"] and pg["cls"] == "dark" else ""
        wrap_cls = "content centered" if pg["center"] else "content"
        sheets.append(
            f'<div class="sheet {pg["cls"]}">{glyph}<div class="{wrap_cls}">{pg["body"]}</div>{spark}{footer}</div>')
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(sheets)}</body></html>"


def main():
    global P
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(Path.home() / "Downloads" / "Giantverse_Dossier_2.0_Sample_Toyuho-Kagemori.pdf"))
    ap.add_argument("--persona-json", default=None,
                     help="Path to a JSON file shaped like persona_toyuho.PERSONA. "
                          "Overrides the built-in sample persona for this run.")
    ap.add_argument("--html-out", default=None,
                     help="Optional separate path for the intermediate HTML (defaults to --out with .html suffix).")
    args = ap.parse_args()

    if args.persona_json:
        from persona_builder import build_persona
        payload = json.loads(Path(args.persona_json).read_text())
        P = build_persona(payload)

    html = assemble()
    html_out = args.html_out or str(Path(args.out).with_suffix(".html"))
    Path(html_out).write_text(html)
    from weasyprint import HTML
    HTML(string=html).write_pdf(args.out)
    quote_pages = [i + 1 for i, pg in enumerate(PAGES) if pg.get("quote")]
    manifest = {"pages": len(PAGES), "quote_pages": quote_pages}
    print(f"pages: {len(PAGES)}  →  {args.out}")
    print(f"MANIFEST:{json.dumps(manifest)}")


if __name__ == "__main__":
    main()
