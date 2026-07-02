"use client";

import { motion } from "framer-motion";

export function ResonanceRipple() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border border-zinc-400/40 dark:border-zinc-100/20"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 600, height: 600, opacity: 0 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.3,
          }}
        />
      ))}
    </div>
  );
}
