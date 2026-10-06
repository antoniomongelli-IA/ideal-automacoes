import { defineConfig } from "@playwright/test"

// Testes automáticos do cardápio (pasta e2e/).
// Rodam contra o site compilado e um "Supabase de mentira" (e2e/supabase-falso.mjs),
// então não mexem no banco de verdade. Como rodar: veja e2e/README.md.
const PORTA = 3100

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // o Supabase de mentira guarda o que recebeu: um teste por vez
  workers: 1,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORTA}`,
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    locale: "pt-BR",
    timezoneId: "America/Campo_Grande",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    { command: "node e2e/supabase-falso.mjs", url: "http://127.0.0.1:54329/__registros", reuseExistingServer: !process.env.CI },
    { command: `npx next start -p ${PORTA}`, url: `http://localhost:${PORTA}/cardapio`, reuseExistingServer: !process.env.CI, timeout: 120_000 },
  ],
})
