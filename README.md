# Giantverse

Giantverse created using Claude — an interactive identity-discovery experience built with Next.js.

Participants go through a birth ritual, a dynamically-sampled personality survey (or guided conversation), and are matched against one of 32 archetypes across the Order of Giants and the Order of Hunters. The result is a "Giantverse Name" and a printable identity card generated on canvas from a design template.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project layout

- `app/` — Next.js App Router routes (birth ritual, survey, conversation, reveal, ending)
- `components/` — experience, layout, and marketing UI components
- `stores/` — Zustand session and conversation state
- `src/engines/` — archetype scoring, naming, survey selection, conversation, and prompt-building logic
- `src/lib/card-generator.ts` — canvas-based identity card renderer
- `prisma/` — database schema
- `docs/` — architecture and design notes

See `docs/ARCHITECTURE.md` and `docs/ARCHETYPE_GUIDE.md` for more detail.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

## Deploy

The easiest way to deploy this app is via the [Vercel Platform](https://vercel.com/new). See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
