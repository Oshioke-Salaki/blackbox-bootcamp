# FHEVM Bootcamp Redesign — "The Vault"

## Core Concept

The UI metaphor is **unlocking encrypted knowledge**. Text appears as scrambled cipher characters and "decrypts" into readable content on scroll/load — directly demonstrating what FHE does through the UI itself. This is the signature element no competitor will have.

## Design Language

### Color
- **Background**: `#0A0A0B` (near-black, not pure black)
- **Surface**: `#111113` (cards, elevated elements)
- **Border**: `#1E1E22` (subtle separation)
- **Text primary**: `#E8E8ED` (off-white, easy on eyes)
- **Text secondary**: `#6B6B76`
- **Accent**: `#C8A55A` (warm gold — like light through a vault door)
- **Accent muted**: `#C8A55A33` (for backgrounds, glows)
- **Success**: `#4ADE80` (green for completed/pass)
- **Code bg**: `#0D0D10`

ONE accent color. No gradients. No neon. Restraint is the design.

### Typography
- **Display headings**: `Space Grotesk` (geometric, distinctive, not overused)
- **Body**: `Inter` (clean, professional)
- **Code**: `JetBrains Mono` (industry standard)
- Heading sizes: 4rem hero → 2.5rem section → 1.5rem subsection
- Body: 1.05rem with 1.7 line height (optimized for reading)
- Letter-spacing on headings: -0.03em (tight, editorial feel)

### Layout Principles
- Max content width: 1200px
- Generous whitespace (80px+ section gaps)
- Asymmetric layouts where appropriate (text left, visual right)
- No rounded corners on cards (sharp = sophisticated). Exception: small elements like badges (4px).
- Borders: 1px solid, never shadows for elevation

### Signature Animation: "Decrypt Effect"
Characters cycle through random cipher characters (█▓░╔╗╚╝║═│┤├┬┴┼▲▼◆●) before settling on real text. Applied to:
- Hero headline on page load
- Section headers on scroll-into-view
- Key statistics/numbers

### Micro-interactions
- Links: gold underline slides in from left on hover
- Cards: subtle border-color transition to gold on hover
- Code blocks: line numbers fade in, copy button appears on hover
- Navigation: active indicator is a small gold dot, not a highlight bar
- Page transitions: content fades up 20px with opacity

## Pages & Features

### 1. Home (`/`)
- Hero: Large headline with decrypt animation, one-line subtitle, two CTAs (Start Learning, View Curriculum)
- Scrolling "encryption visualization": a strip showing `plaintext → euint64 → FHE.add() → decrypt → result` with animated flow
- 4 week cards in a 2x2 grid with week number, title, key topics, estimated hours
- Prerequisites as a minimal checklist
- Final CTA block

### 2. Curriculum (`/curriculum`)
- Left sidebar: week navigation with progress indicators (circles: empty/half/full)
- Main content: lesson cards that expand to show full content
- Each lesson contains:
  - Learning objectives (checkbox list, persisted to localStorage)
  - Conceptual explanation with diagrams (CSS-drawn, not images)
  - Code examples with syntax highlighting + copy button
  - "Key Insight" callout boxes
  - Knowledge check quiz (2-3 questions per lesson, inline)
- Progress bar at top showing % complete across all weeks
- "Mark as Complete" button per lesson

### 3. Homework (`/homework`)
- Card per assignment with difficulty badge, estimated time, week number
- Expandable spec showing: scenario, deliverables, starter code (copyable), grading rubric
- Rubric displayed as a clean table with point values
- "Download Starter" button that triggers a copy of the template code
- Visual difficulty progression (bar or dots)

### 4. Resources (`/resources`) — REPLACES InstructorPage + VideoScriptPage
- Tabbed interface: "Learning Materials" | "Instructor Guide" | "Video Guide"
- **Learning Materials tab**:
  - Curated external links (Zama docs, GitHub repos, blog posts) with descriptions
  - Embedded concept diagrams (FHE pipeline, type system, access control flow)
  - Cheat sheet: encrypted types reference table
  - Glossary of FHE terms
- **Instructor Guide tab**:
  - Weekly cadence schedule
  - Common mistakes (8 items with code examples)
  - Cohort management tips
  - Grading automation setup
- **Video Guide tab**:
  - 5-segment script with timecodes
  - Production tips
  - Equipment recommendations

## Interactive Features

### Progress Tracking (localStorage)
- Per-lesson completion checkboxes
- Per-quiz score tracking
- Overall progress percentage displayed in nav and curriculum sidebar
- Progress persists across sessions
- "Reset Progress" option in footer

### Inline Quizzes
- Multiple choice (3-4 options)
- Immediate feedback (correct/incorrect with explanation)
- Cannot proceed to "mark complete" until quiz passed
- 2-3 questions per lesson, testing key concepts
- Quiz data stored in component (no backend needed)

### Code Blocks
- Syntax highlighting via CSS classes (no external lib needed — manual Prism-like highlighting)
- Line numbers
- Copy-to-clipboard button
- Language label badge
- Optional "diff" view showing before/after

### FHE Concept Visualizations (CSS-only)
- **Encryption Pipeline**: plaintext box → encrypt arrow → ciphertext box → compute arrow → result box → decrypt arrow → plaintext box
- **Type System Diagram**: euint8/16/32/64/128/256 hierarchy
- **Access Control Flow**: who can decrypt what and when

## Content Gaps to Fill

1. **Deeper Week 2-4 lessons**: Match Week 1's depth with full explanations, more code examples
2. **Starter code templates**: Actual Solidity scaffolds for each homework (not just links)
3. **Solution snippets**: Key function implementations shown after quiz completion
4. **FHE glossary**: 20+ terms defined
5. **Concept diagrams**: Visual explanations of encryption, decryption, compute flows
6. **Quiz questions**: 2-3 per lesson across all weeks (~30 total)

## Technical Implementation

- Same stack: React 19, Vite, React Router
- No new dependencies except possibly `react-syntax-highlighter` (or manual highlighting to keep it lean)
- All data remains static (JS objects/arrays)
- localStorage for progress
- CSS-only animations (no Framer Motion needed — reduce bundle)
- Can remove `react-markdown` dependency (render content directly in JSX)

## What This Design Achieves

1. **The decrypt animation is a "wow" moment** — judges see it and immediately understand the product
2. **Restrained color palette signals sophistication** — not AI-generated, not hackathon-tier
3. **Interactive features show production readiness** — progress tracking, quizzes, code copying
4. **Content depth proves curriculum quality** — not just an outline, actual teaching materials
5. **Single-page static site, yet feels like a full LMS** — punches way above its weight
