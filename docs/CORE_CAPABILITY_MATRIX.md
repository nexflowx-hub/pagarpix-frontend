# PagarPIX × XPayments Core — matriz de capacidades

Auditado sobre o branch `main` de `nexflowx-hub/backend.xpayments.digital`.

## Princípio

O PagarPIX é uma vertical de produto e UX. O XPayments Core continua sendo a única fonte de verdade para autenticação, stores, transações, wallets, ledger, liquidações, webhooks, routing e providers.

## Estado atual

| Capacidade PagarPIX | Contrato atual | Estado | Decisão frontend |
|---|---|---:|---|
| Login merchant | `POST /auth/login` | READY | BFF guarda JWT em cookie HttpOnly |
| Perfil empresarial | `GET /merchant/profile` | READY | Consumir via BFF |
| Stores | `GET /merchant/stores` | READY | Consumir via BFF |
| Wallet BRL consolidada | `GET /wallets` | PARTIAL | Mostrar Wallet BRL se existir |
| Movimentos da Wallet | `GET /wallets/movements` | READY | Consumir sem persistência local |
| Transações PIX | `GET /transactions?currency=BRL` | READY | Consumir e filtrar conforme contrato |
| Wallet por Store | Modelo Wallet não possui `storeId` | MISSING | Não calcular saldo no frontend |
| Depósitos | `GET /wallets/deposits` devolve lista vazia | MISSING | Ação marcada como dependente do Core |
| Levantamentos/Payouts | `GET /wallets/payouts` devolve lista vazia | MISSING | Ação marcada como dependente do Core |
| Transferências | Sem endpoint operacional | MISSING | Não criar workaround local |
| Swap Crypto | Sem modelo/endpoint | FUTURE | Não expor como operação ativa |
| Routing multi-provider PIX | `Store.routingRules` é configuração genérica | PARTIAL | Exibir apenas estado não sensível |
| ProviderConnection / RoutingPolicy | Sem modelos canónicos auditados | MISSING | Criar primeiro no Core |

## Requisito recomendado para Wallets por Store

A Store precisa de uma visão financeira real no Core. Duas abordagens são possíveis:

1. **Wallet física por Store**: adicionar `storeId` opcional a Wallet e garantir unicidade `merchantId + storeId + currency`.
2. **Conta/ledger lógico por Store**: manter a Wallet consolidada e criar contas de ledger por Store, das quais o saldo seja derivado atomicamente.

A opção 2 é preferível para manter tesouraria consolidada e permitir transferências internas auditáveis. Em ambos os casos, o frontend só consome saldos produzidos pelo Core.

## Endpoints Core necessários

- `GET /wallets/stores`
- `GET /wallets/stores/:storeId`
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
