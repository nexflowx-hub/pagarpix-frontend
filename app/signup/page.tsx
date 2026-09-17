"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/brand";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        companyName: form.get("companyName"),
        storeName: form.get("storeName"),
        email: form.get("email"),
        password
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "Não foi possível criar a conta PagarPIX.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-page">
      <div className="auth-brand"><Brand /></div>
      <section className="auth-panel">
        <div className="eyebrow"><i /> CONTA PAGARPIX BRL</div>
        <h1>Comece a operar em BRL.</h1>
        <p>Crie a sua conta PagarPIX. A Wallet BRL e a primeira Store são preparadas automaticamente para ativação.</p>
        <form onSubmit={submit}>
          <label>Nome do responsável<input name="name" type="text" autoComplete="name" minLength={2} maxLength={120} required placeholder="Seu nome" /></label>
          <label>Empresa / projeto<input name="companyName" type="text" autoComplete="organization" maxLength={160} placeholder="Nome da empresa" /></label>
          <label>Nome da primeira Store<input name="storeName" type="text" maxLength={120} placeholder="Ex.: Minha Loja Brasil" /></label>
          <label>E-mail empresarial<input name="email" type="email" autoComplete="email" required placeholder="voce@empresa.com" /></label>
          <label>Senha<input name="password" type="password" autoComplete="new-password" minLength={10} required placeholder="Mínimo de 10 caracteres" /></label>
          <label>Confirmar senha<input name="passwordConfirm" type="password" autoComplete="new-password" minLength={10} required placeholder="Repita a senha" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="ds-button ds-button-primary auth-submit" disabled={loading}>{loading ? "Criando conta…" : "Criar conta PagarPIX"} <span>→</span></button>
        </form>
        <small>A conta nasce em BRL. A ativação de processamento PIX e rotas ocorre de forma controlada após validação operacional.</small>
        <p className="auth-request">Já usa PagarPIX ou XPayments? <Link href="/login">Entrar com a conta existente</Link>.</p>
      </section>
      <Link className="auth-back" href="/">← Voltar ao site</Link>
    </main>
  );
}
