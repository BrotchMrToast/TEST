#!/usr/bin/env python3
"""TRINITY RIFT asset generator.

Generates ALL game art and audio procedurally (no downloaded assets):
  assets/generated/sprites/<name>.png     3 frames x 3 dirs sheet (96x144, 32x48 frames)
  assets/generated/portraits/<name>.png   80x80 dialogue portrait
  assets/generated/tiles/<theme>.png      ground tile atlas (3 variants x 12 kinds)
  assets/generated/features/<theme>.png   solid feature sprites (15 cells of 32x64)
  assets/generated/backdrops/<name>.png   960x540 battle backdrops
  assets/generated/audio/*.wav            chiptune theme loops + sfx bank

Run: python3 tools/gen_assets.py
Deterministic: seeded RNG everywhere; re-running produces identical files.
"""
import json
import math
import os
import random
import struct
import wave

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "generated")


def col(c, alpha=255):
    """Parse '#rgb', '#rrggbb' or (r,g,b[,a]) into an RGBA tuple."""
    if isinstance(c, tuple):
        return c if len(c) == 4 else (*c, alpha)
    c = c.strip()
    if c.startswith("#"):
        h = c[1:]
        if len(h) == 3:
            h = "".join(ch * 2 for ch in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        return (r, g, b, alpha)
    raise ValueError("bad color " + c)


class Px:
    """Tiny pixel painter with alpha blending."""

    def __init__(self, w, h):
        self.img = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    def rect(self, x, y, w, h, c, a=255):
        if w <= 0 or h <= 0:
            return
        c = col(c, a)
        if c[3] >= 255:
            d = ImageDraw.Draw(self.img)
            d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)
        else:
            ov = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
            ImageDraw.Draw(ov).rectangle([x, y, x + w - 1, y + h - 1], fill=c)
            self.img = Image.alpha_composite(self.img, ov)

    def px(self, x, y, c, a=255):
        self.rect(x, y, 1, 1, c, a)

    def ellipse(self, cx, cy, rx, ry, c, a=255):
        c = col(c, a)
        ov = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
        ImageDraw.Draw(ov).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)
        self.img = Image.alpha_composite(self.img, ov)

    def scaled(self, k):
        return self.img.resize((self.img.width * k, self.img.height * k), Image.NEAREST)


# ============================================================
# HUMANOID sprites (port of the JS generator, 16x24 base grid)
# ============================================================
def draw_humanoid(p, o, direction, frame):
    skin = o.get("skin", "#e8b88a")
    hair = o.get("hair", "#222222")
    top = o.get("top", "#555566")
    bottom = o.get("bottom", "#333344")
    shoe = o.get("shoe", "#221111")
    eye = o.get("eye", "#181820")
    leg = 1 if frame == 1 else (-1 if frame == 2 else 0)
    # legs
    if direction == "side":
        p.rect(6 + leg, 18, 2, 5, bottom)
        p.rect(8 - leg, 18, 2, 5, bottom)
        p.rect(6 + leg, 22, 3, 2, shoe)
        p.rect(8 - leg, 22, 3, 2, shoe)
    else:
        p.rect(5, 18, 2, 5, bottom)
        p.rect(9, 18, 2, 5, bottom)
        p.rect(5, 22 + (-1 if leg > 0 else 0), 2, 2, shoe)
        p.rect(9, 22 + (-1 if leg < 0 else 0), 2, 2, shoe)
    # torso
    belt = o.get("belt")
    if direction == "side":
        p.rect(5, 10, 6, 8, top)
        p.rect(5, 15, 6, 1, belt if belt else "#000000", 255 if belt else 90)
        p.rect(6 + leg, 11, 2, 5, top)
        p.rect(6 + leg, 15, 2, 2, skin)
    else:
        p.rect(4, 10, 8, 8, top)
        p.rect(4, 15, 8, 1, belt if belt else "#000000", 255 if belt else 90)
        p.rect(3, 11, 1, 5, top)
        p.rect(12, 11, 1, 5, top)
        p.rect(3, 15 + leg, 1, 2, skin)
        p.rect(12, 15 - leg, 1, 2, skin)
        if o.get("tie") and direction == "down":
            p.rect(7, 11, 2, 4, o["tie"])
        if o.get("lapel") and direction == "down":
            p.rect(5, 10, 1, 4, "#ffffff")
            p.rect(10, 10, 1, 4, "#ffffff")
    # head
    hx, hy = 4, 2
    p.rect(hx, hy + 2, 8, 6, skin)
    if direction == "up":
        p.rect(hx, hy, 8, 7, hair)
    else:
        p.rect(hx, hy, 8, 3, hair)
        p.rect(hx, hy + 3, 1, 2, hair)
        p.rect(hx + 7, hy + 3, 1, 2, hair)
        if o.get("longHair"):
            p.rect(hx - 1, hy + 2, 1, 6, hair)
            p.rect(hx + 8, hy + 2, 1, 6, hair)
        if direction == "down":
            p.px(hx + 2, hy + 4, eye)
            p.px(hx + 5, hy + 4, eye)
            if o.get("scar"):
                p.px(hx + 5, hy + 5, "#aa3333")
        else:
            p.px(hx + 5, hy + 4, eye)
            if o.get("scar"):
                p.px(hx + 5, hy + 5, "#aa3333")
        if o.get("beard"):
            p.rect(hx + 1, hy + 6, 6, 2, hair)
    if o.get("topknot"):
        p.rect(hx + 3, hy - 1, 2, 2, hair)
    # headgear
    hc = o.get("hatColor", "#333322")
    hat = o.get("hat")
    if hat == "kasa":
        p.rect(hx - 2, hy + 1, 12, 1, hc)
        p.rect(hx, hy - 1, 8, 2, hc)
        p.rect(hx + 2, hy - 2, 4, 1, hc)
    elif hat == "fedora":
        p.rect(hx - 1, hy + 1, 10, 1, hc)
        p.rect(hx + 1, hy - 1, 6, 2, hc)
    elif hat == "visor":
        p.rect(hx, hy + 3, 8, 2, hc)
        if direction != "up":
            p.px(hx + 2, hy + 4, "#77ffff")
            p.px(hx + 5, hy + 4, "#77ffff")
    elif hat == "hood":
        p.rect(hx - 1, hy - 1, 10, 4, hc)
        p.rect(hx - 1, hy + 2, 2, 5, hc)
        p.rect(hx + 7, hy + 2, 2, 5, hc)
    elif hat == "headband":
        p.rect(hx, hy + 2, 8, 1, hc)
    elif hat == "cap":
        p.rect(hx, hy, 8, 2, hc)
        p.rect(hx + (-2 if direction == "up" else 6), hy + 1, 4, 1, hc)
    elif hat == "crown":
        p.rect(hx + 1, hy - 1, 6, 1, "#ffdd44")
        for dx in (1, 4, 6):
            p.px(hx + dx, hy - 2, "#ffdd44")
    elif hat == "oni":
        p.rect(hx - 1, hy + 3, 10, 3, hc)
        p.rect(hx + 1, hy - 2, 1, 2, "#eeeeee")
        p.rect(hx + 6, hy - 2, 1, 2, "#eeeeee")
    elif hat == "halo":
        p.rect(hx + 1, hy - 3, 6, 1, "#ffe98a")
    # gear
    gc = o.get("gearColor", "#888899")
    gear = o.get("gear")
    if gear == "katana":
        if direction == "down":
            p.rect(12, 12, 1, 6, gc)
        else:
            for i in range(7):
                p.px(11 - i, 9 + i, gc)
    elif gear == "case":
        p.rect(10 if direction == "side" else 12, 15, 3, 4, gc)
    elif gear == "gun":
        p.rect(9 if direction == "side" else 12, 14, 3, 2, gc)
    elif gear == "staff":
        p.rect(13, 6, 1, 14, gc)
        p.px(13, 5, "#88ffff")


def humanoid_sheet(o):
    sheet = Image.new("RGBA", (96, 144), (0, 0, 0, 0))
    for row, direction in enumerate(["down", "up", "side"]):
        for f in range(3):
            p = Px(16, 24)
            draw_humanoid(p, o, direction, f)
            sheet.paste(p.scaled(2), (f * 32, row * 48))
    return sheet


def portrait(o):
    p = Px(20, 20)
    skin = o.get("skin", "#e8b88a")
    hair = o.get("hair", "#222222")
    p.rect(4, 5, 12, 11, skin)
    p.rect(4, 2, 12, 5, hair)
    p.rect(3, 4, 2, 6, hair)
    p.rect(15, 4, 2, 6, hair)
    if o.get("longHair"):
        p.rect(3, 4, 2, 12, hair)
        p.rect(15, 4, 2, 12, hair)
    p.rect(7, 9, 2, 2, o.get("eye", "#181820"))
    p.rect(12, 9, 2, 2, o.get("eye", "#181820"))
    p.px(7, 9, "#ffffff")
    p.px(12, 9, "#ffffff")
    p.rect(8, 13, 4, 1, "#000000", 100)
    if o.get("scar"):
        for x, y in ((12, 8), (13, 11), (12, 12)):
            p.px(x, y, "#aa3333")
    if o.get("beard"):
        p.rect(6, 13, 8, 3, hair)
    hc = o.get("hatColor", "#333322")
    hat = o.get("hat")
    if hat == "kasa":
        p.rect(1, 3, 18, 2, hc)
        p.rect(5, 1, 10, 2, hc)
    elif hat == "fedora":
        p.rect(2, 3, 16, 2, hc)
        p.rect(5, 0, 10, 3, hc)
    elif hat == "visor":
        p.rect(4, 8, 12, 3, hc)
        p.rect(6, 9, 2, 1, "#77ffff")
        p.rect(12, 9, 2, 1, "#77ffff")
    elif hat == "hood":
        p.rect(2, 1, 16, 5, hc)
        p.rect(2, 4, 3, 10, hc)
        p.rect(15, 4, 3, 10, hc)
    elif hat == "headband":
        p.rect(4, 6, 12, 2, hc)
    elif hat == "cap":
        p.rect(3, 2, 14, 3, hc)
    elif hat == "crown":
        p.rect(5, 0, 10, 2, "#ffdd44")
    elif hat in ("horns", "oni"):
        p.rect(3, 0, 2, 3, "#eeeedd")
        p.rect(15, 0, 2, 3, "#eeeedd")
    elif hat == "halo":
        p.rect(5, 0, 10, 1, "#ffe98a")
    if o.get("topknot"):
        p.rect(8, 0, 4, 2, hair)
    return p.scaled(4)


# ============================================================
# BEAST / BLOB / MECH / DEMON (side-view; sheet has 3 identical rows
# so the same region math works for every sprite kind)
# ============================================================
def beast_frame(o, f):
    p = Px(24, 16)
    c = o.get("col", "#786058")
    d = o.get("dark", "#4a3a34")
    p.rect(4, 5, 14, 6, c)
    p.rect(15, 2, 6, 6, c)
    p.rect(15, 1, 2, 2, d)
    p.rect(19, 1, 2, 2, d)
    p.px(19, 4, o.get("eye", "#ff3333"))
    p.rect(20, 6, 2, 2, d)
    l = 0 if f == 0 else 1
    for x in (5 + l, 10 - l, 13 + l, 16 - l):
        p.rect(x, 11, 2, 4, d)
    p.rect(1, 4, 4, 2, d)
    if o.get("spikes"):
        for x in range(5, 17, 3):
            p.px(x, 4, "#dddddd")
    if o.get("cyber"):
        p.rect(16, 3, 4, 1, "#00ffff")
        p.px(6, 6, "#00ffff")
        p.px(10, 7, "#00ffff")
    return p.scaled(2)


def blob_frame(o, f):
    p = Px(20, 20)
    c = o.get("col", "#7a5a9a")
    d = o.get("dark", "#4a3560")
    sq = 0 if f == 0 else 1
    p.rect(3, 6 + sq, 14, 12 - sq, c)
    p.rect(4, 4 + sq, 12, 3, c)
    p.rect(2, 10, 16, 5, c)
    p.rect(6, 9 + sq, 2, 3, o.get("eye", "#ffff44"))
    p.rect(12, 9 + sq, 2, 3, o.get("eye", "#ffff44"))
    p.rect(8, 14, 4, 2, d)
    if o.get("spikes"):
        for x, y in ((4, 3 + sq), (9, 2 + sq), (15, 3 + sq)):
            p.px(x, y, d)
    if o.get("ghost"):
        for x in range(3, 17, 3):
            p.rect(x, 17, 2, 2, c)
    if o.get("drip"):
        p.px(5, 18, d)
        p.px(13, 19, d)
    return p.scaled(2)


def mech_frame(o, f):
    p = Px(20, 20)
    c = o.get("col", "#5a6470")
    d = o.get("dark", "#333a44")
    g = o.get("glow", "#00ffff")
    hov = 0 if f == 0 else 1
    if o.get("fly"):
        p.rect(4, 5 + hov, 12, 8, c)
        p.rect(2, 7 + hov, 2, 3, d)
        p.rect(16, 7 + hov, 2, 3, d)
        p.rect(7, 8 + hov, 6, 2, g)
        p.rect(5, 13 + hov, 2, 2, g)
        p.rect(13, 13 + hov, 2, 2, g)
    else:
        p.rect(5, 4, 10, 9, c)
        p.rect(7, 6, 6, 3, g)
        p.rect(4, 13, 4, 6 - hov, d)
        p.rect(12, 13, 4, 6, d)
        p.rect(2, 6, 3, 5, d)
        p.rect(15, 6, 3, 5, d)
        if o.get("cannon"):
            p.rect(15, 7, 5, 2, d)
    if o.get("antenna"):
        p.rect(9, 1, 1, 3 + hov, d)
        p.px(9, hov, "#ff4444")
    return p.scaled(2)


def demon_frame(o, f):
    p = Px(40, 40)
    c = o.get("col", "#3a1030")
    d = o.get("dark", "#1a0518")
    g = o.get("glow", "#ff33aa")
    br = 0 if f == 0 else 1
    p.rect(8, 10, 24, 24, c)
    p.rect(12, 2, 16, 12, c)
    p.rect(10, 0, 3, 5, "#ddccc0")
    p.rect(27, 0, 3, 5, "#ddccc0")
    p.rect(15, 6 + br, 3, 3, g)
    p.rect(22, 6 + br, 3, 3, g)
    p.rect(16, 11, 8, 2, d)
    p.rect(2, 12, 6, 16, c)
    p.rect(32, 12, 6, 16, c)
    p.rect(1, 26, 7, 4, d)
    p.rect(32, 26, 7, 4, d)
    p.rect(14, 18 + br, 12, 3, g)
    p.rect(17, 15, 6, 9, d)
    p.rect(10, 34, 8, 6, d)
    p.rect(22, 34, 8, 6, d)
    for i in range(6):
        p.px(8 + i * 4, 33 + (i % 2), g)
    return p.scaled(2)


def creature_sheet(kind, o):
    fns = {"beast": beast_frame, "blob": blob_frame, "mech": mech_frame, "demon": demon_frame}
    frames = [fns[kind](o, f % 2) for f in range(3)]
    fw, fh = frames[0].width, frames[0].height
    sheet = Image.new("RGBA", (fw * 3, fh * 3), (0, 0, 0, 0))
    for row in range(3):
        for f in range(3):
            img = frames[f]
            if row == 1:  # "up" row: flipped for variety
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
            sheet.paste(img, (f * fw, row * fh))
    return sheet


def creature_portrait(kind, o):
    frame = {"beast": beast_frame, "blob": blob_frame, "mech": mech_frame, "demon": demon_frame}[kind](o, 0)
    out = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
    k = min(80 // frame.width, 80 // frame.height)
    if k < 1:
        k = 1
    img = frame.resize((frame.width * k, frame.height * k), Image.NEAREST)
    img = img.crop((0, 0, min(80, img.width), min(80, img.height)))
    out.paste(img, ((80 - img.width) // 2, (80 - img.height) // 2))
    return out


# ============================================================
# TILES + FEATURES per theme
# ============================================================
THEMES = {
    "sengoku": {"floor": ["#4c6136", "#50663a", "#485c34"], "hostile": ["#3d4f2c", "#42552f"],
                "path": ["#8a7358", "#937c60"], "wall": ["#4d4a52", "#565360"], "wallTop": "#6a6675",
                "water": ["#2a4a5e", "#2e5268"], "tree": "#2e4424", "trunk": "#4a3520",
                "house": "#5a4632", "roof": "#7a3030", "sand": ["#8a7a5a", "#94845f"],
                "dirt": ["#5c4a38", "#63503c"], "accent": "#c43a3a"},
    "tokyo": {"floor": ["#585c64", "#5c6068", "#54585f"], "hostile": ["#494c53", "#4d5057"],
              "path": ["#3c3f46", "#42454c"], "wall": ["#33363e", "#3a3d45"], "wallTop": "#4c505b",
              "water": ["#1e3448", "#223a50"], "tree": "#3a5a34", "trunk": "#4a3a28",
              "house": "#4e5460", "roof": "#333a48", "sand": ["#8a8272", "#948b79"],
              "dirt": ["#55503f", "#5b5644"], "accent": "#3a7bc4"},
    "rural": {"floor": ["#557038", "#5a763c", "#516b35"], "hostile": ["#46592e", "#4b5f31"],
              "path": ["#93825d", "#9c8b64"], "wall": ["#5c5a52", "#63615a"], "wallTop": "#75736a",
              "water": ["#2c5464", "#305c6e"], "tree": "#31572a", "trunk": "#4d3b24",
              "house": "#6a5a42", "roof": "#5a6a7a", "sand": ["#9a8a68", "#a4936f"],
              "dirt": ["#5e4e3a", "#65543f"], "accent": "#3a7bc4"},
    "cyber": {"floor": ["#2a2438", "#2e2840", "#262032"], "hostile": ["#221c30", "#261f36"],
              "path": ["#3a3450", "#403a58"], "wall": ["#1a1626", "#201a2e"], "wallTop": "#332c48",
              "water": ["#101c3a", "#142244"], "tree": "#1c3a3a", "trunk": "#2a2a3a",
              "house": "#252035", "roof": "#181425", "sand": ["#6a5a48", "#73624e"],
              "dirt": ["#463a30", "#4c4034"], "accent": "#00e5c9"},
    "desert": {"floor": ["#9a7a52", "#a28258", "#93744d"], "hostile": ["#8a6c46", "#91724a"],
               "path": ["#b09468", "#b89c6e"], "wall": ["#6a5238", "#71583c"], "wallTop": "#83694a",
               "water": ["#2a5a6a", "#2e6274"], "tree": "#4a5a2a", "trunk": "#5a4a2a",
               "house": "#7a5f40", "roof": "#8a4a2a", "sand": ["#b0906a", "#b89870"],
               "dirt": ["#8a6a48", "#91704c"], "accent": "#ff9a3c"},
    "rift": {"floor": ["#241a3a", "#2a1f44", "#1f1633"], "hostile": ["#1c1430", "#211838"],
             "path": ["#3c2c5e", "#443368"], "wall": ["#120c20", "#171028"], "wallTop": "#2c2246",
             "water": ["#3a1050", "#44145e"], "tree": "#2a1a44", "trunk": "#1e1430",
             "house": "#2a2040", "roof": "#1a1230", "sand": ["#4a3a5a", "#524062"],
             "dirt": ["#332a44", "#39304b"], "accent": "#c86bff"},
}

# ground tile atlas rows (legend handled by the game's map loader)
GROUND_KINDS = ["floor", "hostile", "path", "dirt", "sand", "water_a", "water_b",
                "wall", "void", "swamp", "neon", "mountain"]


def gen_tiles(theme):
    P = THEMES[theme]
    rng = random.Random(hash(theme) & 0xFFFF)
    img = Image.new("RGBA", (32 * 3, 32 * len(GROUND_KINDS)), (0, 0, 0, 0))
    for row, kind in enumerate(GROUND_KINDS):
        for v in range(3):
            p = Px(32, 32)
            base = P["floor"][v % len(P["floor"])]
            if kind == "floor":
                p.rect(0, 0, 32, 32, base)
                for _ in range(2):
                    p.rect(rng.randint(4, 26), rng.randint(4, 26), 2, 2, "#ffffff", 14)
            elif kind == "hostile":
                p.rect(0, 0, 32, 32, P["hostile"][v % 2])
                for _ in range(4):
                    p.rect(rng.randint(2, 28), rng.randint(2, 24), 2, 6, "#000000", 42)
            elif kind == "path":
                p.rect(0, 0, 32, 32, P["path"][v % 2])
                if v == 2:
                    p.rect(rng.randint(4, 22), rng.randint(4, 24), 5, 3, "#000000", 28)
            elif kind == "dirt":
                p.rect(0, 0, 32, 32, P["dirt"][v % 2])
            elif kind == "sand":
                p.rect(0, 0, 32, 32, P["sand"][v % 2])
                if v == 1:
                    p.rect(rng.randint(2, 24), rng.randint(4, 26), 4, 2, "#000000", 24)
            elif kind == "water_a":
                p.rect(0, 0, 32, 32, P["water"][0])
                p.rect(6, 8 + v * 7, 12, 2, "#ffffff", 30)
            elif kind == "water_b":
                p.rect(0, 0, 32, 32, P["water"][1])
                p.rect(12, 6 + v * 8, 12, 2, "#ffffff", 30)
            elif kind == "wall":
                p.rect(0, 0, 32, 32, P["wall"][v % 2])
                p.rect(0, 0, 32, 6, P["wallTop"])
                p.rect(0, 28, 32, 4, "#000000", 64)
            elif kind == "void":
                p.rect(0, 0, 32, 32, "#050308")
                if v == 1:
                    p.rect(rng.randint(2, 28), rng.randint(2, 28), 2, 2, "#3a2a5a")
            elif kind == "swamp":
                p.rect(0, 0, 32, 32, "#3a4432")
                for _ in range(3):
                    p.rect(rng.randint(0, 24), rng.randint(0, 24), 8, 5, "#2c3626")
                if v == 2:
                    p.rect(rng.randint(0, 20), rng.randint(0, 20), 10, 8, "#782828", 64)
            elif kind == "neon":
                p.rect(0, 0, 32, 32, base)
                p.rect(0, 0, 32, 32, "#00e5c9", 30)
                if v > 0:
                    p.rect(2, 30, 28, 2, ["#00e5c9", "#ff2d95", "#c86bff"][v])
            elif kind == "mountain":
                p.rect(0, 0, 32, 32, P["wall"][v % 2])
                p.rect(0, 0, 32, 6, P["wallTop"])
                p.rect(4, 2, 8, 3, "#ffffff", 36)
                p.rect(0, 28, 32, 4, "#000000", 64)
            img.paste(p.img, (v * 32, row * 32))
    return img


FEATURE_KINDS = ["tree", "deadtree", "bamboo", "rock", "pillar", "fence", "house", "hirise",
                 "counter", "shrine_a", "shrine_b", "chest_closed", "chest_open", "flowers", "crack"]


def gen_features(theme):
    P = THEMES[theme]
    rng = random.Random(hash(theme + "f") & 0xFFFF)
    img = Image.new("RGBA", (32 * len(FEATURE_KINDS), 64), (0, 0, 0, 0))
    for i, kind in enumerate(FEATURE_KINDS):
        p = Px(32, 64)
        if kind == "tree":
            p.rect(13, 46, 6, 16, P["trunk"])
            p.ellipse(16, 30, 14, 14, P["tree"])
            p.ellipse(8, 38, 9, 9, P["tree"])
            p.ellipse(24, 38, 9, 9, P["tree"])
            p.ellipse(12, 26, 6, 6, "#ffffff", 26)
        elif kind == "deadtree":
            p.rect(14, 20, 4, 42, P["trunk"])
            p.rect(6, 28, 10, 3, P["trunk"])
            p.rect(16, 22, 10, 3, P["trunk"])
            p.rect(22, 14, 3, 10, P["trunk"])
        elif kind == "bamboo":
            for bx in (6, 15, 24):
                g = "#5a8a3a" if rng.random() < 0.5 else "#3e6428"
                p.rect(bx, 4, 4, 58, g)
                for sy in range(8, 60, 10):
                    p.rect(bx, sy, 4, 2, "#000000", 66)
        elif kind == "rock":
            p.ellipse(16, 50, 12, 10, P["wall"][0])
            p.ellipse(12, 46, 4, 3, "#ffffff", 40)
        elif kind == "pillar":
            p.rect(10, 12, 12, 50, P["wall"][1])
            p.rect(7, 6, 18, 12, P["wallTop"])
        elif kind == "fence":
            p.rect(0, 44, 32, 4, P["trunk"])
            p.rect(4, 40, 4, 14, P["trunk"])
            p.rect(22, 40, 4, 14, P["trunk"])
        elif kind == "house":
            p.rect(2, 30, 28, 32, P["house"])
            p.rect(0, 18, 32, 16, P["roof"])
            p.rect(0, 18, 32, 3, "#ffffff", 28)
            p.rect(12, 44, 8, 18, P["trunk"])
            p.rect(5, 36, 6, 7, "#f5d789")
        elif kind == "hirise":
            p.rect(2, 0, 28, 62, P["roof"])
            for wy in range(5):
                for wx in range(3):
                    if rng.random() < 0.6:
                        cc = "#ffe98a" if rng.random() < 0.5 else ("#00e5c9" if theme == "cyber" else "#cfe4ff")
                        p.rect(6 + wx * 8, 5 + wy * 11, 5, 7, cc)
        elif kind == "counter":
            p.rect(0, 32, 32, 30, P["house"])
            p.rect(0, 32, 32, 8, "#ffffff", 34)
        elif kind in ("shrine_a", "shrine_b"):
            glow = 200 if kind == "shrine_a" else 90
            p.rect(10, 34, 12, 26, P["wall"][0])
            p.rect(7, 28, 18, 8, P["wallTop"])
            p.rect(13, 42, 6, 8, "#ffe98a", glow)
        elif kind == "chest_closed":
            p.rect(2, 42, 28, 18, "#7a5230")
            p.rect(2, 38, 28, 6, "#8f6238")
            p.rect(14, 46, 4, 6, "#ffd23e")
            p.rect(0, 42, 2, 18, "#4a3018")
            p.rect(30, 42, 2, 18, "#4a3018")
        elif kind == "chest_open":
            p.rect(2, 42, 28, 18, "#7a5230")
            p.rect(2, 30, 28, 6, "#5a3a20")
            p.rect(14, 46, 4, 6, "#4a3018")
            p.rect(0, 42, 2, 18, "#4a3018")
            p.rect(30, 42, 2, 18, "#4a3018")
        elif kind == "flowers":
            for _ in range(4):
                cc = rng.choice(["#e8a0b8", "#f0d060", "#d8e8f0"])
                p.rect(rng.randint(4, 26), rng.randint(40, 58), 3, 3, cc)
        elif kind == "crack":
            x, y = 6, 58
            for _ in range(5):
                nx, ny = x + rng.randint(2, 8), y - rng.randint(6, 12)
                for t in range(8):
                    px_ = int(x + (nx - x) * t / 8)
                    py_ = int(y + (ny - y) * t / 8)
                    p.rect(px_, py_, 2, 2, P["accent"])
                x, y = nx, ny
        img.paste(p.img, (i * 32, 0))
    return img


# ============================================================
# BATTLE BACKDROPS (960x540 ports of the JS painters)
# ============================================================
def vgrad(d, w, h, c1, c2, y0=0, y1=None):
    y1 = h if y1 is None else y1
    a, b = col(c1), col(c2)
    for y in range(y0, y1):
        t = (y - y0) / max(1, (y1 - y0 - 1))
        cc = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)
        d.rectangle([0, y, w, y + 1], fill=cc)


def silhouette(d, rng, color, base_y, min_h, max_h, w1, w2, gap, W=960):
    x = -20
    while x < W + 20:
        w = w1 + rng.random() * w2
        h = min_h + rng.random() * (max_h - min_h)
        d.rectangle([x, base_y - h, x + w, base_y], fill=col(color))
        x += w + rng.random() * gap


def gen_backdrop(name):
    W, H = 960, 540
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    rng = random.Random(hash(name) & 0xFFFF)

    def ground(c, y=380):
        d.rectangle([0, y, W, H], fill=col(c))

    if name == "ashvillage":
        vgrad(d, W, H, "#3a2626", "#6a4438")
        silhouette(d, rng, "#241a1a", 380, 60, 160, 60, 80, 30)
        ground("#403028", 380)
        for _ in range(30):
            x, y = rng.random() * W, rng.random() * 300
            d.rectangle([x, y, x + 2, y + 2], fill=(200, 90, 50, 255))
    elif name == "bamboo":
        vgrad(d, W, H, "#1c2e1c", "#3a5a34")
        for _ in range(26):
            x = rng.random() * W
            g = (40 + int(rng.random() * 40), 90 + int(rng.random() * 50), 40, 255)
            d.rectangle([x, 0, x + 10 + rng.random() * 8, 420], fill=g)
        ground("#2c4426", 400)
    elif name == "street":
        vgrad(d, W, H, "#141824", "#3a4258")
        silhouette(d, rng, "#0e1220", 380, 140, 300, 70, 90, 20)
        for _ in range(60):
            x, y = rng.random() * W, 100 + rng.random() * 260
            d.rectangle([x, y, x + 3, y + 3], fill=(255, 233, 138, 255))
        ground("#2e3240", 380)
        d.rectangle([0, 420, W, 428], fill=col("#22252f"))
    elif name == "office":
        vgrad(d, W, H, "#2c3140", "#4a5264")
        for i in range(5):
            d.rectangle([60 + i * 180, 60, 180 + i * 180, 320], fill=(180, 200, 230, 40))
        ground("#3a4050", 380)
    elif name == "rural":
        vgrad(d, W, H, "#7ba4c4", "#cfe0d8")
        silhouette(d, rng, "#5a7a94", 320, 60, 140, 140, 160, 0)
        silhouette(d, rng, "#48705a", 380, 40, 90, 100, 140, 20)
        ground("#5d7a44", 380)
    elif name == "docks":
        vgrad(d, W, H, "#101828", "#2c3a50")
        d.rectangle([0, 330, W, 390], fill=col("#0c1420"))
        silhouette(d, rng, "#141c2c", 330, 60, 150, 100, 200, 40)
        ground("#2a3040", 390)
        for _ in range(20):
            x, y = rng.random() * W, 340 + rng.random() * 40
            d.rectangle([x, y, x + 30, y + 2], fill=(120, 200, 255, 60))
    elif name == "neon":
        vgrad(d, W, H, "#0c0818", "#2a1440")
        silhouette(d, rng, "#080614", 400, 160, 330, 60, 80, 10)
        for _ in range(80):
            cc = rng.choice(["#00e5c9", "#ff2d95", "#c86bff", "#ffe98a"])
            x, y = rng.random() * W, 80 + rng.random() * 300
            d.rectangle([x, y, x + 3, y + 3], fill=col(cc))
        ground("#181228", 400)
    elif name == "desert":
        vgrad(d, W, H, "#c47840", "#e8b070")
        silhouette(d, rng, "#8a5430", 340, 60, 160, 160, 200, 0)
        ground("#a5794c", 380)
        d.ellipse([-20, 280, 420, 720], fill=col("#b8865a"))
    elif name == "under":
        vgrad(d, W, H, "#0a0c12", "#1e2430")
        for i in range(8):
            d.rectangle([i * 130, 0, i * 130 + 30, 400], fill=col("#141820"))
        for _ in range(12):
            x, y = rng.random() * W, rng.random() * 340
            d.rectangle([x, y, x + 20, y + 3], fill=(0, 229, 201, 64))
        ground("#181c26", 390)
    elif name == "citadel":
        vgrad(d, W, H, "#141024", "#302050")
        d.rectangle([330, 60, 630, 390], fill=col("#0e0a1c"))
        d.rectangle([410, 20, 550, 80], fill=col("#0e0a1c"))
        for _ in range(20):
            x, y = 350 + rng.random() * 260, 80 + rng.random() * 280
            d.rectangle([x, y, x + 5, y + 5], fill=(200, 107, 255, 100))
        ground("#221a38", 390)
    elif name == "castle":
        vgrad(d, W, H, "#2c2434", "#544458")
        silhouette(d, rng, "#1e1828", 390, 100, 240, 100, 120, 60)
        d.rectangle([370, 90, 590, 390], fill=col("#302838"))
        d.rectangle([340, 70, 620, 110], fill=col("#241e2e"))
        ground("#3c3444", 390)
    elif name == "marsh":
        vgrad(d, W, H, "#26301e", "#48543a")
        silhouette(d, rng, "#1a2214", 380, 30, 90, 90, 100, 40)
        ground("#333e28", 380)
        d.rectangle([0, 340, W, 400], fill=(150, 30, 30, 50))
    elif name == "fortress":
        vgrad(d, W, H, "#1a1420", "#4a2430")
        silhouette(d, rng, "#120e18", 400, 150, 300, 130, 140, 20)
        for _ in range(14):
            x, y = rng.random() * W, 180 + rng.random() * 200
            d.rectangle([x, y, x + 4, y + 8], fill=(255, 80, 40, 80))
        ground("#2c1e26", 400)
    elif name == "arena":
        vgrad(d, W, H, "#180a20", "#401454")
        d.ellipse([240, -40, 720, 440], fill=(255, 60, 120, 50))
        silhouette(d, rng, "#0e0616", 400, 80, 200, 90, 110, 30)
        ground("#241030", 390)
        for _ in range(40):
            x, y = rng.random() * W, rng.random() * 200
            d.rectangle([x, y, x + 2, y + 2], fill=(255, 233, 138, 130))
    else:  # rift & default
        vgrad(d, W, H, "#0c0618", "#2a1048")
        for _ in range(8):
            x, y = rng.random() * W, rng.random() * 300
            pts = [(x, y)]
            for _ in range(4):
                x += (rng.random() - 0.5) * 160
                y += rng.random() * 60
                pts.append((x, y))
            d.line(pts, fill=(200, 107, 255, 140), width=3)
        d.ellipse([330, 30, 630, 330], fill=(200, 107, 255, 40))
        ground("#1a1230", 390)
    return img


# ============================================================
# AUDIO: chiptune theme loops + SFX (16-bit mono WAV)
# ============================================================
SR = 22050

AUDIO_THEMES = {
    "title":   {"bpm": 66, "root": 52, "scale": [0, 3, 5, 7, 10, 12, 15], "bass": "sine", "lead": "tri", "perc": None, "density": 0.35},
    "samurai": {"bpm": 76, "root": 57, "scale": [0, 2, 3, 7, 8, 12, 14, 15], "bass": "tri", "lead": "tri", "perc": "taiko", "density": 0.5},
    "business": {"bpm": 104, "root": 60, "scale": [0, 2, 4, 7, 9, 11, 12, 14], "bass": "sine", "lead": "sq", "perc": "kit", "density": 0.65},
    "cyber":   {"bpm": 122, "root": 45, "scale": [0, 3, 5, 7, 10, 12, 15, 17], "bass": "saw", "lead": "saw", "perc": "kit", "density": 0.8},
    "battle":  {"bpm": 140, "root": 50, "scale": [0, 2, 3, 5, 7, 8, 11, 12], "bass": "saw", "lead": "sq", "perc": "kit", "density": 0.9},
    "boss":    {"bpm": 150, "root": 43, "scale": [0, 1, 4, 5, 7, 8, 11, 12], "bass": "saw", "lead": "saw", "perc": "kit", "density": 1.0},
    "rift":    {"bpm": 60, "root": 49, "scale": [0, 1, 5, 6, 10, 12, 13], "bass": "sine", "lead": "sine", "perc": None, "density": 0.3},
    "divine":  {"bpm": 96, "root": 62, "scale": [0, 2, 4, 5, 7, 9, 11, 12], "bass": "tri", "lead": "tri", "perc": "taiko", "density": 0.6},
}


def n2f(n):
    return 440.0 * (2.0 ** ((n - 69) / 12.0))


def osc(wave_kind, phase):
    x = phase % 1.0
    if wave_kind == "sine":
        return math.sin(x * 2 * math.pi)
    if wave_kind == "sq":
        return 1.0 if x < 0.5 else -1.0
    if wave_kind == "saw":
        return 2.0 * x - 1.0
    # tri
    return 4.0 * abs(x - 0.5) - 1.0


def add_tone(buf, wave_kind, freq, t0, attack, decay, peak, bend=1.0):
    n0 = int(t0 * SR)
    total = attack + decay
    n1 = min(len(buf), n0 + int(total * SR))
    phase = 0.0
    for i in range(n0, n1):
        t = (i - n0) / SR
        f = freq * (bend ** (t / max(total, 1e-6)))
        phase += f / SR
        if t < attack:
            env = t / max(attack, 1e-6)
        else:
            env = max(0.0, 1.0 - (t - attack) / max(decay, 1e-6))
        buf[i] += osc(wave_kind, phase) * peak * env


def add_noise(buf, rng, t0, dur, peak, lowpass=1.0):
    n0 = int(t0 * SR)
    n1 = min(len(buf), n0 + int(dur * SR))
    prev = 0.0
    for i in range(n0, n1):
        t = (i - n0) / SR
        env = max(0.0, 1.0 - t / max(dur, 1e-6))
        s = rng.random() * 2 - 1
        prev = prev + lowpass * (s - prev)
        buf[i] += prev * peak * env


def render_theme(name):
    th = AUDIO_THEMES[name]
    rng = random.Random(hash(name) & 0xFFFF)
    spb = 60.0 / th["bpm"] / 2.0  # 8th notes
    steps = 64  # 8 bars of 8ths
    dur = steps * spb + 1.0
    buf = [0.0] * int(dur * SR)
    sc, root = th["scale"], th["root"]
    for s in range(steps):
        t = s * spb
        bar = (s // 8) % 4
        if s % 4 == 0:
            deg = [0, 0, 3, 4][bar] % len(sc)
            add_tone(buf, th["bass"], n2f(root - 12 + sc[deg]), t, 0.01, spb * 3.2, 0.17, 0.995)
        if rng.random() < th["density"] and s % 2 == 0:
            deg = rng.randrange(len(sc))
            octv = 12 if rng.random() < 0.25 else 0
            add_tone(buf, th["lead"], n2f(root + sc[deg] + octv), t, 0.015,
                     spb * (2.4 if rng.random() < 0.3 else 1.2), 0.07)
        if th["perc"] == "kit":
            if s % 8 == 0:
                add_tone(buf, "sine", 110, t, 0.005, 0.1, 0.3, 0.3)
            if s % 8 == 4:
                add_noise(buf, rng, t, 0.08, 0.13, 0.9)
            if s % 2 == 1 and rng.random() < 0.7:
                add_noise(buf, rng, t, 0.03, 0.04, 1.0)
        elif th["perc"] == "taiko":
            if s % 8 == 0 or s % 16 == 6:
                add_tone(buf, "sine", 80, t, 0.004, 0.22, 0.32, 0.4)
            if s % 16 == 12:
                add_noise(buf, rng, t, 0.1, 0.06, 0.5)
    return buf[: int(steps * spb * SR)]  # trim to exact loop length


SFX = {}


def build_sfx():
    def mk(name, fn, dur):
        buf = [0.0] * int(dur * SR)
        fn(buf, random.Random(hash(name) & 0xFFFF))
        SFX[name] = buf

    mk("move", lambda b, r: add_tone(b, "sq", 880, 0, 0.005, 0.04, 0.10), 0.06)
    mk("confirm", lambda b, r: add_tone(b, "sq", 660, 0, 0.005, 0.06, 0.14, 1.4), 0.1)
    mk("cancel", lambda b, r: add_tone(b, "sq", 330, 0, 0.005, 0.08, 0.14, 0.7), 0.1)
    mk("slash", lambda b, r: (add_noise(b, r, 0, 0.12, 0.3, 0.8), add_tone(b, "saw", 200, 0, 0.005, 0.1, 0.12, 0.4)), 0.15)
    mk("gun", lambda b, r: (add_noise(b, r, 0, 0.09, 0.4, 0.5), add_tone(b, "sq", 140, 0, 0.003, 0.07, 0.25, 0.5)), 0.12)
    mk("laser", lambda b, r: add_tone(b, "saw", 1400, 0, 0.01, 0.18, 0.2, 0.15), 0.22)
    mk("hit", lambda b, r: (add_noise(b, r, 0, 0.08, 0.25, 0.4), add_tone(b, "sine", 90, 0, 0.004, 0.12, 0.3, 0.6)), 0.15)
    mk("crit", lambda b, r: (add_noise(b, r, 0, 0.16, 0.35, 0.3), add_tone(b, "sine", 60, 0, 0.004, 0.2, 0.4, 0.5)), 0.24)
    mk("heal", lambda b, r: (add_tone(b, "sine", 520, 0, 0.01, 0.2, 0.14, 1.5), add_tone(b, "sine", 780, 0.09, 0.01, 0.25, 0.12, 1.3)), 0.4)
    mk("chest", lambda b, r: (add_tone(b, "sq", 520, 0, 0.01, 0.08, 0.12), add_tone(b, "sq", 660, 0.09, 0.01, 0.08, 0.12), add_tone(b, "sq", 880, 0.18, 0.01, 0.16, 0.13)), 0.4)
    mk("gold", lambda b, r: (add_tone(b, "tri", 987, 0, 0.005, 0.07, 0.14), add_tone(b, "tri", 1318, 0.06, 0.005, 0.1, 0.12)), 0.2)
    mk("level", lambda b, r: [add_tone(b, "sq", f, i * 0.1, 0.01, 0.18, 0.12) for i, f in enumerate([523, 659, 784, 1046])], 0.6)
    mk("die", lambda b, r: add_tone(b, "saw", 300, 0, 0.01, 0.5, 0.2, 0.2), 0.55)
    mk("boost", lambda b, r: add_tone(b, "saw", 220, 0, 0.01, 0.15, 0.16, 2.2), 0.2)
    mk("rift", lambda b, r: (add_tone(b, "sine", 100, 0, 0.05, 1.2, 0.25, 4.0), add_noise(b, r, 0.2, 0.8, 0.12, 0.2)), 1.3)
    mk("explode", lambda b, r: (add_noise(b, r, 0, 0.4, 0.45, 0.25), add_tone(b, "sine", 55, 0, 0.005, 0.35, 0.45, 0.4)), 0.5)
    mk("step", lambda b, r: add_noise(b, r, 0, 0.03, 0.05, 0.9), 0.05)


def write_wav(path, buf):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for s in buf:
            v = max(-1.0, min(1.0, s))
            frames += struct.pack("<h", int(v * 32000))
        w.writeframes(bytes(frames))


# ============================================================
def main():
    for sub in ("sprites", "portraits", "tiles", "features", "backdrops", "audio"):
        os.makedirs(os.path.join(OUT, sub), exist_ok=True)

    with open(os.path.join(ROOT, "data", "sprites.json")) as f:
        specs = json.load(f)
    for name, spec in specs.items():
        kind, o = spec["kind"], spec.get("o", {})
        if kind == "humanoid":
            sheet, port = humanoid_sheet(o), portrait(o)
        else:
            sheet, port = creature_sheet(kind, o), creature_portrait(kind, o)
        sheet.save(os.path.join(OUT, "sprites", name + ".png"))
        port.save(os.path.join(OUT, "portraits", name + ".png"))
    print(f"sprites: {len(specs)}")

    for theme in THEMES:
        gen_tiles(theme).save(os.path.join(OUT, "tiles", theme + ".png"))
        gen_features(theme).save(os.path.join(OUT, "features", theme + ".png"))
    print(f"tile themes: {len(THEMES)}")

    backs = ["ashvillage", "bamboo", "street", "office", "rural", "docks", "neon", "desert",
             "under", "citadel", "castle", "marsh", "fortress", "arena", "rift"]
    for b in backs:
        gen_backdrop(b).save(os.path.join(OUT, "backdrops", b + ".png"))
    print(f"backdrops: {len(backs)}")

    for name in AUDIO_THEMES:
        write_wav(os.path.join(OUT, "audio", "theme_" + name + ".wav"), render_theme(name))
    build_sfx()
    for name, buf in SFX.items():
        write_wav(os.path.join(OUT, "audio", "sfx_" + name + ".wav"), buf)
    print(f"audio: {len(AUDIO_THEMES)} themes + {len(SFX)} sfx")
    print("done ->", OUT)


if __name__ == "__main__":
    main()
