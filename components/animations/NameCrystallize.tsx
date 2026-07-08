"use client";

import { motion } from "framer-motion";

export function NameCrystallize({ 
  name,
  charClassName = "" 
}: { 
  name: string;
  charClassName?: string;
}) {
  return (
    <span aria-label={name} className="inline-flex">
      {name.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          aria-hidden
          className={charClassName}
          initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, delay: 0.15 * index, ease: "easeOut" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
