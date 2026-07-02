"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useConversationStore } from "@/stores/conversation.store";
import { NameCrystallize } from "@/components/animations/NameCrystallize";

export function LegacyNameReveal() {
  const router = useRouter();
  const proposedLegacyName = useConversationStore((state) => state.proposedLegacyName);
  const legacyNameAccepted = useConversationStore((state) => state.legacyNameAccepted);
  const acceptName = useConversationStore((state) => state.acceptName);
  const rejectName = useConversationStore((state) => state.rejectName);

  if (!proposedLegacyName) return null;

  const onAccept = () => {
    acceptName();
    router.push("/ending");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4 rounded-lg border border-zinc-200 p-6 text-center dark:border-zinc-800"
    >
      <p className="text-sm tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        Based on everything we&apos;ve shared, I think your Legacy Name may be
      </p>
      <h2 className="text-3xl font-semibold">
        <NameCrystallize name={proposedLegacyName} />
      </h2>

      {!legacyNameAccepted && (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => rejectName("keep-talking")}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Let&apos;s Keep Talking
          </button>
          <button
            type="button"
            onClick={() => rejectName("begin-again")}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
          >
            Begin Again
          </button>
        </div>
      )}
    </motion.div>
  );
}
