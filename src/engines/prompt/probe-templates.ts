import type { Dimension } from "@/types/archetype.types";

export const PROBE_TEMPLATES: Record<Dimension, string> = {
  VALUES:
    "There's a moment — someone you respect asks you to go along with something that's almost right, but not quite. What do you do?",
  FEARS:
    "Imagine you've built something. Ten years of work. And someone asks you to hand it to someone else to finish. What's the first thing you feel?",
  POWER:
    "If you had the room's attention — what would you want them to walk away believing?",
  PEOPLE:
    "Who do you find harder to trust — someone who tells you everything, or someone who says little but never lets you down?",
  DECISIONS:
    "A door closes. Another might open, but you're not sure. Do you knock or wait?",
  DREAMS:
    "Years from now — what's the thing you'd feel emptiest about never having tried?",
  LEADERSHIP:
    "Someone on your team is about to make a mistake you can see coming. What do you do?",
  MOTIVATION:
    "What's the thing that would make you keep going even if no one was watching?",
};

// Default rotation order, used as a fallback when every dimension already
// has a confident Signal (see ProbeEngine.selectNext, Section 5).
export const PROBE_ORDER: Dimension[] = [
  "VALUES",
  "FEARS",
  "DREAMS",
  "POWER",
  "PEOPLE",
  "DECISIONS",
  "LEADERSHIP",
  "MOTIVATION",
];
