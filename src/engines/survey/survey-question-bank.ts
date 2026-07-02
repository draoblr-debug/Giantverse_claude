import type { SurveyQuestion } from "./survey-questions";

// The full question bank the per-session survey is drawn from.
// 14 questions per dimension × 8 dimensions = 112 questions.
// Each session samples 2 per dimension (16 total) via
// survey-selection.engine.ts, so every participant's journey differs
// while scoring stays balanced across dimensions.
export const QUESTION_BANK: SurveyQuestion[] = [
  // ── VALUES ────────────────────────────────────────────────────────
  {
    id: "val-01", dimension: "VALUES", type: "likert",
    text: "I would rather lose an advantage than compromise on what I believe is right.",
  },
  {
    id: "val-02", dimension: "VALUES", type: "yesno",
    text: "Do you have a personal code or set of principles you consciously live by?",
  },
  {
    id: "val-03", dimension: "VALUES", type: "likert",
    text: "When everyone around me disagrees, I still find it hard to abandon what I know is fair.",
  },
  {
    id: "val-04", dimension: "VALUES", type: "yesno",
    text: "Have you ever walked away from something you wanted because getting it felt wrong?",
  },
  {
    id: "val-05", dimension: "VALUES", type: "likert",
    text: "Keeping a promise matters to me even when the person I made it to would never find out.",
  },
  {
    id: "val-06", dimension: "VALUES", type: "yesno",
    text: "Would you defend someone being treated unfairly even if it cost you socially?",
  },
  {
    id: "val-07", dimension: "VALUES", type: "likert",
    text: "I judge my own actions by a standard that doesn't move, even when circumstances do.",
  },
  {
    id: "val-08", dimension: "VALUES", type: "yesno",
    text: "Is there a line you are certain you would never cross, no matter the reward?",
  },
  {
    id: "val-09", dimension: "VALUES", type: "likert",
    text: "Honesty feels more important to me than harmony, even when the truth is uncomfortable.",
  },
  {
    id: "val-10", dimension: "VALUES", type: "yesno",
    text: "Do you find it difficult to respect someone whose principles shift with convenience?",
  },
  {
    id: "val-11", dimension: "VALUES", type: "likert",
    text: "I feel a quiet obligation to leave things better than I found them.",
  },
  {
    id: "val-12", dimension: "VALUES", type: "yesno",
    text: "Have you kept a promise long after keeping it stopped being easy?",
  },
  {
    id: "val-13", dimension: "VALUES", type: "likert",
    text: "What is fair matters more to me than what is efficient.",
  },
  {
    id: "val-14", dimension: "VALUES", type: "yesno",
    text: "Would you tell an uncomfortable truth to someone you care about if staying silent protected them?",
  },

  // ── FEARS ─────────────────────────────────────────────────────────
  {
    id: "fear-01", dimension: "FEARS", type: "likert",
    text: "I often worry about falling short of the standards I set for myself.",
  },
  {
    id: "fear-02", dimension: "FEARS", type: "yesno",
    text: "Does losing someone's trust feel worse to you than failing at a task?",
  },
  {
    id: "fear-03", dimension: "FEARS", type: "likert",
    text: "The thought of my efforts being forgotten troubles me more than the effort itself.",
  },
  {
    id: "fear-04", dimension: "FEARS", type: "yesno",
    text: "Do you fear becoming irrelevant more than you fear making mistakes?",
  },
  {
    id: "fear-05", dimension: "FEARS", type: "likert",
    text: "I am more afraid of watching something I care about decay slowly than of losing it suddenly.",
  },
  {
    id: "fear-06", dimension: "FEARS", type: "yesno",
    text: "Does the idea of being misunderstood by the people closest to you keep you up at night?",
  },
  {
    id: "fear-07", dimension: "FEARS", type: "likert",
    text: "Chaos and disorder unsettle me more deeply than confrontation does.",
  },
  {
    id: "fear-08", dimension: "FEARS", type: "yesno",
    text: "Are you more afraid of an ordinary life than of a difficult one?",
  },
  {
    id: "fear-09", dimension: "FEARS", type: "likert",
    text: "I worry about the people I protect more than I worry about myself.",
  },
  {
    id: "fear-10", dimension: "FEARS", type: "yesno",
    text: "Does standing still frighten you more than moving in the wrong direction?",
  },
  {
    id: "fear-11", dimension: "FEARS", type: "likert",
    text: "The possibility that I might stop growing scares me more than any external threat.",
  },
  {
    id: "fear-12", dimension: "FEARS", type: "yesno",
    text: "Have you ever stayed in a fight longer than you should have because leaving felt like abandonment?",
  },
  {
    id: "fear-13", dimension: "FEARS", type: "likert",
    text: "I fear the moment when no one needs me more than the years of being needed too much.",
  },
  {
    id: "fear-14", dimension: "FEARS", type: "yesno",
    text: "Does the thought of important knowledge being lost forever disturb you?",
  },

  // ── DREAMS ────────────────────────────────────────────────────────
  {
    id: "drm-01", dimension: "DREAMS", type: "likert",
    text: "I think often about the kind of impact or legacy I want to leave behind.",
  },
  {
    id: "drm-02", dimension: "DREAMS", type: "yesno",
    text: "Is there a specific future you are actively building towards right now?",
  },
  {
    id: "drm-03", dimension: "DREAMS", type: "likert",
    text: "I can picture, in real detail, a world better than this one — and it pulls at me.",
  },
  {
    id: "drm-04", dimension: "DREAMS", type: "yesno",
    text: "Do you daydream about creating something that outlives you?",
  },
  {
    id: "drm-05", dimension: "DREAMS", type: "likert",
    text: "Unexplored places — physical or intellectual — call to me more than familiar comforts.",
  },
  {
    id: "drm-06", dimension: "DREAMS", type: "yesno",
    text: "Have you ever changed your life's direction because of a vision you couldn't shake?",
  },
  {
    id: "drm-07", dimension: "DREAMS", type: "likert",
    text: "My ambitions are less about what I will have and more about what I will have made possible.",
  },
  {
    id: "drm-08", dimension: "DREAMS", type: "yesno",
    text: "Do you keep a private list — written or mental — of things you must do before your time runs out?",
  },
  {
    id: "drm-09", dimension: "DREAMS", type: "likert",
    text: "When I imagine my best future, other people's flourishing is part of the picture.",
  },
  {
    id: "drm-10", dimension: "DREAMS", type: "yesno",
    text: "Is there an idea you have carried for years, waiting for the right moment to build it?",
  },
  {
    id: "drm-11", dimension: "DREAMS", type: "likert",
    text: "I would trade certainty today for the chance of something extraordinary tomorrow.",
  },
  {
    id: "drm-12", dimension: "DREAMS", type: "yesno",
    text: "Do you feel your real life's work hasn't fully begun yet?",
  },
  {
    id: "drm-13", dimension: "DREAMS", type: "likert",
    text: "The horizon interests me more than the ground beneath my feet.",
  },
  {
    id: "drm-14", dimension: "DREAMS", type: "yesno",
    text: "Would you start over somewhere completely new if it meant pursuing what you truly want?",
  },

  // ── POWER ─────────────────────────────────────────────────────────
  {
    id: "pow-01", dimension: "POWER", type: "likert",
    text: "I feel most energised when I am directing a situation or setting the course for others.",
  },
  {
    id: "pow-02", dimension: "POWER", type: "yesno",
    text: "Do people tend to look to you for answers during uncertain situations?",
  },
  {
    id: "pow-03", dimension: "POWER", type: "likert",
    text: "Authority sits comfortably on my shoulders; I don't shrink from being the one accountable.",
  },
  {
    id: "pow-04", dimension: "POWER", type: "yesno",
    text: "Would you rather hold power yourself than trust someone else to use it well?",
  },
  {
    id: "pow-05", dimension: "POWER", type: "likert",
    text: "I believe influence should be earned through competence, and I hold myself to that.",
  },
  {
    id: "pow-06", dimension: "POWER", type: "yesno",
    text: "Have you ever taken charge of a failing situation nobody else would touch?",
  },
  {
    id: "pow-07", dimension: "POWER", type: "likert",
    text: "I am more comfortable being the quiet force behind decisions than the face of them.",
  },
  {
    id: "pow-08", dimension: "POWER", type: "yesno",
    text: "Do you find it hard to follow a leader you don't respect, even when it costs you?",
  },
  {
    id: "pow-09", dimension: "POWER", type: "likert",
    text: "When I hold power over someone, I feel its weight more than its privilege.",
  },
  {
    id: "pow-10", dimension: "POWER", type: "yesno",
    text: "Would you give up control of something you built if that was best for it?",
  },
  {
    id: "pow-11", dimension: "POWER", type: "likert",
    text: "Rules feel to me like instruments — worth honoring, but also worth redesigning.",
  },
  {
    id: "pow-12", dimension: "POWER", type: "yesno",
    text: "Do you trust structures and institutions more than charismatic individuals?",
  },
  {
    id: "pow-13", dimension: "POWER", type: "likert",
    text: "I would rather empower ten people quietly than command a hundred visibly.",
  },
  {
    id: "pow-14", dimension: "POWER", type: "yesno",
    text: "Has responsibility ever found you before you felt ready for it?",
  },

  // ── PEOPLE ────────────────────────────────────────────────────────
  {
    id: "ppl-01", dimension: "PEOPLE", type: "likert",
    text: "The mood and wellbeing of those around me significantly shapes how I feel and decide.",
  },
  {
    id: "ppl-02", dimension: "PEOPLE", type: "yesno",
    text: "Can you usually sense how someone is feeling before they tell you?",
  },
  {
    id: "ppl-03", dimension: "PEOPLE", type: "likert",
    text: "I instinctively look for the person in the room who is being left out.",
  },
  {
    id: "ppl-04", dimension: "PEOPLE", type: "yesno",
    text: "Do strangers often end up telling you things they say they've never told anyone?",
  },
  {
    id: "ppl-05", dimension: "PEOPLE", type: "likert",
    text: "A conflict between people I care about affects me physically, not just emotionally.",
  },
  {
    id: "ppl-06", dimension: "PEOPLE", type: "yesno",
    text: "Have you ever stayed somewhere longer than you wanted to because someone needed you?",
  },
  {
    id: "ppl-07", dimension: "PEOPLE", type: "likert",
    text: "I remember the small details people mention about their lives, often for years.",
  },
  {
    id: "ppl-08", dimension: "PEOPLE", type: "yesno",
    text: "When a group splinters, do you find yourself becoming the bridge between its parts?",
  },
  {
    id: "ppl-09", dimension: "PEOPLE", type: "likert",
    text: "I would rather resolve a disagreement slowly and fully than win it quickly.",
  },
  {
    id: "ppl-10", dimension: "PEOPLE", type: "yesno",
    text: "Is being deeply known by a few people more important to you than being liked by many?",
  },
  {
    id: "ppl-11", dimension: "PEOPLE", type: "likert",
    text: "Watching someone grow because of something I gave them satisfies me more than my own wins.",
  },
  {
    id: "ppl-12", dimension: "PEOPLE", type: "yesno",
    text: "Do you tend to carry other people's burdens as if they were your own?",
  },
  {
    id: "ppl-13", dimension: "PEOPLE", type: "likert",
    text: "I work better alongside others than alone, even when the others slow me down.",
  },
  {
    id: "ppl-14", dimension: "PEOPLE", type: "yesno",
    text: "Have you ever forgiven someone mostly because you understood why they did it?",
  },

  // ── DECISIONS ─────────────────────────────────────────────────────
  {
    id: "dec-01", dimension: "DECISIONS", type: "likert",
    text: "Before committing to something significant, I prefer to gather as much information as possible.",
  },
  {
    id: "dec-02", dimension: "DECISIONS", type: "yesno",
    text: "Do you feel more confident starting something when you have a clear plan in place?",
  },
  {
    id: "dec-03", dimension: "DECISIONS", type: "likert",
    text: "I trust a decision more when I can explain exactly why I made it.",
  },
  {
    id: "dec-04", dimension: "DECISIONS", type: "yesno",
    text: "When facts and instinct disagree, do you usually side with the facts?",
  },
  {
    id: "dec-05", dimension: "DECISIONS", type: "likert",
    text: "I would rather delay a choice than make one I haven't fully thought through.",
  },
  {
    id: "dec-06", dimension: "DECISIONS", type: "yesno",
    text: "Do you replay past decisions to understand what you would do differently?",
  },
  {
    id: "dec-07", dimension: "DECISIONS", type: "likert",
    text: "In a crisis, I get calmer and more methodical while others speed up.",
  },
  {
    id: "dec-08", dimension: "DECISIONS", type: "yesno",
    text: "Have you ever made a major life decision in a single moment and never regretted it?",
  },
  {
    id: "dec-09", dimension: "DECISIONS", type: "likert",
    text: "I weigh how a choice will look in ten years more than how it feels today.",
  },
  {
    id: "dec-10", dimension: "DECISIONS", type: "yesno",
    text: "Do you prefer to test something small before committing to it fully?",
  },
  {
    id: "dec-11", dimension: "DECISIONS", type: "likert",
    text: "Once I decide, I stop looking back — second-guessing feels like a luxury I don't keep.",
  },
  {
    id: "dec-12", dimension: "DECISIONS", type: "yesno",
    text: "When the path is unclear, do you move anyway and adjust as you learn?",
  },
  {
    id: "dec-13", dimension: "DECISIONS", type: "likert",
    text: "I make my best decisions when I've had time alone with the problem first.",
  },
  {
    id: "dec-14", dimension: "DECISIONS", type: "yesno",
    text: "Do you trust processes you've refined over time more than flashes of inspiration?",
  },

  // ── LEADERSHIP ────────────────────────────────────────────────────
  {
    id: "led-01", dimension: "LEADERSHIP", type: "likert",
    text: "I believe the most effective way to lead is through personal example, not authority.",
  },
  {
    id: "led-02", dimension: "LEADERSHIP", type: "yesno",
    text: "Do you often find yourself naturally stepping up in group situations without being asked?",
  },
  {
    id: "led-03", dimension: "LEADERSHIP", type: "likert",
    text: "I am willing to be the first one through a door no one else will open.",
  },
  {
    id: "led-04", dimension: "LEADERSHIP", type: "yesno",
    text: "Have people followed you into something difficult mainly because you went first?",
  },
  {
    id: "led-05", dimension: "LEADERSHIP", type: "likert",
    text: "A good leader absorbs blame and passes on credit; I try to live that way.",
  },
  {
    id: "led-06", dimension: "LEADERSHIP", type: "yesno",
    text: "Would you rather develop ten quiet leaders than be one celebrated one?",
  },
  {
    id: "led-07", dimension: "LEADERSHIP", type: "likert",
    text: "When a group loses direction, I feel personally responsible for finding it again.",
  },
  {
    id: "led-08", dimension: "LEADERSHIP", type: "yesno",
    text: "Do you lead differently depending on who you are leading?",
  },
  {
    id: "led-09", dimension: "LEADERSHIP", type: "likert",
    text: "I would rather set the long-term direction than manage the day-to-day details.",
  },
  {
    id: "led-10", dimension: "LEADERSHIP", type: "yesno",
    text: "Have you ever stepped back from leading because someone else was better suited — even though you wanted it?",
  },
  {
    id: "led-11", dimension: "LEADERSHIP", type: "likert",
    text: "People seem to trust me most in exactly the moments when everything is uncertain.",
  },
  {
    id: "led-12", dimension: "LEADERSHIP", type: "yesno",
    text: "Do you prepare the people around you to succeed without you?",
  },
  {
    id: "led-13", dimension: "LEADERSHIP", type: "likert",
    text: "I hold the people I lead to high standards because I hold myself to higher ones.",
  },
  {
    id: "led-14", dimension: "LEADERSHIP", type: "yesno",
    text: "When something goes wrong on your watch, is your first instinct to own it publicly?",
  },

  // ── MOTIVATION ────────────────────────────────────────────────────
  {
    id: "mot-01", dimension: "MOTIVATION", type: "likert",
    text: "The process of getting better at something drives me more than the reward at the end.",
  },
  {
    id: "mot-02", dimension: "MOTIVATION", type: "yesno",
    text: "Is there a pursuit or goal you find yourself thinking about almost every day?",
  },
  {
    id: "mot-03", dimension: "MOTIVATION", type: "likert",
    text: "I lose track of time most easily when I am making or fixing something with my hands or mind.",
  },
  {
    id: "mot-04", dimension: "MOTIVATION", type: "yesno",
    text: "Do you return to refine work that everyone else already considers finished?",
  },
  {
    id: "mot-05", dimension: "MOTIVATION", type: "likert",
    text: "An unanswered question will quietly occupy my mind for days until I resolve it.",
  },
  {
    id: "mot-06", dimension: "MOTIVATION", type: "yesno",
    text: "Have you taught yourself a skill purely because not knowing it bothered you?",
  },
  {
    id: "mot-07", dimension: "MOTIVATION", type: "likert",
    text: "I am at my best when the work is hard, slow, and almost nobody is watching.",
  },
  {
    id: "mot-08", dimension: "MOTIVATION", type: "yesno",
    text: "Does solving a problem matter more to you than being seen solving it?",
  },
  {
    id: "mot-09", dimension: "MOTIVATION", type: "likert",
    text: "Repetition doesn't bore me when each repetition makes the thing slightly better.",
  },
  {
    id: "mot-10", dimension: "MOTIVATION", type: "yesno",
    text: "Do you feel restless when too much time passes without meaningful progress?",
  },
  {
    id: "mot-11", dimension: "MOTIVATION", type: "likert",
    text: "I am drawn to problems other people have given up on.",
  },
  {
    id: "mot-12", dimension: "MOTIVATION", type: "yesno",
    text: "Would you keep doing your most important work even if you were never paid or praised for it?",
  },
  {
    id: "mot-13", dimension: "MOTIVATION", type: "likert",
    text: "Curiosity has taken me further in life than discipline has.",
  },
  {
    id: "mot-14", dimension: "MOTIVATION", type: "yesno",
    text: "Do you finish what you start even long after the initial excitement is gone?",
  },
];
