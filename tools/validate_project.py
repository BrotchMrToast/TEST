#!/usr/bin/env python3
"""TRINITY RIFT project validator (engine-free checks).

Validates everything that can be verified without running Godot:
  * all JSON content parses and cross-references resolve
  * maps: spawn/NPC/chest/sign walkability, BFS reachability from spawn,
    exit rectangles, arrival tiles, bounce loops, trigger rectangles
  * res:// paths referenced from .tscn and load("...") in .gd exist
  * sprite names used by content exist in data/sprites.json AND as PNGs

Run: python3 tools/validate_project.py   (exit 1 on errors)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors = []
warns = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warns.append(msg)


def load_json(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        return None
    try:
        with open(path) as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        err(f"{rel}: JSON parse error: {e}")
        return None


SOLID = set("~#^_TY%oPFHBc")
SHOP_KEYS = None

items = load_json("data/items.json") or {}
enemies = load_json("data/enemies.json") or {}
quests = load_json("data/quests.json") or {}
shops = load_json("data/shops.json") or {}
companions = load_json("data/companions.json") or {}
banks = load_json("data/common.json") or {}
sprites = load_json("data/sprites.json") or {}

worlds = {}
maps = {}
cutscenes = {}
dialogues = {}
for wid in ["samurai", "business", "cyber", "convergence"]:
    w = load_json(f"data/worlds/{wid}/world.json")
    if w is None:
        err(f"missing world.json for {wid}")
        continue
    worlds[wid] = w
    for mid in w.get("maps", []):
        m = load_json(f"data/worlds/{wid}/maps/{mid}.json")
        if m is None:
            err(f"world {wid}: missing map file {mid}.json")
        else:
            maps[mid] = m
    cs = load_json(f"data/worlds/{wid}/cutscenes.json") or {}
    cutscenes.update(cs)
    dl = load_json(f"data/worlds/{wid}/dialogue.json") or {}
    dialogues.update(dl)


def sprite_ok(name, ctx):
    if name not in sprites:
        err(f"{ctx}: sprite '{name}' not in data/sprites.json")
        return
    png = os.path.join(ROOT, "assets", "generated", "sprites", name + ".png")
    if not os.path.exists(png):
        err(f"{ctx}: sprite PNG missing: {name}.png (run tools/gen_assets.py)")


# ---------------- map checks ----------------
for mid, m in maps.items():
    ctx = f"map {mid}"
    rows = m.get("rows", [])
    H = len(rows)
    W = max(len(r) for r in rows) if rows else 0
    grid = [list(r.ljust(W, "#")) for r in rows]
    for y, r in enumerate(rows):
        if len(r) != W:
            warn(f"{ctx}: row {y} width {len(r)} != {W} (padded with walls)")

    def at(x, y):
        if x < 0 or y < 0 or x >= W or y >= H:
            return "#"
        return grid[y][x]

    def walk(x, y):
        return at(x, y) not in SOLID

    sx, sy = m["spawn"]["x"], m["spawn"]["y"]
    seen = [[False] * W for _ in range(H)]
    if not walk(sx, sy):
        err(f"{ctx}: spawn ({sx},{sy}) on solid '{at(sx, sy)}'")
    else:
        stack = [(sx, sy)]
        seen[sy][sx] = True
        while stack:
            x, y = stack.pop()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < W and 0 <= ny < H and not seen[ny][nx] and walk(nx, ny):
                    seen[ny][nx] = True
                    stack.append((nx, ny))

    def reach(x, y):
        return 0 <= x < W and 0 <= y < H and seen[y][x]

    def reach_near(x, y):
        return reach(x, y) or reach(x + 1, y) or reach(x - 1, y) or reach(x, y + 1) or reach(x, y - 1)

    for n in m.get("npcs", []):
        if not walk(n["x"], n["y"]):
            err(f"{ctx}: npc {n['id']} at ({n['x']},{n['y']}) on solid '{at(n['x'], n['y'])}'")
        elif not reach_near(n["x"], n["y"]):
            err(f"{ctx}: npc {n['id']} unreachable from spawn")
        sprite_ok(n.get("sprite", ""), f"{ctx} npc {n['id']}")
        if "dialog" in n and n["dialog"] not in dialogues:
            err(f"{ctx}: npc {n['id']} missing dialogue '{n['dialog']}'")
        if "shop" in n and n["shop"] not in shops:
            err(f"{ctx}: npc {n['id']} missing shop '{n['shop']}'")
        if "quest" in n and n["quest"] not in quests:
            err(f"{ctx}: npc {n['id']} missing quest '{n['quest']}'")
        if "hire" in n and n["hire"] not in companions:
            err(f"{ctx}: npc {n['id']} missing companion '{n['hire']}'")
    for c in m.get("chests", []):
        if not walk(c["x"], c["y"]):
            err(f"{ctx}: chest {c['id']} at ({c['x']},{c['y']}) on solid")
        elif not reach_near(c["x"], c["y"]):
            err(f"{ctx}: chest {c['id']} unreachable")
        for entry in c.get("items", []):
            if entry["id"] not in items:
                err(f"{ctx}: chest {c['id']} unknown item {entry['id']}")
    for s in m.get("signs", []):
        if not reach_near(s["x"], s["y"]):
            warn(f"{ctx}: sign at ({s['x']},{s['y']}) unreachable")
    for e in m.get("exits", []):
        ok = any(walk(e["x"] + dx, e["y"] + dy) and reach(e["x"] + dx, e["y"] + dy)
                 for dx in range(e.get("w", 1)) for dy in range(e.get("h", 1)))
        if not ok:
            err(f"{ctx}: exit to {e['to']} at ({e['x']},{e['y']}) has no reachable walkable tile")
        if e["to"] not in maps:
            if e.get("req_chapter", 0) >= 2:
                pass  # stub gate for future chapters — locked in the vertical slice
            else:
                err(f"{ctx}: exit target map '{e['to']}' missing (and not a locked stub)")
        else:
            trows = maps[e["to"]]["rows"]
            tW = max(len(r) for r in trows)
            tgrid = [list(r.ljust(tW, "#")) for r in trows]

            def tat(x, y):
                if x < 0 or y < 0 or x >= tW or y >= len(tgrid):
                    return "#"
                return tgrid[y][x]

            if tat(e["tx"], e["ty"]) in SOLID:
                err(f"{ctx}: exit to {e['to']}: arrival ({e['tx']},{e['ty']}) is solid '{tat(e['tx'], e['ty'])}'")
            for be in maps[e["to"]].get("exits", []):
                if be["x"] <= e["tx"] < be["x"] + be.get("w", 1) and be["y"] <= e["ty"] < be["y"] + be.get("h", 1):
                    err(f"{ctx}: exit to {e['to']}: arrival lands INSIDE its exit to {be['to']} (bounce loop)")
    for t in m.get("triggers", []):
        ok = any(walk(t["x"] + dx, t["y"] + dy) and reach(t["x"] + dx, t["y"] + dy)
                 for dx in range(t.get("w", 1)) for dy in range(t.get("h", 1)))
        if not ok:
            err(f"{ctx}: trigger {t['id']} has no reachable walkable tile")
        if t["event"] not in cutscenes:
            err(f"{ctx}: trigger {t['id']} missing cutscene '{t['event']}'")
    for g in m.get("enc", {}).get("groups", []):
        for eid in g:
            if eid not in enemies:
                err(f"{ctx}: enc enemy '{eid}' missing")
    if m.get("enc") and not any(ch in "".join(rows) for ch in ",;w"):
        warn(f"{ctx}: enc table but no hostile tiles")
    if "+" not in "".join(rows):
        warn(f"{ctx}: no shrine (+) checkpoint")

# ---------------- cross-reference checks ----------------
for eid, e in enemies.items():
    sprite_ok(e.get("sprite", eid), f"enemy {eid}")
    for d in e.get("drops", []):
        if d["id"] not in items:
            err(f"enemy {eid}: unknown drop item {d['id']}")
for sid, s in shops.items():
    for iid in s.get("items", []):
        if iid not in items:
            err(f"shop {sid}: unknown item {iid}")
for qid, q in quests.items():
    st = q["stages"][0]
    if st["type"] == "kill" and st["target"] not in enemies:
        err(f"quest {qid}: kill target '{st['target']}' missing")
    if st["type"] == "item" and st["target"] not in items:
        err(f"quest {qid}: item target '{st['target']}' missing")
    for entry in q.get("reward", {}).get("items", []):
        if entry["id"] not in items:
            err(f"quest {qid}: reward item '{entry['id']}' missing")
    giver_found = any(n.get("quest") == qid for m in maps.values() for n in m.get("npcs", []))
    if not giver_found:
        err(f"quest {qid}: no giver NPC on any map")
for cid, c in companions.items():
    sprite_ok(c.get("sprite", ""), f"companion {cid}")
    if c.get("type") not in banks:
        err(f"companion {cid}: archetype '{c.get('type')}' has no dialogue bank")
for wid, w in worlds.items():
    if w.get("start", {}).get("map") not in maps:
        err(f"world {wid}: start map missing")
    intro = w.get("intro", "")
    if intro and intro not in cutscenes:
        err(f"world {wid}: intro cutscene '{intro}' missing")

# cutscene step integrity
for cid, steps in cutscenes.items():
    for i, s in enumerate(steps):
        sctx = f"cutscene {cid}[{i}]"
        if "battle" in s:
            for eid in s["battle"].get("enemies", []):
                if eid not in enemies:
                    err(f"{sctx}: unknown enemy '{eid}'")
            party = s["battle"].get("party", "")
            if party and party not in ("samurai", "business", "cyber"):
                err(f"{sctx}: bad party '{party}'")
        if "give" in s and s["give"]["item"] not in items:
            err(f"{sctx}: unknown item '{s['give']['item']}'")
        if "tp" in s and s["tp"]["map"] not in maps:
            err(f"{sctx}: unknown map '{s['tp']['map']}'")
        for line in s.get("say", []):
            p = line.get("portrait", "")
            if p and p not in sprites:
                err(f"{sctx}: unknown portrait '{p}'")

# ---------------- res:// path checks (.tscn + load() in .gd) ----------------
res_re = re.compile(r'res://[A-Za-z0-9_/.\-]+')
for base, _dirs, files in os.walk(ROOT):
    if any(part in base for part in (".git", "web-prototype", ".godot")):
        continue
    for fn in files:
        if not (fn.endswith(".tscn") or fn.endswith(".gd") or fn == "project.godot"):
            continue
        path = os.path.join(base, fn)
        with open(path) as f:
            text = f.read()
        for ref in res_re.findall(text):
            rel = ref[len("res://"):]
            # dynamic sprite/audio paths are constructed with %s — skip patterns
            if "%s" % "" and "%s" in rel:
                continue
            if "%s" in rel or "%d" in rel:
                continue
            target = os.path.join(ROOT, rel)
            if not os.path.exists(target):
                err(f"{os.path.relpath(path, ROOT)}: broken res path {ref}")

print(f"maps: {len(maps)}  cutscenes: {len(cutscenes)}  enemies: {len(enemies)}  items: {len(items)}")
for w in warns:
    print("  warn :", w)
for e in errors:
    print("  ERROR:", e)
print(f"\n{len(errors)} error(s), {len(warns)} warning(s)")
sys.exit(1 if errors else 0)
