# ROADMAP.md

# Product Vision

An educational compiler visualization platform that shows how compilation works internally in real time.

Primary audience:

- Students
- Teachers
- Self-learners
- Compiler beginners

Core philosophy:

- Educational clarity first
- Performance second
- Features third

The project must avoid feature creep.

---

# Strict Development Rule

DO NOT implement future roadmap items early.

If a feature is not inside the current phase:
- Ignore it
- Do not partially implement it
- Do not add placeholders
- Do not create unused abstractions

Premature abstraction is forbidden.

---

# Phase 1 — MVP

Goal:
Create a stable educational compiler visualization tool for C code.

Status:
CURRENT PRIORITY

---

# MVP Scope

## Core Editor

Required:

- Monaco Editor
- Syntax highlighting
- Line numbers
- Responsive layout
- Debounced compilation

NOT allowed:

- Themes marketplace
- Multi-tab editing
- File explorer
- AI assistant
- Collaboration

---

## Compilation Pipeline

Required stages:

1. Lexical Analysis
2. Parsing
3. AST Generation
4. Semantic Analysis
5. LLVM IR Generation

NOT required:

- Optimization passes
- Machine code generation
- Register allocation visualization
- Linker simulation

---

## Visualizations

Required:

- Token viewer
- AST tree
- Symbol table
- LLVM IR panel

NOT required:

- CFG graph
- SSA graph
- Interactive graph editing
- Assembly flow diagrams
- Animated memory models

---

## Language Support

MVP supports:

- C only

NOT allowed:

- C++
- Rust
- Python
- Java
- JavaScript

No multi-language architecture yet.

---

## Backend Architecture

Required:

- WebAssembly compiler
- Web Workers
- Client-side execution

NOT required:

- Servers
- Databases
- Authentication
- Cloud compilation
- User accounts

---

## Performance Targets

Required:

- Works on low-end laptops
- Minimal RAM usage
- Fast initial load
- No UI freezing

Target:

- < 3s initial load
- < 300ms small compile updates

---

## UI Rules

Required:

- Clean educational layout
- Flat design
- Minimal animation
- High readability

Forbidden:

- Glassmorphism
- Excessive transitions
- Over-designed dashboards
- Fancy landing pages

---

# MVP Deliverable

The MVP is complete when:

- Users can type C code
- Compiler stages are visualized
- Errors are understandable
- The app runs reliably in browser
- Teachers can use it in class

Nothing else matters before this.

---

# Phase 2 — V2

Only begin after MVP is stable.

---

# V2 Goals

Improve educational depth.

NOT platform expansion.

---

# V2 Features

## Additional Visualizations

Allowed:

- Control Flow Graph
- SSA visualization
- Parse tree vs AST comparison
- Memory layout view

Still forbidden:

- AI-generated explanations
- Multiplayer collaboration
- Accounts

---

## Compilation Features

Allowed:

- Optimization pass visualization
- Constant folding visualization
- Dead code elimination view

---

## UX Improvements

Allowed:

- Light/Dark themes
- Save locally in browser storage
- Export diagrams as PNG

NOT allowed:

- Cloud sync
- User profiles
- Social systems

---

## Educational Features

Allowed:

- Step-by-step execution
- Stage-by-stage playback
- Compiler terminology tooltips

---

# Phase 3 — Advanced Educational Features

Only after V2 is stable.

---

# Advanced Features

## Multi-Language Support

Potential languages:

- C++
- Rust
- Java
- Python subset

This requires:
- Major architecture redesign
- Separate parsing pipelines
- Unified IR abstraction

Do not prepare for this early.

---

## Advanced Compiler Concepts

Potential additions:

- Register allocation visualization
- Instruction scheduling
- Machine code generation
- Linker simulation
- Loader visualization

---

## Advanced Learning Features

Potential additions:

- Interactive tutorials
- Guided lessons
- Classroom mode
- Quiz system

---

# Phase 4 — Future Experimental Ideas

Low priority.

Optional.

May never happen.

---

# Experimental Ideas

## AI Features

Possible:

- AI explanations
- AI-generated walkthroughs
- Code understanding assistant

These are dangerous for scope creep.

Do not touch before maturity.

---

## Community Features

Possible:

- Shared examples
- Public snippets
- Classroom sharing

Not important currently.

---

## Monetization

Possible:

- AdSense
- Sponsorships
- Educational institution partnerships

Do not optimize for revenue before product quality.

---

# Features Explicitly Rejected

The following are NOT part of the product vision:

- Competitive coding platform
- Online IDE replacement
- Full VSCode clone
- General code execution platform
- Social coding platform
- AI coding agent
- LeetCode clone

This is a compiler education tool.

Stay focused.

---

# Technical Debt Policy

Allowed:

- Small duplication during MVP
- Simple architecture
- Fast iteration

Forbidden:

- Premature microservices
- Over-engineering
- Generic plugin systems
- Enterprise abstractions

---

# Decision Filter

Before implementing any feature, ask:

1. Does this improve compiler education?
2. Is this necessary for current phase?
3. Does this hurt performance?
4. Will this confuse beginners?
5. Can low-end devices handle it?

If answers are poor:
Do not implement.

---

# Final Principle

A smaller finished product is better than a massive unfinished system.

Focus beats feature count.