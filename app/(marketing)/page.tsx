import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RealmCard } from "@/components/landing/RealmCard";
import { InteractiveWorldMap } from "@/components/landing/InteractiveWorldMap";
import { ArchetypeCompass } from "@/components/landing/ArchetypeCompass";
import { JourneyTimeline } from "@/components/landing/JourneyTimeline";
import { REALM_ORDER } from "@/content/landing-atlas";
import "@/components/landing/landing-atlas.css";

export const metadata = {
  title: "Giantverse — Discover Your Name",
  description: "A brand experience. Discover the name that was always yours.",
};

function SectionHeading({
  eyebrow,
  heading,
  intro,
}: {
  eyebrow: string;
  heading: string;
  intro?: string;
}) {
  return (
    <>
      <div className="atlas-eyebrow">
        <span>{eyebrow}</span>
      </div>
      <h2 className="atlas-heading">{heading}</h2>
      {intro ? <p className="atlas-intro">{intro}</p> : null}
    </>
  );
}

export default async function LandingPage() {
  const t = await getTranslations("marketing");
  const tl = await getTranslations("landing");

  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">

        {/* ── Hero (unchanged, plus the reassurance line) ─────────── */}
        <div className="content">
          <div className="logo m-auto mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Images/thegianthunt.png" alt="The Giant Hunt" title="The Giant Hunt" />
          </div>
          <div className="g-logo m-auto mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Images/g-logo.png" alt="Giantverse" title="Giantverse" />
          </div>
          <div className="g-title2-cont mb-2">
            <div className="line line1"></div>
            <div className="g-title2">
              <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp">{t("eyebrow")}</p>
            </div>
            <div className="line line2"></div>
          </div>
          <div className="g-title m-auto mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Images/g-title.png" alt="Giantverse" title="Giantverse" />
          </div>
          <p className="mxw-385 m-auto txt-center f-14 fw-400 txt-thm-clr-70-2 line-ht-20">
            {t("tagline")}
          </p>
          <div className="txt-center mt-6 mb-2">
            <Link href="/birth" className="btn">
              {t("beginRitual")}
            </Link>
          </div>
          <div className="txt-center mb-3">
            <Link
              href="/visual-discovery"
              className="btn bdr-rds2"
              style={{ background: "transparent", color: "#C9A24B", border: "1px solid #C9A24B" }}
            >
              {t("discoverVisual")}
            </Link>
          </div>
          <div className="txt-center mb-3">
            <Link
              href="/compatibility"
              className="btn bdr-rds2"
              style={{ background: "transparent", color: "#C9A24B", border: "1px solid #C9A24B" }}
            >
              {t("checkCompatibility")}
            </Link>
          </div>
          <p className="atlas-reassure">{tl("reassurance")}</p>
        </div>
      </div>

      {/* The atlas sections live outside .container-fluid (a shared legacy
          class capped at max-width:550px for the narrow hero card used
          across the app) so their own 1060px-wide layout isn't clipped. */}
      <div className="atlas">
        {/* ── What is Giantverse? ────────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading eyebrow="Giantverse" heading={tl("whatIs.heading")} />
          <div className="atlas-cinematic">
            <p>{tl("whatIs.p1")}</p>
            <p>{tl("whatIs.p2")}</p>
            <p>{tl("whatIs.p3")}</p>
            <p>{tl("whatIs.p4")}</p>
          </div>
        </section>

        {/* ── The Five Lands ─────────────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading
            eyebrow="I"
            heading={tl("lands.heading")}
            intro={tl("lands.intro")}
          />
          <div className="atlas-realm-grid">
            {REALM_ORDER.map((realmId) => (
              <RealmCard key={realmId} realmId={realmId} />
            ))}
          </div>
        </section>

        {/* ── Interactive World Map ──────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading
            eyebrow="II"
            heading={tl("map.heading")}
            intro={tl("map.intro")}
          />
          <InteractiveWorldMap />
        </section>

        {/* ── The Giantverse Compass ─────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading
            eyebrow="III"
            heading={tl("compass.heading")}
            intro={tl("compass.intro")}
          />
          <ArchetypeCompass />
        </section>

        {/* ── Your Journey ───────────────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading eyebrow="IV" heading={tl("journey.heading")} />
          <JourneyTimeline />
        </section>

        {/* ── Three Ways In ──────────────────────────────────────── */}
        <section className="atlas-section">
          <SectionHeading
            eyebrow="V"
            heading={tl("paths.heading")}
            intro={tl("paths.intro")}
          />
          <div className="atlas-paths-grid">
            <div className="atlas-path-card">
              <div className="atlas-path-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <p className="atlas-path-title">{tl("paths.items.survey.title")}</p>
              <p className="atlas-path-desc">{tl("paths.items.survey.description")}</p>
              <Link href="/survey" className="atlas-path-link">
                {tl("paths.items.survey.cta")}
              </Link>
            </div>
            <div className="atlas-path-card">
              <div className="atlas-path-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="atlas-path-title">{tl("paths.items.chat.title")}</p>
              <p className="atlas-path-desc">{tl("paths.items.chat.description")}</p>
              <Link href="/scenario-chat" className="atlas-path-link">
                {tl("paths.items.chat.cta")}
              </Link>
            </div>
            <div className="atlas-path-card">
              <div className="atlas-path-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className="atlas-path-title">{tl("paths.items.visual.title")}</p>
              <p className="atlas-path-desc">{tl("paths.items.visual.description")}</p>
              <Link href="/visual-discovery" className="atlas-path-link">
                {tl("paths.items.visual.cta")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Begin Discovery CTA ────────────────────────────────── */}
        <section className="atlas-cta">
          <h2 className="atlas-cta-heading">{tl("cta.heading")}</h2>
          <p className="atlas-cta-sub">{tl("cta.sub")}</p>
          <Link href="/birth" className="btn">
            {tl("cta.button")}
          </Link>
        </section>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
