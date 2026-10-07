"""
Gera os vídeos verticais (9:16) dos pratos do cardápio demo.

Cada vídeo é uma animação em loop perfeito (6s, 30fps) desenhada com Cairo
e codificada em H.264 pelo ffmpeg. Também gera um poster .jpg (1º frame)
para o cardápio mostrar instantaneamente enquanto o vídeo carrega.

Uso:
    pip install pycairo numpy
    python scripts/cardapio/gerar_videos.py            # todos
    python scripts/cardapio/gerar_videos.py smash-classico ramen-tonkotsu

Saída: public/midia/<restaurante>/videos/<id>.mp4 (+ .webm) e public/midia/<restaurante>/posters/<id>.jpg
"""

import math
import os
import random
import subprocess
import sys

import cairo

W, H = 540, 960
FPS = 30
DUR = 6
FRAMES = FPS * DUR
TAU = math.tau

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MIDIA = os.path.join(ROOT, "public", "midia")


# ---------------------------------------------------------------- helpers

def hx(h, a=1.0):
    h = h.lstrip("#")
    return (int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255, a)


def mix(c1, c2, t):
    return tuple(c1[i] + (c2[i] - c1[i]) * t for i in range(4))


def src(ctx, c, a=None):
    ctx.set_source_rgba(c[0], c[1], c[2], c[3] if a is None else a)


def lin(x0, y0, x1, y1, stops):
    g = cairo.LinearGradient(x0, y0, x1, y1)
    for off, c in stops:
        g.add_color_stop_rgba(off, *c)
    return g


def rad(cx, cy, r, stops, fx=None, fy=None):
    g = cairo.RadialGradient(cx if fx is None else fx, cy if fy is None else fy, 0, cx, cy, r)
    for off, c in stops:
        g.add_color_stop_rgba(off, *c)
    return g


def ellipse(ctx, cx, cy, rx, ry):
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(max(rx, 0.01), max(ry, 0.01))
    ctx.arc(0, 0, 1, 0, TAU)
    ctx.restore()


def rrect(ctx, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    ctx.new_sub_path()
    ctx.arc(x + w - r, y + r, r, -TAU / 4, 0)
    ctx.arc(x + w - r, y + h - r, r, 0, TAU / 4)
    ctx.arc(x + r, y + h - r, r, TAU / 4, TAU / 2)
    ctx.arc(x + r, y + r, r, TAU / 2, 3 * TAU / 4)
    ctx.close_path()


def glow(ctx, cx, cy, rx, ry, c, a):
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(max(rx, 0.01), max(ry, 0.01))
    ctx.set_source(rad(0, 0, 1, [(0, hx_a(c, a)), (1, hx_a(c, 0))]))
    ctx.arc(0, 0, 1, 0, TAU)
    ctx.fill()
    ctx.restore()


def hx_a(c, a):
    return (c[0], c[1], c[2], a)


def blob(ctx, cx, cy, r, seed, amp=0.12, n=5, ry_scale=1.0, phase=0.0):
    rnd = random.Random(seed)
    harm = [(rnd.randint(2, 7), rnd.uniform(0, TAU), rnd.uniform(0.3, 1.0)) for _ in range(n)]
    steps = 48
    for i in range(steps + 1):
        a = TAU * i / steps
        k = 1 + amp * sum(w * math.sin(f * a + ph + phase) for f, ph, w in harm) / n
        x = cx + math.cos(a) * r * k
        y = cy + math.sin(a) * r * k * ry_scale
        if i == 0:
            ctx.move_to(x, y)
        else:
            ctx.line_to(x, y)
    ctx.close_path()


def leaf(ctx, x, y, length, width, angle, c):
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.move_to(0, 0)
    ctx.curve_to(length * 0.3, -width, length * 0.7, -width, length, 0)
    ctx.curve_to(length * 0.7, width, length * 0.3, width, 0, 0)
    ctx.set_source(lin(0, -width, 0, width, [(0, mix(c, hx("#ffffff"), 0.25)), (1, mix(c, hx("#000000"), 0.3))]))
    ctx.fill()
    ctx.move_to(length * 0.05, 0)
    ctx.line_to(length * 0.9, 0)
    src(ctx, hx("#ffffff", 0.35))
    ctx.set_line_width(1.2)
    ctx.stroke()
    ctx.restore()


def star(ctx, x, y, s, a):
    if s <= 0.2 or a <= 0.01:
        return
    ctx.save()
    ctx.translate(x, y)
    ctx.move_to(0, -s)
    ctx.curve_to(s * 0.12, -s * 0.12, s * 0.12, -s * 0.12, s, 0)
    ctx.curve_to(s * 0.12, s * 0.12, s * 0.12, s * 0.12, 0, s)
    ctx.curve_to(-s * 0.12, s * 0.12, -s * 0.12, s * 0.12, -s, 0)
    ctx.curve_to(-s * 0.12, -s * 0.12, -s * 0.12, -s * 0.12, 0, -s)
    src(ctx, hx("#ffffff", a))
    ctx.fill()
    ctx.restore()
    glow(ctx, x, y, s * 1.4, s * 1.4, hx("#ffffff"), a * 0.4)


def sparkles(ctx, p, pts, size=9):
    for i, (x, y) in enumerate(pts):
        k = (math.sin(TAU * (p * 2 + i * 0.37)) + 1) / 2
        star(ctx, x, y, size * k ** 3, 0.9 * k ** 2)


def steam(ctx, p, cx, cy, spread, n=12, height=300, seed=1, strength=0.16):
    rnd = random.Random(seed)
    for i in range(n):
        off = rnd.random()
        x0 = cx + (rnd.random() - 0.5) * spread
        sway = rnd.uniform(10, 26)
        ph = (p + off) % 1.0
        x = x0 + math.sin(TAU * ph + off * 6) * sway
        y = cy - ph * height
        r = 16 + ph * 52
        a = strength * math.sin(math.pi * ph) ** 1.5
        glow(ctx, x, y, r, r * 1.15, hx("#ffffff"), a)


def falling(ctx, p, x0, x1, y0, y1, n, seed, draw, speed=1):
    rnd = random.Random(seed)
    for i in range(n):
        off = rnd.random()
        x = rnd.uniform(x0, x1)
        ph = (p * speed + off) % 1.0
        y = y0 + (y1 - y0) * ph
        x += math.sin(TAU * (ph + off)) * 8
        a = min(1.0, ph * 6, (1 - ph) * 6)
        draw(ctx, x, y, a, rnd.random(), ph)


# ---------------------------------------------------------------- cenário

def background(ctx, p, theme):
    bg, glw, table = hx(theme["bg"]), hx(theme["glow"]), theme.get("table", "wood")
    src(ctx, bg)
    ctx.paint()
    # luz de cena
    ctx.set_source(rad(W / 2, 420, 620, [(0, hx_a(glw, 0.55)), (0.45, hx_a(glw, 0.16)), (1, hx_a(glw, 0))]))
    ctx.paint()
    # bokeh
    rnd = random.Random(theme.get("seed", 7))
    for i in range(16):
        x = rnd.uniform(-20, W + 20)
        y = rnd.uniform(40, 560)
        r = rnd.uniform(14, 46)
        a = rnd.uniform(0.05, 0.16) * (0.6 + 0.4 * math.sin(TAU * (p + i / 16)))
        x += math.sin(TAU * (p + i * 0.13)) * 14
        c = mix(glw, hx("#ffffff"), rnd.uniform(0.2, 0.7))
        glow(ctx, x, y, r, r, c, a)
        ellipse(ctx, x, y, r * 0.55, r * 0.55)
        src(ctx, c, a * 0.5)
        ctx.fill()

    top = 620
    if table == "wood":
        ctx.rectangle(0, top, W, H - top)
        ctx.set_source(lin(0, top, 0, H, [(0, hx("#4a2c1a")), (1, hx("#1d110a"))]))
        ctx.fill()
        rnd = random.Random(3)
        for i in range(26):
            y = top + 8 + i * 11 + rnd.uniform(-3, 3)
            ctx.move_to(0, y)
            for x in range(0, W + 30, 30):
                ctx.line_to(x, y + math.sin(x / 70 + i) * 2.5)
            src(ctx, hx("#000000", 0.18 + rnd.random() * 0.12))
            ctx.set_line_width(rnd.uniform(0.6, 2))
            ctx.stroke()
    elif table == "slate":
        ctx.rectangle(0, top, W, H - top)
        ctx.set_source(lin(0, top, 0, H, [(0, hx("#2b2a30")), (1, hx("#0b0a0d"))]))
        ctx.fill()
        rnd = random.Random(5)
        for _ in range(500):
            x, y = rnd.uniform(0, W), rnd.uniform(top, H)
            src(ctx, hx("#ffffff", rnd.uniform(0.02, 0.06)))
            ctx.rectangle(x, y, 1.5, 1.5)
            ctx.fill()
    elif table == "toalha":
        ctx.save()
        ctx.rectangle(0, top, W, H - top)
        ctx.clip()
        ctx.set_source(lin(0, top, 0, H, [(0, hx("#efe6d6")), (1, hx("#b9ab95"))]))
        ctx.paint()
        rows, sq = 9, 64
        for u in range(rows):
            y0 = top + (H - top) * (u / rows) ** 1.25
            y1 = top + (H - top) * ((u + 1) / rows) ** 1.25
            s0, s1 = 0.45 + 0.75 * u / rows, 0.45 + 0.75 * (u + 1) / rows
            for i in range(-8, 8):
                if (i + u) % 2:
                    continue
                ctx.move_to(W / 2 + i * sq * s0, y0)
                ctx.line_to(W / 2 + (i + 1) * sq * s0, y0)
                ctx.line_to(W / 2 + (i + 1) * sq * s1, y1)
                ctx.line_to(W / 2 + i * sq * s1, y1)
                ctx.close_path()
        src(ctx, hx("#b3262b", 0.85))
        ctx.fill()
        ctx.restore()
    # borda da mesa + sombra
    ctx.rectangle(0, top - 2, W, 4)
    src(ctx, hx("#ffffff", 0.06))
    ctx.fill()
    ctx.rectangle(0, top, W, 120)
    ctx.set_source(lin(0, top, 0, top + 120, [(0, hx("#000000", 0.35)), (1, hx("#000000", 0))]))
    ctx.fill()


def vignette(ctx):
    ctx.set_source(rad(W / 2, H * 0.48, H * 0.75, [(0.45, hx("#000000", 0)), (1, hx("#000000", 0.75))]))
    ctx.paint()
    # gradiente inferior para a legenda do app ficar legível
    ctx.rectangle(0, H * 0.62, W, H * 0.38)
    ctx.set_source(lin(0, H * 0.62, 0, H, [(0, hx("#000000", 0)), (1, hx("#000000", 0.55))]))
    ctx.fill()


def light_sweep(ctx, p):
    ph = (p * 1.0) % 1.0
    if ph > 0.45:
        return
    k = ph / 0.45
    x = -300 + k * (W + 600)
    ctx.save()
    ctx.set_operator(cairo.OPERATOR_ADD)
    ctx.translate(x, 0)
    ctx.rotate(0.35)
    ctx.rectangle(-60, -200, 120, H + 400)
    ctx.set_source(lin(-60, 0, 60, 0, [(0, hx("#ffffff", 0)), (0.5, hx("#ffffff", 0.07)), (1, hx("#ffffff", 0))]))
    ctx.fill()
    ctx.restore()


def shadow(ctx, cx, cy, rx, ry, a=0.55):
    glow(ctx, cx, cy, rx, ry, hx("#000000"), a)


# ---------------------------------------------------------------- pratos

def burger(ctx, p, cfg):
    double, bacon = cfg.get("double"), cfg.get("bacon")
    # tábua
    shadow(ctx, 270, 712, 250, 40, 0.6)
    ellipse(ctx, 270, 704, 236, 52)
    src(ctx, hx("#5b351c"))
    ctx.fill()
    ellipse(ctx, 270, 696, 236, 52)
    ctx.set_source(lin(40, 0, 500, 0, [(0, hx("#a0683a")), (0.5, hx("#c48a52")), (1, hx("#8c5a30"))]))
    ctx.fill()
    for i in range(1, 6):
        ellipse(ctx, 270 + i * 4, 696, 230 - i * 36, 50 - i * 8)
        src(ctx, hx("#6b3f1f", 0.25))
        ctx.set_line_width(1.2)
        ctx.stroke()
    shadow(ctx, 270, 684, 175, 20, 0.6)

    y = 684
    # pão de baixo
    rrect(ctx, 118, y - 50, 304, 50, 22)
    ctx.set_source(lin(0, y - 50, 0, y, [(0, hx("#f0c070")), (0.35, hx("#dc9a45")), (1, hx("#9c5a22"))]))
    ctx.fill()
    y -= 46

    def patty(y):
        rrect(ctx, 104, y - 50, 332, 52, 24)
        ctx.set_source(lin(0, y - 50, 0, y, [(0, hx("#6e3a20")), (0.5, hx("#4a2412")), (1, hx("#2a1309"))]))
        ctx.fill()
        rnd = random.Random(int(y))
        for _ in range(120):
            xx, yy = rnd.uniform(112, 428), rnd.uniform(y - 46, y - 4)
            ellipse(ctx, xx, yy, rnd.uniform(1, 3.5), rnd.uniform(1, 2.5))
            src(ctx, hx("#a8603a" if rnd.random() < 0.5 else "#1a0a04", rnd.uniform(0.3, 0.7)))
            ctx.fill()
        ctx.move_to(124, y - 46)
        ctx.line_to(416, y - 46)
        src(ctx, hx("#ffffff", 0.12))
        ctx.set_line_width(2)
        ctx.stroke()
        return y - 46

    def cheese(y, seed):
        rnd = random.Random(seed)
        drips = [(rnd.uniform(130, 410), rnd.uniform(22, 54), rnd.uniform(0, 1)) for _ in range(5)]
        ctx.move_to(98, y)
        ctx.line_to(442, y - 4)
        xs = list(range(442, 96, -6))
        for x in xs:
            d = 14
            for dx, ln, ph in drips:
                k = max(0, 1 - abs(x - dx) / 16)
                d += k * k * ln * (0.85 + 0.15 * math.sin(TAU * (p + ph)))
            ctx.line_to(x, y + d)
        ctx.close_path()
        ctx.set_source(lin(0, y, 0, y + 60, [(0, hx("#ffd84a")), (0.6, hx("#f6b21b")), (1, hx("#e08e0b"))]))
        ctx.fill_preserve()
        src(ctx, hx("#ffffff", 0.25))
        ctx.set_line_width(1.5)
        ctx.stroke()

    top = patty(y)
    cheese(top + 2, 11)
    y = top - 4
    if double:
        top = patty(y + 6)
        cheese(top + 2, 23)
        y = top - 4
    if bacon:
        for k, off in enumerate((0, 10)):
            ctx.move_to(92, y - off)
            pts = []
            for x in range(92, 452, 6):
                pts.append((x, y - off + math.sin(x / 17 + k * 2 + TAU * p) * 6))
            for x, yy in pts:
                ctx.line_to(x, yy)
            for x, yy in reversed(pts):
                ctx.line_to(x, yy + 13)
            ctx.close_path()
            ctx.set_source(lin(0, y - off, 0, y - off + 13, [(0, hx("#c4553a")), (0.5, hx("#f2a68a")), (1, hx("#8e2e1c"))]))
            ctx.fill()
        y -= 18
    # alface
    ctx.move_to(96, y)
    for x in range(96, 446, 4):
        ctx.line_to(x, y + 10 + math.sin(x / 7) * 6 + math.sin(x / 23 + TAU * p) * 3)
    ctx.line_to(446, y - 14)
    ctx.line_to(96, y - 14)
    ctx.close_path()
    ctx.set_source(lin(0, y - 14, 0, y + 16, [(0, hx("#9be35a")), (1, hx("#3f8f22"))]))
    ctx.fill()
    y -= 14
    # tomate
    rrect(ctx, 122, y - 14, 296, 18, 9)
    ctx.set_source(lin(0, y - 14, 0, y + 4, [(0, hx("#ff5a4a")), (1, hx("#b3170f"))]))
    ctx.fill()
    y -= 10
    # pão de cima
    ctx.move_to(112, y)
    ctx.curve_to(108, y - 150, 432, y - 150, 428, y)
    ctx.curve_to(330, y + 12, 210, y + 12, 112, y)
    ctx.close_path()
    ctx.set_source(rad(270, y - 40, 230, [(0, hx("#f7c56a")), (0.55, hx("#df8f2e")), (1, hx("#94501a"))], fx=210, fy=y - 100))
    ctx.fill()
    glow(ctx, 215, y - 88, 70, 28, hx("#ffffff"), 0.35)
    rnd = random.Random(42)
    for _ in range(26):
        u = rnd.uniform(-0.85, 0.85)
        v = rnd.uniform(0.25, 0.95)
        sx = 270 + u * 150
        sy = y - (1 - u * u) * 108 * v - 6
        ctx.save()
        ctx.translate(sx, sy)
        ctx.rotate(rnd.uniform(0, math.pi))
        ellipse(ctx, 1, 1.5, 5, 2.4)
        src(ctx, hx("#7a3f12", 0.5))
        ctx.fill()
        ellipse(ctx, 0, 0, 5, 2.4)
        src(ctx, hx("#fff3d6"))
        ctx.fill()
        ctx.restore()
    # palito com bandeira da marca
    flag = hx(cfg.get("flag", "#ff6a1a"))
    ctx.move_to(270, y - 100)
    ctx.line_to(270, y - 190)
    src(ctx, hx("#e8cfa0"))
    ctx.set_line_width(4)
    ctx.stroke()
    wave = math.sin(TAU * p) * 6
    ctx.move_to(272, y - 188)
    ctx.curve_to(300, y - 196 + wave, 320, y - 176 - wave, 346, y - 182 + wave)
    ctx.line_to(346, y - 146 + wave)
    ctx.curve_to(320, y - 140 - wave, 300, y - 160 + wave, 272, y - 152)
    ctx.close_path()
    src(ctx, flag)
    ctx.fill()
    steam(ctx, p, 270, y - 110, 220, n=9, height=260, seed=3, strength=0.11)
    sparkles(ctx, p, [(330, 560), (190, 520), (400, 640)], 8)


def fries(ctx, p, cfg):
    box = hx(cfg.get("box", "#d93a1a"))
    shadow(ctx, 270, 760, 170, 28, 0.6)
    # ketchup
    shadow(ctx, 430, 742, 62, 14, 0.5)
    ellipse(ctx, 430, 730, 56, 20)
    src(ctx, hx("#f2efe9"))
    ctx.fill()
    ellipse(ctx, 430, 726, 44, 13)
    ctx.set_source(rad(430, 726, 44, [(0, hx("#e8392a")), (1, hx("#8d150c"))], fx=418, fy=721))
    ctx.fill()
    glow(ctx, 418, 722, 14, 4, hx("#ffffff"), 0.6)

    rnd = random.Random(9)
    sticks = []
    for i in range(30):
        x = rnd.uniform(168, 372)
        h = rnd.uniform(170, 260)
        ang = (x - 270) / 260 + rnd.uniform(-0.12, 0.12)
        sticks.append((x, h, ang, rnd.random()))
    sticks.sort(key=lambda s: -s[1])

    def stick(x, h, ang, ph):
        ctx.save()
        ctx.translate(x, 600)
        ctx.rotate(ang + math.sin(TAU * (p + ph)) * 0.015)
        rrect(ctx, -11, -h, 22, h, 4)
        ctx.set_source(lin(-11, 0, 11, 0, [(0, hx("#d99a2b")), (0.4, hx("#ffd96a")), (1, hx("#c98418"))]))
        ctx.fill()
        rrect(ctx, -11, -h, 22, 14, 4)
        src(ctx, hx("#a4611a", 0.55))
        ctx.fill()
        ctx.restore()

    for s in sticks[:18]:
        stick(*s)
    # caixa
    ctx.move_to(128, 520)
    ctx.curve_to(190, 560, 230, 560, 270, 545)
    ctx.curve_to(310, 560, 350, 560, 412, 520)
    ctx.line_to(372, 770)
    ctx.line_to(168, 770)
    ctx.close_path()
    ctx.set_source(lin(128, 0, 412, 0, [(0, mix(box, hx("#000000"), 0.35)), (0.45, box), (1, mix(box, hx("#000000"), 0.45))]))
    ctx.fill()
    for s in sticks[18:]:
        x, h, ang, ph = s
        stick(x, h * 0.6, ang * 0.6, ph)
    ctx.move_to(128, 520)
    ctx.curve_to(190, 560, 230, 560, 270, 545)
    ctx.curve_to(310, 560, 350, 560, 412, 520)
    ctx.line_to(400, 600)
    ctx.curve_to(330, 630, 210, 630, 140, 600)
    ctx.close_path()
    ctx.set_source(lin(128, 0, 412, 0, [(0, mix(box, hx("#000000"), 0.3)), (0.45, mix(box, hx("#ffffff"), 0.12)), (1, mix(box, hx("#000000"), 0.4))]))
    ctx.fill()
    # selo da marca
    ellipse(ctx, 270, 680, 44, 44)
    src(ctx, hx("#ffffff", 0.92))
    ctx.fill()
    ellipse(ctx, 270, 680, 34, 34)
    src(ctx, box)
    ctx.set_line_width(4)
    ctx.stroke()
    star(ctx, 270, 680, 16, 0.0)
    ctx.move_to(270, 662)
    for i in range(1, 11):
        a = -TAU / 4 + i * TAU / 10
        r = 18 if i % 2 == 0 else 8
        ctx.line_to(270 + math.cos(a) * r, 680 + math.sin(a) * r)
    ctx.close_path()
    src(ctx, box)
    ctx.fill()

    def salt(ctx, x, y, a, r, ph):
        ctx.rectangle(x, y, 2.5 + r * 2, 2.5 + r * 2)
        src(ctx, hx("#ffffff", 0.85 * a))
        ctx.fill()

    falling(ctx, p, 190, 350, 230, 470, 34, 4, salt, speed=2)
    sparkles(ctx, p, [(220, 380), (330, 350), (290, 420), (380, 600)], 9)
    steam(ctx, p, 270, 380, 160, n=8, height=220, seed=5, strength=0.1)


def pizza(ctx, p, cfg):
    kind = cfg.get("kind", "margherita")
    cx, cy = 270, 590
    rot = 0.18 * math.sin(TAU * p)
    shadow(ctx, cx, cy + 48, 270, 70, 0.6)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, 0.56)
    # tábua
    ctx.arc(0, 26, 252, 0, TAU)
    src(ctx, hx("#6b4222"))
    ctx.fill()
    ctx.arc(0, 0, 252, 0, TAU)
    ctx.set_source(lin(-250, 0, 250, 0, [(0, hx("#b07a44")), (0.5, hx("#d29a5c")), (1, hx("#9c6a38"))]))
    ctx.fill()
    for i in range(1, 7):
        ctx.arc(10, 0, 250 - i * 34, 0, TAU)
        src(ctx, hx("#6b4222", 0.18))
        ctx.set_line_width(1.5)
        ctx.stroke()
    # espessura da massa
    ctx.arc(0, 18, 218, 0, TAU)
    src(ctx, hx("#a8662a"))
    ctx.fill()
    ctx.rotate(rot)
    ctx.arc(0, 0, 218, 0, TAU)
    ctx.set_source(rad(0, 0, 218, [(0.78, hx("#d9963e")), (0.9, hx("#f0bf6e")), (1, hx("#b8742e"))]))
    ctx.fill()
    rnd = random.Random(12)
    for _ in range(40):
        a, r = rnd.uniform(0, TAU), rnd.uniform(196, 214)
        ellipse(ctx, math.cos(a) * r, math.sin(a) * r, rnd.uniform(3, 9), rnd.uniform(2, 6))
        src(ctx, hx("#5a2c0e", rnd.uniform(0.3, 0.7)))
        ctx.fill()
    ctx.arc(0, 0, 188, 0, TAU)
    ctx.set_source(rad(0, 0, 188, [(0, hx("#d6402a")), (1, hx("#a3200f"))]))
    ctx.fill()
    for i in range(34):
        a, r = rnd.uniform(0, TAU), rnd.uniform(0, 165)
        blob(ctx, math.cos(a) * r, math.sin(a) * r, rnd.uniform(22, 40), 100 + i, amp=0.35)
        ctx.set_source(rad(math.cos(a) * r, math.sin(a) * r, 40, [(0, hx("#fff3c4", 0.95)), (1, hx("#f2c45a", 0.85))]))
        ctx.fill()
    if kind == "margherita":
        for i in range(7):
            a, r = i * TAU / 7 + 0.3, 110 if i % 2 else 70
            blob(ctx, math.cos(a) * r, math.sin(a) * r, 30, 300 + i, amp=0.15)
            ctx.set_source(rad(math.cos(a) * r - 8, math.sin(a) * r - 8, 34, [(0, hx("#ffffff")), (1, hx("#efe6cf"))]))
            ctx.fill()
        for i in range(9):
            a, r = i * TAU / 9, rnd.uniform(40, 160)
            leaf(ctx, math.cos(a) * r, math.sin(a) * r, 46, 16, rnd.uniform(0, TAU), hx("#2f9b3e"))
    else:
        for i in range(16):
            a, r = rnd.uniform(0, TAU), rnd.uniform(20, 165)
            x, y = math.cos(a) * r, math.sin(a) * r
            ctx.arc(x, y, 24, 0, TAU)
            ctx.set_source(rad(x - 6, y - 6, 26, [(0, hx("#c8452e")), (1, hx("#7c1d10"))]))
            ctx.fill()
            for _ in range(5):
                ctx.arc(x + rnd.uniform(-14, 14), y + rnd.uniform(-14, 14), 2.5, 0, TAU)
                src(ctx, hx("#f6d3b8", 0.8))
                ctx.fill()
        for i in range(10):
            a, r = rnd.uniform(0, TAU), rnd.uniform(20, 170)
            ctx.arc(math.cos(a) * r, math.sin(a) * r, rnd.uniform(16, 26), rnd.uniform(0, 3), rnd.uniform(3.5, 6))
            src(ctx, hx("#f7f0ff", 0.85))
            ctx.set_line_width(4)
            ctx.stroke()
        for i in range(8):
            a, r = rnd.uniform(0, TAU), rnd.uniform(30, 160)
            ctx.arc(math.cos(a) * r, math.sin(a) * r, 9, 0, TAU)
            src(ctx, hx("#1a1a1a"))
            ctx.set_line_width(6)
            ctx.stroke()
    for i in range(4):
        a = i * TAU / 8
        ctx.move_to(math.cos(a) * 214, math.sin(a) * 214)
        ctx.line_to(-math.cos(a) * 214, -math.sin(a) * 214)
    src(ctx, hx("#4a1a0a", 0.22))
    ctx.set_line_width(3)
    ctx.stroke()
    ctx.restore()
    # orégano/manjericão caindo
    def oregano(ctx, x, y, a, r, ph):
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(ph * 8 + r * 6)
        ctx.rectangle(-3, -1.5, 6, 3)
        src(ctx, hx("#4c7a2a", a))
        ctx.fill()
        ctx.restore()
    falling(ctx, p, 140, 400, 200, 560, 30, 8, oregano)
    steam(ctx, p, cx, cy - 40, 320, n=14, height=320, seed=9)
    sparkles(ctx, p, [(200, 560), (330, 610), (280, 520)], 8)


def pasta(ctx, p, cfg):
    sauce = hx(cfg.get("sauce", "#b8261a"))
    cx, cy = 270, 600
    shadow(ctx, cx, cy + 56, 250, 60, 0.6)
    ellipse(ctx, cx, cy + 14, 236, 118)
    src(ctx, hx("#c9c4bb"))
    ctx.fill()
    ellipse(ctx, cx, cy, 236, 118)
    ctx.set_source(rad(cx, cy, 236, [(0.6, hx("#ffffff")), (1, hx("#dedad2"))], fx=cx - 60, fy=cy - 40))
    ctx.fill()
    ellipse(ctx, cx, cy + 6, 160, 78)
    ctx.set_source(rad(cx, cy + 6, 160, [(0.5, hx("#f3f0ea")), (1, hx("#cfc9be"))]))
    ctx.fill()
    shadow(ctx, cx, cy + 14, 140, 58, 0.35)
    rnd = random.Random(21)
    for k in range(90):
        level = k / 90
        r_nest = 120 * (1 - level * 0.55)
        a = rnd.uniform(0, TAU)
        rr = rnd.uniform(0, r_nest)
        x = cx + math.cos(a) * rr
        y = cy - 6 + math.sin(a) * rr * 0.5 - level * 46
        R = rnd.uniform(18, 60) * (1 - level * 0.3)
        st = rnd.uniform(0, TAU) + math.sin(TAU * p + k) * 0.03
        ext = rnd.uniform(1.6, 3.4)
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, 0.5)
        ctx.arc(0, 0, R, st, st + ext)
        ctx.restore()
        src(ctx, hx("#b88c38"))
        ctx.set_line_width(7)
        ctx.stroke()
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, 0.5)
        ctx.arc(0, 0, R, st, st + ext)
        ctx.restore()
        src(ctx, hx("#f6d886"))
        ctx.set_line_width(4.6)
        ctx.stroke()
    blob(ctx, cx + 4, cy - 52, 64, 5, amp=0.25, ry_scale=0.55, phase=TAU * p * 0)
    ctx.set_source(rad(cx - 10, cy - 64, 70, [(0, mix(sauce, hx("#ffffff"), 0.25)), (0.7, sauce), (1, mix(sauce, hx("#000000"), 0.35))]))
    ctx.fill()
    glow(ctx, cx - 18, cy - 66, 20, 7, hx("#ffffff"), 0.55)
    leaf(ctx, cx + 10, cy - 70, 52, 18, -0.6, hx("#2f9b3e"))
    leaf(ctx, cx + 14, cy - 72, 44, 15, -2.3, hx("#3bab4a"))

    def parm(ctx, x, y, a, r, ph):
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(ph * 10 + r * 5)
        ctx.move_to(-5, -2)
        ctx.line_to(6, -3)
        ctx.line_to(3, 3)
        ctx.close_path()
        src(ctx, hx("#fff4cc", 0.95 * a))
        ctx.fill()
        ctx.restore()

    falling(ctx, p, 200, 340, 180, 560, 40, 31, parm)
    steam(ctx, p, cx, cy - 70, 240, n=14, height=300, seed=12)


def ramen(ctx, p, cfg):
    cx, cy = 270, 560
    shadow(ctx, cx, 760, 190, 30, 0.7)
    # tigela
    ctx.move_to(cx - 222, cy)
    ctx.curve_to(cx - 222, cy + 150, cx - 120, cy + 205, cx, cy + 205)
    ctx.curve_to(cx + 120, cy + 205, cx + 222, cy + 150, cx + 222, cy)
    ctx.close_path()
    ctx.set_source(lin(cx - 222, 0, cx + 222, 0, [(0, hx("#0d0c10")), (0.3, hx("#3a3442")), (0.55, hx("#1b1820")), (1, hx("#08070a"))]))
    ctx.fill()
    for i, y in enumerate((cy + 40, cy + 52)):
        ctx.move_to(cx - 214, y)
        ctx.curve_to(cx - 120, y + 50, cx + 120, y + 50, cx + 214, y)
        src(ctx, hx(cfg.get("stripe", "#d83a2e"), 0.9 if i == 0 else 0.5))
        ctx.set_line_width(6 if i == 0 else 2.5)
        ctx.stroke()
    ellipse(ctx, cx, cy, 222, 90)
    src(ctx, hx("#2a2530"))
    ctx.fill()
    ellipse(ctx, cx, cy + 3, 204, 80)
    ctx.set_source(rad(cx, cy + 3, 204, [(0, hx("#f0c47e")), (0.8, hx("#d7973f")), (1, hx("#a8681f"))]))
    ctx.fill()
    ctx.save()
    ellipse(ctx, cx, cy + 3, 204, 80)
    ctx.clip()
    for i in range(14):
        y0 = cy - 40 + i * 7
        ctx.move_to(cx - 210, y0)
        for x in range(-210, 214, 8):
            ctx.line_to(cx + x, y0 + math.sin(x / 13 + i * 1.7 + TAU * p) * 5)
        src(ctx, hx("#f8e29a", 0.9))
        ctx.set_line_width(4)
        ctx.stroke()
    rnd = random.Random(4)
    for i in range(30):
        x, y = cx + rnd.uniform(-180, 180), cy + rnd.uniform(-60, 70)
        r = rnd.uniform(2, 7)
        ellipse(ctx, x, y, r, r * 0.6)
        src(ctx, hx("#fff2c0", 0.25 + 0.2 * math.sin(TAU * (p + i / 30))))
        ctx.fill()
    ctx.restore()
    # nori
    for i, x in enumerate((cx - 120, cx - 70)):
        ctx.save()
        ctx.translate(x, cy - 20)
        ctx.rotate(-0.18 + i * 0.12)
        ctx.rectangle(-28, -110, 56, 120)
        ctx.set_source(lin(-28, 0, 28, 0, [(0, hx("#0f1a12")), (0.5, hx("#26382a")), (1, hx("#0a120c"))]))
        ctx.fill()
        ctx.restore()
    # chashu
    for x, y in ((cx + 70, cy - 20), (cx + 120, cy + 10)):
        ellipse(ctx, x, y + 5, 52, 24)
        src(ctx, hx("#7a3a22"))
        ctx.fill()
        ellipse(ctx, x, y, 52, 24)
        ctx.set_source(rad(x, y, 52, [(0, hx("#f5c7b0")), (0.75, hx("#e09a7c")), (1, hx("#9a4a2c"))]))
        ctx.fill()
        ctx.save()
        ctx.translate(x, y)
        ctx.scale(1, 0.46)
        ctx.arc(0, 0, 28, 0.5, 4.5)
        ctx.restore()
        src(ctx, hx("#fff4ea", 0.7))
        ctx.set_line_width(3)
        ctx.stroke()
    # ovos
    for x, y in ((cx - 30, cy + 26), (cx + 22, cy + 40)):
        ellipse(ctx, x, y + 4, 36, 21)
        src(ctx, hx("#c9b89a"))
        ctx.fill()
        ellipse(ctx, x, y, 36, 21)
        src(ctx, hx("#fffaf0"))
        ctx.fill()
        ellipse(ctx, x, y, 19, 11)
        ctx.set_source(rad(x, y, 19, [(0, hx("#ff7a12")), (0.7, hx("#f39a1c")), (1, hx("#e8b84a"))]))
        ctx.fill()
        glow(ctx, x - 6, y - 4, 7, 3, hx("#ffffff"), 0.7)
    # naruto
    ellipse(ctx, cx - 120, cy + 34, 30, 16)
    src(ctx, hx("#ffffff"))
    ctx.fill()
    ctx.save()
    ctx.translate(cx - 120, cy + 34)
    ctx.scale(1, 0.55)
    for k in range(30):
        a = k * 0.45
        r = 2 + k * 0.7
        (ctx.move_to if k == 0 else ctx.line_to)(math.cos(a) * r, math.sin(a) * r)
    ctx.restore()
    src(ctx, hx("#ef5a8a"))
    ctx.set_line_width(3)
    ctx.stroke()
    # cebolinha
    for i in range(26):
        x, y = cx + rnd.uniform(-150, 150), cy + rnd.uniform(-30, 60)
        ellipse(ctx, x, y, 6, 3.5)
        src(ctx, hx("#7fd04a"))
        ctx.set_line_width(2.4)
        ctx.stroke()
    # hashi levantando o lámen
    lift = 0.5 - 0.5 * math.cos(TAU * p)
    tx, ty = cx + 40, cy - 70 - lift * 120
    for dx in (0, 14):
        ctx.move_to(tx + dx, ty)
        ctx.line_to(tx + 220 + dx, ty - 300)
        src(ctx, hx("#3a2214"))
        ctx.set_line_width(8)
        ctx.stroke()
        ctx.move_to(tx + dx, ty)
        ctx.line_to(tx + 220 + dx, ty - 300)
        src(ctx, hx("#c48a52"))
        ctx.set_line_width(5)
        ctx.stroke()
    for i in range(7):
        sx = tx + 2 + i * 2
        ex = cx + 10 + (i - 3) * 16
        ctx.move_to(sx, ty + 4)
        ctx.curve_to(sx + math.sin(TAU * p + i) * 14 - 10, ty + 60, ex + 10, cy - 30, ex, cy + 6)
        src(ctx, hx("#b88c38"))
        ctx.set_line_width(5.5)
        ctx.stroke_preserve()
        src(ctx, hx("#f8e29a"))
        ctx.set_line_width(3.6)
        ctx.stroke()
    steam(ctx, p, cx, cy - 40, 300, n=18, height=360, seed=2, strength=0.2)


def sushi(ctx, p, cfg):
    shadow(ctx, 270, 690, 270, 50, 0.7)
    ctx.save()
    ctx.translate(270, 620)
    ctx.rotate(-0.06)
    # tábua de ardósia (perspectiva leve)
    ctx.move_to(-240, -70)
    ctx.line_to(240, -70)
    ctx.line_to(262, 80)
    ctx.line_to(-262, 80)
    ctx.close_path()
    src(ctx, hx("#1e1d22"))
    ctx.fill()
    ctx.move_to(-240, -80)
    ctx.line_to(240, -80)
    ctx.line_to(262, 66)
    ctx.line_to(-262, 66)
    ctx.close_path()
    ctx.set_source(lin(0, -80, 0, 66, [(0, hx("#3d3c44")), (1, hx("#25242a"))]))
    ctx.fill()
    rnd = random.Random(8)
    for _ in range(300):
        ctx.rectangle(rnd.uniform(-240, 240), rnd.uniform(-78, 62), 1.6, 1.6)
        src(ctx, hx("#ffffff", rnd.uniform(0.02, 0.07)))
        ctx.fill()

    def rice(x, y, w, h):
        rrect(ctx, x - w / 2, y - h, w, h, h / 2)
        ctx.set_source(lin(0, y - h, 0, y, [(0, hx("#ffffff")), (1, hx("#d9d4c8"))]))
        ctx.fill()
        for _ in range(26):
            ellipse(ctx, x + rnd.uniform(-w / 2 + 6, w / 2 - 6), y - rnd.uniform(4, h - 4), 3.5, 2)
            src(ctx, hx("#c9c2b2", 0.6))
            ctx.fill()

    # nigiris (linha de trás)
    fishes = [("#f47a48", "#ffd2b8"), ("#d42a3c", "#f08a92"), ("#f47a48", "#ffd2b8"), ("#f3e9dc", "#ffffff")]
    for i, (fc, sc) in enumerate(fishes):
        x = -165 + i * 110
        y = -18
        shadow(ctx, x, y + 4, 52, 10, 0.5)
        rice(x, y, 92, 38)
        ctx.move_to(x - 56, y - 26)
        ctx.curve_to(x - 50, y - 64, x + 50, y - 64, x + 58, y - 24)
        ctx.curve_to(x + 30, y - 18, x - 30, y - 18, x - 56, y - 26)
        ctx.close_path()
        ctx.set_source(lin(0, y - 64, 0, y - 18, [(0, mix(hx(fc), hx("#ffffff"), 0.2)), (1, mix(hx(fc), hx("#000000"), 0.2))]))
        ctx.fill()
        ctx.save()
        ctx.move_to(x - 56, y - 26)
        ctx.curve_to(x - 50, y - 64, x + 50, y - 64, x + 58, y - 24)
        ctx.curve_to(x + 30, y - 18, x - 30, y - 18, x - 56, y - 26)
        ctx.clip()
        for k in range(6):
            sx = x - 50 + k * 22
            ctx.move_to(sx, y - 70)
            ctx.curve_to(sx + 10, y - 50, sx - 4, y - 36, sx + 14, y - 16)
            src(ctx, hx(sc, 0.75))
            ctx.set_line_width(4)
            ctx.stroke()
        gx = x - 40 + ((p * 1.0 + i * 0.25) % 1.0) * 120
        glow(ctx, gx, y - 44, 22, 8, hx("#ffffff"), 0.45)
        ctx.restore()
    # makis (linha da frente)
    for i in range(4):
        x = -150 + i * 100
        y = 52
        shadow(ctx, x, y + 2, 40, 9, 0.6)
        ctx.rectangle(x - 32, y - 40, 64, 40)
        ctx.set_source(lin(x - 32, 0, x + 32, 0, [(0, hx("#0c140e")), (0.5, hx("#22342a")), (1, hx("#0a100b"))]))
        ctx.fill()
        ellipse(ctx, x, y, 32, 12)
        src(ctx, hx("#0c140e"))
        ctx.fill()
        ellipse(ctx, x, y - 40, 32, 13)
        src(ctx, hx("#15221a"))
        ctx.fill()
        ellipse(ctx, x, y - 40, 27, 10.5)
        src(ctx, hx("#fbf8f0"))
        ctx.fill()
        ellipse(ctx, x - 5, y - 41, 9, 4.5)
        src(ctx, hx("#f47a48"))
        ctx.fill()
        ellipse(ctx, x + 7, y - 39, 7, 3.6)
        src(ctx, hx("#8cc84b"))
        ctx.fill()
    # wasabi e gengibre
    blob(ctx, 205, 40, 18, 77, amp=0.3, ry_scale=0.7)
    ctx.set_source(rad(200, 34, 22, [(0, hx("#c4e870")), (1, hx("#6f9a2a"))]))
    ctx.fill()
    for k in range(4):
        ellipse(ctx, 180 + k * 8, 0 - k * 3, 20, 9)
        src(ctx, hx("#f7b9b2", 0.85))
        ctx.fill()
    ctx.restore()
    # hashis
    for dx in (0, 14):
        ctx.move_to(60 + dx, 760)
        ctx.line_to(520 + dx, 700)
        src(ctx, hx("#2a1a10"))
        ctx.set_line_width(8)
        ctx.stroke()
    sparkles(ctx, p, [(120, 560), (270, 545), (380, 560), (330, 600)], 8)


def glass_path(ctx, top, bot, wt, wb):
    ctx.move_to(270 - wt / 2, top)
    ctx.line_to(270 + wt / 2, top)
    ctx.line_to(270 + wb / 2, bot - 14)
    ctx.curve_to(270 + wb / 2, bot, 270 + wb / 2 - 14, bot, 270 + wb / 2 - 18, bot)
    ctx.line_to(270 - wb / 2 + 18, bot)
    ctx.curve_to(270 - wb / 2 + 14, bot, 270 - wb / 2, bot, 270 - wb / 2, bot - 14)
    ctx.close_path()


def citrus(ctx, x, y, r, c_out, c_in, ang):
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(ang)
    ctx.arc(0, 0, r, 0, TAU)
    src(ctx, hx(c_out))
    ctx.fill()
    ctx.arc(0, 0, r * 0.9, 0, TAU)
    src(ctx, hx("#fffbe8"))
    ctx.fill()
    ctx.arc(0, 0, r * 0.82, 0, TAU)
    ctx.set_source(rad(0, 0, r, [(0, mix(hx(c_in), hx("#ffffff"), 0.4)), (1, hx(c_in))]))
    ctx.fill()
    for k in range(8):
        a = k * TAU / 8
        ctx.move_to(0, 0)
        ctx.line_to(math.cos(a) * r * 0.82, math.sin(a) * r * 0.82)
    src(ctx, hx("#fffbe8", 0.9))
    ctx.set_line_width(2.5)
    ctx.stroke()
    ctx.restore()


def drink(ctx, p, cfg):
    top, bot = cfg.get("top", 330), 780
    wt, wb = cfg.get("wt", 250), cfg.get("wb", 206)
    c1, c2 = hx(cfg["c1"]), hx(cfg["c2"])
    level = cfg.get("level", 400) + math.sin(TAU * p) * 3
    shadow(ctx, 270, bot + 6, 150, 22, 0.7)
    coaster = cfg.get("coaster")
    if coaster:
        ellipse(ctx, 270, bot + 4, 160, 30)
        src(ctx, hx(coaster))
        ctx.fill()
        ellipse(ctx, 270, bot + 4, 140, 24)
        src(ctx, hx("#ffffff", 0.25))
        ctx.set_line_width(2)
        ctx.stroke()
    # canudo (atrás)
    straw = cfg.get("straw")
    if straw:
        ctx.move_to(300, bot - 40)
        ctx.line_to(370, top - 110)
        src(ctx, hx(straw))
        ctx.set_line_width(14)
        ctx.stroke()
        for k in range(8):
            t0 = k / 8
            ctx.move_to(300 + 70 * t0, bot - 40 - (bot - 40 - top + 110) * t0)
            t1 = t0 + 0.05
            ctx.line_to(300 + 70 * t1, bot - 40 - (bot - 40 - top + 110) * t1)
        src(ctx, hx("#ffffff", 0.8))
        ctx.set_line_width(14)
        ctx.stroke()
    ctx.save()
    glass_path(ctx, top, bot, wt, wb)
    ctx.clip()
    ctx.rectangle(0, level, W, bot - level)
    ctx.set_source(lin(0, level, 0, bot, [(0, c1), (1, c2)]))
    ctx.fill()
    ellipse(ctx, 270, level, wt / 2 - 4, 12)
    src(ctx, mix(c1, hx("#ffffff"), 0.35))
    ctx.fill()
    rnd = random.Random(cfg.get("seed", 1))
    for leafi in range(cfg.get("mint", 0)):
        leaf(ctx, rnd.uniform(200, 330), rnd.uniform(level + 60, bot - 60), 40, 14, rnd.uniform(0, TAU), hx("#3dae4f", 0.9))
    for k in range(cfg.get("wedges", 0)):
        x, y = rnd.uniform(200, 340), rnd.uniform(level + 120, bot - 40)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rnd.uniform(0, TAU))
        ctx.move_to(0, 0)
        ctx.arc(0, 0, 34, 0, 1.6)
        ctx.close_path()
        src(ctx, hx("#6aaf2e", 0.9))
        ctx.fill()
        ctx.move_to(0, 0)
        ctx.arc(0, 0, 28, 0.1, 1.5)
        ctx.close_path()
        src(ctx, hx("#d8ef9a", 0.9))
        ctx.fill()
        ctx.restore()
    ice = cfg.get("ice", 3)
    for k in range(ice):
        bx = rnd.uniform(205, 335)
        by = level + rnd.uniform(-10, 160) + math.sin(TAU * p + k) * 6
        s = rnd.uniform(36, 54) if not cfg.get("crushed") else rnd.uniform(14, 24)
        ctx.save()
        ctx.translate(bx, by)
        ctx.rotate(rnd.uniform(-0.5, 0.5) + math.sin(TAU * p + k) * 0.05)
        rrect(ctx, -s / 2, -s / 2, s, s, s * 0.22)
        src(ctx, hx("#ffffff", 0.28))
        ctx.fill_preserve()
        src(ctx, hx("#ffffff", 0.55))
        ctx.set_line_width(2)
        ctx.stroke()
        rrect(ctx, -s / 2 + 5, -s / 2 + 5, s * 0.35, s * 0.18, 3)
        src(ctx, hx("#ffffff", 0.6))
        ctx.fill()
        ctx.restore()
    for k in range(cfg.get("bubbles", 26)):
        off = rnd.random()
        bx = rnd.uniform(160, 380)
        ph = (p * 2 + off) % 1.0
        by = bot - 20 - ph * (bot - 20 - level)
        r = rnd.uniform(1.5, 4.5)
        ctx.arc(bx + math.sin(TAU * (ph * 2 + off)) * 3, by, r, 0, TAU)
        src(ctx, hx("#ffffff", 0.55))
        ctx.set_line_width(1.2)
        ctx.stroke()
    if cfg.get("foam"):
        for k in range(26):
            fx = rnd.uniform(270 - wt / 2, 270 + wt / 2)
            fy = level - rnd.uniform(-6, 14)
            r = rnd.uniform(10, 20)
            ctx.arc(fx, fy, r + math.sin(TAU * p + k) * 1.2, 0, TAU)
            ctx.set_source(rad(fx - 3, fy - 4, r, [(0, hx("#ffffff")), (1, hx(cfg["foam"]))]))
            ctx.fill()
    # reflexo
    ctx.rectangle(270 - wt / 2 + 16, top, 22, bot - top)
    ctx.set_source(lin(270 - wt / 2 + 16, 0, 270 - wt / 2 + 38, 0, [(0, hx("#ffffff", 0)), (0.5, hx("#ffffff", 0.32)), (1, hx("#ffffff", 0))]))
    ctx.fill()
    ctx.rectangle(270 + wt / 2 - 40, top, 10, bot - top)
    src(ctx, hx("#ffffff", 0.1))
    ctx.fill()
    # gotas de condensação
    for k in range(34):
        dx, dy = rnd.uniform(160, 380), rnd.uniform(level + 10, bot - 20)
        ellipse(ctx, dx, dy, 2.5, 3.2)
        src(ctx, hx("#ffffff", 0.45))
        ctx.fill()
    for k in range(3):
        off = k / 3 + 0.1
        ph = (p + off) % 1.0
        dx = 180 + k * 70
        dy = level + 20 + ph * (bot - level - 60)
        ctx.move_to(dx, dy - 40 * ph)
        ctx.line_to(dx, dy)
        src(ctx, hx("#ffffff", 0.2))
        ctx.set_line_width(3)
        ctx.stroke()
        ellipse(ctx, dx, dy, 4, 5)
        src(ctx, hx("#ffffff", 0.7))
        ctx.fill()
    ctx.restore()
    # vidro
    glass_path(ctx, top, bot, wt, wb)
    src(ctx, hx("#ffffff", 0.06))
    ctx.fill_preserve()
    src(ctx, hx("#ffffff", 0.45))
    ctx.set_line_width(2.5)
    ctx.stroke()
    ellipse(ctx, 270, top, wt / 2, 12)
    src(ctx, hx("#ffffff", 0.5))
    ctx.set_line_width(2)
    ctx.stroke()
    ellipse(ctx, 270, bot - 12, wb / 2 - 6, 10)
    src(ctx, hx("#ffffff", 0.15))
    ctx.fill()
    g = cfg.get("garnish")
    if g:
        out, inn = {"lime": ("#4f9a22", "#c9e67a"), "limao": ("#f2d43a", "#fff09a"), "laranja": ("#f28a1a", "#ffb84a"), "yuzu": ("#f6c21a", "#ffe066")}[g]
        citrus(ctx, 270 + wt / 2 - 24, top + 6, 54, out, inn, math.sin(TAU * p) * 0.06)
    if cfg.get("rosemary"):
        ctx.move_to(230, level + 30)
        ctx.line_to(190, top - 120)
        src(ctx, hx("#3f5a2a"))
        ctx.set_line_width(3)
        ctx.stroke()
        for k in range(14):
            t = k / 14
            x = 230 - 40 * t
            y = level + 30 - (level + 150 - top) * t
            for s in (-1, 1):
                ctx.move_to(x, y)
                ctx.line_to(x + s * 16, y - 8)
                src(ctx, hx("#4f7a34"))
                ctx.set_line_width(3)
                ctx.stroke()
    sparkles(ctx, p, [(270 - wt / 2 + 24, top + 80), (270 + wt / 2 - 30, top + 220), (250, bot - 60)], 10)


def milkshake(ctx, p, cfg):
    c1, c2 = hx(cfg["c1"]), hx(cfg["c2"])
    drizzle = hx(cfg["drizzle"])
    top, bot = 360, 790
    shadow(ctx, 270, bot + 6, 130, 20, 0.7)
    path = lambda: (ctx.move_to(150, top), ctx.line_to(390, top), ctx.curve_to(360, top + 140, 330, top + 200, 330, bot - 120),
                    ctx.line_to(330, bot - 20), ctx.line_to(210, bot - 20), ctx.line_to(210, bot - 120),
                    ctx.curve_to(210, top + 200, 180, top + 140, 150, top), ctx.close_path())
    # pé do copo
    ellipse(ctx, 270, bot, 100, 18)
    src(ctx, hx("#ffffff", 0.35))
    ctx.fill()
    ctx.rectangle(254, bot - 40, 32, 40)
    src(ctx, hx("#ffffff", 0.25))
    ctx.fill()
    ctx.save()
    path()
    ctx.clip()
    ctx.rectangle(0, top, W, bot)
    ctx.set_source(lin(0, top, 0, bot, [(0, c1), (1, c2)]))
    ctx.fill()
    for k in range(7):
        x = 160 + k * 38
        ctx.move_to(x, top)
        ctx.curve_to(x + 10, top + 80, x - 12, top + 140, x + 4 + math.sin(TAU * p + k) * 3, top + 170 + (k % 3) * 40)
        src(ctx, drizzle)
        ctx.set_line_width(9)
        ctx.stroke()
    ctx.rectangle(176, top, 18, bot - top)
    src(ctx, hx("#ffffff", 0.3))
    ctx.fill()
    ctx.restore()
    path()
    src(ctx, hx("#ffffff", 0.5))
    ctx.set_line_width(2.5)
    ctx.stroke()
    # canudo
    ctx.move_to(310, top + 20)
    ctx.line_to(380, top - 210)
    src(ctx, hx(cfg.get("straw", "#ff6a1a")))
    ctx.set_line_width(16)
    ctx.stroke()
    # chantilly
    rnd = random.Random(2)
    layers = [(0, 128, 34), (-38, 104, 32), (-72, 78, 30), (-102, 50, 26), (-124, 26, 20)]
    for li, (dy, spread, r) in enumerate(layers):
        n = max(3, int(spread / 14))
        for k in range(n):
            x = 270 - spread + (2 * spread) * k / max(1, n - 1)
            y = top - 10 + dy + math.sin(TAU * p + k + li) * 1.5
            ctx.arc(x, y, r, 0, TAU)
            ctx.set_source(rad(x - r * 0.3, y - r * 0.4, r * 1.2, [(0, hx("#ffffff")), (0.7, hx("#fbf3ea")), (1, hx("#e0d2c2"))]))
            ctx.fill()
    for k in range(40):
        x, y = rnd.uniform(160, 380), rnd.uniform(top - 140, top + 10)
        if abs(x - 270) > 120 - (top - y) * 0.6:
            continue
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rnd.uniform(0, math.pi))
        rrect(ctx, -5, -1.6, 10, 3.2, 1.6)
        src(ctx, hx(rnd.choice(["#ff4f8b", "#ffd23a", "#3ad0ff", "#7cdb4a", "#ffffff"])))
        ctx.fill()
        ctx.restore()
    # calda escorrendo sobre o chantilly
    for k in range(3):
        x = 236 + k * 34
        ln = 14 + 16 * (0.5 + 0.5 * math.sin(TAU * p + k))
        ctx.move_to(x, top - 128 + abs(k - 1) * 14)
        ctx.line_to(x, top - 128 + abs(k - 1) * 14 + ln)
        src(ctx, drizzle)
        ctx.set_line_width(7)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.stroke()
    # cereja
    cy = top - 160 + math.sin(TAU * p) * 3
    ctx.move_to(276, cy - 20)
    ctx.curve_to(280, cy - 60, 300, cy - 70, 316, cy - 76)
    src(ctx, hx("#4a6a1a"))
    ctx.set_line_width(3)
    ctx.stroke()
    ctx.arc(272, cy, 24, 0, TAU)
    ctx.set_source(rad(264, cy - 8, 26, [(0, hx("#ff5a6a")), (0.6, hx("#d0101e")), (1, hx("#7a0610"))]))
    ctx.fill()
    glow(ctx, 264, cy - 9, 7, 5, hx("#ffffff"), 0.8)
    sparkles(ctx, p, [(190, 450), (350, 330), (300, 620)], 9)


def chopp(ctx, p, cfg):
    top, bot = 380, 790
    shadow(ctx, 270, bot + 6, 150, 22, 0.7)
    # alça
    ctx.move_to(370, top + 80)
    ctx.curve_to(470, top + 80, 470, top + 300, 370, top + 300)
    src(ctx, hx("#ffffff", 0.35))
    ctx.set_line_width(26)
    ctx.stroke()
    ctx.move_to(370, top + 80)
    ctx.curve_to(470, top + 80, 470, top + 300, 370, top + 300)
    src(ctx, hx("#000000", 0.25))
    ctx.set_line_width(12)
    ctx.stroke()
    ctx.save()
    rrect(ctx, 160, top, 220, bot - top, 18)
    ctx.clip()
    ctx.rectangle(0, top + 40, W, H)
    ctx.set_source(lin(0, top, 0, bot, [(0, hx("#ffcb3a")), (0.5, hx("#f2a11b")), (1, hx("#b56a0a"))]))
    ctx.fill()
    for i in range(5):
        x = 175 + i * 46
        ctx.rectangle(x, top, 8, bot - top)
        src(ctx, hx("#ffffff", 0.14))
        ctx.fill()
    rnd = random.Random(6)
    for k in range(70):
        off = rnd.random()
        bx = rnd.choice([200, 238, 272, 300, 340]) + rnd.uniform(-6, 6)
        ph = (p * 2 + off) % 1.0
        by = bot - 10 - ph * (bot - top - 40)
        ctx.arc(bx, by, rnd.uniform(1.2, 3.2), 0, TAU)
        src(ctx, hx("#fff6d0", 0.75))
        ctx.fill()
    for k in range(40):
        ellipse(ctx, rnd.uniform(168, 372), rnd.uniform(top + 80, bot - 20), 2.6, 3.4)
        src(ctx, hx("#ffffff", 0.4))
        ctx.fill()
    ctx.restore()
    rrect(ctx, 160, top, 220, bot - top, 18)
    src(ctx, hx("#ffffff", 0.5))
    ctx.set_line_width(3)
    ctx.stroke()
    ctx.rectangle(160, bot - 30, 220, 30)
    src(ctx, hx("#ffffff", 0.18))
    ctx.fill()
    # espuma
    rnd = random.Random(16)
    for k in range(36):
        fx = rnd.uniform(160, 380)
        fy = top + 30 - rnd.uniform(0, 50) * (1 - abs(fx - 270) / 160)
        r = rnd.uniform(16, 30)
        ctx.arc(fx, fy + math.sin(TAU * p + k) * 1.5, r, 0, TAU)
        ctx.set_source(rad(fx - 5, fy - 6, r, [(0, hx("#ffffff")), (0.8, hx("#fbf4e2")), (1, hx("#e2d4b4"))]))
        ctx.fill()
    ln = 40 + 50 * (0.5 - 0.5 * math.cos(TAU * p))
    ctx.move_to(176, top + 40)
    ctx.line_to(176, top + 40 + ln)
    src(ctx, hx("#fffaf0"))
    ctx.set_line_width(14)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.stroke()
    steam(ctx, p, 270, top - 20, 200, n=6, height=180, seed=6, strength=0.06)
    sparkles(ctx, p, [(190, 520), (350, 610), (300, 450)], 9)


def wine(ctx, p, cfg):
    c = hx(cfg.get("c", "#6e0f1e"))
    cx, top, bowl_bot = 270, 300, 600
    shadow(ctx, cx, 790, 120, 18, 0.7)
    ellipse(ctx, cx, 780, 100, 18)
    src(ctx, hx("#ffffff", 0.3))
    ctx.fill()
    ctx.rectangle(cx - 5, bowl_bot - 10, 10, 190)
    ctx.set_source(lin(cx - 5, 0, cx + 5, 0, [(0, hx("#ffffff", 0.25)), (0.5, hx("#ffffff", 0.6)), (1, hx("#ffffff", 0.2))]))
    ctx.fill()

    def bowl():
        ctx.move_to(cx - 110, top)
        ctx.curve_to(cx - 150, top + 180, cx - 120, bowl_bot, cx, bowl_bot)
        ctx.curve_to(cx + 120, bowl_bot, cx + 150, top + 180, cx + 110, top)
        ctx.close_path()

    ctx.save()
    bowl()
    ctx.clip()
    slope = 0.28 * math.sin(TAU * p)
    lvl = 460
    ctx.move_to(0, lvl - slope * cx)
    ctx.line_to(W, lvl + slope * (W - cx))
    ctx.line_to(W, H)
    ctx.line_to(0, H)
    ctx.close_path()
    ctx.set_source(lin(0, lvl - 30, 0, bowl_bot, [(0, mix(c, hx("#ffffff"), 0.15)), (1, mix(c, hx("#000000"), 0.5))]))
    ctx.fill()
    ctx.save()
    ctx.translate(cx, lvl)
    ctx.rotate(math.atan(slope))
    ellipse(ctx, 0, 0, 150, 14)
    ctx.restore()
    src(ctx, mix(c, hx("#ff8aa0"), 0.35))
    ctx.fill()
    glow(ctx, cx - 50, lvl + 60, 30, 60, hx("#ff6a8a"), 0.25)
    ctx.restore()
    bowl()
    src(ctx, hx("#ffffff", 0.07))
    ctx.fill_preserve()
    src(ctx, hx("#ffffff", 0.5))
    ctx.set_line_width(2.5)
    ctx.stroke()
    ellipse(ctx, cx, top, 110, 14)
    src(ctx, hx("#ffffff", 0.45))
    ctx.set_line_width(2)
    ctx.stroke()
    ctx.move_to(cx - 100, top + 40)
    ctx.curve_to(cx - 124, top + 140, cx - 100, top + 220, cx - 70, top + 260)
    src(ctx, hx("#ffffff", 0.45))
    ctx.set_line_width(7)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    ctx.stroke()
    # uvas
    for i, (gx, gy) in enumerate([(420, 760), (448, 742), (436, 718), (462, 768), (408, 734), (476, 740)]):
        ctx.arc(gx, gy, 16, 0, TAU)
        ctx.set_source(rad(gx - 5, gy - 6, 18, [(0, hx("#9a4a8a")), (1, hx("#3a0f3a"))]))
        ctx.fill()
        glow(ctx, gx - 5, gy - 6, 4, 3, hx("#ffffff"), 0.6)
    sparkles(ctx, p, [(200, 380), (330, 460), (250, 560)], 9)


def dessert(ctx, p, cfg):
    kind = cfg.get("kind", "brownie")
    cx = 270
    shadow(ctx, cx, 740, 230, 40, 0.6)
    ellipse(ctx, cx, 722, 220, 64)
    src(ctx, hx(cfg.get("plate", "#efebe4")))
    ctx.fill()
    ellipse(ctx, cx, 718, 150, 40)
    src(ctx, hx("#000000", 0.06))
    ctx.fill()
    sauce = hx(cfg.get("sauce", "#2b140a"))
    blob(ctx, cx + 10, 712, 110, 33, amp=0.25, ry_scale=0.3)
    src(ctx, sauce)
    ctx.fill()
    glow(ctx, cx - 30, 704, 40, 6, hx("#ffffff"), 0.25)
    if kind == "tiramisu":
        layers = [("#5b3a24", 18), ("#f6e7c8", 30), ("#b07a45", 26), ("#f6e7c8", 30), ("#a06a38", 26)]
        y = 704
        for col, h in reversed(layers):
            ctx.rectangle(160, y - h, 210, h)
            src(ctx, hx(col))
            ctx.fill()
            ctx.move_to(370, y - h)
            ctx.line_to(410, y - h - 30)
            ctx.line_to(410, y - 30)
            ctx.line_to(370, y)
            ctx.close_path()
            src(ctx, mix(hx(col), hx("#000000"), 0.25))
            ctx.fill()
            y -= h
        ctx.move_to(160, y)
        ctx.line_to(370, y)
        ctx.line_to(410, y - 30)
        ctx.line_to(200, y - 30)
        ctx.close_path()
        src(ctx, hx("#4a2c18"))
        ctx.fill()
        rnd = random.Random(3)
        for _ in range(160):
            ctx.rectangle(rnd.uniform(170, 400), y - rnd.uniform(0, 30), 2, 2)
            src(ctx, hx("#2a160a", 0.6))
            ctx.fill()
        for bx in (220, 320):
            ellipse(ctx, bx, y - 18, 10, 6)
            src(ctx, hx("#3a1e0a"))
            ctx.fill()
            ctx.move_to(bx - 7, y - 18)
            ctx.line_to(bx + 7, y - 18)
            src(ctx, hx("#a06a38"))
            ctx.set_line_width(1.5)
            ctx.stroke()

        def cocoa(ctx, x, yy, a, r, ph):
            ctx.arc(x, yy, 1.4 + r * 1.6, 0, TAU)
            src(ctx, hx("#6b3e22", 0.85 * a))
            ctx.fill()

        # peneira
        ellipse(ctx, 300, 180, 90, 22)
        src(ctx, hx("#c7c7cc", 0.9))
        ctx.set_line_width(4)
        ctx.stroke()
        ctx.move_to(390, 180)
        ctx.line_to(500, 150)
        ctx.set_line_width(8)
        ctx.stroke()
        falling(ctx, p, 220, 380, 190, y - 20, 70, 13, cocoa, speed=2)
    else:
        # brownie/petit em cubo
        top_c, front_c = ("#5a3420", "#3e2214") if kind == "brownie" else ("#3e2214", "#2b160c")
        ctx.move_to(180, 610)
        ctx.line_to(360, 610)
        ctx.line_to(360, 700)
        ctx.line_to(180, 700)
        ctx.close_path()
        ctx.set_source(lin(0, 610, 0, 700, [(0, hx(front_c)), (1, mix(hx(front_c), hx("#000000"), 0.4))]))
        ctx.fill()
        ctx.move_to(360, 610)
        ctx.line_to(400, 580)
        ctx.line_to(400, 670)
        ctx.line_to(360, 700)
        ctx.close_path()
        src(ctx, mix(hx(front_c), hx("#000000"), 0.45))
        ctx.fill()
        ctx.move_to(180, 610)
        ctx.line_to(360, 610)
        ctx.line_to(400, 580)
        ctx.line_to(220, 580)
        ctx.close_path()
        src(ctx, hx(top_c))
        ctx.fill()
        rnd = random.Random(1)
        for _ in range(14):
            x, y = rnd.uniform(200, 380), rnd.uniform(584, 606)
            ctx.move_to(x, y)
            ctx.line_to(x + rnd.uniform(-14, 14), y + rnd.uniform(-3, 3))
            src(ctx, hx("#8a5a3a", 0.6))
            ctx.set_line_width(1.5)
            ctx.stroke()
        # bola de sorvete
        ice = hx(cfg.get("ice", "#fff4dc"))
        sx, sy = 292, 552
        blob(ctx, sx, sy, 62, 44, amp=0.18, ry_scale=0.82)
        ctx.set_source(rad(sx - 20, sy - 22, 80, [(0, mix(ice, hx("#ffffff"), 0.5)), (0.7, ice), (1, mix(ice, hx("#000000"), 0.2))]))
        ctx.fill()
        for _ in range(26):
            ellipse(ctx, sx + rnd.uniform(-40, 40), sy + rnd.uniform(-34, 30), 1.6, 1.2)
            src(ctx, hx("#3a2410", 0.55) if kind == "brownie" else hx("#2f5a1a", 0.35))
            ctx.fill()
        ctx.move_to(250, 590)
        ln = 20 + 30 * (0.5 - 0.5 * math.cos(TAU * p))
        ctx.line_to(250, 590 + ln)
        src(ctx, ice)
        ctx.set_line_width(12)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.stroke()
        # calda caindo
        wob = math.sin(TAU * p * 2) * 4
        ctx.move_to(300 + wob, 0)
        ctx.curve_to(300 - wob, 200, 296 + wob, 400, 292, sy - 58)
        src(ctx, sauce)
        ctx.set_line_width(9)
        ctx.stroke()
        ctx.move_to(298 + wob, 0)
        ctx.curve_to(298 - wob, 200, 294 + wob, 400, 290, sy - 58)
        src(ctx, hx("#ffffff", 0.18))
        ctx.set_line_width(2)
        ctx.stroke()
        for k in range(4):
            x = 248 + k * 30
            ln = 18 + 22 * (0.5 + 0.5 * math.sin(TAU * p + k * 1.3))
            ctx.move_to(x, sy - 46 + abs(x - sx) * 0.3)
            ctx.line_to(x, sy - 46 + abs(x - sx) * 0.3 + ln)
            src(ctx, sauce)
            ctx.set_line_width(9)
            ctx.stroke()
        leaf(ctx, sx + 6, sy - 58, 34, 12, -1.1, hx("#3dae4f"))
        leaf(ctx, sx + 6, sy - 58, 30, 11, -2.2, hx("#4ac05a"))
        # morangos
        for bx, by in ((160, 700), (400, 712)):
            ctx.move_to(bx, by + 20)
            ctx.curve_to(bx - 30, by, bx - 22, by - 24, bx, by - 22)
            ctx.curve_to(bx + 22, by - 24, bx + 30, by, bx, by + 20)
            ctx.set_source(rad(bx - 6, by - 10, 30, [(0, hx("#ff5a5a")), (1, hx("#a00a14"))]))
            ctx.fill()
            for _ in range(8):
                ellipse(ctx, bx + rnd.uniform(-12, 12), by + rnd.uniform(-14, 8), 1.4, 2)
                src(ctx, hx("#ffe08a"))
                ctx.fill()
            leaf(ctx, bx, by - 22, 16, 6, -2.4, hx("#3a8a2a"))
            leaf(ctx, bx, by - 22, 16, 6, -0.7, hx("#3a8a2a"))
    sparkles(ctx, p, [(210, 560), (360, 600), (300, 480)], 9)


# ---------------------------------------------------------------- catálogo

BRASA = {"slug": "brasa-burger", "bg": "#160b06", "glow": "#ff6a1a", "table": "wood", "seed": 7}
KAZE = {"slug": "kaze-sushi", "bg": "#0b0a0f", "glow": "#e8443a", "table": "slate", "seed": 11}
NONNA = {"slug": "cantina-nonna", "bg": "#120d08", "glow": "#f2b45a", "table": "toalha", "seed": 4}

SCENES = {
    # Brasa Burger & Co.
    "smash-classico": (BRASA, burger, {"flag": "#ff6a1a"}),
    "bacon-duplo": (BRASA, burger, {"double": True, "bacon": True, "flag": "#ff6a1a"}),
    "batata-rustica": (BRASA, fries, {"box": "#e2441c"}),
    "milkshake-morango": (BRASA, milkshake, {"c1": "#ffb3c7", "c2": "#f0628c", "drizzle": "#d0102e", "straw": "#ff6a1a"}),
    "milkshake-ovomaltine": (BRASA, milkshake, {"c1": "#d9b08c", "c2": "#8a5a36", "drizzle": "#3a1c0c", "straw": "#ff6a1a"}),
    "chopp-pilsen": (BRASA, chopp, {}),
    "limonada-suica": (BRASA, drink, {"c1": "#eef7d4", "c2": "#b7dc7a", "foam": "#eaf5d0", "garnish": "lime", "straw": "#ff6a1a", "mint": 2, "ice": 3, "bubbles": 10, "level": 420, "seed": 3}),
    "brownie-sorvete": (BRASA, dessert, {"kind": "brownie"}),
    # Kaze Sushi Bar
    "combinado-kaze": (KAZE, sushi, {"zoom": 1.04}),
    "ramen-tonkotsu": (KAZE, ramen, {"stripe": "#d83a2e"}),
    "gin-yuzu": (KAZE, drink, {"c1": "#fff6c8", "c2": "#f5d65a", "garnish": "yuzu", "rosemary": True, "ice": 4, "bubbles": 46, "level": 380, "top": 300, "wt": 270, "wb": 220, "seed": 5, "coaster": "#d83a2e"}),
    "petit-matcha": (KAZE, dessert, {"kind": "petit", "ice": "#b8dc8a", "sauce": "#2b140a", "plate": "#1c1b20"}),
    "soda-lichia": (KAZE, drink, {"c1": "#ffe0ea", "c2": "#f59ab8", "garnish": "limao", "ice": 3, "bubbles": 50, "straw": "#d83a2e", "level": 400, "seed": 8}),
    # Cantina Nonna
    "pizza-margherita": (NONNA, pizza, {"kind": "margherita"}),
    "pizza-calabresa": (NONNA, pizza, {"kind": "calabresa"}),
    "spaghetti-sugo": (NONNA, pasta, {"sauce": "#b8261a", "zoom": 1.2}),
    "tiramisu-nonna": (NONNA, dessert, {"kind": "tiramisu", "sauce": "#3a1c0c"}),
    "vinho-tinto": (NONNA, wine, {"c": "#6e0f1e"}),
    "spritz": (NONNA, drink, {"c1": "#ffb35a", "c2": "#f2561a", "garnish": "laranja", "ice": 4, "bubbles": 40, "level": 390, "top": 320, "wt": 260, "wb": 214, "seed": 9}),
    "caipirinha": (NONNA, drink, {"c1": "#f3f9e2", "c2": "#d4eaa6", "ice": 22, "crushed": True, "wedges": 5, "bubbles": 8, "top": 470, "wt": 270, "wb": 240, "level": 500, "seed": 12, "straw": "#2f7a3a"}),
}


def render(name):
    theme, fn, cfg = SCENES[name]
    OUT_VIDEO = os.path.join(MIDIA, theme["slug"], "videos")
    OUT_POSTER = os.path.join(MIDIA, theme["slug"], "posters")
    os.makedirs(OUT_VIDEO, exist_ok=True)
    os.makedirs(OUT_POSTER, exist_ok=True)
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    mp4 = os.path.join(OUT_VIDEO, f"{name}.mp4")
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "27",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4],
        stdin=subprocess.PIPE,
    )
    for f in range(FRAMES):
        p = f / FRAMES
        ctx = cairo.Context(surface)
        ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        background(ctx, p, theme)
        ctx.save()
        s = 1.05 + 0.04 * math.sin(TAU * p)
        ctx.translate(W / 2, 560)
        ctx.scale(s, s)
        ctx.rotate(0.012 * math.sin(TAU * p + 1))
        ctx.translate(-W / 2, -690)
        z = cfg.get("zoom", 1.0)
        ctx.translate(270, 620)
        ctx.scale(z, z)
        ctx.translate(-270, -620)
        fn(ctx, p, cfg)
        ctx.restore()
        light_sweep(ctx, p)
        vignette(ctx)
        surface.flush()
        ff.stdin.write(bytes(surface.get_data()))
        if f == 0:
            png = os.path.join(OUT_POSTER, f"{name}.png")
            surface.write_to_png(png)
    ff.stdin.close()
    ff.wait()
    # fallback VP9 para navegadores sem H.264 (ex.: Chromium de Linux)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "40",
                    "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-an", mp4[:-4] + ".webm"], check=True)
    png = os.path.join(OUT_POSTER, f"{name}.png")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", png, "-q:v", "5", os.path.join(OUT_POSTER, f"{name}.jpg")], check=True)
    os.remove(png)
    print(f"ok  {name}  {os.path.getsize(mp4) // 1024} KB")


if __name__ == "__main__":
    names = sys.argv[1:] or list(SCENES)
    for n in names:
        render(n)
