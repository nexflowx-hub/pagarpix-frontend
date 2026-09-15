# Production Polish V2.5

## Escopo e baseline

- Commit inicial do frontend: `eadc21dfcd1010a0eeb717e7e6215f6f8ad1261a`.
- Auditoria do Core: `6b14ba13dad29ec1b908e434014ababd55c5d7dc`.
- Baseline validada com instalação limpa, typecheck e build de produção.
- A landing em produção tinha conteúdo de `reveal` invisível fora do viewport inicial, produzindo uma extensa área branca na captura full-page.
- O dashboard desconectado apresentava a estrutura financeira vazia como se estivesse ativa, em vez de um estado de sessão claramente bloqueado.

As capturas baseline desktop foram feitas em browser real antes da alteração. A matriz automatizada pós-alteração captura landing e dashboard em 1440, 1024, 768 e 390 pixels no CI.

## Decisões financeiras

- “Disponível para saque” só aceita a Wallet física `WALLET-BRL` de `treasury/overview`, BRL, `BANK_SETTLEMENT`, `physical: true` e `active`.
- `finance.wallet` e `/wallets` permanecem visões contábeis separadas.
- Recebíveis previstos e valores reservados não são somados ao saldo movimentável.
- O cashflow aceita somente `currency=BRL`, `status=succeeded` e `method=pix`, com agregação diária nos últimos sete dias em horário de Brasília.
- Depósito, transferência e saque continuam desabilitados e rotulados como “Requer Core”.

## Produto e experiência

- Design System V2.5 com tokens semânticos, Geist local, escala tipográfica legível, estados e foco visível.
- Narrativa coordenada do hero: criação da cobrança, confirmação, routing, liberação e atualização da Wallet.
- `PublicLayout` comum para Preços, Docs, Status, Contato, Solicitação de acesso e Legal.
- Funnel separado entre Entrar, Solicitar acesso, Falar com especialista e Explorar API.
- Rotas reais do dashboard para Wallet, Stores, PIX, Movimentações e Liberações.
- Bottom navigation e drawer funcional em mobile.
- Estados independentes de loading, sessão necessária, Core indisponível, dados parciais, stale e vazio.

## Segurança e arquitetura

- BFF somente de leitura com allowlist; não existe proxy genérico.
- JWT permanece em cookie HttpOnly, `SameSite=Lax`, sem retorno ao browser.
- Proteção de origem em login/logout.
- Validação runtime de envelopes críticos do Core.
- CSP, HSTS, proteção contra framing, política de permissões e `no-store` para dashboard/API.
- Override compatível do PostCSS transitivo do Next 15.5.25 para `8.5.28`; `npm audit` sem vulnerabilidades conhecidas.
- Dashboard noindex por metadata e header HTTP.
- Sem service worker: o manifest continua instalável, mas dados financeiros não são cacheados como atuais.

## Verificação automatizada

- Unitários: semântica física versus contábil, cashflow PIX, envelopes do Core, allowlist, origem, login e logout.
- E2E: CTAs, login, sessão, indisponibilidade do Core, dados completos/parciais, navegação mobile e logout.
- Acessibilidade: axe nas páginas públicas, login e dashboard.
- Visual: capturas pós-alteração em 1440/1024/768/390.
- Lighthouse: comparação automática entre a produção anterior e a branch; JSON e resumo ficam anexados ao workflow.

## Dependências do XPayments Core

- Escritas de depósito, transferência e saque/payout.
- Modelo canônico caso cada Store precise de uma Wallet física própria, e não apenas visão de recebíveis.
- `ProviderConnection`, `RoutingPolicy` e saúde/failover publicáveis ao merchant.
- Revisão jurídica final de Termos, Privacidade e Cookies; os textos permanecem sinalizados como preliminares e noindex.
