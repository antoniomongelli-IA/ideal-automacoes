import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"

export const metadata = {
  title: "Política de Privacidade — Ideal Automações",
  description: "Como a Ideal Automações coleta, usa e protege seus dados pessoais.",
}

export default function Privacidade() {
  return (
    <>
      <Navbar />
      <main className="bg-bg min-h-screen pt-28 pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Política de Privacidade</h1>
          <p className="text-text-muted text-sm mb-12">Última atualização: junho de 2025</p>

          <div className="flex flex-col gap-10 text-text-muted leading-relaxed text-sm">

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">1. Quem somos</h2>
              <p>
                A <strong className="text-text-primary">Ideal Automações</strong>, com sede em Campo Grande, MS, é responsável pelo tratamento dos dados coletados neste site. Dúvidas podem ser enviadas para{" "}
                <a href="mailto:contato.ideaalautomacoes@gmail.com" className="text-accent hover:underline">
                  contato.ideaalautomacoes@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">2. Quais dados coletamos</h2>
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li><strong className="text-text-primary">Nome</strong> — fornecido voluntariamente no formulário de contato.</li>
                <li><strong className="text-text-primary">Número de WhatsApp</strong> — fornecido voluntariamente no formulário de contato.</li>
                <li><strong className="text-text-primary">Segmento de negócio</strong> — fornecido voluntariamente no formulário de contato.</li>
                <li><strong className="text-text-primary">Dados de navegação</strong> — coletados automaticamente via cookies para análise de tráfego (origem, páginas visitadas, tempo de sessão).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">3. Para que usamos seus dados</h2>
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li>Entrar em contato via WhatsApp para apresentar nossas soluções de automação.</li>
                <li>Personalizar a abordagem com base no segmento informado.</li>
                <li>Melhorar o site com base em dados de navegação agregados.</li>
                <li>Enviar comunicações relacionadas aos nossos serviços, mediante consentimento.</li>
              </ul>
              <p className="mt-3">Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins comerciais.</p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">4. Base legal (LGPD)</h2>
              <p>
                O tratamento de dados é fundamentado no <strong className="text-text-primary">consentimento</strong> do titular (art. 7º, I da Lei nº 13.709/2018) e no <strong className="text-text-primary">legítimo interesse</strong> da Ideal Automações em responder a solicitações de contato (art. 7º, IX).
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">5. Cookies</h2>
              <p>
                Utilizamos cookies de sessão e de análise (como Google Analytics e Meta Pixel) para entender como os visitantes interagem com o site e para exibir anúncios relevantes. Você pode desabilitar cookies no seu navegador a qualquer momento, embora isso possa afetar a experiência de navegação.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">6. Por quanto tempo guardamos seus dados</h2>
              <p>
                Seus dados são mantidos pelo tempo necessário para atender à finalidade da coleta ou pelo período exigido por lei. Após o encerramento do relacionamento comercial, os dados são excluídos ou anonimizados em até 90 dias.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">7. Seus direitos</h2>
              <p className="mb-3">Conforme a LGPD, você tem direito a:</p>
              <ul className="list-disc list-inside flex flex-col gap-2">
                <li>Confirmar se tratamos seus dados pessoais.</li>
                <li>Acessar os dados que temos sobre você.</li>
                <li>Corrigir dados incompletos ou desatualizados.</li>
                <li>Solicitar a exclusão dos seus dados.</li>
                <li>Revogar o consentimento a qualquer momento.</li>
              </ul>
              <p className="mt-3">
                Para exercer qualquer desses direitos, envie um e-mail para{" "}
                <a href="mailto:contato.ideaalautomacoes@gmail.com" className="text-accent hover:underline">
                  contato.ideaalautomacoes@gmail.com
                </a>{" "}
                com o assunto "LGPD — Direitos do Titular".
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">8. Segurança</h2>
              <p>
                Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda ou divulgação indevida. Os dados coletados pelo formulário são transmitidos via HTTPS e processados por sistemas seguros.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">9. Alterações nesta política</h2>
              <p>
                Esta política pode ser atualizada periodicamente. A data de última atualização estará sempre indicada no topo desta página. O uso continuado do site após qualquer alteração implica aceite das novas condições.
              </p>
            </section>

            <section>
              <h2 className="text-text-primary font-semibold text-lg mb-3">10. Contato</h2>
              <p>
                Ideal Automações — Campo Grande, MS<br />
                E-mail:{" "}
                <a href="mailto:contato.ideaalautomacoes@gmail.com" className="text-accent hover:underline">
                  contato.ideaalautomacoes@gmail.com
                </a><br />
                WhatsApp:{" "}
                <a href="https://wa.me/5567996329837" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  (67) 99632-9837
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
