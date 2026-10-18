"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content is visible without JS and under reduced motion. */
export function GalleryMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const titles = document.querySelectorAll<HTMLElement>("[data-gallery-reveal]");
    let frame = 0;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("gallery-revealed"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    if (!preference.matches) titles.forEach(title => { title.classList.add("gallery-motion-ready"); observer.observe(title); });
    const update = () => {
      frame = 0;
      const header = document.querySelector<HTMLElement>("[data-gallery-header]");
      const rooms = Array.from(document.querySelectorAll<HTMLElement>('[data-gallery-room="ink"]'));
      const edge = header?.getBoundingClientRect().bottom || 64;
      const dark = rooms.some(room => { const box=room.getBoundingClientRect(); return box.top < edge && box.bottom > edge; });
      header?.setAttribute("data-inverted", String(dark));
      if (!preference.matches) document.querySelectorAll<HTMLElement>("[data-gallery-parallax]").forEach(panel => {
        const box = panel.getBoundingClientRect();
        if (box.top > innerHeight || box.bottom < 0) return;
        const progress = Math.max(-1, Math.min(1, (box.top + box.height/2 - innerHeight/2) / innerHeight));
        panel.style.setProperty("--painting-shift", `${progress * 48}px`);
        panel.style.setProperty("--card-shift", `${progress * -24}px`);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onPreference = () => { titles.forEach(title => title.classList.add("gallery-revealed")); schedule(); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", onPreference);
    update();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); preference.removeEventListener("change", onPreference); };
  }, [pathname]);
  return null;
}
