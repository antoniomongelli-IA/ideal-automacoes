"""
Prepara os vídeos gravados de um restaurante para o cardápio.

Para cada vídeo da pasta de entrada:
  - recorta no formato vertical 9:16 (720x1280), centralizado
  - limita a duração (padrão 15s), tira o áudio e comprime
  - gera .mp4 (H.264) + .webm (VP9) e um poster .jpg para carregar instantâneo

O nome do arquivo vira o id do item: "Bacon Duplo.MOV" -> "bacon-duplo".
No final imprime os itens prontos para colar em lib/cardapio/restaurantes/<slug>.ts.

Uso:
    python scripts/cardapio/preparar_videos.py <slug> <pasta-dos-videos> [--duracao 15] [--logo caminho/logo.png]

Exemplo:
    python scripts/cardapio/preparar_videos.py pizzaria-do-ze ~/Downloads/videos-ze --logo ~/Downloads/logo-ze.png

Requer ffmpeg instalado.
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import unicodedata

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
EXTENSOES = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}


def slugify(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def duracao_de(caminho):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", caminho],
        capture_output=True, text=True,
    ).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def preparar(slug, pasta, duracao, logo):
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg não encontrado. Instale com: brew install ffmpeg (Mac) ou apt install ffmpeg (Linux).")
    destino = os.path.join(ROOT, "public", "midia", slug)
    os.makedirs(os.path.join(destino, "videos"), exist_ok=True)
    os.makedirs(os.path.join(destino, "posters"), exist_ok=True)

    arquivos = sorted(f for f in os.listdir(pasta) if os.path.splitext(f)[1].lower() in EXTENSOES)
    if not arquivos:
        sys.exit(f"Nenhum vídeo encontrado em {pasta}")

    filtro = "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30"
    ids = []
    for nome in arquivos:
        entrada = os.path.join(pasta, nome)
        item_id = slugify(os.path.splitext(nome)[0])
        mp4 = os.path.join(destino, "videos", f"{item_id}.mp4")
        webm = os.path.join(destino, "videos", f"{item_id}.webm")
        jpg = os.path.join(destino, "posters", f"{item_id}.jpg")

        ffmpeg("-i", entrada, "-t", str(duracao), "-vf", filtro, "-an", "-c:v", "libx264", "-preset", "slow",
               "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4)
        ffmpeg("-i", mp4, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1",
               "-deadline", "good", "-cpu-used", "4", "-an", webm)
        momento = min(1.0, duracao_de(mp4) / 2)
        ffmpeg("-ss", f"{momento:.2f}", "-i", mp4, "-frames:v", "1", "-q:v", "4", jpg)

        kb = os.path.getsize(mp4) // 1024
        print(f"ok  {nome}  ->  {item_id}  ({kb} KB)")
        ids.append((item_id, os.path.splitext(nome)[0]))

    if logo:
        ext = os.path.splitext(logo)[1].lower()
        shutil.copy(logo, os.path.join(destino, f"logo{ext}"))
        print(f"ok  logo -> /midia/{slug}/logo{ext}  (coloque em branding.logo)")

    print("\nItens para colar em lib/cardapio/restaurantes/%s.ts (preencha descrição, preço e categoria):\n" % slug)
    for item_id, titulo in ids:
        print(
            "    {\n"
            f'      id: "{item_id}",\n'
            f'      nome: "{titulo.strip()}",\n'
            '      descricao: "",\n'
            "      preco: 0,\n"
            '      categoria: "",\n'
            f'      midia: "{item_id}",\n'
            "      pedidos30d: 0,\n"
            "      pedidosMesAnterior: 0,\n"
            "      curtidas: 0,\n"
            "    },"
        )


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Prepara os vídeos de um restaurante para o cardápio.")
    ap.add_argument("slug", help="id do restaurante, o mesmo do link (ex.: pizzaria-do-ze)")
    ap.add_argument("pasta", help="pasta com os vídeos gravados")
    ap.add_argument("--duracao", type=float, default=15, help="duração máxima de cada vídeo em segundos (padrão 15)")
    ap.add_argument("--logo", help="arquivo da logo (png, svg, jpg)")
    a = ap.parse_args()
    preparar(slugify(a.slug), os.path.expanduser(a.pasta), a.duracao, a.logo and os.path.expanduser(a.logo))
