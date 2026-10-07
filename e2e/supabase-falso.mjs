// "Supabase de mentira" para os testes automáticos: responde as chamadas que o site
// faz ao banco com dados fixos e guarda o que recebeu (os testes conferem em /__registros).
// Uso: node e2e/supabase-falso.mjs  (porta 54329)
import { createServer } from "node:http"

const PORTA = Number(process.env.PORTA_SUPABASE_FALSO ?? 54329)
const foto = (m) => `/midia/brasa-burger/posters/${m}.jpg`

// cardápio de teste no "banco": WhatsApp ligado, Google ligado e uma promoção o dia todo
const CARDAPIO = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "teste-burguer",
  nome: "Teste Burguer",
  nicho: "hamburgueria",
  cidade: "Campo Grande",
  endereco: null,
  horario: null,
  instagram: null,
  whatsapp: "(67) 99610-2537",
  branding: { primary: "#FF6A1A", onPrimary: "#160B06", logoText: "TESTE", logoMark: "T" },
  logo_url: null,
  pedido_whatsapp: true,
  google_avaliacao: "https://g.page/r/teste/review",
  promocoes: [
    { id: "p1", titulo: "Prato do dia", descricao: "", item_id: "00000000-0000-4000-8000-0000000000b2", preco_promo: 20, dias: [0, 1, 2, 3, 4, 5, 6], hora_inicio: "00:00", hora_fim: "00:00" },
  ],
  categorias: [{ id: "c1", nome: "Burgers", emoji: "🍔" }],
  itens: [
    ["b1", "X-Bacon da Casa", 39.9, "bacon-duplo"],
    ["b2", "Smash do Dia", 32.9, "smash-classico"],
    ["b3", "Batata Rústica", 24.9, "batata-rustica"],
  ].map(([id, nome, preco, m], i) => ({
    id: `00000000-0000-4000-8000-0000000000${id}`,
    categoria_id: "c1",
    nome,
    descricao: `Descrição do ${nome}`,
    preco,
    preco_antigo: null,
    video_url: null,
    poster_url: null,
    foto_url: foto(m),
    tags: [],
    serve: null,
    tempo_preparo: null,
    destaque_mes: i === 0,
    nota_chef: null,
    combina_com: null,
    pedidos_mes: 0,
    pedidos_mes_anterior: 0,
    curtidas: 3 - i,
    vistos_30d: 10 - i,
  })),
}

let registros = []

// tabelas para o painel do dono (cópia em memória; volta ao original em /__limpar)
const DONO_ID = "00000000-0000-4000-8000-00000000d0e0"
const tabelasIniciais = () => ({
  estabelecimentos: [
    {
      ...Object.fromEntries(Object.entries(CARDAPIO).filter(([k]) => !["categorias", "itens", "promocoes"].includes(k))),
      dono_id: DONO_ID,
      ativo: true,
    },
  ],
  categorias: CARDAPIO.categorias.map((c, i) => ({ ...c, estabelecimento_id: CARDAPIO.id, ordem: i })),
  itens: CARDAPIO.itens.map((i, n) => ({ ...i, estabelecimento_id: CARDAPIO.id, ativo: true, ordem: n })),
  promocoes: [],
})
let tabelas = tabelasIniciais()

// filtros simples do PostgREST: ?id=eq.x
const filtrar = (linhas, url) =>
  linhas.filter((l) =>
    [...url.searchParams].every(([k, v]) => !v.startsWith("eq.") || String(l[k]) === v.slice(3)),
  )

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}

function responder(res, status, corpo) {
  res.writeHead(status, { ...cors, "Content-Type": "application/json" })
  res.end(corpo === undefined ? "" : JSON.stringify(corpo))
}

createServer((req, res) => {
  if (req.method === "OPTIONS") return responder(res, 204)
  let texto = ""
  req.on("data", (c) => (texto += c))
  req.on("end", () => {
    const url = new URL(req.url, "http://x")
    let corpo = null
    try {
      corpo = texto ? JSON.parse(texto) : null
    } catch {
      corpo = texto
    }
    const caminho = url.pathname

    if (caminho === "/__registros") return responder(res, 200, registros)
    if (caminho === "/__limpar") {
      registros = []
      tabelas = tabelasIniciais()
      return responder(res, 200, { ok: true })
    }

    registros.push({ caminho, corpo })

    const rpc = caminho.match(/^\/rest\/v1\/rpc\/(\w+)$/)?.[1]
    if (rpc === "cardapio_publico") return responder(res, 200, corpo?.p_slug === CARDAPIO.slug ? CARDAPIO : null)
    if (rpc === "meus_favoritos") return responder(res, 200, [])
    if (rpc === "curtir") return responder(res, 200, 1)
    if (rpc === "pedir_codigo_senha") return responder(res, 200, "ok")
    if (rpc === "redefinir_senha") return responder(res, 200, corpo?.p_codigo === "123456" ? "ok" : "codigo_invalido")
    if (rpc === "eh_dono") return responder(res, 200, false)
    if (rpc === "resumo_painel")
      return responder(res, 200, {
        dias: 30,
        totais: { pessoas: 12, visualizacoes: 40, curtidas: 5, compartilhamentos: 2, detalhes: 3, pessoas_ant: 10, visualizacoes_ant: 30, curtidas_ant: 4, compartilhamentos_ant: 1, pedidos_whatsapp: 7, pedidos_whatsapp_ant: 2, avaliacoes_google: 3 },
        por_dia: [],
        por_hora: [],
        por_item: [],
        clientes_com_conta: 1,
      })
    if (rpc) return responder(res, 204)

    // tabelas (painel do dono)
    const tabela = caminho.match(/^\/rest\/v1\/(estabelecimentos|categorias|itens|promocoes)$/)?.[1]
    if (tabela) {
      const umSo = (req.headers.accept ?? "").includes("vnd.pgrst.object")
      const devolver = (linhas) => responder(res, 200, umSo ? linhas[0] : linhas)
      if (req.method === "GET") return devolver(filtrar(tabelas[tabela], url))
      if (req.method === "POST") {
        const novas = (Array.isArray(corpo) ? corpo : [corpo]).map((l) => ({ id: `novo-${Math.random().toString(36).slice(2)}`, ativo: true, criado_em: new Date().toISOString(), ...l }))
        tabelas[tabela].push(...novas)
        return devolver(novas)
      }
      if (req.method === "PATCH") {
        const alvo = filtrar(tabelas[tabela], url)
        alvo.forEach((l) => Object.assign(l, corpo))
        return devolver(alvo)
      }
      if (req.method === "DELETE") {
        const alvo = new Set(filtrar(tabelas[tabela], url))
        tabelas[tabela] = tabelas[tabela].filter((l) => !alvo.has(l))
        return responder(res, 204)
      }
    }

    // login (cliente ou dono): só aceita a senha "segredo1"
    if (caminho === "/auth/v1/token") {
      if (corpo?.password !== "segredo1") return responder(res, 400, { error: "invalid_grant", error_description: "Invalid login credentials", msg: "Invalid login credentials", code: 400 })
      const ehCliente = String(corpo.email).endsWith("@clientes.idealautomacoes.com.br")
      const user = { id: ehCliente ? "00000000-0000-4000-8000-00000000c11e" : DONO_ID, aud: "authenticated", role: "authenticated", email: corpo.email, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
      return responder(res, 200, { access_token: "falso", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "falso", user })
    }
    if (caminho === "/rest/v1/clientes") {
      const c = { id: "00000000-0000-4000-8000-00000000c11e", nome: "Ana Teste", telefone: "5567999990000" }
      return responder(res, 200, (req.headers.accept ?? "").includes("vnd.pgrst.object") ? c : [c])
    }
    responder(res, 404, { message: `rota não simulada: ${caminho}` })
  })
}).listen(PORTA, "127.0.0.1", () => console.log(`supabase falso na porta ${PORTA}`))
