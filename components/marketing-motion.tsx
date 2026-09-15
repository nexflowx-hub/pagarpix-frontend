"use client";

import { useEffect } from "react";

export function MarketingMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".v2-hero");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-ready");
            requestAnimationFrame(() => entry.target.classList.add("is-visible"));
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

    const heroObserver = new IntersectionObserver(([entry]) => {
      hero?.classList.toggle("is-playing", Boolean(entry?.isIntersecting) && !document.hidden);
    }, { threshold: 0.08 });
    if (hero) heroObserver.observe(hero);

    function syncVisibility() {
      if (document.hidden) hero?.classList.remove("is-playing");
    }

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
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      heroObserver.disconnect();
      hero?.removeEventListener("pointermove", moveScene);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  return null;
}
