import { BirthRitualForm } from "@/components/experience/BirthRitualForm";

export default function BirthRitualPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-semibold">Birth Ritual</h1>
      <BirthRitualForm />
    </main>
  );
}
