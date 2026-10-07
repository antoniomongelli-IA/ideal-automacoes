"""
Gera um reel narrado (1080x1920) no padrão visual do @ia.antoniomongelli.

Lê um roteiro em JSON (videos/reels/roteiros/<slug>.json), e para cada cena:
  1. gera a fala com a voz pf_dora (Kokoro, via HyperFrames) e mede a duração;
  2. monta a cena em HTML/GSAP com a duração exata da fala (sem pausas entre cenas);
  3. renderiza com HyperFrames e mixa voz + trilha (que abaixa quando a voz fala).

Uso:
    python3 videos/reels/gerar_reel.py <slug> [--so-html]

Tipos de cena: gancho, frase, chat, lista, comparar, contador, diagrama, linha-do-tempo, cta.
Em qualquer texto, *palavra* fica em azul.
"""

import html
import json
import os
import re
import shutil
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
VIDEOS = os.path.dirname(AQUI)
HF = "hyperframes@0.8.138"
GAP = 0.12  # respiro entre falas (s)
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
VOZ_CADEIA = ("highpass=f=85,equalizer=f=220:t=q:w=1.0:g=2.5,equalizer=f=3200:t=q:w=1.2:g=2.5,"
              "equalizer=f=7500:t=q:w=1.5:g=-1.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3dB,"
              "aecho=0.85:0.6:28|47:0.10|0.06,alimiter=limit=0.95")
TRILHAS = [os.path.join(VIDEOS, "cardapio-apresentacao/assets/music/bgm.wav"),
           os.path.join(VIDEOS, "cardapio-em-video-promo/assets/music/bgm.wav")]


def run(*a, **kw):
    return subprocess.run(list(a), check=True, **kw)


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))


def rico(t):
    """Escapa o texto e transforma *palavra* em destaque azul."""
    t = html.escape(t)
    return re.sub(r"\*(.+?)\*", r'<b class="az">\1</b>', t)


def palavras_destacadas(t):
    """Divide em palavras mantendo o destaque *...* mesmo quando ele cobre várias palavras."""
    saida, dentro = [], False
    for w in t.split(" "):
        abre = w.startswith("*")
        w2 = w[1:] if abre else w
        dentro = dentro or abre
        m = re.match(r"^(.*?)\*(\W*)$", w2)
        fecha = bool(m)
        if fecha:
            w2 = m.group(1)
        txt = html.escape(w2)
        if dentro:
            txt = f'<b class="az">{txt}</b>'
        if fecha:
            txt += html.escape(m.group(2))
            dentro = False
        saida.append(txt)
    return saida


# ------------------------------------------------------------------ narração

def narrar(proj, cenas, velocidade):
    pasta = os.path.join(proj, "assets", "voz")
    os.makedirs(pasta, exist_ok=True)
    tempos = []
    t = 0.0
    for i, c in enumerate(cenas):
        bruto, limpo = os.path.join(pasta, f"{i:02d}.raw.wav"), os.path.join(pasta, f"{i:02d}.wav")
        vel = c.get("velocidade", velocidade)
        if not os.path.exists(limpo) or c.get("_refazer"):
            run("npx", "--yes", HF, "tts", c["fala"], "-v", "pf_dora", "-l", "pt-br", "-s", str(vel), "-o", bruto, capture_output=True)
            run("ffmpeg", "-y", "-v", "error", "-i", bruto, "-af", TRIM, limpo)
            os.remove(bruto)
        d = dur(limpo)
        cena_d = max(d + GAP, c.get("min", 0))
        if c["tipo"] == "cta":
            cena_d += 1.2  # segura o CTA no fim
        tempos.append((t, cena_d, d))
        t += cena_d
    return tempos, round(t, 3)


# ------------------------------------------------------------------ cenas (HTML + GSAP)

def cena_html(i, c):
    p = f"s{i}"
    tp = c["tipo"]
    h = []
    if tp == "gancho":
        desce = ' style="top:{}px"'
        if c.get("logo"):
            h.append(f'<img id="{p}-logo" class="logo-g" src="assets/img/{os.path.basename(c["logo"])}" alt="" />')
        if c.get("selo"):
            h.append(f'<div id="{p}-selo" class="selo-topo"{desce.format(640) if c.get("logo") else ""}>{rico(c["selo"])}</div>')
        h.append(f'<div id="{p}-t" class="gancho"{desce.format(770) if c.get("logo") else ""}>{rico(c["titulo"])}</div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="sub" style="top:{c.get("subTop", 1180)}px">{rico(c["sub"])}</div>')
    elif tp == "frase":
        spans = " ".join(f'<span class="w">{w}</span>' for w in palavras_destacadas(c["titulo"]))
        h.append(f'<div id="{p}-t" class="frase">{spans}</div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="sub" style="top:1260px">{rico(c["sub"])}</div>')
    elif tp == "chat":
        h.append(f'<div id="{p}-t" class="headline">{rico(c["titulo"])}</div>')
        bolhas = "".join(
            f'<div class="bolha {b["lado"]}">{rico(b["texto"])}{f"<small>{b["hora"]}</small>" if b.get("hora") else ""}</div>'
            for b in c["bolhas"])
        nome = html.escape(c.get("contato", "Cliente"))
        h.append(f'<div class="stage"><div id="{p}-ph" class="phone"><div class="phone-top"><div class="avatar">{nome[0]}</div>'
                 f'<div><div class="nome">{nome}</div><div class="online">online</div></div></div><div class="chat">{bolhas}</div></div></div>')
    elif tp == "lista":
        h.append(f'<div id="{p}-n" class="s-num">{c["numero"]}</div><div id="{p}-tag" class="s-tag">{html.escape(c.get("tag", "ERRO"))}</div>')
        h.append(f'<div id="{p}-t" class="s-t">{rico(c["titulo"])}</div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="s-sub">{rico(c["sub"])}</div>')
        if c.get("icone"):
            h.append(f'<div id="{p}-ic" class="icone">{c["icone"]}</div>')
    elif tp == "comparar":
        h.append(f'<div id="{p}-t" class="headline">{rico(c["titulo"])}</div>')
        for lado, cls in (("esq", "ruim"), ("dir", "bom")):
            col = c[lado]
            itens = "".join(f'<li>{rico(x)}</li>' for x in col["itens"])
            h.append(f'<div id="{p}-{lado}" class="col {cls}"><div class="col-t">{rico(col["nome"])}</div><ul>{itens}</ul></div>')
    elif tp == "contador":
        h.append(f'<div id="{p}-t" class="headline">{rico(c["titulo"])}</div>')
        h.append(f'<div class="contador" data-layout-allow-overlap>' + "".join(
            f'<span class="cv" id="{p}-v{k}">{html.escape(str(v))}</span>' for k, v in enumerate(c["valores"])) + "</div>")
        h.append(f'<div id="{p}-rot" class="rotulo">{rico(c["rotulo"])}</div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="sub" style="top:1260px">{rico(c["sub"])}</div>')
    elif tp == "diagrama":
        h.append(f'<div id="{p}-t" class="headline">{rico(c["titulo"])}</div>')
        pos = [(130, 720), (590, 720), (130, 1280), (590, 1280)]
        linhas = '<svg class="linhas" viewBox="0 0 1080 1920">' + "".join(
            f'<line id="{p}-l{k}" x1="540" y1="1060" x2="{x + 180}" y2="{y + 80}" />' for k, (x, y) in enumerate(pos[:len(c["nos"])])) + "</svg>"
        h.append(f'<div class="stage">{linhas}<div id="{p}-centro" class="no-centro">{rico(c["centro"])}</div>')
        for k, (txt, (x, y)) in enumerate(zip(c["nos"], pos)):
            h.append(f'<div id="{p}-n{k}" class="no" style="left:{x}px;top:{y}px">{rico(txt)}</div>')
        h.append("</div>")
    elif tp == "linha-do-tempo":
        h.append(f'<div id="{p}-t" class="headline">{rico(c["titulo"])}</div>')
        h.append('<div class="tl">' + "".join(
            f'<div class="ev" id="{p}-e{k}"><span class="hora">{html.escape(e["hora"])}</span><span class="txt">{rico(e["texto"])}</span></div>'
            for k, e in enumerate(c["eventos"])) + "</div>")
    elif tp == "tela":
        h.append(f'<div id="{p}-t" class="headline" style="top:250px">{rico(c["titulo"])}</div>')
        h.append(f'<div class="stage"><div id="{p}-ph" class="cel"><img src="assets/img/{os.path.basename(c["imagem"])}" alt="" /></div></div>')
    elif tp == "tela-pc":
        h.append(f'<div id="{p}-t" class="headline" style="top:300px">{rico(c["titulo"])}</div>')
        h.append(f'<div class="stage"><div id="{p}-pc" class="pc"><img src="assets/img/{os.path.basename(c["imagem"])}" alt="" /></div></div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="sub" style="top:1330px">{rico(c["sub"])}</div>')
    elif tp == "foto":
        h.append(f'<div id="{p}-img" class="foto-bg" style="background-image:url(assets/img/{os.path.basename(c["imagem"])});background-position:{c.get("pos", "center")}"></div><div class="foto-veu"></div>')
        h.append(f'<div id="{p}-t" class="foto-t">{rico(c["titulo"])}</div>')
        if c.get("sub"):
            h.append(f'<div id="{p}-sub" class="foto-sub">{rico(c["sub"])}</div>')
    elif tp == "cta":
        h.append(f'<div id="{p}-t" class="cta-top">{rico(c["titulo"])}</div>')
        h.append(f'<div id="{p}-box" class="cta-box"><div class="k">{html.escape(c.get("k", "Comenta"))}</div><div class="w" style="font-size:{c.get("wSize", 150)}px">{html.escape(c.get("palavra", "AGENTE"))}</div></div>')
        h.append(f'<div id="{p}-sub" class="cta-sub">{rico(c.get("sub", "e eu te mando um *diagnóstico grátis*."))}</div>')
        h.append(f'<div id="{p}-h" class="cta-handle">{html.escape(c.get("handle", "@ia.antoniomongelli"))}</div>')
    return "\n".join(h)


def cena_js(i, c, t0, d):
    p = f"s{i}"
    tp = c["tipo"]
    j = []
    rise = lambda sel, at: j.append(f'rise("{sel}", {at:.3f});')
    pop = lambda sel, at, extra="{}": j.append(f'pop("{sel}", {at:.3f}, {extra});')
    if tp == "gancho":
        if c.get("logo"):
            j.append(f'tl.fromTo("#{p}-logo", {{opacity:0, scale:0.5, rotation:-12}}, {{opacity:1, scale:1, rotation:0, duration:0.6, ease:"back.out(1.7)"}}, {t0 + 0.05:.3f});')
        if c.get("selo"):
            rise(f"#{p}-selo", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-t", {{opacity:0, scale:1.18, filter:"blur(16px)"}}, {{opacity:1, scale:1, filter:"blur(0px)", duration:0.6, ease:"power4.out"}}, {t0 + 0.1:.3f});')
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + min(0.9, d * 0.4))
    elif tp == "frase":
        n = len(c["titulo"].split(" "))
        passo = min(0.22, max(0.08, (d * 0.7) / max(n, 1)))
        j.append(f'tl.fromTo("#{p}-t .w", {{opacity:0, y:40, filter:"blur(8px)"}}, {{opacity:1, y:0, filter:"blur(0px)", duration:0.35, stagger:{passo:.3f}, ease:"power3.out"}}, {t0 + 0.05:.3f});')
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + min(d * 0.6, 0.15 + n * passo))
    elif tp == "chat":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-ph", {{opacity:0, z:-500, rotationX:26, rotationY:-10, y:200}}, {{opacity:1, z:0, rotationX:6, rotationY:-4, y:0, duration:0.8, ease:"power3.out"}}, {t0 + 0.15:.3f});')
        j.append(f'tl.to("#{p}-ph", {{rotationY:4, rotationX:3, duration:{max(d - 1, 0.5):.3f}, ease:"sine.inOut"}}, {t0 + 0.95:.3f});')
        nb = len(c["bolhas"])
        for k in range(nb):
            at = t0 + 0.6 + k * (d - 1.2) / max(nb, 1)
            j.append(f'pop("#{p}-ph .bolha:nth-child({k + 1})", {at:.3f}, {{x: {-60 if c["bolhas"][k]["lado"] != "ia" else 60}}});')
    elif tp == "lista":
        j.append(f'tl.fromTo("#{p}-n", {{opacity:0, x:-120, rotationY:50}}, {{opacity:1, x:0, rotationY:0, duration:0.5, ease:"power3.out"}}, {t0 + 0.05:.3f});')
        rise(f"#{p}-tag", t0 + 0.15)
        rise(f"#{p}-t", t0 + 0.25)
        if c.get("icone"):
            j.append(f'tl.fromTo("#{p}-ic", {{opacity:0, scale:0.5, rotation:-20, z:300}}, {{opacity:1, scale:1, rotation:0, z:0, duration:0.6, ease:"back.out(1.7)"}}, {t0 + 0.45:.3f});')
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + min(d * 0.5, 1.6))
    elif tp == "comparar":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-esq", {{opacity:0, x:-200, rotationY:35}}, {{opacity:1, x:0, rotationY:8, duration:0.6, ease:"power3.out"}}, {t0 + 0.3:.3f});')
        j.append(f'tl.fromTo("#{p}-esq li", {{opacity:0, x:-30}}, {{opacity:1, x:0, duration:0.3, stagger:{(d * 0.3) / 4:.3f}}}, {t0 + 0.6:.3f});')
        meio = t0 + d * 0.45
        j.append(f'tl.fromTo("#{p}-dir", {{opacity:0, x:200, rotationY:-35}}, {{opacity:1, x:0, rotationY:-8, duration:0.6, ease:"power3.out"}}, {meio:.3f});')
        j.append(f'tl.fromTo("#{p}-dir li", {{opacity:0, x:30}}, {{opacity:1, x:0, duration:0.3, stagger:{(d * 0.3) / 4:.3f}}}, {meio + 0.3:.3f});')
        j.append(f'tl.to("#{p}-esq", {{opacity:0.45, scale:0.96, duration:0.4}}, {meio + 0.2:.3f});')
    elif tp == "contador":
        rise(f"#{p}-t", t0 + 0.05)
        nv = len(c["valores"])
        j.append(f'tl.fromTo("#{p}-v0", {{opacity:0, scale:1.4}}, {{opacity:1, scale:1, duration:0.35, ease:"power4.out"}}, {t0 + 0.3:.3f});')
        for k in range(1, nv):
            at = t0 + 0.3 + k * (d * 0.6) / max(nv - 1, 1)
            j.append(f'tl.to("#{p}-v{k - 1}", {{opacity:0, y:-60, duration:0.15}}, {at:.3f});')
            j.append(f'tl.fromTo("#{p}-v{k}", {{opacity:0, y:60}}, {{opacity:1, y:0, duration:0.2, ease:"power3.out"}}, {at + 0.08:.3f});')
        rise(f"#{p}-rot", t0 + 0.45)
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + d * 0.7)
    elif tp == "diagrama":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-centro", {{opacity:0, scale:0.4, z:-400}}, {{opacity:1, scale:1, z:0, duration:0.6, ease:"back.out(1.6)"}}, {t0 + 0.25:.3f});')
        nn = len(c["nos"])
        for k in range(nn):
            at = t0 + 0.8 + k * (d - 1.3) / max(nn, 1)
            j.append(f'tl.fromTo("#{p}-l{k}", {{strokeDashoffset:600}}, {{strokeDashoffset:0, duration:0.4, ease:"power2.out"}}, {at:.3f});')
            pop(f"#{p}-n{k}", at + 0.2)
    elif tp == "linha-do-tempo":
        rise(f"#{p}-t", t0 + 0.05)
        ne = len(c["eventos"])
        for k in range(ne):
            at = t0 + 0.45 + k * (d - 0.9) / max(ne, 1)
            j.append(f'tl.fromTo("#{p}-e{k}", {{opacity:0, x:-80}}, {{opacity:1, x:0, duration:0.4, ease:"power3.out"}}, {at:.3f});')
            j.append(f'tl.fromTo("#{p}-e{k} .hora", {{color:"#3D8BFF"}}, {{color:"#FFFFFF", duration:0.3}}, {at + 0.4:.3f});')
    elif tp == "tela":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-ph", {{opacity:0, z:-600, rotationY:-28, rotationX:12, y:160}}, {{opacity:1, z:0, rotationY:-8, rotationX:4, y:0, duration:0.85, ease:"power3.out"}}, {t0 + 0.15:.3f});')
        j.append(f'tl.to("#{p}-ph", {{rotationY:8, rotationX:2, duration:{max(d - 1.1, 0.5):.3f}, ease:"sine.inOut"}}, {t0 + 1.0:.3f});')
        j.append(f'tl.fromTo("#{p}-ph img", {{yPercent:0}}, {{yPercent:{c.get("rolar", 0)}, duration:{max(d - 1.4, 0.5):.3f}, ease:"sine.inOut"}}, {t0 + 1.0:.3f});')
    elif tp == "tela-pc":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-pc", {{opacity:0, z:-600, rotationX:30, y:200}}, {{opacity:1, z:0, rotationX:10, y:0, duration:0.85, ease:"power3.out"}}, {t0 + 0.15:.3f});')
        j.append(f'tl.to("#{p}-pc", {{rotationX:4, rotationY:-6, duration:{max(d - 1.1, 0.5):.3f}, ease:"sine.inOut"}}, {t0 + 1.0:.3f});')
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + d * 0.45)
    elif tp == "foto":
        j.append(f'tl.fromTo("#{p}-img", {{scale:1.0, opacity:0}}, {{scale:1.12, opacity:1, duration:{d:.3f}, ease:"none"}}, {t0:.3f});')
        j.append(f'tl.fromTo("#{p}-img", {{opacity:0}}, {{opacity:1, duration:0.5}}, {t0:.3f});')
        rise(f"#{p}-t", t0 + 0.3)
        if c.get("sub"):
            rise(f"#{p}-sub", t0 + min(1.2, d * 0.4))
    elif tp == "cta":
        rise(f"#{p}-t", t0 + 0.05)
        j.append(f'tl.fromTo("#{p}-box", {{opacity:0, scale:0.6, rotationX:40, z:-300}}, {{opacity:1, scale:1, rotationX:0, z:0, duration:0.7, ease:"back.out(1.5)"}}, {t0 + 0.35:.3f});')
        rise(f"#{p}-sub", t0 + 0.9)
        j.append(f'tl.fromTo("#{p}-h", {{opacity:0}}, {{opacity:1, duration:0.4}}, {t0 + 1.2:.3f});')
        j.append(f'tl.to("#{p}-box", {{scale:1.04, duration:0.5, yoyo:true, repeat:1, ease:"sine.inOut"}}, {t0 + 1.5:.3f});')
    if tp != "cta":  # saída da cena
        j.append(f'tl.to("#{p} > *", {{opacity:0, y:-40, duration:0.25, ease:"power2.in"}}, {t0 + d - 0.27:.3f});')
    return "\n".join(j)


CSS = open(os.path.join(AQUI, "estilo-reel.css")).read()


def montar(proj, rot, tempos, total):
    cenas_html, cenas_js = [], []
    for i, (c, (t0, d, _)) in enumerate(zip(rot["cenas"], tempos)):
        cenas_html.append(f'<div id="s{i}" class="clip" data-start="{t0:.3f}" data-duration="{d:.3f}" data-track-index="{1 + i % 2}">\n{cena_html(i, c)}\n</div>')
        cenas_js.append(cena_js(i, c, t0, d))
    doc = f"""<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>{html.escape(rot.get("titulo", "Reel"))}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
{CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total:.3f}" data-width="1080" data-height="1920">
      <div id="bg" class="clip" data-start="0" data-duration="{total:.3f}" data-track-index="0">
        <div class="bg-grid"></div><div id="orb-a" class="orb orb-a"></div><div id="orb-b" class="orb orb-b"></div>
        <div id="handle" class="handle">@ia.antoniomongelli</div>
      </div>
{chr(10).join(cenas_html)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      const rise = (s, at) => tl.fromTo(s, {{ opacity: 0, y: 50, filter: "blur(10px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }}, at);
      const pop = (s, at, extra) => tl.fromTo(s, Object.assign({{ opacity: 0, y: 40, scale: 0.88 }}, extra), {{ opacity: 1, x: 0, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.6)" }}, at);
      tl.fromTo("#orb-a", {{ x: 0, y: 0 }}, {{ x: 180, y: 140, duration: {total:.3f}, ease: "sine.inOut" }}, 0);
      tl.fromTo("#orb-b", {{ x: 0, y: 0 }}, {{ x: -220, y: -180, duration: {total:.3f}, ease: "sine.inOut" }}, 0);
      tl.fromTo("#handle", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, 0.1);
{chr(10).join(cenas_js)}
      tl.set({{}}, {{}}, {total:.3f});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    open(os.path.join(proj, "index.html"), "w").write(doc)


def preparar_projeto(proj, slug):
    base = os.path.join(AQUI, "reel-23h")
    os.makedirs(os.path.join(proj, "assets"), exist_ok=True)
    for sub in ("fonts", "vendor"):
        if not os.path.exists(os.path.join(proj, "assets", sub)):
            shutil.copytree(os.path.join(base, "assets", sub), os.path.join(proj, "assets", sub))
    for f in ("hyperframes.json",):
        shutil.copy(os.path.join(base, f), proj)
    pk = json.load(open(os.path.join(base, "package.json")))
    pk["name"] = slug
    json.dump(pk, open(os.path.join(proj, "package.json"), "w"), indent=2)
    json.dump({"id": slug, "name": slug, "createdAt": "2026-10-07T03:00:00.000Z"}, open(os.path.join(proj, "meta.json"), "w"), indent=2)


def mixar(proj, slug, tempos, total, trilha, inicio):
    render = sorted(f for f in os.listdir(os.path.join(proj, "renders")) if f.endswith(".mp4"))[-1]
    entradas = ["-i", os.path.join(proj, "renders", render), "-ss", str(inicio), "-i", trilha]
    partes, rotulos = [], []
    for k, (t0, _, _) in enumerate(tempos):
        entradas += ["-i", os.path.join(proj, "assets", "voz", f"{k:02d}.wav")]
        ms = int((t0 + 0.04) * 1000)
        partes.append(f"[{k + 2}:a]aresample=48000,adelay={ms}|{ms}[v{k}]")
        rotulos.append(f"[v{k}]")
    fc = ";".join(partes) + f";{''.join(rotulos)}amix=inputs={len(rotulos)}:normalize=0,{VOZ_CADEIA},apad,atrim=0:{total},asplit=2[voz][sc];"
    fc += (f"[1:a]aresample=48000,atrim=0:{total},asetpts=N/SR/TB,afade=t=in:d=0.5,afade=t=out:st={total - 2:.2f}:d=2,volume=0.42[m];"
           "[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450[md];"
           "[voz][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000[a]")
    saida = os.path.join(proj, f"{slug}-narrado.mp4")
    run("ffmpeg", "-y", "-v", "error", *entradas, "-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(total), saida)
    shutil.rmtree(os.path.join(proj, "renders"), ignore_errors=True)
    return saida


def main():
    slug = sys.argv[1]
    so_html = "--so-html" in sys.argv
    rot = json.load(open(os.path.join(AQUI, "roteiros", f"{slug}.json")))
    proj = os.path.join(AQUI, slug)
    preparar_projeto(proj, slug)
    os.makedirs(os.path.join(proj, "assets", "img"), exist_ok=True)
    raiz = os.path.dirname(VIDEOS)
    for c in rot["cenas"]:
        for k in ("imagem", "logo"):
            if c.get(k):
                shutil.copy(os.path.join(raiz, c[k]), os.path.join(proj, "assets", "img", os.path.basename(c[k])))
    tempos, total = narrar(proj, rot["cenas"], rot.get("velocidade", 1.08))
    montar(proj, rot, tempos, total)
    json.dump([{"inicio": t0, "duracao": d, "fala": c["fala"]} for c, (t0, d, _) in zip(rot["cenas"], tempos)],
              open(os.path.join(proj, "roteiro-narracao.json"), "w"), ensure_ascii=False, indent=2)
    print(f"{slug}: {len(tempos)} cenas, {total:.1f}s")
    if so_html:
        return
    run("npm", "run", "render", cwd=proj, capture_output=True)
    trilha = TRILHAS[rot.get("trilha", 0)]
    saida = mixar(proj, slug, tempos, total, trilha, rot.get("trilhaInicio", 0))
    print("ok", saida)


if __name__ == "__main__":
    main()
