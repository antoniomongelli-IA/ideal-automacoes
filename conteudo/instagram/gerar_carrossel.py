"""Gera carrosséis no padrão do @ia.antoniomongelli a partir de um roteiro em Python/JSON.
Uso: python3 gerar_carrossel.py  (gera todos os roteiros de ROTEIROS abaixo e exporta PNG + JPG)"""
import html, json, os, re, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SETA = '<span class="seta">→</span>'
MAO = '<svg viewBox="0 0 64 64" fill="none" stroke="#3D8BFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 34V14a5 5 0 0 1 10 0v16"/><path d="M32 28a5 5 0 0 1 10 0v4"/><path d="M42 30a5 5 0 0 1 10 0v12c0 9-7 16-16 16h-4c-6 0-10-3-13-8l-7-11a5 5 0 0 1 8-5l2 3"/><path d="M8 8h10M8 8l4-4M8 8l4 4"/></svg>'

def r(t):
    t = html.escape(t)
    t = re.sub(r"\*(.+?)\*", r'<span class="az">\1</span>', t)
    return re.sub(r"_(.+?)_", r'<b class="azc">\1</b>', t)

def topo(i, n):
    return f'<div class="topo"><span>@ia.antoniomongelli</span><span>{i}/{n}</span></div>'

def rod(ultimo=False):
    return '' if ultimo else f'<div class="rodape"><span></span>{SETA}</div>'

def chat(bolhas):
    return '<div class="chat">' + ''.join(
        f'<div class="b {b[0]}">{r(b[1])}{f"<small>{b[2]}</small>" if len(b) > 2 else ""}</div>' for b in bolhas) + '</div>'

def slide(s, i, n):
    t = s["tipo"]
    if t == "capa":
        foto = s["foto"]
        if foto in ("perfil-dir", "perfil-esq"):
            cls = ' capa-esq' if foto == "perfil-esq" else ''
            corpo_style = ('max-width: 470px; gap: 40px; margin-left: auto' if foto == "perfil-esq" else 'max-width: 520px; gap: 40px')
            fundo = f'<div class="brilho"></div><div class="foto-capa"><img src="../fotos/antonio-perfil.png" alt=""></div><div class="capa-fade"></div>'
            corpo = f'<div class="corpo" style="{corpo_style}"><h1>{r(s["titulo"])}</h1><div class="linha"></div><p class="apoio">{r(s["sub"])}</p></div>'
        else:
            cls = ''
            fundo = (f'<div style="position:absolute;inset:0;z-index:0;background:url(\'../fotos/{foto}\') {s.get("pos", "center")} / cover"></div>'
                     '<div style="position:absolute;inset:0;z-index:1;background:linear-gradient(0deg, rgba(2,4,12,1) 0%, rgba(2,4,12,.95) 42%, rgba(2,4,12,.25) 68%, rgba(2,4,12,.85) 100%)"></div>')
            corpo = f'<div class="corpo" style="justify-content: flex-end; gap: 30px; padding-bottom: 150px"><h1 style="font-size: 92px">{r(s["titulo"])}</h1><div class="linha"></div><p class="apoio">{r(s["sub"])}</p></div>'
        serie = f'<div class="serie"><div class="num">{s["num"]}</div><div class="t">Série:<br>{html.escape(s["serie"])}</div></div>'
        rodape = f'<div class="rodape"><div class="arrasta">{MAO}<span>Arrasta pro lado<br>{html.escape(s.get("arrasta", "e entenda o processo."))}</span></div><span>1/{n} {SETA}</span></div>'
        return f'<section class="slide{cls}">{fundo}{serie}{corpo}{rodape}</section>'
    if t == "passo":
        num = f'<div class="n">{s["n"]}</div>' if s.get("n") else ""
        estilo = ' style="border-color: rgba(255,77,126,.6); background: rgba(255,77,126,.12); color: #FF4D7E"' if s.get("alerta") else ""
        cab = f'<div class="passo">{num}<div class="tag"{estilo}>{html.escape(s["tag"])}</div></div>'
        extra = ''
        if s.get("chat"):
            extra = chat(s["chat"])
        if s.get("resumo"):
            extra = '<div class="resumo"><div class="k">' + html.escape(s["resumo"][0]) + '</div>' + '<br>'.join(r(x) for x in s["resumo"][1:]) + '</div>'
        if s.get("itens"):
            extra = '<div class="cartao"><ul class="lista">' + ''.join(f'<li>{r(x)}</li>' for x in s["itens"]) + '</ul></div>'
        return f'<section class="slide">{topo(i, n)}<div class="corpo">{cab}<h2>{r(s["titulo"])}</h2><p>{r(s["texto"])}</p>{extra}</div>{rod()}</section>'
    if t == "vs":
        return (f'<section class="slide">{topo(i, n)}<div class="corpo" style="gap: 28px"><div class="hora-grande">{html.escape(s["hora"])}</div>'
                f'<h2 style="font-size: 64px">{r(s["titulo"])}</h2><div class="vs"><div class="lado sem"><div class="r">SEM AGENTE</div><p>{r(s["sem"])}</p></div>'
                f'<div class="lado com"><div class="r">COM AGENTE DE IA</div><p>{r(s["com"])}</p></div></div></div>{rod()}</section>')
    if t == "marcar":
        return (f'<section class="slide">{topo(i, n)}<div class="corpo"><div class="passo"><div class="tag">{html.escape(s["tag"])}</div></div><h2>{r(s["titulo"])}</h2>'
                f'<div class="cartao"><ul class="marcar">' + ''.join(f'<li>{r(x)}</li>' for x in s["itens"]) + f'</ul></div><p class="apoio">{r(s.get("texto", ""))}</p></div>{rod()}</section>')
    if t == "faixas":
        return (f'<section class="slide">{topo(i, n)}<div class="corpo" style="gap: 26px"><h2>{r(s["titulo"])}</h2>' +
                ''.join(f'<div class="faixa"><div class="q">{html.escape(q)}</div><p>{r(p)}</p></div>' for q, p in s["faixas"]) + f'</div>{rod()}</section>')
    if t == "salvar":
        return (f'<section class="slide">{topo(i, n)}<div class="corpo"><h2>Resumo pra <span class="az">salvar</span></h2><div class="cartao"><ul class="lista">' +
                ''.join(f'<li>{r(x)}</li>' for x in s["itens"]) + f'</ul></div><p class="apoio">{r(s["texto"])}</p></div>{rod()}</section>')
    if t == "cta":
        return (f'<section class="slide"><div class="foto-topo" style="background-image: url(\'../fotos/{s.get("foto", "bastidor-camisa.jpg")}\'); background-position: {s.get("pos", "52% 62%")}"></div>{topo(i, n)}'
                f'<div class="corpo" style="justify-content: flex-end; text-align: center; gap: 30px; padding-bottom: 0"><h2>{r(s["titulo"])}</h2>'
                f'<div class="cta"><div class="k">Comenta</div><div class="w">AGENTE</div></div><p>{r(s.get("texto", "e eu te mando um _diagnóstico grátis_ do seu atendimento."))}</p></div></section>')
    raise ValueError(t)

def gerar(pasta, titulo, slides):
    n = len(slides)
    corpo = "\n".join(slide(s, i + 1, n) for i, s in enumerate(slides))
    doc = f'<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<title>{html.escape(titulo)}</title>\n<link rel="stylesheet" href="../estilo-carrossel.css">\n</head>\n<body>\n<div class="deck">\n{corpo}\n</div>\n</body>\n</html>\n'
    d = os.path.join(AQUI, pasta)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "carrossel.html"), "w").write(doc)
    raiz = os.path.dirname(os.path.dirname(AQUI))
    subprocess.run(["rm", "-rf", os.path.join(d, "out"), os.path.join(d, "jpg")])
    subprocess.run(["node", os.path.join(d, "exportar.mjs"), os.path.join(d, "carrossel.html"), os.path.join(d, "out")], cwd=raiz, check=True, capture_output=True)
    os.makedirs(os.path.join(d, "jpg"))
    for f in sorted(os.listdir(os.path.join(d, "out"))):
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(d, "out", f), "-q:v", "2", os.path.join(d, "jpg", f.replace(".png", ".jpg"))], check=True)
    print("ok", pasta, n, "slides")

if __name__ == "__main__":
    roteiros = json.load(open(os.path.join(AQUI, "roteiros-carrossel.json")))
    alvo = sys.argv[1:] or list(roteiros)
    for k in alvo:
        gerar(k, roteiros[k]["titulo"], roteiros[k]["slides"])
