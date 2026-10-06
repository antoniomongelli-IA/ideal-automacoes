"use client"
import { supabaseNavegador } from "@/lib/supabase/cliente"

// Preparação e envio de arquivos para o Storage (bucket "midia").
// Tudo é feito no aparelho de quem envia: a foto é reduzida e a capa do vídeo
// é tirada de um quadro do próprio vídeo, sem precisar de servidor.

export const LIMITE_VIDEO_MB = 50 // limite por arquivo no plano grátis do Supabase
export const LIMITE_LOGO_MB = 2

/** Reduz a foto para no máximo `max` px no maior lado e salva em JPEG. */
export async function comprimirFoto(arquivo: File | Blob, max = 1440, qualidade = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error("Não foi possível ler a imagem"))), "image/jpeg", qualidade))
}

export interface InfoVideo {
  capa: Blob
  duracao: number
  largura: number
  altura: number
}

/**
 * Abre o vídeo no navegador, confere se ele toca e tira a capa (um quadro do começo).
 * Se o navegador não conseguir abrir, o formato provavelmente não toca em todos os celulares.
 */
export function lerVideo(arquivo: File): Promise<InfoVideo> {
  return new Promise((ok, erro) => {
    const url = URL.createObjectURL(arquivo)
    const v = document.createElement("video")
    v.muted = true
    v.playsInline = true
    v.preload = "auto"
    const falhou = () => {
      URL.revokeObjectURL(url)
      erro(new Error("Este vídeo não abriu neste navegador. Grave em MP4 (no iPhone: Ajustes › Câmera › Formatos › Mais Compatível)."))
    }
    v.onerror = falhou
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1, (v.duration || 2) / 3)
    }
    v.onseeked = () => {
      const largura = v.videoWidth
      const altura = v.videoHeight
      if (!largura || !altura) return falhou()
      const escala = Math.min(1, 720 / largura)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(largura * escala)
      canvas.height = Math.round(altura * escala)
      canvas.getContext("2d")!.drawImage(v, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (capa) => {
          URL.revokeObjectURL(url)
          if (!capa) return falhou()
          ok({ capa, duracao: v.duration, largura, altura })
        },
        "image/jpeg",
        0.82,
      )
    }
    v.src = url
  })
}

const extensao = (tipo: string, nome?: string) =>
  ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg", "image/gif": "gif", "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" })[tipo] ??
  nome?.split(".").pop()?.toLowerCase() ??
  "bin"

/** Envia para midia/<id do estabelecimento>/<pasta>/<nome único> e devolve o endereço público. */
export async function enviarArquivo(estId: string, pasta: "logo" | "fotos" | "videos" | "capas", arquivo: Blob, nome?: string): Promise<string> {
  const tipo = arquivo.type || "application/octet-stream"
  const caminho = `${estId}/${pasta}/${crypto.randomUUID()}.${extensao(tipo, nome)}`
  const sb = supabaseNavegador()
  const { error } = await sb.storage.from("midia").upload(caminho, arquivo, { contentType: tipo, cacheControl: "31536000", upsert: false })
  if (error) throw new Error(error.message.includes("exceeded") ? "Arquivo grande demais para o plano atual." : error.message)
  return sb.storage.from("midia").getPublicUrl(caminho).data.publicUrl
}

/** Apaga um arquivo do Storage a partir do endereço público (ao trocar foto/vídeo). */
export async function apagarArquivo(url?: string | null) {
  if (!url) return
  const marca = "/storage/v1/object/public/midia/"
  const i = url.indexOf(marca)
  if (i < 0) return // arquivo da demo ou de fora do Storage
  await supabaseNavegador().storage.from("midia").remove([decodeURIComponent(url.slice(i + marca.length))])
}

/** Texto em formato de link: "Pizzaria do Zé" -> "pizzaria-do-ze". */
export const paraSlug = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
