# PagarPIX × XPayments Core — matriz de capacidades

Auditado em 15/09/2026 sobre o commit `6b14ba13dad29ec1b908e434014ababd55c5d7dc` do branch `main` de `nexflowx-hub/backend.xpayments.digital`.

## Princípio

O PagarPIX é uma vertical de produto e UX. O XPayments Core continua sendo a única fonte de verdade para autenticação, stores, transações, wallets, ledger, liquidações, webhooks, routing e providers.

## Estado atual

| Capacidade PagarPIX | Contrato atual | Estado | Decisão frontend |
|---|---|---:|---|
| Login merchant | `POST /auth/login` | READY | BFF guarda JWT em cookie HttpOnly |
| Perfil empresarial | `GET /merchant/profile` | READY | Consumir via BFF |
| Stores | `GET /merchant/stores` | READY | Consumir via BFF |
| Wallet BRL física | `GET /treasury/overview` → `physicalWallets` | READY | Aceitar para saque somente `WALLET-BRL`, BRL, `BANK_SETTLEMENT`, `physical: true` e `active` |
| Wallet/ledger BRL contábil | `GET /wallets` e `GET /finance/overview` | READY | Mostrar separadamente para conciliação; nunca promover a saldo sacável |
| Movimentos da Wallet | `GET /wallets/movements` | READY | Consumir sem persistência local |
| Transações PIX | `GET /transactions?currency=BRL&status=succeeded&method=pix` | READY | Validar envelope paginado, filtrar novamente e agregar por dia |
| Financeiro por Store | `GET /finance/stores?currency=BRL` | READY | Exibir recebíveis e liberações como visão financeira da Store |
| Wallet física por Store | Modelo Wallet não possui `storeId` | MISSING | Não apresentar recebível da Store como saldo físico independente |
| Liberações | `GET /finance/releases?currency=BRL` | READY | Exibir previsão, mantendo-a fora do saldo disponível |
| Depósitos | `GET /wallets/deposits` devolve lista vazia | MISSING | Ação marcada como dependente do Core |
| Saques/Payouts | `GET /wallets/payouts` devolve lista vazia | MISSING | Ação marcada como dependente do Core |
| Transferências | Sem endpoint operacional | MISSING | Não criar workaround local |
| Swap Crypto | Sem modelo/endpoint | FUTURE | Não expor como operação ativa |
| Routing multi-provider PIX | `Store.routingRules` é configuração genérica | PARTIAL | Exibir apenas estado não sensível |
| ProviderConnection / RoutingPolicy | Sem modelos canônicos auditados | MISSING | Criar primeiro no Core |

## Contrato visual obrigatório

O frontend mantém quatro conceitos separados:

1. **Disponível para saque**: apenas `treasury.physicalWallets[].available` da Wallet física validada.
2. **Reservado físico**: `treasury.physicalWallets[].reserved` da mesma Wallet.
3. **Saldo contábil**: `accountingByCurrency` ou `/wallets`, identificado como registro de ledger e não como saque.
4. **A liberar**: `/finance/releases` ou `finance.wallet.pending`, identificado como recebível previsto e não como fundo disponível.

Se a origem física estiver ausente, inativa ou incompatível, a UI mostra **Indisponível / Aguardando Core**. Não existe fallback financeiro.

## Requisito recomendado para Wallets por Store

A Store precisa de uma visão financeira real no Core. Duas abordagens são possíveis:

1. **Wallet física por Store**: adicionar `storeId` opcional a Wallet e garantir unicidade `merchantId + storeId + currency`.
2. **Conta/ledger lógico por Store**: manter a Wallet consolidada e criar contas de ledger por Store, das quais o saldo seja derivado atomicamente.

A opção 2 é preferível para manter tesouraria consolidada e permitir transferências internas auditáveis. Em ambos os casos, o frontend só consome saldos produzidos pelo Core.

## Endpoints Core necessários

- contrato canônico para conta/ledger por Store, caso o produto precise de saldo operacional individual;
- `POST /wallets/deposits`
- `POST /wallets/transfers`
- `POST /wallets/withdrawals`
- `GET /wallets/operations/:id`

Todas as escritas financeiras devem aceitar idempotency key, autorização explícita, validação de saldo, audit log e estados `pending | processing | completed | failed | reversed`.

## Segurança aplicada no frontend

- JWT apenas em cookie HttpOnly;
- proxy BFF com allowlist de rotas de leitura;
- nenhuma API key ou credencial de provider no browser;
- sem saldo, movimento ou settlement persistido no PagarPIX;
- sem endpoint genérico de proxy para impedir acesso acidental a áreas administrativas.
- validação runtime dos envelopes financeiros antes de renderizar valores;
- respostas do dashboard e BFF com `no-store`, e áreas autenticadas com `noindex`.
