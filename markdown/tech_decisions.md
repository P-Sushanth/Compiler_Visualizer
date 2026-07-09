# TECH_DECISIONS.md

# Purpose

This document records major technical decisions and the reasoning behind them.

Future contributors and AI agents must read this before making architectural changes.

The goal is to prevent good decisions from being undone later.

---

# Core Philosophy

The platform prioritizes:

1. Educational clarity
2. Browser performance
3. Low-end device support
4. Simplicity
5. Maintainability

NOT:

- Enterprise scalability
- Infinite extensibility
- Backend-heavy systems
- Fancy architecture patterns

---

# Why React Was Chosen

## Decision

Use React for UI rendering.

## Reasons

- Mature ecosystem
- Excellent component model
- Strong educational tooling ecosystem
- Good compatibility with Monaco
- Strong TypeScript support
- Easy incremental development

## Alternatives Rejected

### Vue

Rejected because:
- Smaller ecosystem for compiler visualization tooling

### Angular

Rejected because:
- Too heavy for project scope

### Svelte

Rejected because:
- Smaller ecosystem
- Less mature visualization integrations

---

# Why TypeScript Was Chosen

## Decision

Use TypeScript across the frontend.

## Reasons

- Better maintainability
- Safer compiler pipeline code
- Strong editor integration
- Better refactoring safety
- Prevents visualization data shape bugs

This project manipulates complex AST structures.
Type safety matters.

---

# Why Zustand Was Chosen

## Decision

Use Zustand for lightweight global state.

## Reasons

- Minimal boilerplate
- Tiny bundle size
- Simple mental model
- Easier than Redux
- Better for small focused apps

The project does NOT need enterprise state architecture.

## Alternatives Rejected

### Redux

Rejected because:
- Excessive boilerplate
- Unnecessary complexity
- Overkill for current scope

### MobX

Rejected because:
- Implicit behavior
- Harder debugging

### Context-Only Architecture

Rejected because:
- Causes excessive rerenders at scale

---

# Why Web Workers Are Mandatory

## Decision

All compilation logic runs inside Web Workers.

## Reasons

Compilation is CPU intensive.

Without workers:

- UI freezes
- Typing lag occurs
- Browser becomes unresponsive
- Weak laptops struggle badly

Workers isolate heavy computation from rendering.

This is non-negotiable.

---

# Why WebAssembly Was Chosen

## Decision

Compiler tooling runs through WebAssembly.

## Reasons

- Near-native performance
- Existing compiler tooling support
- Browser portability
- No backend required
- Deterministic execution

## Alternatives Rejected

### Pure JavaScript Compiler

Rejected because:
- Lower performance
- Less compatibility with real compiler tooling

### Backend Compilation

Rejected because:
- Server costs
- Latency
- Scalability burden
- Infrastructure complexity

---

# Why No Backend Exists

## Decision

The MVP is fully client-side.

## Reasons

- Lower infrastructure cost
- Easier deployment
- Better privacy
- Faster interaction
- No authentication complexity
- Easier scaling
- Better educational sandboxing

## Explicitly Avoided

- Databases
- User accounts
- Cloud compilation
- Session systems

These are unnecessary for MVP goals.

---

# Why Monaco Editor Was Chosen

## Decision

Use Monaco Editor.

## Reasons

- Industry standard
- Excellent TypeScript support
- Strong syntax highlighting
- Familiar developer experience
- Efficient rendering

## Alternatives Rejected

### CodeMirror

Rejected because:
- Monaco ecosystem stronger for this use case

---

# Why React Flow Was Chosen

## Decision

Use React Flow for graph-based educational visualizations.

## Reasons

- Good node graph rendering
- Easy interaction model
- React integration
- Faster development
- Adequate performance for educational graphs

Used for:

- AST visualization
- CFG visualization
- Graph relationships

---

# Why D3 May Be Used

## Decision

Use D3 only where lower-level control is required.

## Reasons

Some visualizations require:

- Custom layouts
- Precise graph control
- Fine-grained SVG behavior

D3 is NOT the default solution.

Use only when React Flow becomes limiting.

---

# Why Tailwind Was Chosen

## Decision

Use TailwindCSS.

## Reasons

- Fast iteration
- Consistent spacing system
- Reduced CSS sprawl
- Easier responsive layouts
- Better maintainability

## Constraints

Tailwind must NOT be abused for:

- Giant unreadable class chains
- Arbitrary values everywhere
- Design inconsistency

---

# Why Flat UI Design Was Chosen

## Decision

Use minimal flat educational UI.

## Reasons

- Better readability
- Better performance
- Less visual distraction
- Easier accessibility
- Easier maintenance

## Explicitly Rejected

- Glassmorphism
- Heavy gradients
- Decorative dashboards
- Excessive motion

---

# Why Low-End Laptop Support Matters

## Decision

Optimize for weak hardware first.

## Reasons

Target users include:

- Students
- College labs
- Low-cost laptops
- Older systems

The platform must remain accessible.

---

# Why Educational Clarity Overrides Features

## Decision

Educational understanding is the primary product goal.

## Implications

A feature is rejected if it:

- Confuses beginners
- Adds unnecessary complexity
- Reduces readability
- Hurts performance

Even if technically impressive.

---

# Why Simplicity Is Preferred

## Decision

Prefer simpler architecture whenever possible.

## Reasons

Simple systems are:

- Easier to debug
- Easier to maintain
- Easier for contributors
- Easier for AI agents
- More stable

Complexity is a liability.

---

# Final Principle

Every architectural decision must support:

- Education
- Performance
- Simplicity
- Stability

If not:
Reject the change.