# Giantverse - AI Project Documentation

This document provides a comprehensive overview of the Giantverse project for AI agents. It describes the project structure and the purpose of every file.

## Project Overview

Giantverse is an interactive identity-discovery experience built with Next.js. Participants go through a birth ritual, a personality survey (or guided conversation), and are matched against one of 32 archetypes across the Order of Giants and the Order of Hunters. The result is a 'Giantverse Name' and a printable identity card.

**Tech Stack**: Next.js (App Router), React, Tailwind CSS, Zustand, Prisma, Vercel AI SDK.

## Architecture Summary

1. **Presentation Layer**: `app/` (Next.js Pages) and `components/` (React UI). No business logic.
2. **Application Layer**: `stores/` (Zustand state) and `hooks/`.
3. **API Layer**: `app/api/` (Next.js Route Handlers).
4. **Engine Layer**: `src/engines/` (Pure TypeScript logic for naming, conversation, archetype scoring, prompting).
5. **Service Layer**: `src/services/` (External integrations like AI, Database).
6. **Database Layer**: `src/db/` and `prisma/` (Prisma ORM).

## Directory and File Breakdown

### Root/

- **`.gitignore`**
  - *Purpose*: Core file.
  - *Preview*: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files. # dependencies /node_modules /.pnp .pnp.* .yarn/* !.yarn/patches`

- **`AGENTS.md`**
  - *Purpose*: Core file.
  - *Preview*: `<!-- BEGIN:nextjs-agent-rules --> # This is NOT the Next.js you know This version has breaking changes — APIs, conventions, and file structure may all`

- **`CLAUDE.md`**
  - *Purpose*: Core file.
  - *Preview*: `@AGENTS.md`

- **`eslint.config.mjs`**
  - *Purpose*: Core file.
  - *Preview*: `import { defineConfig, globalIgnores } from "eslint/config"; import nextVitals from "eslint-config-next/core-web-vitals"; import nextTs from "eslint-c`

- **`generate_doc.js`**
  - *Purpose*: Core file.
  - *Preview*: `const fs = require('fs'); const path = require('path'); function getFileContentPreview(filepath, maxLines = 10) {     try {         const content = fs`

- **`generate_doc.py`**
  - *Purpose*: Core file.
  - *Preview*: `import os import json def get_file_content_preview(filepath, max_lines=10):     try:         with open(filepath, 'r', encoding='utf-8') as f:`

- **`landing`**
  - *Purpose*: Core file.
  - *Preview*: `import { useState, useEffect, useRef } from "react"; /* ---------------- data ---------------- */ const CYCLE_NAMES = ["Sokanu", "RikanÅ", "Tomari",`

- **`next.config.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import type { NextConfig } from "next"; const nextConfig: NextConfig = {   turbopack: {     root: __dirname,   }, }; export default nextConfig;`

- **`package-lock.json`**
  - *Purpose*: Core file.
  - *Preview*: `{   "name": "giantverse",   "version": "0.1.0",   "lockfileVersion": 3,   "requires": true,   "packages": {     "": {       "name": "giantverse",`

- **`package.json`**
  - *Purpose*: Core file.
  - *Preview*: `{   "name": "giantverse",   "version": "0.1.0",   "private": true,   "scripts": {     "dev": "NODE_TLS_REJECT_UNAUTHORIZED=0 next dev",     "build": "`

- **`postcss.config.mjs`**
  - *Purpose*: Core file.
  - *Preview*: `const config = {   plugins: {     "@tailwindcss/postcss": {},   }, }; export default config;`

- **`README.md`**
  - *Purpose*: Core file.
  - *Preview*: `# Giantverse Giantverse created using Claude — an interactive identity-discovery experience built with Next.js. Participants go through a birth ritual`

- **`tsconfig.json`**
  - *Purpose*: Core file.
  - *Preview*: `{   "compilerOptions": {     "target": "ES2017",     "lib": ["dom", "dom.iterable", "esnext"],     "allowJs": true,     "skipLibCheck": true,     "str`

- **`vitest.config.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import path from "node:path"; import { defineConfig } from "vitest/config"; export default defineConfig({   resolve: {     alias: [       { find: "@/c`

### app/

- **`app/(experience)/birth/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { BirthRitualForm } from "@/components/experience/BirthRitualForm"; export default function BirthRitualPage() {   return (     <div className="`

- **`app/(experience)/choose/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { BirthNameReveal } from "@/components/experience/BirthNameReveal"; export default function ChooseExperiencePage() {   return <BirthNameReveal`

- **`app/(experience)/compatibility/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { Suspense } from "react"; import { CompatibilityChecker } from "@/components/compatibility/CompatibilityChecker"; export const metadata = {`

- **`app/(experience)/conversation/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { ConversationShell } from "@/components/experience/ConversationShell"; export default function ConversationPage() {   return (     <main class`

- **`app/(experience)/dossier/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { DossierPreview } from "@/components/dossier/DossierPreview"; export const metadata = {   title: "Your Giantverse Dossier",   description: "Pr`

- **`app/(experience)/ending/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { DrawingInvitation } from "@/components/experience/DrawingInvitation"; export default function DrawingInvitationPage() {   return <DrawingInvi`

- **`app/(experience)/layout.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `export default function ExperienceRouteLayout({   children, }: Readonly<{ children: React.ReactNode }>) {   return <div className="flex flex-1 flex-co`

- **`app/(experience)/reveal/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `"use client"; import { useEffect, useMemo, useState } from "react"; import { useRouter } from "next/navigation"; import { useSessionStore } from "@/st`

- **`app/(experience)/scenario-chat/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `"use client"; import { useEffect, useRef, useState } from "react"; import { useRouter } from "next/navigation"; import { useSessionStore } from "@/sto`

- **`app/(experience)/survey/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { SurveyShell } from "@/components/experience/SurveyShell"; export const metadata = { title: "The Ritual — Giantverse" }; export default functi`

- **`app/(experience)/visual-discovery/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import { VisualCharacterDiscovery } from "@/components/visual/VisualCharacterDiscovery"; export const metadata = {   title: "Visual Character Discover`

- **`app/(marketing)/page.tsx`**
  - *Purpose*: Next.js Route Page UI.
  - *Preview*: `import Link from "next/link"; export const metadata = {   title: "Giantverse — Discover Your Name",   description: "A brand experience. Discover the n`

- **`app/api/archetype/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; import { z } from "zod"; import { scoreArchetypes } from "@/engines/archetype/archetype.engin`

- **`app/api/conversation/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; import { z } from "zod"; import { receive } from "@/engines/conversation/conversation.engine"`

- **`app/api/dossier/generate/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; import { execFile } from "node:child_process"; import { promisify } from "node:util"; import`

- **`app/api/legacy-name/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; import { z } from "zod"; import { buildLegacyName } from "@/engines/naming/legacy-name.engine`

- **`app/api/scenario-chat/archetype/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextResponse } from 'next/server'; import { classify, archetypes } from '@/engines/scenario/math'; import { ARCHETYPE_DEFINITIONS } from '@/e`

- **`app/api/scenario-chat/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextResponse } from 'next/server'; import { QuestionService, GeminiProvider, FallbackService, QuestionCache, ExtractionService } from '@/engi`

- **`app/api/session/[id]/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; export async function GET(   _req: NextRequest,   { params }: { params: Promise<{ id: string`

- **`app/api/session/route.ts`**
  - *Purpose*: Next.js API Route Handler.
  - *Preview*: `import { NextRequest, NextResponse } from "next/server"; import { generateBirthName } from "@/engines/naming/birth-name.engine"; import { birthRitualS`

- **`app/globals.css`**
  - *Purpose*: Core file.
  - *Preview*: `@import "tailwindcss"; :root {   --background: #ffffff;   --foreground: #171717; } @theme inline {   --color-background: var(--background);   --color-`

- **`app/layout.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import type { Metadata } from "next"; import { Geist, Geist_Mono } from "next/font/google"; import "./globals.css"; import "./legacy-ui.css"; const ge`

- **`app/legacy-ui.css`**
  - *Purpose*: Core file.
  - *Preview*: `@charset "utf-8"; @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&family=Poppins:wght@400;500;600;700&display=swap');`

### components/

- **`components/animations/FadeSequence.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; import { motion } from "framer-motion"; export function FadeSequence({   children,   delay = 0, }: {   children: React.ReactNode;   dela`

- **`components/animations/NameCrystallize.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; import { motion } from "framer-motion"; export function NameCrystallize({    name,   charClassName = ""  }: {    name: string;   charCla`

- **`components/animations/ResonanceRipple.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; import { motion } from "framer-motion"; export function ResonanceRipple() {   return (     <div       aria-hidden       className="point`

- **`components/chat/AgreementSlider/AgreementSlider.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.sliderContainer {   margin: 2rem 0;   width: 100%;   max-width: 600px;   position: relative;   display: flex;   flex-direction: column;   align-items`

- **`components/chat/AgreementSlider/AgreementSlider.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import React, { useState, useEffect } from 'react'; import styles from './AgreementSlider.module.css'; interface Props {   value: number; // -1 to 1`

- **`components/chat/Composer/Composer.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.composerWrapper {   position: fixed;   bottom: 0;   left: 0;   right: 0;   padding: 16px 24px 32px 24px;   background: linear-gradient(to top, rgba(1`

- **`components/chat/Composer/Composer.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import React, { useRef, useEffect } from 'react'; import styles from './Composer.module.css'; import { Send, ChevronUp } from 'lucide-react'; interfac`

- **`components/chat/CustomAnswerBox/CustomAnswerBox.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.container {   display: flex;   flex-direction: column;   gap: var(--spacing-3);   width: 100%;   max-width: 500px;   margin: var(--spacing-6) auto 0;`

- **`components/chat/CustomAnswerBox/CustomAnswerBox.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import { useState } from 'react'; import styles from './CustomAnswerBox.module.css'; interface Props {   onSubmit: (text: string) => void;   disabled:`

- **`components/chat/MessagesContainer/MessagesContainer.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.container {   flex: 1;   overflow-y: auto;   padding: 90px 24px 180px 24px; /* Padding for header top, composer bottom */   display: flex;   flex-dir`

- **`components/chat/MessagesContainer/MessagesContainer.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import React, { useEffect, useRef } from 'react'; import { motion, AnimatePresence } from 'framer-motion'; import styles from './MessagesContainer.mod`

- **`components/chat/OptionSelector/OptionSelector.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.container {   display: flex;   flex-direction: column;   gap: 12px;   width: 100%;   max-width: 600px;   margin: 0 auto 2rem auto; } .optionBtn {`

- **`components/chat/OptionSelector/OptionSelector.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import React from 'react'; import { QuestionOption } from '@/stores/scenario.store'; import styles from './OptionSelector.module.css'; interface Props`

- **`components/chat/QuestionCard/QuestionCard.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.container {   min-height: 200px;   display: flex;   align-items: center;   justify-content: center;   padding: var(--spacing-8);   margin-bottom: var`

- **`components/chat/QuestionCard/QuestionCard.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import { motion, AnimatePresence } from 'framer-motion'; import styles from './QuestionCard.module.css'; import { Question } from '@/stores/scenario.s`

- **`components/chat/SuggestionsSheet/SuggestionsSheet.module.css`**
  - *Purpose*: Core file.
  - *Preview*: `.sheet {   position: fixed;   bottom: 0;   left: 0;   right: 0;   background: rgba(15, 15, 15, 0.85);   backdrop-filter: blur(20px);   -webkit-backdro`

- **`components/chat/SuggestionsSheet/SuggestionsSheet.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `import React from 'react'; import { motion, AnimatePresence } from 'framer-motion'; import styles from './SuggestionsSheet.module.css'; import { Optio`

- **`components/compatibility/CompatibilityChecker.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // Compatibility Checker — an optional, standalone tool: enter two names // and pick each person's Giantverse archetype from a dropdown,`

- **`components/compatibility/CompatibilityShareCard.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // CompatibilityShareCard — canvas-rendered share card for a Compatibility // Checker result, drawn on top of the official "Compatibilit`

- **`components/dossier/DossierBook.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // Magazine-style double-page-spread book viewer for the Giantverse Dossier. // Page 1 (the cover) sits alone on the right, like a close`

- **`components/dossier/DossierPreview.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // Dossier Preview + paywall — shown after identity generation. Presents // the 105-page "Dossier 2.0" sample as a flip-through double-p`

- **`components/dossier/PaymentModal.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // Dummy checkout UI — wired to lib/payment/gateway's MockPaymentProvider. // No real payment is ever processed here. Swapping in a real`

- **`components/experience/ArchetypeJourneyPlayer.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useEffect, useRef, useState } from "react"; import { renderJourneyMap, type TurnSnapshot } from "@/lib/journey-renderer"; impor`

- **`components/experience/BirthNameReveal.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { AnimatePresence, motion } from "frame`

- **`components/experience/BirthRitualForm.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useState } from "react"; import { useRouter } from "next/navigation"; import { useForm } from "react-hook-form"; import { zodRe`

- **`components/experience/ConversationShell.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useEffect, useRef, useState } from "react"; import { useRouter } from "next/navigation"; import { useSessionStore } from "@/sto`

- **`components/experience/DrawingInvitation.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useEffect, useRef, useState } from "react"; import { useRouter } from "next/navigation"; import { motion } from "framer-motion"`

- **`components/experience/LandingHero.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `export function LandingHero() {   return null; }`

- **`components/experience/LegacyNameReveal.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useRouter } from "next/navigation"; import { motion } from "framer-motion"; import { useConversationStore } from "@/stores/conv`

- **`components/experience/MessageBubble.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `import type { ChatMessage } from "@/types/conversation.types"; export function MessageBubble({   message,   isStreaming, }: {   message: ChatMessage;`

- **`components/experience/RevealButton.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useState } from "react"; import { useConversationStore } from "@/stores/conversation.store"; export function RevealButton() {`

- **`components/experience/SurveyShell.tsx`**
  - *Purpose*: Experience specific UI component.
  - *Preview*: `"use client"; import { useEffect, useMemo, useRef, useState } from "react"; import { useRouter } from "next/navigation"; import { AnimatePresence, mot`

- **`components/layout/BackgroundCanvas.tsx`**
  - *Purpose*: Layout UI component.
  - *Preview*: `export function BackgroundCanvas() {   return null; }`

- **`components/layout/ExperienceLayout.tsx`**
  - *Purpose*: Layout UI component.
  - *Preview*: `export function ExperienceLayout({ children }: { children: React.ReactNode }) {   return <div className="flex flex-1 flex-col">{children}</div>; }`

- **`components/visual/CharacterResultCard.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; import type { CharacterMatch } from "@/types/visual.types"; import { AXIS_LABELS } from "@/types/visual.types"; // Monogram avatar — we`

- **`components/visual/DesignPrincipleCard.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; import type { CharacterEntry } from "@/types/visual.types"; // Educational breakdown of WHY the matched design works — teaches design //`

- **`components/visual/ShareCard.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // ShareCard — canvas-rendered social card ("Who's My Anime Twin?"). // The QR code is cropped at runtime from the official card templat`

- **`components/visual/VisualCharacterDiscovery.tsx`**
  - *Purpose*: Core file.
  - *Preview*: `"use client"; // Visual Character Discovery — optional onboarding module. // // Flow: intro (privacy) → selfie/upload → analyzing → top-5 results → //`

### docs/

- **`docs/ARCHETYPE_GUIDE.md`**
  - *Purpose*: Project documentation.
  - *Preview*: `# The Archetype Wheel The 32 archetypes are not 32 isolated boxes. They're a 32-point compass: `src/engines/archetype/archetype-wheel.ts` arranges eve`

- **`docs/ARCHITECTURE.md`**
  - *Purpose*: Project documentation.
  - *Preview*: `# GIANTVERSE — Architecture Document **Status: Pre-Production | Awaiting Approval** *Prepared for Giant Hunt* --- ## 1. Folder Structure ``` giantvers`

- **`docs/PROMPT_DESIGN.md`**
  - *Purpose*: Project documentation.
  - *Preview*: ``

### hooks/

- **`hooks/useConversation.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import { useConversationStore } from "@/stores/conversation.store"; export function useConversation() {   return useConversationStore(); }`

- **`hooks/useReveal.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export function useReveal() {   return {}; }`

- **`hooks/useSession.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export function useSession() {   return {}; }`

### prisma/

- **`prisma/schema.prisma`**
  - *Purpose*: Database schema and configuration.
  - *Preview*: `generator client {   provider = "prisma-client-js" } datasource db {   provider = "postgresql"   url      = env("DATABASE_URL") } // ── Sessions ─────`

### public/

- **`public/dossier-sample.manifest.json`**
  - *Purpose*: Core file.
  - *Preview*: `{"pages": 105, "quote_pages": [4, 9, 18, 24, 32, 44, 54, 62, 81, 98]}`

- **`public/pdf.worker.min.mjs`**
  - *Purpose*: Core file.
  - *Preview*: `/**  * @licstart The following is the entire license notice for the  * JavaScript code in this page  *  * Copyright 2024 Mozilla Foundation  *  * Lice`

### src/

- **`src/data/character-database.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import type { CharacterEntry, CharacterCollection, VisualAxes } from "@/types/visual.types"; // Visual Character Discovery — curated design-language d`

- **`src/db/client.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/db/schema.prisma`**
  - *Purpose*: Core file.
  - *Preview*: ``

- **`src/engines/archetype/archetype-definitions.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { ArchetypeProfile, Dimension } from "@/types/archetype.types"; function weights(partial: Partial<Record<Dimension, number>>): Record<Dime`

- **`src/engines/archetype/archetype-wheel.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import type { ArchetypeProfile } from "@/types/archetype.types"; //`

- **`src/engines/archetype/archetype.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import type { ArchetypeProfile, ArchetypeScore, Dimension, Signal }`

- **`src/engines/archetype/confidence.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { dimensionsCovered } from "@/engines/archetype/archetype.engine"; import type { Signal } from "@/types/archetype.types"; const MIN_CONFIDENT_D`

- **`src/engines/archetype/convergence.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import type { ArchetypeProfile, Dimension, Signal } from "@/types/a`

- **`src/engines/archetype/journey-history.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { scoreArchetypes } from "@/engines/archetype/archetype.engine"; import type { Signal } from "@/types/archetype.types"; import type { TurnSnaps`

- **`src/engines/archetype/order-classifier.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import type { Order } from "@/types/archetype.types"; export functi`

- **`src/engines/archetype/tension.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { scoreArchetypes } from "@/engines/archetype/archetype.engine"; import { getOppositeId, OPPOSITE_TENSIONS } from "@/engines/archetype/archetyp`

- **`src/engines/compatibility/compatibility.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import { WHEEL_ORDER } from "@/engines/archetype/archetype-wheel";`

- **`src/engines/conversation/conversation.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { buildSystemPrompt } from "@/engines/prompt/system-prompt.builder"; import { selectNextProbe } from "@/engines/conversation/probe.engine"; imp`

- **`src/engines/conversation/memory.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { extractSignalFromMessage } from "@/engines/conversation/signal-extractor.engine"; import type { Dimension, Signal } from "@/types/archetype.t`

- **`src/engines/conversation/probe.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { PROBE_ORDER } from "@/engines/prompt/probe-templates"; import type { Dimension, Signal } from "@/types/archetype.types"; const CONFIDENT_THRE`

- **`src/engines/conversation/signal-extractor.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { extractSignal } from "@/services/ai/ai.service"; import { PROBE_TEMPLATES } from "@/engines/prompt/probe-templates"; import type { Dimension,`

- **`src/engines/dossier/persona-payload.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import { WHEEL_ORDER, OPPOSITE_TENSIONS } from "@/engines/archetype`

- **`src/engines/guilds.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; // The 8 Guilds every archetype belongs to. Membership is derived f`

- **`src/engines/inspiration-graph.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `/**  * @license  * SPDX-License-Identifier: Apache-2.0  */ // Inspiration Graph: personalities, books, cinema, anime, and games // resonant with each`

- **`src/engines/inspiration.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { INSPIRATION_GRAPH, InspirationEntry } from "@/engines/inspiration-graph"; import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetyp`

- **`src/engines/naming/birth-name.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { DOB_SYLLABLES, MONTH_SYLLABLES, LETTER_SYLLABLES } from "./syllable-tables"; export function generateBirthName(firstName: string, dateOfBirth`

- **`src/engines/naming/japanese-lexicon.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export {};`

- **`src/engines/naming/legacy-name.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; export function buildLegacyName(birthName: string, archetypeId: str`

- **`src/engines/naming/syllable-tables.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export const DOB_SYLLABLES: Record<number, string> = {   1: "Ka", 2: "Ki", 3: "Ku", 4: "Ke", 5: "Ko",   6: "Sa", 7: "Shi", 8: "Su", 9: "Se", 10: "So",`

- **`src/engines/prompt/persona.builder.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export function buildPersonaIdentity(firstName: string, birthName: string): string {   return `You are ${birthName}, the Giantverse counterpart of ${f`

- **`src/engines/prompt/probe-templates.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { Dimension } from "@/types/archetype.types"; export const PROBE_TEMPLATES: Record<Dimension, string> = {   VALUES:     "There's a moment`

- **`src/engines/prompt/system-prompt.builder.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { buildPersonaIdentity, PERSONA_VOICE } from "@/engines/prompt/persona.builder"; import { PROBE_TEMPLATES } from "@/engines/prompt/probe-templa`

- **`src/engines/realms.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `/**  * @license  * SPDX-License-Identifier: Apache-2.0  */ // The five ecological Realms every Giantverse continent contains. // See lore/02_realms.md`

- **`src/engines/scenario/ai/cache/question_cache.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { LRUCache } from 'lru-cache'; import { QuestionResponse, GenerationContext } from '../types/generation'; export class QuestionCache {   privat`

- **`src/engines/scenario/ai/index.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export * from './types/generation'; export * from './providers/base_provider'; export * from './providers/gemini_provider'; export * from './schemas/q`

- **`src/engines/scenario/ai/prompts/index.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { GenerationContext } from '../types/generation'; import { INDEX_TO_DIMENSION } from '@/engines/scenario/math'; export function buildQuestionPr`

- **`src/engines/scenario/ai/providers/base_provider.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { GenerationContext, QuestionResponse } from '../types/generation'; export interface LLMProvider {   generate(context: GenerationContext, timeo`

- **`src/engines/scenario/ai/providers/gemini_provider.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { LLMProvider } from './base_provider'; import { GenerationContext } from '../types/generation'; import { buildQuestionPrompt, buildRepairPromp`

- **`src/engines/scenario/ai/schemas/question_schema.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { z } from 'zod'; export const QuestionSchema = z.object({   id: z.string().uuid().or(z.string()),   scenario: z.string().min(30).max(300),   o`

- **`src/engines/scenario/ai/services/context_builder.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { GenerationContext } from '../types/generation'; import { selectHighVarianceDimensions, INDEX_TO_DIMENSION } from '@/engines/scenario/math'; e`

- **`src/engines/scenario/ai/services/extraction_service.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { LLMProvider } from '../providers/base_provider'; import { buildExtractionPrompt, buildRepairPrompt } from '../prompts'; import { z } from 'zo`

- **`src/engines/scenario/ai/services/fallback_service.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { QuestionResponse } from '../types/generation'; const MOCK_FALLBACK: QuestionResponse = {   id: 'fb-001',   scenario: 'A plan collapses unexpe`

- **`src/engines/scenario/ai/services/question_service.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { LLMProvider } from '../providers/base_provider'; import { FallbackService } from './fallback_service'; import { QuestionCache } from '../cach`

- **`src/engines/scenario/ai/types/generation.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export interface GenerationContext {   needSignals: string[];   usedThemes: string[];   usedStructures: string[];   usedSignals: string[];   entropySt`

- **`src/engines/scenario/math/constants/signals.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export const BehaviorDimensions: Record<string, number> = {   curiosity: 0,   logic: 1,   abstraction: 2,   patternRecognition: 3,   riskTaking: 4,`

- **`src/engines/scenario/math/data/archetype_seed.json`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `[   {     "id": "ARCHITECT_01",     "name": "The Architect",     "vector": [0.8, -0.6, 0.5, -0.2, 0.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,`

- **`src/engines/scenario/math/data/archetypes.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ArchetypeCentroid } from '../math/classifier'; export const archetypes: ArchetypeCentroid[] = [   {     "id": "CUSTODIAN_01",     "name": "Th`

- **`src/engines/scenario/math/index.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `export * from './math/vectors'; export * from './math/entropy'; export * from './math/classifier'; export * from './logic/adaptive_selector'; export *`

- **`src/engines/scenario/math/logic/adaptive_selector.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { ArchetypeCentroid } from '../math/classifier'; /**  * Identifies the dimensions with the highest variance among the top K candidate archetype`

- **`src/engines/scenario/math/math/classifier.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import { cosineSimilarity } from './vectors'; export interface ArchetypeCentroid {   id: string;   name: string;   vector: number[]; } export interfac`

- **`src/engines/scenario/math/math/entropy.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `/**  * Computes the Shannon Entropy (H) of a probability distribution.  * H = - sum( P(i) * log2(P(i)) )  */ export function calculateEntropy(probabil`

- **`src/engines/scenario/math/math/vectors.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `/**  * Computes the Euclidean distance between two vectors.  */ export function euclideanDistance(a: number[], b: number[]): number {   if (a.length !`

- **`src/engines/survey/survey-question-bank.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { SurveyQuestion } from "./survey-questions"; // The full question bank the per-session survey is drawn from. // 14 questions per dimensio`

- **`src/engines/survey/survey-questions.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { Dimension } from "@/types/archetype.types"; export type QuestionType = "likert" | "yesno"; export type SurveyQuestion = {   id: string;`

- **`src/engines/survey/survey-scoring.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { Signal } from "@/types/archetype.types"; import type { SurveyQuestion } from "./survey-questions"; import { SURVEY_QUESTIONS } from "./s`

- **`src/engines/survey/survey-selection.engine.ts`**
  - *Purpose*: Core business logic engine.
  - *Preview*: `import type { Dimension } from "@/types/archetype.types"; import type { SurveyQuestion } from "./survey-questions"; import { QUESTION_BANK } from "./s`

- **`src/lib/card-generator.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import { renderJourneyMap, getSpokeAngle, type TurnSnapshot } from "@/lib/journey-renderer"; export type CardParams = {   birthName: string;   legacyN`

- **`src/lib/journey-renderer.ts`**
  - *Purpose*: Core file.
  - *Preview*: `// GIANTVERSE · JOURNEY MAP glyph (browser port of journeyCardRender.v2) // // Renders the participant's turn-by-turn drift across the 32 archetypes a`

- **`src/lib/payment/gateway.ts`**
  - *Purpose*: Core file.
  - *Preview*: `// Payment gateway abstraction for unlocking the full Giantverse Dossier // PDF. Only a mock provider is wired in today — this interface exists so //`

- **`src/lib/utils.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/lib/validators.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import { z } from "zod"; // Feb allows 29 so leap-day birthdays remain valid even without a birth year. const DAYS_IN_MONTH: Record<number, number> =`

- **`src/lib/visual/character-matcher.ts`**
  - *Purpose*: Core file.
  - *Preview*: `// CharacterMatcher — visual-similarity ranking over any character collection. // // Consumes only the shared measurement axes, so every collection (a`

- **`src/lib/visual/face-embedding.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `// FaceEmbeddingService — fully client-side visual feature extraction. // // Privacy: the image never leaves the browser. Analysis runs on an in-memor`

- **`src/localization/en.json`**
  - *Purpose*: Core file.
  - *Preview*: `{}`

- **`src/localization/ja.json`**
  - *Purpose*: Core file.
  - *Preview*: `{}`

- **`src/services/ai/ai.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import { GoogleGenAI, Type } from "@google/genai"; import type { ChatMessage } from "@/types/conversation.types"; const MODEL = "gemini-2.5-flash"; co`

- **`src/services/ai/stream.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export function toTextStream(chunks: AsyncIterable<{ text?: string }>): ReadableStream<Uint8Array> {   const encoder = new TextEncoder();   return new`

- **`src/services/analytics/analytics.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/services/database/participant.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/services/database/session.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/services/database/submission.service.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export {};`

- **`src/types/archetype.types.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export type Dimension =   | "VALUES"   | "FEARS"   | "DREAMS"   | "POWER"   | "PEOPLE"   | "DECISIONS"   | "LEADERSHIP"   | "MOTIVATION";`

- **`src/types/conversation.types.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export type ChatRole = "user" | "assistant"; export type ChatMessage = {   role: ChatRole;   content: string; }; export type ConversationRequest = {`

- **`src/types/naming.types.ts`**
  - *Purpose*: Core file.
  - *Preview*: `export type BirthNameInput = {   firstName: string;   dateOfBirth: Date; };`

- **`src/types/session.types.ts`**
  - *Purpose*: Core file.
  - *Preview*: `import type { TurnSnapshot } from "@/lib/journey-renderer"; export type SessionStore = {   sessionId: string | null;   firstName: string;   birthDay:`

- **`src/types/visual.types.ts`**
  - *Purpose*: Core file.
  - *Preview*: `// Visual Character Discovery — types. // // IMPORTANT DISTINCTION (maintained everywhere): the face image produces a // VISUAL EMBEDDING used only fo`

### stores/

- **`stores/assessment.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; import type { Signal } from "@/types/archetype.types"; export interface AssessmentResult {   source: "survey" | "cha`

- **`stores/conversation.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; import type { ChatMessage } from "@/types/conversation.types"; import type { Dimension, Signal } from "@/types/arche`

- **`stores/invite.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; // Pending Compatibility invite — set when someone arrives at /compatibility // via a friend's share link (?invite=<`

- **`stores/payment.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; import { getPaymentGateway, type ChargeRequest } from "@/lib/payment/gateway"; // Dossier unlock state. Not persiste`

- **`stores/scenario.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from 'zustand'; export interface QuestionOption {   text: string;   traits: string[]; } export interface Question {   id: string;`

- **`stores/session.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; import type { SessionStore } from "@/types/session.types"; export const useSessionStore = create<SessionStore>((set,`

- **`stores/ui.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `export {};`

- **`stores/visual.store.ts`**
  - *Purpose*: Zustand global state store.
  - *Preview*: `import { create } from "zustand"; import type { CharacterMatch } from "@/types/visual.types"; // Visual Character Discovery state. Deliberately isolat`

### tests/

- **`tests/engines/archetype-wheel.test.ts`**
  - *Purpose*: Unit test file.
  - *Preview*: `import { describe, expect, it } from "vitest"; import { ARCHETYPE_DEFINITIONS } from "@/engines/archetype/archetype-definitions"; import {   WHEEL_ORD`

- **`tests/engines/archetype.test.ts`**
  - *Purpose*: Unit test file.
  - *Preview*: `import { describe, expect, it } from "vitest"; import { scoreArchetypes, selectArchetype, dimensionsCovered } from "@/engines/archetype/archetype.engi`

- **`tests/engines/birth-name.test.ts`**
  - *Purpose*: Unit test file.
  - *Preview*: `import { describe, expect, it } from "vitest"; import { generateBirthName } from "@/engines/naming/birth-name.engine"; import {   DOB_SYLLABLES,   MON`

- **`tests/engines/compatibility.test.ts`**
  - *Purpose*: Unit test file.
  - *Preview*: `import { describe, expect, it } from "vitest"; import { WHEEL_ORDER } from "@/engines/archetype/archetype-wheel"; import { ARCHETYPE_DEFINITIONS } fro`

- **`tests/engines/legacy-name.test.ts`**
  - *Purpose*: Unit test file.
  - *Preview*: `import { describe, expect, it } from "vitest"; import { buildLegacyName } from "@/engines/naming/legacy-name.engine"; describe("buildLegacyName", () =`

### tools/

- **`tools/dossier/__pycache__/content_book.cpython-310.pyc`**
  - *Purpose*: Core file.
  - *Preview*: `o     i�Pjg�  �                   @   s  d dddd�ddddd�dd	d dd�ddd dd�ddddd�ddd dd�ddddd�ddddd�ddd dd`

- **`tools/dossier/__pycache__/guild_lore.cpython-310.pyc`**
  - *Purpose*: Core file.
  - *Preview*: `o     *�Qj�#  �                   @   s�   d g d�ddgd�dg d�ddgd�d	g d �ddgd�dg d�ddgd�dg d�ddgd�dg d�ddgd`

- **`tools/dossier/__pycache__/persona_builder.cpython-310.pyc`**
  - *Purpose*: Core file.
  - *Preview*: `o     ��Qj�f  �                   @   s�  d Z ddlmZ ddlmZ ddg d�dfdd	g d �dfddg d�dfddg d�dfddg d�dfddg d`

- **`tools/dossier/__pycache__/persona_toyuho.cpython-310.pyc`**
  - *Purpose*: Core file.
  - *Preview*: `o     i�PjoK  �                   @   s�  i d d�dd�dd�dd�dd	�d d�dd�dd�dd�dd�dd�dd�dd�dd�dd�dd�d d!�i`

- **`tools/dossier/__pycache__/realm_lore.cpython-310.pyc`**
  - *Purpose*: Core file.
  - *Preview*: `o     �QjR3  �                   @   s,  d ddddg d�g d�g d�g d�gg d	�g d �ddgd�	dddddg d�g d�g d�g d�gg d�g d�`

- **`tools/dossier/content_book.py`**
  - *Purpose*: Core file.
  - *Preview*: `# GIANTVERSE DOSSIER 2.0 — universal book content. # Everything here is persona-independent; strings may contain {placeholders} # that the generator f`

- **`tools/dossier/generate_dossier.py`**
  - *Purpose*: Core file.
  - *Preview*: `#!/usr/bin/env python3 """GIANTVERSE DOSSIER 2.0 — Premium Collector's Edition generator. Usage:     DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib pyth`

- **`tools/dossier/guild_lore.py`**
  - *Purpose*: Core file.
  - *Preview*: `# Guild lore — shared across every archetype belonging to that Calling. # Eight guilds, each authored once. "Guild of Survivors" is extracted # from t`

- **`tools/dossier/persona_builder.py`**
  - *Purpose*: Core file.
  - *Preview*: `"""Builds a full generate_dossier.py PERSONA dict from a live participant. Input is a JSON payload (see PayloadKeys below) produced by the Next.js app`

- **`tools/dossier/persona_toyuho.py`**
  - *Purpose*: Core file.
  - *Preview*: `# Sample persona — Toyuho Kagemori (the Survivor), extracted from the # Dossier 1.0 sample so 2.0 preserves every original feature. In # production th`

- **`tools/dossier/realm_lore.py`**
  - *Purpose*: Core file.
  - *Preview*: `# Realm lore — shared across every archetype whose realmBias maps here. # Five realms, each authored once, reused by every persona born into it. # Sty`

