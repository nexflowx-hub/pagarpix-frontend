"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/brand";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error?.message ?? "Não foi possível entrar.");
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
        <div className="eyebrow"><i /> ACESSO EMPRESARIAL</div>
        <h1>Bem-vindo de volta.</h1>
        <p>Aceda à sua conta PagarPIX ligada ao XPayments Core.</p>
        <form onSubmit={submit}>
          <label>E-mail empresarial<input name="email" type="email" autoComplete="email" required placeholder="voce@empresa.com" /></label>
          <label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button auth-submit" disabled={loading}>{loading ? "A entrar…" : "Entrar na plataforma"} <span>→</span></button>
        </form>
        <small>O token de sessão é protegido em cookie HttpOnly e nunca fica exposto ao browser.</small>
      </section>
      <Link className="auth-back" href="/">← Voltar ao site</Link>
    </main>
  );
}
