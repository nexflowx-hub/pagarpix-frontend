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
- login ligado ao endpoint canónico do XPayments;
- dashboard de conta empresarial BRL;
- Wallet BRL consolidada;
- Stores apresentadas como contas operacionais;
- transações PIX reais;
- estados explícitos para capacidades ainda ausentes no Core;
- PWA e layout responsivo.

## Desenvolvimento

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Variáveis

- `XPAYMENTS_API_URL`: base privada utilizada pelo BFF. Padrão: `https://api.xpayments.digital/api/v1`.
- `NEXT_PUBLIC_APP_URL`: URL pública da aplicação.

## Estado do Core

Consulte [docs/CORE_CAPABILITY_MATRIX.md](docs/CORE_CAPABILITY_MATRIX.md). Wallet por Store, depósito, transferência e levantamento devem ser implementados no XPayments Core antes de se tornarem operações ativas no PagarPIX.
