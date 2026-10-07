"""
Transforma FOTOS de pratos em vídeos verticais animados para o cardápio.

Útil quando o restaurante ainda não gravou vídeos: cada foto vira um loop de 6s
(540x960) com a foto nítida no centro, o fundo desfocado da própria foto,
um leve movimento de câmera e a moldura nas cores da marca.

Para cada foto gera:
  public/midia/<slug>/videos/<id>.mp4 (+ .webm) e public/midia/<slug>/posters/<id>.jpg

Uso:
    python scripts/cardapio/fotos_para_videos.py <slug> <pasta-das-fotos> [--cor "#C8373D"]

O nome do arquivo vira o id do item: "Smash House.jpg" -> "smash-house".
Requer: pip install pillow  e  ffmpeg instalado.
"""

import argparse
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EXTENSOES = {".jpg", ".jpeg", ".png", ".webp"}
W, H = 1080, 1920  # composição em alta; o vídeo sai em 540x960


def slugify(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def compor(foto, cor):
    """Fundo desfocado + foto nítida com cantos arredondados e sombra."""
    foto = foto.convert("RGB")
    # fundo: a própria foto cobrindo a tela, bem desfocada e escurecida
    esc = max(W / foto.width, H / foto.height)
    fundo = foto.resize((int(foto.width * esc) + 2, int(foto.height * esc) + 2), Image.LANCZOS)
    fundo = fundo.crop(((fundo.width - W) // 2, (fundo.height - H) // 2, (fundo.width - W) // 2 + W, (fundo.height - H) // 2 + H))
    fundo = fundo.filter(ImageFilter.GaussianBlur(48))
    fundo = ImageEnhance.Brightness(fundo).enhance(0.55)
    # véu na cor da marca, de baixo para cima
    veu = Image.new("RGB", (W, H), hex_rgb(cor))
    mascara = Image.linear_gradient("L").resize((W, H)).point(lambda v: int(v * 0.35))
    fundo = Image.composite(veu, fundo, mascara)

    # foto principal: largura de 92% da tela, levemente mais nítida
    largura = int(W * 0.92)
    altura = int(foto.height * largura / foto.width)
    if altura > H * 0.62:
        altura = int(H * 0.62)
        largura = int(foto.width * altura / foto.height)
    principal = foto.resize((largura, altura), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=2))
    principal = ImageEnhance.Color(principal).enhance(1.08)
    raio = 44
    m = Image.new("L", (largura, altura), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, largura - 1, altura - 1), raio, fill=255)

    x, y = (W - largura) // 2, int(H * 0.40 - altura / 2)
    sombra = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sombra).rounded_rectangle((x + 10, y + 40, x + largura - 10, y + altura + 40), raio, fill=170)
    sombra = sombra.filter(ImageFilter.GaussianBlur(40))
    fundo = Image.composite(Image.new("RGB", (W, H), (0, 0, 0)), fundo, sombra)
    fundo.paste(principal, (x, y), m)
    return fundo


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def gerar(slug, pasta, cor):
    destino = os.path.join(ROOT, "public", "midia", slug)
    os.makedirs(os.path.join(destino, "videos"), exist_ok=True)
    os.makedirs(os.path.join(destino, "posters"), exist_ok=True)
    arquivos = sorted(f for f in os.listdir(pasta) if os.path.splitext(f)[1].lower() in EXTENSOES)
    if not arquivos:
        sys.exit(f"Nenhuma foto em {pasta}")
    for nome in arquivos:
        mid = slugify(os.path.splitext(nome)[0])
        quadro = compor(Image.open(os.path.join(pasta, nome)), cor)
        with tempfile.TemporaryDirectory() as tmp:
            still = os.path.join(tmp, "q.png")
            quadro.save(still)
            # zoom suave de ida e volta (loop perfeito em 6s) + leve deriva
            filtro = (
                "zoompan=z='1.06+0.05*sin(2*PI*on/180)':"
                "x='iw/2-(iw/zoom/2)+18*sin(2*PI*on/180)':y='ih/2-(ih/zoom/2)':"
                "d=180:s=540x960:fps=30,format=yuv420p"
            )
            mp4 = os.path.join(destino, "videos", f"{mid}.mp4")
            ffmpeg("-loop", "1", "-i", still, "-vf", filtro, "-frames:v", "180", "-c:v", "libx264", "-preset", "slow", "-crf", "24", "-movflags", "+faststart", "-an", mp4)
            ffmpeg("-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1", "-an", os.path.join(destino, "videos", f"{mid}.webm"))
            ffmpeg("-i", mp4, "-frames:v", "1", "-q:v", "3", os.path.join(destino, "posters", f"{mid}.jpg"))
        print(f"ok  {mid}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("pasta")
    ap.add_argument("--cor", default="#C8373D", help="cor principal da marca (véu no fundo)")
    a = ap.parse_args()
    gerar(a.slug, a.pasta, a.cor)
