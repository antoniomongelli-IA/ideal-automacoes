import type { Restaurante } from "../types"
import { brasaBurger } from "./brasa-burger"
import { kazeSushi } from "./kaze-sushi"
import { cantinaNonna } from "./cantina-nonna"

// Para colocar um restaurante novo:
// 1. copie `_modelo.ts` para `<slug>.ts` e preencha marca, categorias e itens
// 2. rode `python scripts/cardapio/preparar_videos.py <slug> <pasta-dos-videos>`
// 3. importe aqui e adicione na lista abaixo
const CADASTRO: Restaurante[] = [brasaBurger, kazeSushi, cantinaNonna]

/** Os itens apontam só o nome do arquivo; aqui viram os endereços do vídeo e da capa. */
export const RESTAURANTES: Restaurante[] = CADASTRO.map((r) => ({
  ...r,
  fonte: "demo",
  itens: r.itens.map((i) => ({
    ...i,
    video: i.midia ? `/midia/${r.slug}/videos/${i.midia}.mp4` : i.video,
    poster: i.midia ? `/midia/${r.slug}/posters/${i.midia}.jpg` : i.poster,
  })),
}))

export function getRestaurante(slug: string) {
  return RESTAURANTES.find((r) => r.slug === slug)
}
