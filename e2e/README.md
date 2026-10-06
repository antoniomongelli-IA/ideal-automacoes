# Testes automáticos do cardápio

Abrem o cardápio num navegador de verdade (sem tela) e conferem que o principal funciona:
abas, abrir/voltar de um prato, link de prato, limite de histórico do iPhone, promoções com
horário, “Pedir pelo WhatsApp”, convites de conta (2 min) e do Google (5 min), “esqueci minha
senha” e o monitor de erros.

Não usam o banco de verdade: `e2e/supabase-falso.mjs` imita o Supabase.

Rodam sozinhos no GitHub a cada envio (aba **Actions** → “Testes do cardápio”).
Para rodar no computador:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54329 NEXT_PUBLIC_SUPABASE_ANON_KEY=teste npm run build
npx playwright install chromium   # só na primeira vez
npm run test:e2e
```

Depois, rode `npm run build` de novo (sem as variáveis) antes de usar o site normalmente.
