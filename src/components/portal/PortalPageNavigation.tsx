"use client";

import { useEffect, useSyncExternalStore, type ComponentProps } from "react";
import styles from "./portal-pages.module.css";

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
const snapshot = () => window.location.search;
const serverSnapshot = () => "";

/** URL-backed sections work with reloads, browser history and copied links. */
export function usePortalPart(fallback: string) {
  const search = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return new URLSearchParams(search).get("part") || fallback;
}

export function navigatePortal(href: string) {
  if (window.location.pathname + window.location.search === href) return;
  window.history.pushState({ ...window.history.state, portalBackHref: window.location.pathname + window.location.search }, "", href);
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
  window.scrollTo({ top: 0, behavior: "instant" });
}

export function PortalPageLink({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) {
  return <a {...props} href={href} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigatePortal(href);
  }} />;
}

export function PortalBreadcrumbs({ stage, current }: { stage?: { id: string; title: string }; current?: string }) {
  return <nav className={styles.breadcrumbs} aria-label="Путь по кабинету"><ol>
    <li><PortalPageLink href="/portal">Мой план</PortalPageLink></li>
    {stage && <li>{current ? <PortalPageLink href={`/portal?stage=${encodeURIComponent(stage.id)}`}>{stage.title}</PortalPageLink> : <span aria-current="page">{stage.title}</span>}</li>}
    {current && <li><span aria-current="page">{current}</span></li>}
  </ol></nav>;
}

export function PortalPageNavigation({ items, active, label = "Разделы задачи" }: {
  items: { id: string; label: string; href: string }[]; active: string; label?: string;
}) {
  return <nav className={styles.sections} aria-label={label}>{items.map(item => <PortalPageLink key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined}>{item.label}</PortalPageLink>)}</nav>;
}

export function usePortalPageFocus(title: string, key: string, target = "portal-step-heading") {
  useEffect(() => {
    document.title = `${title} — iItaly`;
    const frame = requestAnimationFrame(() => document.getElementById(target)?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [title, key, target]);
}
