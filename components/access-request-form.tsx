"use client";

import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "contact@xpayments.digital";

export function AccessRequestForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = [
      "Olá, equipe PagarPIX!",
      "",
      "Gostaria de solicitar uma avaliação para acesso empresarial.",
      "",
      `Nome: ${data.get("name")}`,
      `Empresa: ${data.get("company")}`,
      `E-mail: ${data.get("email")}`,
      `Volume PIX mensal: ${data.get("volume")}`,
      `Objetivo: ${data.get("goal")}`,
      `Contexto adicional: ${data.get("message") || "Não informado"}`
    ].join("\n");
    setSubmitted(true);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Solicitação de acesso PagarPIX")}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className={`access-form${compact ? " is-compact" : ""}`} onSubmit={submit}>
      <div className="form-grid">
        <label><span>Nome completo</span><input name="name" autoComplete="name" maxLength={120} required placeholder="Seu nome" /></label>
        <label><span>Empresa</span><input name="company" autoComplete="organization" maxLength={160} required placeholder="Nome da empresa" /></label>
        <label><span>E-mail empresarial</span><input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="voce@empresa.com" /></label>
        <label><span>Volume PIX mensal</span><select name="volume" defaultValue="" required><option value="" disabled>Selecione uma faixa</option><option>Até R$ 50 mil</option><option>R$ 50 mil a R$ 500 mil</option><option>R$ 500 mil a R$ 5 milhões</option><option>Acima de R$ 5 milhões</option><option>Projeto em validação</option></select></label>
        <label className="form-wide"><span>O que você quer construir?</span><select name="goal" defaultValue="API PIX"><option>API PIX</option><option>Checkout PIX</option><option>Links de pagamento</option><option>Smart Routing e failover</option><option>Conciliação por Store</option><option>Outro fluxo</option></select></label>
        {!compact ? <label className="form-wide"><span>Contexto adicional <small>(opcional)</small></span><textarea name="message" maxLength={2000} rows={4} placeholder="Conte um pouco sobre a operação, integração atual e prazo." /></label> : null}
      </div>
      <button className="ds-button ds-button-primary form-submit" type="submit">Preparar solicitação por e-mail <span aria-hidden="true">→</span></button>
      <p className="form-privacy">Ao continuar, abriremos o seu aplicativo de e-mail com a solicitação preenchida para você revisar e enviar. Nenhum dado é armazenado por este frontend.</p>
      {submitted ? <p className="form-success" role="status">Solicitação preparada. Revise a mensagem no seu aplicativo de e-mail antes de enviar.</p> : null}
    </form>
  );
}
