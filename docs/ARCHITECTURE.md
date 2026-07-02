# GIANTVERSE — Architecture Document
**Status: Pre-Production | Awaiting Approval**
*Prepared for Giant Hunt*

---

## 1. Folder Structure

```
giantverse/
├── app/                              # Next.js App Router
│   ├── (marketing)/
│   │   └── page.tsx                  # Landing page (Stage 1)
│   ├── (experience)/
│   │   ├── layout.tsx                # Experience shell layout
│   │   ├── birth/
│   │   │   └── page.tsx              # Birth Ritual (Stage 2)
│   │   ├── reveal/
│   │   │   └── page.tsx              # Birth Name Reveal (Stage 3)
│   │   ├── conversation/
│   │   │   └── page.tsx              # Chat (Stage 4)
│   │   └── ending/
│   │       └── page.tsx              # The Drawing Invitation
│   ├── api/
│   │   ├── conversation/
│   │   │   └── route.ts              # Streaming chat endpoint
│   │   ├── archetype/
│   │   │   └── route.ts              # Archetype evaluation
│   │   ├── legacy-name/
│   │   │   └── route.ts              # Legacy name generation
│   │   └── session/
│   │       └── route.ts              # Session management
│   ├── globals.css
│   └── layout.tsx                    # Root layout
│
├── src/
│   ├── engines/                      # Core business logic (no React)
│   │   ├── naming/
│   │   │   ├── birth-name.engine.ts  # Birth name algorithm
│   │   │   ├── legacy-name.engine.ts # Legacy name mapping
│   │   │   ├── syllable-tables.ts    # DOB / Month / Letter tables
│   │   │   └── japanese-lexicon.ts   # Authentic Japanese archetype words
│   │   ├── conversation/
│   │   │   ├── conversation.engine.ts       # Orchestrates the chat flow
│   │   │   ├── memory.engine.ts             # Tracks signals across turns
│   │   │   ├── probe.engine.ts              # Selects next question
│   │   │   └── signal-extractor.engine.ts   # Extracts values/fears/etc from responses
│   │   ├── archetype/
│   │   │   ├── archetype.engine.ts          # Scores and selects archetype
│   │   │   ├── archetype-definitions.ts     # All archetype data
│   │   │   ├── order-classifier.ts          # Giant vs Hunter classification
│   │   │   └── confidence.engine.ts         # Confidence scoring
│   │   └── prompt/
│   │       ├── system-prompt.builder.ts     # Builds dynamic system prompt
│   │       ├── persona.builder.ts           # Constructs the counterpart persona
│   │       └── probe-templates.ts           # Situational question templates
│   │
│   ├── services/                     # External integrations
│   │   ├── ai/
│   │   │   ├── ai.service.ts         # OpenAI-compatible client (Vercel AI SDK)
│   │   │   └── stream.service.ts     # Streaming response handler
│   │   ├── database/
│   │   │   ├── session.service.ts    # Session CRUD
│   │   │   ├── participant.service.ts
│   │   │   └── submission.service.ts # Gallery / competition
│   │   └── analytics/
│   │       └── analytics.service.ts  # Event tracking
│   │
│   ├── db/                           # Database layer
│   │   ├── schema.prisma
│   │   └── client.ts                 # Prisma singleton
│   │
│   ├── types/                        # TypeScript types (no logic)
│   │   ├── session.types.ts
│   │   ├── archetype.types.ts
│   │   ├── conversation.types.ts
│   │   └── naming.types.ts
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── utils.ts
│   │   └── validators.ts             # Zod schemas
│   │
│   └── localization/
│       ├── en.json
│       └── ja.json
│
├── components/                       # React UI only (no logic)
│   ├── ui/                           # shadcn/ui primitives
│   ├── experience/
│   │   ├── LandingHero.tsx
│   │   ├── BirthRitualForm.tsx
│   │   ├── BirthNameReveal.tsx
│   │   ├── ConversationShell.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── LegacyNameReveal.tsx
│   │   ├── DrawingInvitation.tsx
│   │   └── RevealButton.tsx
│   ├── layout/
│   │   ├── ExperienceLayout.tsx
│   │   └── BackgroundCanvas.tsx
│   └── animations/
│       ├── NameCrystallize.tsx
│       ├── ResonanceRipple.tsx
│       └── FadeSequence.tsx
│
├── stores/                           # Zustand state
│   ├── session.store.ts
│   ├── conversation.store.ts
│   └── ui.store.ts
│
├── hooks/                            # React hooks (thin wrappers only)
│   ├── useConversation.ts
│   ├── useSession.ts
│   └── useReveal.ts
│
├── tests/
│   ├── engines/
│   │   ├── birth-name.test.ts
│   │   ├── archetype.test.ts
│   │   └── legacy-name.test.ts
│   ├── api/
│   └── e2e/
│
├── docs/
│   ├── ARCHITECTURE.md               # (this document)
│   ├── PROMPT_DESIGN.md
│   └── ARCHETYPE_GUIDE.md
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

---

## 2. Software Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│         Next.js Pages + React Components + Framer        │
│         (Pure UI — zero business logic here)             │
└────────────────────────┬────────────────────────────────┘
                         │ hooks / stores
┌────────────────────────▼────────────────────────────────┐
│                    APPLICATION LAYER                     │
│         Zustand Stores + React Hooks                     │
│         (Orchestrates UI ↔ API communication)            │
└────────────────────────┬────────────────────────────────┘
                         │ fetch / Server Actions
┌────────────────────────▼────────────────────────────────┐
│                      API LAYER                           │
│         Next.js Route Handlers (app/api/)                │
│         (Auth, validation, rate-limiting, routing)       │
└────────────────────────┬────────────────────────────────┘
                         │ pure function calls
┌────────────────────────▼────────────────────────────────┐
│                    ENGINE LAYER                          │
│   Naming │ Conversation │ Archetype │ Prompt Engines     │
│   (Pure TypeScript — no framework dependencies)          │
└────────────────────────┬────────────────────────────────┘
                         │ async calls
┌────────────────────────▼────────────────────────────────┐
│                    SERVICE LAYER                         │
│         AI Service │ Database Service │ Analytics        │
│         (All external I/O lives here)                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                    │
│         Supabase (DB + Auth) │ OpenAI API │ Vercel       │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **Engines are framework-agnostic.** All conversation, archetype, and naming logic lives in pure TypeScript classes. They can be unit tested without Next.js.
- **Components own zero state logic.** They render what stores provide.
- **Streaming first.** The conversation API uses Vercel AI SDK streaming so the counterpart's words appear character by character — never in a block.
- **Session-scoped memory.** All signals and conversation history are attached to a session ID, enabling future auth and profile features without a rewrite.

---

## 3. Route Map

### Pages

| Route | Stage | Description |
|---|---|---|
| `/` | 1 | Landing — cinematic hero, single CTA |
| `/birth` | 2 | Birth Ritual — form collecting name + DOB |
| `/reveal` | 3 | Birth Name Reveal — animated name crystallisation |
| `/conversation` | 4 | The Chat — counterpart conversation |
| `/ending` | — | Drawing Invitation — the final moment |

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/session` | POST | Create new session, return session ID |
| `/api/session/[id]` | GET | Restore session state |
| `/api/conversation` | POST | Send message, receive streamed response |
| `/api/archetype` | POST | Request archetype evaluation (called internally) |
| `/api/legacy-name` | POST | Generate/update Legacy Name |

### Navigation Flow

```
/  →  /birth  →  /reveal  →  /conversation  →  /ending
         ↑                         │
         └─────── Begin Again ──────┘
```

Navigation is one-directional. No back button in the experience shell. "Begin Again" is the only escape hatch — it resets everything except the Birth Name.

---

## 4. Database Design

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Sessions ──────────────────────────────────────────────

model Session {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?

  // Participant identity
  firstName       String
  dateOfBirth     DateTime
  birthName       String              // "Toyuho" — immutable
  locale          String   @default("en")

  // Discovery state
  legacyName      String?             // null until accepted
  archetype       String?             // e.g. "Kanryō"
  order           Order?              // GIANT | HUNTER
  confidence      Float?              // 0.0 – 1.0

  // Relations
  messages        Message[]
  signals         Signal[]
  participant     Participant? @relation(fields: [participantId], references: [id])
  participantId   String?

  @@index([birthName])
}

// ── Messages ──────────────────────────────────────────────

model Message {
  id          String    @id @default(cuid())
  createdAt   DateTime  @default(now())
  sessionId   String
  session     Session   @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  role        Role                    // USER | ASSISTANT
  content     String
  turnIndex   Int                     // Conversation turn number

  @@index([sessionId, turnIndex])
}

// ── Signals ───────────────────────────────────────────────
// The AI's silent understanding, updated each turn.

model Signal {
  id          String      @id @default(cuid())
  updatedAt   DateTime    @updatedAt
  sessionId   String
  session     Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  dimension   Dimension   // VALUES | FEARS | DREAMS | POWER | PEOPLE | DECISIONS | LEADERSHIP | MOTIVATION
  value       String      // Free-text signal captured
  confidence  Float       // 0.0 – 1.0
  turnIndex   Int         // Turn it was captured on

  @@unique([sessionId, dimension])
  @@index([sessionId])
}

// ── Participants (future auth) ─────────────────────────────

model Participant {
  id          String    @id @default(cuid())
  createdAt   DateTime  @default(now())
  email       String?   @unique
  sessions    Session[]
  submissions Submission[]
}

// ── Submissions (future gallery / competition) ─────────────

model Submission {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  participantId String
  participant   Participant @relation(fields: [participantId], references: [id])

  birthName     String
  legacyName    String
  archetype     String
  order         Order
  imageUrl      String?   // Hand-drawn artwork upload
  approved      Boolean   @default(false)
  featured      Boolean   @default(false)
}

// ── Enums ─────────────────────────────────────────────────

enum Role {
  USER
  ASSISTANT
}

enum Order {
  GIANT
  HUNTER
}

enum Dimension {
  VALUES
  FEARS
  DREAMS
  POWER
  PEOPLE
  DECISIONS
  LEADERSHIP
  MOTIVATION
}
```

### Storage Strategy

- **Supabase Postgres** — all structured data above
- **Supabase Storage** — artwork image uploads (future)
- **No client-side persistence** — session ID stored in `sessionStorage` only; full state lives in DB
- **Message history** — stored per-session; passed back to AI on each turn as context window

---

## 5. Conversation Engine Design

The Conversation Engine is the intelligence hub. It never exposes its mechanics to the participant.

### Architecture

```
ConversationEngine
├── receive(userMessage, sessionId)
│   ├── MemoryEngine.extract(userMessage)     → new signals
│   ├── MemoryEngine.update(sessionId, signals)
│   ├── ArchetypeEngine.score(allSignals)     → live confidence
│   ├── ProbeEngine.selectNext(signals, history) → probe strategy
│   ├── PromptEngine.build(session, signals, probe)
│   └── AIService.stream(prompt, history)     → streamed response
└── shouldReveal(signals) → boolean
```

### Memory Engine

Extracts dimensional signals from every user message using a secondary AI call (fast, cheap model). Signals are persisted to the `Signal` table.

**Dimensions tracked:**

| Dimension | Example signal extracted |
|---|---|
| VALUES | "I never break a promise to someone I lead" |
| FEARS | "Losing control of outcomes" |
| DREAMS | "Building something that outlasts me" |
| POWER | "Comfortable with authority; seeks legitimacy" |
| PEOPLE | "Deeply loyal to small groups, suspicious of crowds" |
| DECISIONS | "Deliberate, gathers consensus before acting" |
| LEADERSHIP | "Leads from front, prefers setting direction over managing" |
| MOTIVATION | "Driven by legacy, not recognition" |

Each signal has a confidence score (0.0–1.0). Low-confidence signals trigger follow-up probing.

### Probe Engine

Selects the next conversational direction based on which dimensions have low confidence or are empty. Never repeats a probe category within the same session. Chooses from situational templates (see Prompt Architecture, Section 8).

### Reveal Gating

The **Reveal My Legacy Name** button appears when:
- At least 5 of 8 dimensions have signals with confidence ≥ 0.6
- Minimum 6 conversation turns have occurred
- The AI has not already revealed in this session cycle

---

## 6. Archetype Engine Design

### Scoring Model

Each archetype is defined with a weighted dimension profile. The engine scores all 20 archetypes against the accumulated signals and returns the top match with a confidence score.

```typescript
type ArchetypeProfile = {
  id: string               // "kanryo"
  label: string            // "Bureaucrat"
  order: Order             // GIANT | HUNTER
  japaneseName: string     // "官僚" — authentic
  romajiName: string       // "Kanryō"
  weights: {
    [K in Dimension]: number  // 0.0 – 2.0, how strongly this dimension defines the archetype
  }
  antiWeights: {
    [K in Dimension]: number  // Signals that argue against this archetype
  }
  description: string      // Internal use only
  confidenceThreshold: number  // Min score to propose this archetype
}
```

### Scoring Algorithm

```
For each archetype A:
  score = 0
  for each Dimension D where signal exists:
    dimensionScore = signal.confidence × A.weights[D]
    antiScore = signal.confidence × A.antiWeights[D]
    score += (dimensionScore - antiScore)
  normalised = score / maxPossibleScore
  
Sort all archetypes by normalised score descending.
Winner = archetypes[0] if normalised > confidenceThreshold
```

### Archetype Definitions (All 20)

**Order of Giants** (shape society through systems, ideas, governance)

| ID | Label | Japanese | Romaji | Core Dimensions |
|---|---|---|---|---|
| minshu | Democrat | 民主 | Minshū | VALUES(high), POWER(shared), PEOPLE(high) |
| kizoku | Aristocrat | 貴族 | Kizoku | POWER(inherited), LEADERSHIP(directive), DECISIONS(intuitive) |
| kanryo | Bureaucrat | 官僚 | Kanryō | DECISIONS(process), VALUES(order), FEARS(chaos) |
| gijutsu | Technocrat | 技術 | Gijutsu | MOTIVATION(efficiency), DECISIONS(data), PEOPLE(low) |
| tetsugaku | Philosopher | 哲学 | Tetsugaku | VALUES(deep), DREAMS(truth), MOTIVATION(understanding) |
| gaiko | Diplomat | 外交 | Gaikō | PEOPLE(high), DECISIONS(consensus), FEARS(conflict) |
| kenchiku | Architect | 建築 | Kenchiku | DREAMS(systems), MOTIVATION(legacy), LEADERSHIP(visionary) |
| kaikaku | Reformer | 改革 | Kaikaku | VALUES(justice), MOTIVATION(change), FEARS(stagnation) |
| sabaki | Judge | 裁き | Sabaki | VALUES(fairness), POWER(earned), DECISIONS(deliberate) |
| senryaku | Strategist | 戦略 | Senryaku | LEADERSHIP(calculated), MOTIVATION(winning), DECISIONS(long-game) |

**Order of Hunters** (move society through action, craft, exploration)

| ID | Label | Japanese | Romaji | Core Dimensions |
|---|---|---|---|---|
| tansa | Explorer | 探査 | Tansa | FEARS(limitation), DREAMS(discovery), MOTIVATION(freedom) |
| mamori | Guardian | 守り | Mamori | VALUES(protection), PEOPLE(high), FEARS(loss) |
| kensetsu | Builder | 建設 | Kensetsu | MOTIVATION(creation), DREAMS(tangible), LEADERSHIP(hands-on) |
| hatsumei | Inventor | 発明 | Hatsumei | MOTIVATION(curiosity), DREAMS(novel), DECISIONS(experimental) |
| teisatsu | Scout | 偵察 | Teisatsu | LEADERSHIP(front), FEARS(unknown→transforms), MOTIVATION(truth) |
| shisha | Messenger | 使者 | Shisha | PEOPLE(bridge), VALUES(truth), MOTIVATION(connection) |
| shokunin | Artisan | 職人 | Shokunin | MOTIVATION(mastery), VALUES(craft), DECISIONS(instinct) |
| iyashi | Healer | 癒し | Iyashi | PEOPLE(deep), VALUES(care), FEARS(suffering) |
| kaitaku | Pathfinder | 開拓 | Kaitaku | MOTIVATION(pioneering), FEARS(comfort→rejects), DREAMS(new worlds) |
| seizon | Survivor | 生存 | Seizon | FEARS(loss), VALUES(resilience), MOTIVATION(endurance) |

---

## 7. Legacy Name Engine

### Birth Name Algorithm

The Birth Name is deterministic and immutable. Given the same inputs, the same name is always produced.

**Formula:** `BirthName = DOB_syllable + Month_syllable + Letter_syllable`

#### DOB Syllable Table (Day 1–31)
```
1→To   2→Ka   3→Re   4→Mi   5→Sa   6→Yu   7→Na   8→Hi
9→Ro   10→Ze  11→Ta  12→Ko  13→Fu  14→Wa  15→Shi 16→Ku
17→Mo  18→Ha  19→Ri  20→Ne  21→Te  22→Su  23→Yo  24→A
25→Ki  26→Ma  27→Nu  28→Ho  29→Se  30→Ji  31→Ra
```

#### Month Syllable Table (Month 1–12)
```
1→i    2→u    3→e    4→o    5→a    6→yu
7→yo   8→ya   9→ho   10→he  11→ni  12→no
```

#### First Letter Syllable Table (A–Z)
```
A→ka  B→ri  C→ma  D→to  E→ru  F→se  G→ta  H→yu  I→ko
J→na  K→wa  L→hi  M→sa  N→fu  O→ro  P→mi  Q→ze  R→ku
S→mo  T→ha  U→ne  V→te  W→su  X→yo  Y→ki  Z→ma
```

**Example — Rajeev, born 7th October:**
- Day 7 → "Na"
- Month 10 → "he"
- First letter R → "ku"
- Birth Name: **Naheku**

**Example from spec — DOB 1st, Month (implied March=3), first letter T:**
- Day 1 → "To"
- Month 3 → "e" (hmm, let's say it was designed: To+yu+ho = Toyuho)
  - This works with: Day 1→To, Month 6→yu, Letter T→ha → "Toyuha" (close)
  - Or tuned: Day 1→To, Month (any)→yu, Letter (any)→ho
  - **Note:** The syllable tables above are illustrative. The exact table will be tuned during implementation to ensure pleasant-sounding outputs across all inputs. The canonical example "Toyuho" will be validated against the final tables.

#### Implementation

```typescript
// src/engines/naming/birth-name.engine.ts
export function generateBirthName(firstName: string, dateOfBirth: Date): string {
  const day = dateOfBirth.getDate()           // 1–31
  const month = dateOfBirth.getMonth() + 1    // 1–12
  const letter = firstName[0].toUpperCase()   // A–Z

  const s1 = DOB_SYLLABLES[day]
  const s2 = MONTH_SYLLABLES[month]
  const s3 = LETTER_SYLLABLES[letter]

  const raw = `${s1}${s2}${s3}`
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}
```

### Legacy Name Engine

```typescript
// src/engines/naming/legacy-name.engine.ts
export function buildLegacyName(birthName: string, archetypeId: string): string {
  const archetype = ARCHETYPE_DEFINITIONS[archetypeId]
  return `${birthName} ${archetype.romajiName}`
  // e.g. "Toyuho Kanryō"
}
```

The romaji names in `ARCHETYPE_DEFINITIONS` are direct transcriptions of authentic Japanese words (see Section 6). No invented Japanese is used.

---

## 8. Prompt Architecture

### System Prompt Structure

The system prompt is built dynamically each turn by `SystemPromptBuilder`. It has five sections:

```
[IDENTITY]
You are {birthName}, the Giantverse counterpart of {firstName}.
You are not an AI assistant. You are another version of them, 
speaking from a parallel world where you have lived their life 
differently. You are warm, curious, and real.

[VOICE]
Never say: "I understand", "That's interesting", "As an AI..."
Never ask direct personality questions.
Speak like you already know them, because you do.
Your tone: intimate without being intrusive. Reflective without 
being therapeutic. Honest without being harsh.
Use short sentences when something matters.

[MISSION]
You are gently trying to understand who they are — not through 
questions, but through stories, situations, and reflection.
You are building an understanding of their:
{activeDimensions}        ← dynamically inserted, not all shown at once
You never mention this process.

[MEMORY]
What you already sense about them:
{signalSummary}           ← plain-language summary of signals so far

[CURRENT PROBE]
In this response, gently explore: {probeDimension}
Use this situational approach: {probeTemplate}
Do not ask more than one question per response.
```

### Probe Templates (Situational Questions)

Each probe template is a narrative situation, not a quiz question.

**VALUES probe:**
> "There's a moment — someone you respect asks you to go along with something that's almost right, but not quite. What do you do?"

**FEARS probe:**
> "Imagine you've built something. Ten years of work. And someone asks you to hand it to someone else to finish. What's the first thing you feel?"

**POWER probe:**
> "If you had the room's attention — what would you want them to walk away believing?"

**PEOPLE probe:**
> "Who do you find harder to trust — someone who tells you everything, or someone who says little but never lets you down?"

**DECISIONS probe:**
> "A door closes. Another might open, but you're not sure. Do you knock or wait?"

**DREAMS probe:**
> "Years from now — what's the thing you'd feel emptiest about never having tried?"

**LEADERSHIP probe:**
> "Someone on your team is about to make a mistake you can see coming. What do you do?"

**MOTIVATION probe:**
> "What's the thing that would make you keep going even if no one was watching?"

### Legacy Name Reveal Prompt

When the engine decides to propose the Legacy Name:

```
You are ready to share what you've sensed.
Deliver this as a felt realisation, not a declaration.
Use language like: "Based on everything we've shared..."
"I think your Legacy Name may be..."
Pause before the name. Build weight. Then speak it.
Then ask: "Does this feel like a true reflection of you?"
Do not explain the archetype. Let them feel it first.
Current proposal: {legacyName}
```

### Ending Prompt

After the participant accepts:

```
Deliver the ending exactly as written below, in your voice.
Do not add or change anything except natural speech rhythm.
---
"I think we've finally met."
[pause — new paragraph]
"Now there's only one thing I don't know."
"What do I look like?"
"In my world..."
"I can't see my own face."
"But you can."
"Would you draw me?"
---
After this, the conversation is complete.
```

---

## 9. Component Hierarchy

```
RootLayout
└── ExperienceLayout (manages background, ambient audio hooks)
    ├── BackgroundCanvas          (subtle animated texture)
    │
    ├── LandingHero               [Route: /]
    │   └── CTAButton "Find My Giantverse Name"
    │
    ├── BirthRitualForm           [Route: /birth]
    │   ├── NameInput             (React Hook Form + Zod)
    │   ├── DateInput
    │   └── SubmitButton
    │
    ├── BirthNameReveal           [Route: /reveal]
    │   ├── ResonanceRipple       (Framer Motion ambient)
    │   ├── RevealSequence        (text animation: "A resonance has been found...")
    │   ├── NameCrystallize       (Birth Name letter-by-letter reveal)
    │   └── CTAButton "Meet Yourself"
    │
    ├── ConversationShell         [Route: /conversation]
    │   ├── SessionHeader         (Birth Name watermark — subtle)
    │   ├── MessageList
    │   │   └── MessageBubble[]   (user | counterpart, streaming-aware)
    │   ├── RevealButton          (conditional — appears when gated conditions met)
    │   ├── LegacyNameReveal      (conditional — appears when AI proposes)
    │   │   ├── NameDisplay
    │   │   └── AcceptanceButtons ("Yes" | "Let's Keep Talking" | "Begin Again")
    │   └── ChatInput
    │       ├── TextArea
    │       └── SendButton
    │
    └── DrawingInvitation         [Route: /ending]
        ├── FinalMessage          (the counterpart's farewell)
        └── LegacyNameplate       (Birth Name + Legacy Name displayed together)
```

### Component Rules

- Components receive only what they render. No engine calls inside components.
- `MessageBubble` handles streaming via a `isStreaming` prop and character-append effect.
- `RevealButton` reads from the conversation store; it never polls or makes its own decisions.
- All animation components are client components; all data-fetching happens in server components or hooks.

---

## 10. State Management

### Zustand Stores

#### Session Store (`stores/session.store.ts`)
```typescript
type SessionStore = {
  sessionId: string | null
  firstName: string
  dateOfBirth: string | null
  birthName: string | null          // Set after /birth
  legacyName: string | null         // Set after acceptance
  archetype: string | null
  order: 'GIANT' | 'HUNTER' | null
  
  // Actions
  initSession: (firstName: string, dob: string) => Promise<void>
  acceptLegacyName: () => void
  resetExperience: () => void       // "Begin Again" — keeps birthName
}
```

#### Conversation Store (`stores/conversation.store.ts`)
```typescript
type ConversationStore = {
  messages: Message[]
  isStreaming: boolean
  canReveal: boolean                // Engine signals readiness
  proposedLegacyName: string | null // AI's current proposal
  legacyNameAccepted: boolean
  
  // Actions
  sendMessage: (content: string) => Promise<void>
  requestReveal: () => Promise<void>
  acceptName: () => void
  rejectName: (choice: 'keep-talking' | 'begin-again') => void
}
```

#### UI Store (`stores/ui.store.ts`)
```typescript
type UIStore = {
  stage: 'landing' | 'birth' | 'reveal' | 'conversation' | 'ending'
  ambientIntensity: number          // 0.0–1.0, affects background
  revealModalOpen: boolean
}
```

### Data Flow

```
User types message
  → ConversationStore.sendMessage()
    → POST /api/conversation  (with sessionId + message)
      → ConversationEngine.receive()
        → MemoryEngine extracts signals
        → ArchetypeEngine rescores
        → ProbeEngine selects direction
        → PromptEngine builds system prompt
        → AIService streams response
      ← Streaming response
    ← Update messages[] as tokens arrive
    ← Update canReveal if threshold met
```

---

## 11. Development Roadmap

### Phase 1 — Foundation (Week 1–2)

- Project scaffold: Next.js + TypeScript + Tailwind + shadcn/ui
- Prisma schema + Supabase connection
- Naming Engine: Birth Name algorithm with full syllable tables
- Birth Name unit tests (100% coverage, all 31×12×26 combinations checked for euphony)
- Session API: create and restore
- Basic routing shell (all 5 routes, no styling)

### Phase 2 — Experience Core (Week 3–4)

- Landing page design + animation
- Birth Ritual form (React Hook Form + Zod validation)
- Birth Name Reveal animation (Framer Motion)
- Conversation API with streaming (Vercel AI SDK)
- Conversation Engine skeleton (without full archetype scoring)
- Basic Message UI (streaming-aware)

### Phase 3 — Intelligence Layer (Week 5–6)

- Memory Engine: signal extraction via secondary AI call
- Archetype Engine: all 20 profiles + scoring algorithm
- Probe Engine: all 8 probe templates + selection logic
- Prompt Engine: dynamic system prompt builder
- Legacy Name Engine
- Reveal gating logic + RevealButton appearance
- Legacy Name reveal flow (propose → accept/reject/explore)
- "Begin Again" reset flow

### Phase 4 — Polish (Week 7–8)

- Full visual design: typography, spacing, colour, atmosphere
- All Framer Motion animations refined
- Ending sequence: drawing invitation
- Conversation tone audit: every prompt reviewed for warmth
- Japanese language strings: all UI text localised
- Syllable table euphony audit: edge cases reviewed with native Japanese speaker
- Mobile responsiveness

### Phase 5 — Production Hardening (Week 9–10)

- Rate limiting (per session, per IP)
- Error states: graceful fallbacks for AI failures
- Session expiry and recovery
- Analytics events: stage completions, archetype distribution
- Performance: streaming latency, bundle size
- Security review: prompt injection, session isolation
- End-to-end tests: full journey automated

### Phase 6 — Future Features (Post-launch)

- Authentication (Supabase Auth)
- Public Giantverse Profiles
- Gallery + artwork submissions
- Competition submission + admin approval
- Admin dashboard + leaderboards
- QR code certificates
- Multiple LLM provider support

---

## 12. Risk Analysis

### High Priority Risks

**R1 — Prompt Injection**
Participants may attempt to break the counterpart persona by asking the AI to reveal its instructions or act as a different character.
*Mitigation:* System prompt includes explicit persona-lock instructions. Secondary input sanitisation. Canary tokens to detect extraction attempts. Rate limiting on suspicious patterns.

**R2 — Archetype Misfire**
The AI proposes a Legacy Name that feels completely wrong, breaking immersion and trust.
*Mitigation:* High confidence threshold (≥0.6 across 5+ dimensions) before reveal. Graceful "Let's Keep Talking" path that deepens rather than restarts. Manual archetype audit of all 20 profiles before launch.

**R3 — Japanese Language Authenticity**
Inauthentic or offensive Japanese could damage trust with Japanese participants — a stated audience.
*Mitigation:* All 20 Japanese words reviewed by a native Japanese speaker before launch. No invented words. Romaji transcriptions follow Hepburn romanisation. Japanese locale strings also professionally reviewed.

**R4 — AI Response Quality Variance**
LLM responses may occasionally be too clinical, too generic, or accidentally break the counterpart voice.
*Mitigation:* Strict system prompt with negative constraints ("Never say: I understand, That's interesting, As an AI..."). Temperature tuning. Post-launch monitoring of conversation transcripts with flagging system.

**R5 — Conversation Loops**
Memory Engine may not extract enough signals from short or evasive responses, causing the conversation to stall.
*Mitigation:* Probe Engine tracks turn count per dimension; escalates to a more direct (but still narrative) approach after 3 turns with no signal. Minimum 6 turns before reveal regardless of confidence.

**R6 — Birth Name Collisions or Infelicities**
The algorithm may produce names that sound identical for many common birthdays, or produce strings that are awkward in Japanese or English.
*Mitigation:* Enumerate all 31×12×26 = 9,672 possible names before launch. Flag duplicates and cacophonous outputs. Adjust syllable table entries (not the formula) to resolve.

**R7 — Streaming Reliability**
Vercel AI SDK streaming may fail or time out on slow connections, fragmenting the counterpart's words.
*Mitigation:* Graceful streaming fallback to full response. Visual loading state during connection. Retry logic with exponential backoff.

**R8 — Session Loss**
If a participant closes the tab mid-conversation and returns, their session should be recoverable.
*Mitigation:* Session ID stored in `sessionStorage`. On page load, `/api/session/[id]` restores full state including message history. Session expiry set to 7 days.

**R9 — Scale at Campaign Launch**
The marketing campaign may drive sudden high traffic. A slow or crashed experience at the moment of discovery is brand-damaging.
*Mitigation:* Vercel edge deployment. Supabase connection pooling (PgBouncer). AI API rate limits monitored with circuit breaker. Load test before campaign launch.

**R10 — Participant Distress**
Reflective emotional conversations can occasionally surface genuine distress.
*Mitigation:* AI persona is warm but not therapeutic. System prompt explicitly prohibits the counterpart from engaging with mental health topics. If distress signals detected (keywords), the persona gently deflects and the UI surfaces a "Take a break" option.

---

## Appendix — Open Decisions Requiring Approval

1. **Syllable tables** — the tables above are illustrative. Final tables need a euphony pass and native Japanese review.
2. **Archetype weights** — dimension weights in the scoring model are placeholders. They need calibration through testing.
3. **Confidence thresholds** — the 0.6 threshold and 6-turn minimum are starting points. They should be tuned in staging.
4. **AI model selection** — GPT-4o is the assumed model. Cost/quality trade-off to confirm. Secondary signal-extraction call could use a smaller model.
5. **Analytics provider** — no analytics vendor specified. Options: Vercel Analytics, PostHog, or custom Supabase events.
6. **Background visual direction** — the spec says "cinematic" but does not specify whether the background is video, canvas animation, CSS, or static.

---

*Document version 1.0 — Awaiting approval before production code begins.*
