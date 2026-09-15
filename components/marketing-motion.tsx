"use client";

import { useEffect } from "react";

const HERO_MOTION_DELAY_MS = 900;

export function MarketingMotion() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".v2-hero");
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const precisePointer = window.matchMedia("(pointer: fine) and (min-width: 981px)");
    let frame = 0;
    let heroVisible = false;
    let motionReady = false;

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

    function syncHeroPlayback() {
      hero?.classList.toggle(
        "is-playing",
        motionReady && heroVisible && !document.hidden && !reducedMotion.matches
      );
    }

    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = Boolean(entry?.isIntersecting);
      syncHeroPlayback();
    }, { threshold: 0.08 });
    if (hero) heroObserver.observe(hero);

    // Preserve the first render/LCP window for layout and text. Decorative motion
    // starts shortly afterwards and still pauses when the hero leaves the viewport.
    const motionTimer = window.setTimeout(() => {
      motionReady = true;
      syncHeroPlayback();
    }, HERO_MOTION_DELAY_MS);

    function syncVisibility() {
      syncHeroPlayback();
    }

    function syncMotionPreference() {
      syncHeroPlayback();
    }

    function moveScene(event: PointerEvent) {
      if (!hero || reducedMotion.matches || !precisePointer.matches) return;
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
    reducedMotion.addEventListener("change", syncMotionPreference);

    return () => {
      window.clearTimeout(motionTimer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      heroObserver.disconnect();
      hero?.removeEventListener("pointermove", moveScene);
      document.removeEventListener("visibilitychange", syncVisibility);
      reducedMotion.removeEventListener("change", syncMotionPreference);
    };
  }, []);

  return null;
}
