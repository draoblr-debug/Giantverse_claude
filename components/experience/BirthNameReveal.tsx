"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSessionStore } from "@/stores/session.store";
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
    <div className="legacy-container container2">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <div className="ps-circle-cont">
          <span className="ps-circle"></span>
          <span className="ps-circle"></span>
          <span className="ps-circle"></span>
        </div>
        <table width="100%" cellPadding="0" cellSpacing="0" border={0} className="p-relative">
          <tbody>
            <tr>
              <td>
                <div className="content">
                  <div className="logo m-auto mb-2">
                    <img src="/Images/thegianthunt.png" alt="The Giant Hunt" title="The Giant Hunt" />
                  </div>
                  <div className="g-logo3"></div>
                  
                  <FadeSequence>
                    <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp letter-spacing2 mb-3">
                      A resonance has been found
                    </p>
                  </FadeSequence>
                  
                  <h1 className="txt-center fw-600 creative-title">
                    <NameCrystallize name={birthName} charClassName="h1 fw-600" />
                  </h1>
                  
                  {/* Fixed height container to prevent layout shift when button appears */}
                  <div className="txt-center mt-7 mb-3" style={{ minHeight: "44px" }}>
                    <AnimatePresence>
                      {showCta && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}
                        >
                          <button
                            type="button"
                            onClick={() => router.push("/survey")}
                            className="btn bdr-rds1 wdth-100p"
                            style={{ maxWidth: "250px" }}
                          >
                            Begin Survey
                          </button>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {showCta && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="f-12 txt-center txt-thm-clr-6 line-ht-20 mxw-320 m-auto mb-3"
                      >
                        Hi, {birthName}, answer a few questions quickly to find out your Purpose in Giantverse, which is also your Surname.
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <div className="g-logo4"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
