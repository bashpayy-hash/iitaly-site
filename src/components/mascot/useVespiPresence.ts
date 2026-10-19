"use client";

import { useEffect, useState } from "react";

/** The content owns the character; the always-reachable launcher yields its
 * face, not its action. Intersection state is event-driven, never scroll-polled. */
export function useVespiPresence() {
  const [present, setPresent] = useState(false);
  useEffect(() => {
    const visibility = new Map<Element, boolean>();
    const publish = () => setPresent([...visibility.values()].some(Boolean));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
      publish();
    }, { threshold: 0.05 });
    const sync = () => {
      const targets = new Set([...document.querySelectorAll("[data-vespi]")]
        .filter(node => !node.closest("#chat-launcher, #iitaly-chat")));
      for (const node of visibility.keys()) {
        if (!targets.has(node)) { observer.unobserve(node); visibility.delete(node); }
      }
      for (const node of targets) {
        if (!visibility.has(node)) { visibility.set(node, false); observer.observe(node); }
      }
      publish();
    };
    sync();
    const mutations = new MutationObserver(sync);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
  return present;
}
