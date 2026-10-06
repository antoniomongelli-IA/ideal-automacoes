"use client"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { supabaseConfigurado, supabaseNavegador } from "@/lib/supabase/cliente"
import { RESTAURANTES } from "@/lib/cardapio/restaurantes"
import { brandingPadrao, NICHOS, nichoPorId } from "@/lib/cardapio/nichos"
import { criarContaDono, traduzirErro, usuarioLogado } from "@/lib/cardapio/dono"
import { enviarArquivo, paraSlug } from "@/lib/cardapio/uploads"
import type { Branding, Restaurante } from "@/lib/cardapio/types"
import { MenuApp } from "../MenuApp"
import { Campo, EditorMarca } from "../marca/EditorMarca"

const PASSOS = ["Seu negócio", "Sua marca", "Acesso"]

/** Prévia: usa os pratos de uma demo parecida com o nicho, com o nome e a marca da pessoa. */
function previa(nicho: string, nome: string, branding: Branding): Restaurante {
  const base = ["hamburgueria", "bar", "churrascaria"].includes(nicho) ? "brasa-burger" : ["japones", "saudavel"].includes(nicho) ? "kaze-sushi" : "cantina-nonna"
  const demo = RESTAURANTES.find((r) => r.slug === base)!
  return { ...demo, slug: "previa", nome: nome || "Seu estabelecimento", branding }
}

export function Cadastro() {
  const router = useRouter()
  const [passo, setPasso] = useState(0)
  const [nome, setNome] = useState("")
  const [nicho, setNicho] = useState("hamburgueria")
  const [slug, setSlug] = useState("")
  const [slugEditado, setSlugEditado] = useState(false)
  const [slugLivre, setSlugLivre] = useState<boolean | null>(null)
  const [cidade, setCidade] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [instagram, setInstagram] = useState("")
  const [branding, setBranding] = useState<Branding>(() => brandingPadrao("Seu cardápio", "hamburgueria"))
  const [logo, setLogo] = useState<File | null>(null)
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [logado, setLogado] = useState(false)
  const [erro, setErro] = useState("")
  const [criando, setCriando] = useState("")

  // nome e nicho preenchem link, fonte, cantos e frase (até a pessoa mexer)
  const linkFinal = slugEditado ? slug : paraSlug(nome)
  useEffect(() => {
    if (!supabaseConfigurado) return
    supabaseNavegador()
      .auth.getSession()
      .then(({ data }) => setLogado(!!data.session))
  }, [])

  // confere se o link está livre (com uma pequena espera enquanto digita)
  useEffect(() => {
    if (!supabaseConfigurado || linkFinal.length < 3) return
    let vivo = true
    const t = setTimeout(async () => {
      const { data } = await supabaseNavegador().rpc("slug_disponivel", { p_slug: linkFinal })
      if (vivo) setSlugLivre(Boolean(data))
    }, 450)
    return () => {
      vivo = false
      clearTimeout(t)
    }
  }, [linkFinal])

  const escolherNicho = (id: string) => {
    setNicho(id)
    const n = nichoPorId(id)
    setBranding((b) => ({ ...b, fontDisplay: n.fonte, radius: n.raio, tagline: n.frase }))
  }
  const mudarNome = (v: string) => {
    setNome(v)
    setBranding((b) => ({ ...b, logoText: v || "Seu cardápio", logoMark: v.trim().charAt(0).toUpperCase() || "★" }))
  }

  const r = useMemo(() => previa(nicho, nome, branding), [nicho, nome, branding])

  const podeAvancar = passo === 0 ? nome.trim().length >= 2 && linkFinal.length >= 3 && slugLivre !== false : true

  const criar = async () => {
    setErro("")
    if (!supabaseConfigurado) return setErro("O banco ainda não está conectado. Siga o guia de configuração do Supabase.")
    try {
      if (!(await usuarioLogado())) {
        setCriando("Criando sua conta…")
        const e = await criarContaDono(email, senha)
        if (e) {
          setCriando("")
          return setErro(e)
        }
      }
      const sb = supabaseNavegador()
      setCriando("Criando seu cardápio…")
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { logo: _semLogo, ...marca } = branding
      const { data: est, error } = await sb
        .from("estabelecimentos")
        .insert({ slug: linkFinal, nome: nome.trim(), nicho, cidade: cidade || null, whatsapp: whatsapp || null, instagram: instagram || null, branding: marca })
        .select("id")
        .single()
      if (error || !est) throw new Error(traduzirErro(error?.message ?? "Não foi possível criar"))

      if (logo) {
        setCriando("Enviando a logo…")
        const url = await enviarArquivo(est.id, "logo", logo, logo.name)
        await sb.from("estabelecimentos").update({ logo_url: url }).eq("id", est.id)
      }
      setCriando("Preparando as categorias…")
      await sb.from("categorias").insert(nichoPorId(nicho).categorias.map((c, i) => ({ estabelecimento_id: est.id, nome: c.nome, emoji: c.emoji, ordem: i })))
      router.push("/cardapio/painel?novo=1")
    } catch (e) {
      setCriando("")
      setErro(e instanceof Error ? e.message : "Algo deu errado. Tente de novo.")
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0c0b10] text-white">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/cardapio" className="text-sm font-semibold text-white/60 hover:text-white">
            ← Cardápio em Vídeo
          </Link>
          <Link href="/cardapio/entrar" className="text-sm text-white/60 hover:text-white">
            Já tenho conta · <span className="font-semibold text-white underline">Entrar</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1fr_360px]">
        <main className="min-w-0">
          <h1 className="text-3xl font-extrabold md:text-4xl">Crie o cardápio em vídeo do seu negócio</h1>
          <p className="mt-2 text-white/60">Em 3 passos. Depois é só adicionar os itens com foto ou vídeo no painel.</p>

          {!supabaseConfigurado && (
            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Modo demonstração: dá para testar os passos e a prévia, mas o cadastro só é salvo depois de conectar o Supabase.
            </p>
          )}

          <ol className="mt-6 flex gap-2">
            {PASSOS.map((p, i) => (
              <li key={p} className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${i === passo ? "border-white/50 bg-white/10" : "border-white/10 text-white/50"}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${i < passo ? "bg-emerald-400 text-black" : "bg-white/15"}`}>{i < passo ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className="truncate">{p}</span>
              </li>
            ))}
          </ol>

          <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#15141a] p-5 md:p-6">
            {passo === 0 && (
              <div className="space-y-5">
                <Campo id="cad-nome" l="Nome do estabelecimento" v={nome} on={mudarNome} placeholder="Ex.: Tropical Burger" />
                <div>
                  <div className="mb-2 text-xs font-semibold text-white/60">Tipo de negócio</div>
                  <div className="flex flex-wrap gap-2">
                    {NICHOS.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => escolherNicho(n.id)}
                        className={`rounded-full border px-3.5 py-2 text-sm transition ${nicho === n.id ? "border-white bg-white font-semibold text-black" : "border-white/15 hover:bg-white/5"}`}
                      >
                        {n.emoji} {n.nome}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Campo
                    id="cad-link"
                    l="Link do cardápio"
                    v={linkFinal}
                    on={(v) => {
                      setSlugEditado(true)
                      setSlug(paraSlug(v))
                    }}
                    placeholder="tropical-burger"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    seusite.com/cardapio/<b className="text-white/80">{linkFinal || "…"}</b>{" "}
                    {supabaseConfigurado && linkFinal.length >= 3 && slugLivre !== null && (
                      <span className={slugLivre ? "text-emerald-400" : "text-rose-400"}>{slugLivre ? "· disponível" : "· já em uso"}</span>
                    )}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Campo id="cad-cidade" l="Cidade" v={cidade} on={setCidade} placeholder="Campo Grande · MS" />
                  <Campo id="cad-whats" l="WhatsApp" v={whatsapp} on={setWhatsapp} placeholder="(67) 99999-9999" />
                  <Campo id="cad-insta" l="Instagram" v={instagram} on={setInstagram} placeholder="@seuperfil" />
                </div>
              </div>
            )}

            {passo === 1 && <EditorMarca branding={branding} mudar={setBranding} aoEnviarLogo={(f) => setLogo(f)} />}

            {passo === 2 && (
              <div className="space-y-4">
                {logado ? (
                  <p className="rounded-xl bg-white/[0.05] p-3 text-sm">Você já está conectado. O cardápio será criado na sua conta.</p>
                ) : (
                  <>
                    <p className="text-sm text-white/60">Com este e-mail e senha você entra no painel para adicionar itens, fotos e vídeos.</p>
                    <Campo id="cad-email" l="E-mail" tipo="email" v={email} on={setEmail} placeholder="voce@seunegocio.com" />
                    <Campo id="cad-senha" l="Senha" tipo="password" v={senha} on={setSenha} placeholder="mínimo 6 caracteres" />
                  </>
                )}
                {erro && <p className="text-sm font-semibold text-rose-400">{erro}</p>}
                <button
                  onClick={criar}
                  disabled={!!criando}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold disabled:opacity-60"
                  style={{ background: branding.primary, color: branding.onPrimary }}
                >
                  {criando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                  {criando || "Criar meu cardápio"}
                </button>
              </div>
            )}
          </section>

          <div className="mt-4 flex justify-between">
            <button onClick={() => setPasso((p) => p - 1)} disabled={passo === 0} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/70 disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            {passo < 2 && (
              <button onClick={() => setPasso((p) => p + 1)} disabled={!podeAvancar} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40">
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-center text-sm font-semibold text-white/60">Prévia ao vivo · com pratos de exemplo</p>
          <div className="relative mx-auto h-[700px] w-[340px] overflow-hidden rounded-[44px] border-[9px] border-[#1f1e25] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            <MenuApp key={r.branding.logo ?? "sem-logo"} restaurante={r} embutido />
          </div>
        </aside>
      </div>
    </div>
  )
}
