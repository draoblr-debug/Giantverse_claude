import { CompatibilityChecker } from "@/components/compatibility/CompatibilityChecker";

export const metadata = {
  title: "Giant Hunt Compatibility Checker",
  description: "See which Giant Hunt role the wheel casts between two Giantverse names.",
};

export default function CompatibilityPage() {
  return <CompatibilityChecker />;
}
