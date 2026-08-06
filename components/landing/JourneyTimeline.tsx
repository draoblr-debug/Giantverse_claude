import { useTranslations } from "next-intl";

// The four illustrated discovery steps plus the promises panel — the
// "you cannot fail" reassurances the assessment depends on. Static
// content, so this renders on the server.
export function JourneyTimeline() {
  const t = useTranslations("landing.journey");
  const steps = t.raw("steps") as { title: string; caption: string }[];
  const promises = t.raw("promises") as string[];

  return (
    <>
      <ol className="atlas-journey">
        {steps.map((step, i) => (
          <li key={i} className="atlas-step">
            <div className="atlas-step-num" aria-hidden="true">
              {i + 1}
            </div>
            <div className="atlas-step-title">{step.title}</div>
            <div className="atlas-step-caption">{step.caption}</div>
          </li>
        ))}
      </ol>
      <ul className="atlas-promises">
        {promises.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </>
  );
}
