"use client";

import { useEffect } from "react";

export function MarketingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".v2-hero");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let frame = 0;

    root.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -7%" }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
      observer.observe(item);
    });

    function moveScene(event: PointerEvent) {
      if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        hero.style.setProperty("--parallax-x", `${(x * -8).toFixed(2)}px`);
        hero.style.setProperty("--parallax-y", `${(y * -5).toFixed(2)}px`);
      });
    }

    hero?.addEventListener("pointermove", moveScene, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      hero?.removeEventListener("pointermove", moveScene);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
