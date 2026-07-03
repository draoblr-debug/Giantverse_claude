import Link from "next/link";

export const metadata = {
  title: "Giantverse — Discover Your Name",
  description: "A brand experience. Discover the name that was always yours.",
};

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12 text-center">
      <div className="flex flex-col gap-3">
        <p className="text-sm uppercase tracking-widest opacity-50">A brand experience</p>
        <h1 className="text-5xl font-semibold tracking-tight">Giantverse</h1>
        <p className="max-w-md text-lg opacity-70">
          Every person carries a name that was always theirs. Begin the ritual to discover yours.
        </p>
      </div>

      <Link
        href="/birth"
        className="rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition-opacity hover:opacity-80"
      >
        Begin the Ritual
      </Link>
    </main>
  );
}
