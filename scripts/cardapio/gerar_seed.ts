// Gera supabase/seed_demo.sql com os restaurantes de demonstração.
// Uso: npx tsx scripts/cardapio/gerar_seed.ts
import { writeFileSync } from "node:fs"
import { brasaBurger } from "../../lib/cardapio/restaurantes/brasa-burger"
import { kazeSushi } from "../../lib/cardapio/restaurantes/kaze-sushi"
import { cantinaNonna } from "../../lib/cardapio/restaurantes/cantina-nonna"

const q = (v: unknown) => (v === undefined || v === null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`)
// ids fixos (md5 do nome) para o script poder rodar de novo sem duplicar
const id = (s: string) => `md5(${q(s)})::uuid`
const linhas: string[] = [
  "-- Restaurantes de demonstração (fictícios). Gerado por scripts/cardapio/gerar_seed.ts",
  "-- Pode rodar de novo: apaga e recria só estes três.",
  "begin;",
  "delete from public.estabelecimentos where slug in ('brasa-burger', 'kaze-sushi', 'cantina-nonna');",
]

for (const r of [brasaBurger, kazeSushi, cantinaNonna]) {
  const { logo, ...branding } = r.branding
  linhas.push(
    `insert into public.estabelecimentos (id, slug, nome, nicho, cidade, endereco, horario, instagram, branding, logo_url) values (${id(r.slug)}, ${q(r.slug)}, ${q(r.nome)}, ${q(r.tipo)}, ${q(r.cidade)}, ${q(r.endereco)}, ${q(r.horario)}, ${q(r.instagram)}, ${q(JSON.stringify(branding))}::jsonb, ${q(logo)});`,
  )
  r.categorias.forEach((c, i) =>
    linhas.push(`insert into public.categorias (id, estabelecimento_id, nome, emoji, ordem) values (${id(`${r.slug}/cat/${c.id}`)}, ${id(r.slug)}, ${q(c.nome)}, ${q(c.emoji)}, ${i});`),
  )
  r.itens.forEach((it, i) => {
    const tags = `array[${(it.tags ?? []).map(q).join(", ")}]::text[]`
    linhas.push(
      `insert into public.itens (id, estabelecimento_id, categoria_id, nome, descricao, preco, preco_antigo, video_url, poster_url, tags, serve, tempo_preparo, destaque_mes, nota_chef, pedidos_mes, pedidos_mes_anterior, ordem) values (${id(`${r.slug}/${it.id}`)}, ${id(r.slug)}, ${id(`${r.slug}/cat/${it.categoria}`)}, ${q(it.nome)}, ${q(it.descricao)}, ${it.preco}, ${it.precoAntigo ?? "null"}, ${q(`/midia/${r.slug}/videos/${it.midia}.mp4`)}, ${q(`/midia/${r.slug}/posters/${it.midia}.jpg`)}, ${tags}, ${q(it.serve)}, ${q(it.tempoPreparo)}, ${!!it.destaqueDoMes}, ${q(it.notaDoChef)}, ${it.pedidos30d}, ${it.pedidosMesAnterior}, ${i});`,
    )
  })
  for (const it of r.itens.filter((i) => i.combinaCom))
    linhas.push(`update public.itens set combina_com = ${id(`${r.slug}/${it.combinaCom}`)} where id = ${id(`${r.slug}/${it.id}`)};`)
}
linhas.push("commit;", "")
writeFileSync("supabase/seed_demo.sql", linhas.join("\n"))
console.log(`ok: supabase/seed_demo.sql (${linhas.length} linhas)`)
