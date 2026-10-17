"use client";

import { motion } from "motion/react";
import { Vespa, type VespaPose } from "@/components/Vespa";
import { useReducedMotion } from "@/components/motion/MotionProvider";

/** Existing completion/recovery reveal, now with the approved plush character.
 * Image pixels stay static; only this wrapper moves. Reduced motion is instant. */
export function VespaReveal({
  pose,
  className = "",
  alt = "",
  delay = 0,
}: {
  pose: VespaPose;
  className?: string;
  alt?: string;
  /** секунды */
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      className="inline-flex shrink-0"
      initial={{ opacity: 0, scale: 0.72, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 22, mass: 0.8, delay }
      }
    >
      <Vespa pose={pose} className={className} alt={alt} />
    </motion.span>
  );
}
