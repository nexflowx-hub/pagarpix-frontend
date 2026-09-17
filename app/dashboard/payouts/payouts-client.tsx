"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "./payouts.module.css";

type TicketResult = {
  ticketId: string;
  status: string;
  amount: number;
  deliveredTo: string[];
  partialDelivery: boolean;
  createdAt: string;
};

export default function PayoutsClient() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TicketResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      amount: Number(form.get("amount") ?? 0),
      holder: String(form.get("holder") ?? ""),
      taxId: String(form.get("taxId") ?? ""),
      pixKey: String(form.get("pixKey") ?? ""),
      notes: String(form.get("notes") ?? "")
    };

    const response = await fetch("/api/payout-ticket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);

    const body = await response?.json().catch(() => null);
    setSubmitting(false);

    if (!response?.ok) {
      setError(body?.error?.message ?? "Não foi possível abrir a solicitação agora.");
      return;
    }

    setResult(body.data as TicketResult);
    event.currentTarget.reset();
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>SAÍDAS · OPERAÇÃO ASSISTIDA</span>
          <h1>Solicitar saída em BRL</h1>
          <p>Abra um ticket para análise manual. Nenhum valor é transferido automaticamente pelo formulário.</p>
        </div>
        <div className={styles.topActions}>
          <Link href="/dashboard">Visão geral</Link>
          <Link href="/dashboard/routing">Smart Routing</Link>
        </div>
      </header>

      <section className={styles.grid}>
        <article className={styles.formCard}>
          <div className={styles.cardHeader}>
            <div>
              <span>PASSO 1</span>
              <h2>Dados da solicitação</h2>
            </div>
            <span className={styles.status}>MANUAL</span>
          </div>

          <form onSubmit={submit} className={styles.form}>
            <label>
              <span>Valor da saída</span>
              <div className={styles.moneyInput}><b>R$</b><input name="amount" type="number" min="0.01" step="0.01" placeholder="0,00" required /></div>
            </label>

            <div className={styles.twoCols}>
              <label><span>Titular</span><input name="holder" maxLength={160} placeholder="Nome do titular" required /></label>
              <label><span>CPF/CNPJ</span><input name="taxId" maxLength={32} placeholder="Opcional" /></label>
            </div>

            <label><span>Chave PIX de destino</span><input name="pixKey" maxLength={180} placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" required /></label>
            <label><span>Observações</span><textarea name="notes" maxLength={800} rows={4} placeholder="Referência interna, urgência ou contexto operacional." /></label>

            {error ? <div className={styles.error}>{error}</div> : null}
            {result ? (
              <div className={styles.success}>
                <b>Ticket {result.ticketId} aberto.</b>
                <span>Enviado para {result.deliveredTo.join(" + ")}. Status: aguardando análise manual.</span>
              </div>
            ) : null}

            <button type="submit" disabled={submitting}>{submitting ? "Abrindo ticket…" : "Abrir solicitação de saída"}</button>
          </form>
        </article>

        <aside className={styles.side}>
          <article>
            <span className={styles.eyebrow}>COMO FUNCIONA</span>
            <h2>Controle humano antes da saída</h2>
            <ol>
              <li><b>1</b><div><strong>Ticket criado</strong><span>O pedido é enviado ao canal operacional configurado.</span></div></li>
              <li><b>2</b><div><strong>Análise manual</strong><span>Saldo, Store, destino e documentação podem ser conferidos.</span></div></li>
              <li><b>3</b><div><strong>Execução externa</strong><span>A transferência é realizada apenas após aprovação operacional.</span></div></li>
            </ol>
          </article>
          <article className={styles.guardrail}>
            <span>SEGURANÇA OPERACIONAL</span>
            <strong>Este formulário não movimenta dinheiro.</strong>
            <p>O PagarPIX registra a intenção operacional; a saída continua fora do fluxo automático enquanto esta política estiver ativa.</p>
          </article>
        </aside>
      </section>
    </main>
  );
}
