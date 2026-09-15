import { ImageResponse } from "next/og";

export const alt = "PagarPIX — Infraestrutura PIX para operações que não podem parar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", color: "#f5fffb", background: "linear-gradient(135deg,#04110d 0%,#061d25 68%,#062836 100%)", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .22, backgroundImage: "linear-gradient(rgba(86,230,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(86,230,255,.18) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", width: 620, height: 620, right: -130, top: -30, borderRadius: 999, background: "radial-gradient(circle,rgba(0,230,161,.35),rgba(0,230,161,0) 67%)" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "62px 72px", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 800 }}><span style={{ width: 34, height: 34, transform: "rotate(45deg)", background: "#00e6a1", borderRadius: 5 }} />Pagar<span style={{ color: "#00e6a1", marginLeft: -18 }}>PIX</span></div>
        <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#00e6a1", fontSize: 18, letterSpacing: 4, fontWeight: 700 }}>PIX PARA EMPRESAS</span><h1 style={{ maxWidth: 870, margin: "20px 0 26px", fontSize: 68, lineHeight: 1.02, letterSpacing: -4, fontWeight: 750 }}>Infraestrutura PIX para operações que não podem parar.</h1><p style={{ margin: 0, color: "#9bb5ad", fontSize: 24 }}>Receba. Roteie. Concilie. Movimente.</p></div>
      </div>
    </div>,
    size
  );
}
