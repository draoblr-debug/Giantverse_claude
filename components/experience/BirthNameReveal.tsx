"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
import { ResonanceRipple } from "@/components/animations/ResonanceRipple";
import { NameCrystallize } from "@/components/animations/NameCrystallize";
import { FadeSequence } from "@/components/animations/FadeSequence";

export function BirthNameReveal() {
  const router = useRouter();
  const birthName = useSessionStore((state) => state.birthName);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (!birthName) {
      router.replace("/birth");
    }
  }, [birthName, router]);

  useEffect(() => {
    if (!birthName) return;
    const timer = setTimeout(
      () => setShowCta(true),
      900 + birthName.length * 150 + 400,
    );
    return () => clearTimeout(timer);
  }, [birthName]);

  if (!birthName) return null;

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-10 p-8">
      <ResonanceRipple />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <FadeSequence>
          <p className="text-sm tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            A resonance has been found
          </p>
        </FadeSequence>

        <h1 className="text-5xl font-semibold tracking-tight">
          <NameCrystallize name={birthName} />
        </h1>

        <AnimatePresence>
          {showCta && (
            <motion.button
              type="button"
              onClick={() => router.push("/survey")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Meet Yourself
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
