import type { SurveyQuestion } from "./survey-questions";

// The full question bank the per-session survey is drawn from.
// 14 questions per dimension × 8 dimensions = 112 questions.
// Each session samples 2 per dimension (16 total) via
// survey-selection.engine.ts, so every participant's journey differs
// while scoring stays balanced across dimensions.
//
// Text below is the simplified (grade-8 reading level) rewrite of the
// question bank — same ids/dimension/type as before, reworded for
// clarity and to translate more naturally across languages. Translated
// banks (survey-question-bank.ta.ts, .kn.ts, .hi.ts, .te.ts) mirror this
// file's exact id order per dimension so the deterministic seeded
// selection in survey-selection.engine.ts picks the same questions
// regardless of the participant's language.
export const QUESTION_BANK: SurveyQuestion[] = [
  // ── VALUES ────────────────────────────────────────────────────────
  {
    id: "val-01", dimension: "VALUES", type: "likert",
    text: "I would rather give up an advantage than do something I think is wrong.",
  },
  {
    id: "val-02", dimension: "VALUES", type: "yesno",
    text: "Do you have a set of personal rules that you try to live by?",
  },
  {
    id: "val-03", dimension: "VALUES", type: "likert",
    text: "Even when everyone disagrees with me, it's hard for me to give up on what I know is fair.",
  },
  {
    id: "val-04", dimension: "VALUES", type: "yesno",
    text: "Have you ever given up something you wanted because getting it felt wrong?",
  },
  {
    id: "val-05", dimension: "VALUES", type: "likert",
    text: "Keeping a promise matters to me, even if the other person would never know.",
  },
  {
    id: "val-06", dimension: "VALUES", type: "yesno",
    text: "Would you stand up for someone treated unfairly, even if it hurt your reputation?",
  },
  {
    id: "val-07", dimension: "VALUES", type: "likert",
    text: "I judge my own actions by the same standard, even when situations change.",
  },
  {
    id: "val-08", dimension: "VALUES", type: "yesno",
    text: "Is there something you would never do, no matter what you got for it?",
  },
  {
    id: "val-09", dimension: "VALUES", type: "likert",
    text: "Being honest matters more to me than keeping the peace, even when the truth is uncomfortable.",
  },
  {
    id: "val-10", dimension: "VALUES", type: "yesno",
    text: "Do you find it hard to respect someone whose values change to suit them?",
  },
  {
    id: "val-11", dimension: "VALUES", type: "likert",
    text: "I feel a quiet duty to leave things better than I found them.",
  },
  {
    id: "val-12", dimension: "VALUES", type: "yesno",
    text: "Have you kept a promise long after it stopped being easy to keep?",
  },
  {
    id: "val-13", dimension: "VALUES", type: "likert",
    text: "Being fair matters more to me than being efficient.",
  },
  {
    id: "val-14", dimension: "VALUES", type: "yesno",
    text: "Would you tell someone you care about an uncomfortable truth, even if staying quiet would protect them?",
  },

  // ── FEARS ─────────────────────────────────────────────────────────
  {
    id: "fear-01", dimension: "FEARS", type: "likert",
    text: "I often worry about not living up to my own standards.",
  },
  {
    id: "fear-02", dimension: "FEARS", type: "yesno",
    text: "Does losing someone's trust feel worse to you than failing at a task?",
  },
  {
    id: "fear-03", dimension: "FEARS", type: "likert",
    text: "It bothers me more to think my work will be forgotten than to do the work itself.",
  },
  {
    id: "fear-04", dimension: "FEARS", type: "yesno",
    text: "Do you fear becoming unimportant more than you fear making mistakes?",
  },
  {
    id: "fear-05", dimension: "FEARS", type: "likert",
    text: "I am more afraid of watching something I love fall apart slowly than losing it all at once.",
  },
  {
    id: "fear-06", dimension: "FEARS", type: "yesno",
    text: "Does the thought of being misunderstood by people close to you keep you up at night?",
  },
  {
    id: "fear-07", dimension: "FEARS", type: "likert",
    text: "Chaos and disorder bother me more than conflict does.",
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
    text: "The thought that I might stop growing scares me more than any outside threat.",
  },
  {
    id: "fear-12", dimension: "FEARS", type: "yesno",
    text: "Have you ever stayed in a fight longer than you should have because leaving felt like giving up on someone?",
  },
  {
    id: "fear-13", dimension: "FEARS", type: "likert",
    text: "I fear the day no one needs me more than I fear years of being needed too much.",
  },
  {
    id: "fear-14", dimension: "FEARS", type: "yesno",
    text: "Does the thought of important knowledge being lost forever disturb you?",
  },

  // ── DREAMS ────────────────────────────────────────────────────────
  {
    id: "drm-01", dimension: "DREAMS", type: "likert",
    text: "I often think about the mark I want to leave on the world.",
  },
  {
    id: "drm-02", dimension: "DREAMS", type: "yesno",
    text: "Is there a specific future you are working toward right now?",
  },
  {
    id: "drm-03", dimension: "DREAMS", type: "likert",
    text: "I can picture a better world in real detail, and it pulls at me.",
  },
  {
    id: "drm-04", dimension: "DREAMS", type: "yesno",
    text: "Do you dream about creating something that lasts after you're gone?",
  },
  {
    id: "drm-05", dimension: "DREAMS", type: "likert",
    text: "New places, whether real or in ideas, call to me more than familiar comforts.",
  },
  {
    id: "drm-06", dimension: "DREAMS", type: "yesno",
    text: "Have you ever changed the direction of your life because of a vision you couldn't let go of?",
  },
  {
    id: "drm-07", dimension: "DREAMS", type: "likert",
    text: "My goals are less about what I will own and more about what I will make possible.",
  },
  {
    id: "drm-08", dimension: "DREAMS", type: "yesno",
    text: "Do you keep a private list of things you want to do before you run out of time?",
  },
  {
    id: "drm-09", dimension: "DREAMS", type: "likert",
    text: "When I imagine my best future, other people are thriving in it too.",
  },
  {
    id: "drm-10", dimension: "DREAMS", type: "yesno",
    text: "Is there an idea you have carried for years, waiting for the right moment to build it?",
  },
  {
    id: "drm-11", dimension: "DREAMS", type: "likert",
    text: "I would give up certainty today for a chance at something amazing tomorrow.",
  },
  {
    id: "drm-12", dimension: "DREAMS", type: "yesno",
    text: "Do you feel your real life's work hasn't fully begun yet?",
  },
  {
    id: "drm-13", dimension: "DREAMS", type: "likert",
    text: "What lies ahead interests me more than where I'm standing now.",
  },
  {
    id: "drm-14", dimension: "DREAMS", type: "yesno",
    text: "Would you start over somewhere completely new to pursue what you truly want?",
  },

  // ── POWER ─────────────────────────────────────────────────────────
  {
    id: "pow-01", dimension: "POWER", type: "likert",
    text: "I feel most energized when I'm in charge or setting the direction for others.",
  },
  {
    id: "pow-02", dimension: "POWER", type: "yesno",
    text: "Do people tend to look to you for answers during uncertain situations?",
  },
  {
    id: "pow-03", dimension: "POWER", type: "likert",
    text: "I'm comfortable with authority. I don't shy away from being held accountable.",
  },
  {
    id: "pow-04", dimension: "POWER", type: "yesno",
    text: "Would you rather hold power yourself than trust someone else to use it well?",
  },
  {
    id: "pow-05", dimension: "POWER", type: "likert",
    text: "I believe influence should be earned by being good at what you do, and I hold myself to that.",
  },
  {
    id: "pow-06", dimension: "POWER", type: "yesno",
    text: "Have you ever taken charge of a failing situation nobody else would touch?",
  },
  {
    id: "pow-07", dimension: "POWER", type: "likert",
    text: "I'm more comfortable working quietly behind decisions than being the face of them.",
  },
  {
    id: "pow-08", dimension: "POWER", type: "yesno",
    text: "Do you find it hard to follow a leader you don't respect, even when it costs you?",
  },
  {
    id: "pow-09", dimension: "POWER", type: "likert",
    text: "When I have power over someone, I feel the weight of it more than the perks.",
  },
  {
    id: "pow-10", dimension: "POWER", type: "yesno",
    text: "Would you give up control of something you built if that was best for it?",
  },
  {
    id: "pow-11", dimension: "POWER", type: "likert",
    text: "To me, rules are tools. They're worth following, but also worth changing.",
  },
  {
    id: "pow-12", dimension: "POWER", type: "yesno",
    text: "Do you trust rules and systems more than one charming leader?",
  },
  {
    id: "pow-13", dimension: "POWER", type: "likert",
    text: "I would rather quietly help ten people gain power than lead a hundred people in public.",
  },
  {
    id: "pow-14", dimension: "POWER", type: "yesno",
    text: "Has responsibility ever found you before you felt ready for it?",
  },

  // ── PEOPLE ────────────────────────────────────────────────────────
  {
    id: "ppl-01", dimension: "PEOPLE", type: "likert",
    text: "The mood and wellbeing of people around me strongly affects how I feel and decide.",
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
    text: "When people I care about fight, it affects my body, not just my feelings.",
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
    text: "When a group breaks apart, do you become the bridge that connects its parts?",
  },
  {
    id: "ppl-09", dimension: "PEOPLE", type: "likert",
    text: "I would rather work out a disagreement slowly and fully than win it quickly.",
  },
  {
    id: "ppl-10", dimension: "PEOPLE", type: "yesno",
    text: "Is being deeply known by a few people more important to you than being liked by many?",
  },
  {
    id: "ppl-11", dimension: "PEOPLE", type: "likert",
    text: "Watching someone grow because of something I gave them feels better than my own wins.",
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
    text: "Before committing to something important, I first try to learn all I can.",
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
    text: "In a crisis, I become calmer and more organized while others speed up.",
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
    text: "Once I decide, I stop looking back. I don't have time for second-guessing.",
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
    text: "Do you trust methods you've improved over time more than sudden bursts of inspiration?",
  },

  // ── LEADERSHIP ────────────────────────────────────────────────────
  {
    id: "led-01", dimension: "LEADERSHIP", type: "likert",
    text: "I believe the best way to lead is by example, not by giving orders.",
  },
  {
    id: "led-02", dimension: "LEADERSHIP", type: "yesno",
    text: "In group situations, do you often step up without being asked?",
  },
  {
    id: "led-03", dimension: "LEADERSHIP", type: "likert",
    text: "I am willing to be the first one through a door no one else will open.",
  },
  {
    id: "led-04", dimension: "LEADERSHIP", type: "yesno",
    text: "Have people followed you into something hard mainly because you led the way?",
  },
  {
    id: "led-05", dimension: "LEADERSHIP", type: "likert",
    text: "A good leader takes the blame and gives away the credit. I try to live that way.",
  },
  {
    id: "led-06", dimension: "LEADERSHIP", type: "yesno",
    text: "Would you rather train ten quiet leaders than become one famous leader yourself?",
  },
  {
    id: "led-07", dimension: "LEADERSHIP", type: "likert",
    text: "When a group loses its way, I feel it's my job to find it again.",
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
    text: "Have you ever stepped back from leading, even though you wanted it, because someone else was better suited?",
  },
  {
    id: "led-11", dimension: "LEADERSHIP", type: "likert",
    text: "People seem to trust me most in the moments when everything feels uncertain.",
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
    text: "Getting better at something drives me more than the reward at the end.",
  },
  {
    id: "mot-02", dimension: "MOTIVATION", type: "yesno",
    text: "Is there a goal you find yourself thinking about almost every day?",
  },
  {
    id: "mot-03", dimension: "MOTIVATION", type: "likert",
    text: "I lose track of time most easily when I am making or fixing something with my hands or mind.",
  },
  {
    id: "mot-04", dimension: "MOTIVATION", type: "yesno",
    text: "Do you go back to improve work that everyone else thinks is already done?",
  },
  {
    id: "mot-05", dimension: "MOTIVATION", type: "likert",
    text: "An unanswered question will stay in my mind for days until I solve it.",
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
    text: "Repeating a task doesn't bore me when each time makes it a little better.",
  },
  {
    id: "mot-10", dimension: "MOTIVATION", type: "yesno",
    text: "Do you feel restless when a lot of time passes without real progress?",
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
