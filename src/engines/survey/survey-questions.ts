import type { Dimension } from "@/types/archetype.types";

export type QuestionType = "likert" | "yesno";

export type SurveyQuestion = {
  id: string;
  dimension: Dimension;
  type: QuestionType;
  text: string;
};

export const SURVEY_QUESTIONS: SurveyQuestion[] = [
  // VALUES
  {
    id: "v1",
    dimension: "VALUES",
    type: "likert",
    text: "I would rather lose an advantage than compromise on what I believe is right.",
  },
  {
    id: "v2",
    dimension: "VALUES",
    type: "yesno",
    text: "Do you have a personal code or set of principles you consciously live by?",
  },

  // FEARS
  {
    id: "f1",
    dimension: "FEARS",
    type: "likert",
    text: "I often worry about falling short of the standards I set for myself.",
  },
  {
    id: "f2",
    dimension: "FEARS",
    type: "yesno",
    text: "Does losing someone's trust feel worse to you than failing at a task?",
  },

  // DREAMS
  {
    id: "d1",
    dimension: "DREAMS",
    type: "likert",
    text: "I think often about the kind of impact or legacy I want to leave behind.",
  },
  {
    id: "d2",
    dimension: "DREAMS",
    type: "yesno",
    text: "Is there a specific future you are actively building towards right now?",
  },

  // POWER
  {
    id: "p1",
    dimension: "POWER",
    type: "likert",
    text: "I feel most energised when I am directing a situation or setting the course for others.",
  },
  {
    id: "p2",
    dimension: "POWER",
    type: "yesno",
    text: "Do people tend to look to you for answers during uncertain situations?",
  },

  // PEOPLE
  {
    id: "pe1",
    dimension: "PEOPLE",
    type: "likert",
    text: "The mood and wellbeing of those around me significantly shapes how I feel and decide.",
  },
  {
    id: "pe2",
    dimension: "PEOPLE",
    type: "yesno",
    text: "Can you usually sense how someone is feeling before they tell you?",
  },

  // DECISIONS
  {
    id: "dc1",
    dimension: "DECISIONS",
    type: "likert",
    text: "Before committing to something significant, I prefer to gather as much information as possible.",
  },
  {
    id: "dc2",
    dimension: "DECISIONS",
    type: "yesno",
    text: "Do you feel more confident starting something when you have a clear plan in place?",
  },

  // LEADERSHIP
  {
    id: "l1",
    dimension: "LEADERSHIP",
    type: "likert",
    text: "I believe the most effective way to lead is through personal example, not authority.",
  },
  {
    id: "l2",
    dimension: "LEADERSHIP",
    type: "yesno",
    text: "Do you often find yourself naturally stepping up in group situations without being asked?",
  },

  // MOTIVATION
  {
    id: "m1",
    dimension: "MOTIVATION",
    type: "likert",
    text: "The process of getting better at something drives me more than the reward at the end.",
  },
  {
    id: "m2",
    dimension: "MOTIVATION",
    type: "yesno",
    text: "Is there a pursuit or goal you find yourself thinking about almost every day?",
  },
];
