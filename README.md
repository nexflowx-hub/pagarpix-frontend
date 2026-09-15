# PagarPIX Frontend

Vertical PIX do ecossistema XPayments, criada como produto fintech e gateway para empresas.

## Arquitetura

```
PagarPIX web / dashboard
          ↓
Next.js BFF (sessão e allowlist)
          ↓
XPayments Core API
          ↓
Wallets · Ledger · Transactions · Routing · Providers
```

O frontend não contém ledger, banco financeiro, credenciais de providers ou lógica de liquidação. O token do XPayments é guardado em cookie HttpOnly e o browser consome apenas um proxy de leitura explicitamente permitido.

## Experiência inicial

- landing institucional com posicionamento fintech + gateway;
- login conectado ao endpoint canônico do XPayments;
- dashboard de conta empresarial BRL;
- Wallet BRL física separada do saldo contábil;
- Stores apresentadas como contas operacionais de recebíveis, sem inventar Wallets físicas por Store;
- transações PIX reais;
- estados explícitos para capacidades ainda ausentes no Core;
- manifest instalável e layout responsivo (sem cache offline de dados financeiros).

## Desenvolvimento

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Quality gate

```bash
npm ci
npm run quality
npx playwright install chromium
npm run test:e2e
```

O CI executa typecheck, ESLint CLI, testes unitários, build, E2E, axe, matriz visual em 1440/1024/768/390 e Lighthouse. Os relatórios são publicados como artefatos da execução.

## Variáveis

- `XPAYMENTS_API_URL`: base privada utilizada pelo BFF. Padrão: `https://api.xpayments.digital/api/v1`.
- `NEXT_PUBLIC_APP_URL`: URL pública da aplicação.

## Estado do Core

Consulte [docs/CORE_CAPABILITY_MATRIX.md](docs/CORE_CAPABILITY_MATRIX.md). Wallet por Store, depósito, transferência e saque devem ser implementados no XPayments Core antes de se tornarem operações ativas no PagarPIX.
