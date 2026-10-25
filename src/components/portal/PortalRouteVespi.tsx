"use client";
import { useEffect, useState } from "react";
import { VespiVideoAvatar } from "@/components/mascot/VespiVideoAvatar";

export function PortalRouteVespi({ className }: { className: string }) {
  const [celebration, setCelebration] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const saved = () => { clearTimeout(timer); setCelebration(value => value + 1); timer = setTimeout(() => setCelebration(0), 3000); };
    window.addEventListener("iitaly:task-saved", saved);
    return () => { clearTimeout(timer); window.removeEventListener("iitaly:task-saved", saved); };
  }, []);
  return <div className={className} data-vespi-scene="welcome" aria-hidden="true"><VespiVideoAvatar key={celebration} state={celebration ? "celebrate" : "idle"} presentation="route" /></div>;
}
