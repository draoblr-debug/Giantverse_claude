import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().uuid().or(z.string()),
  scenario: z.string().min(30).max(300),
  options: z.array(z.object({
    text: z.string().min(3).max(80),
    traits: z.array(z.string()).min(1).max(3)
  })).min(2).max(4),
  theme: z.string(),
  structure: z.string(),
  difficulty: z.number().min(1).max(5)
});
