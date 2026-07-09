# PROMPTING_RULES.md

# Purpose

This document defines how AI coding agents must behave while working on this project.

The objective is to:

- Prevent feature creep
- Prevent architectural drift
- Maintain performance
- Preserve educational focus
- Avoid unnecessary rewrites
- Reduce debugging time
- Preserve maintainability

Agents must follow these rules strictly.

---

# Core Philosophy

The project is:

- A compiler education platform
- Browser-first
- Client-side
- Lightweight
- Educationally focused

The project is NOT:

- A cloud IDE
- A VSCode replacement
- A social coding platform
- An AI coding assistant
- An enterprise architecture showcase

---

# Critical Agent Rules

## NEVER Rewrite Unrelated Files

If fixing:

- AST rendering

Do NOT rewrite:

- editor logic
- state management
- layout system
- styling architecture

Only touch files directly related to the task.

Large unrelated rewrites are forbidden.

---

## NEVER Add Dependencies Unnecessarily

Before adding a package:

Ask:

1. Can this be implemented simply without dependency?
2. Does this increase bundle size?
3. Is the dependency mature and stable?
4. Is this solving a real problem?

Avoid dependency bloat.

---

## Prefer Composition Over Inheritance

Prefer:

- Small reusable components
- Utility functions
- Composition patterns

Avoid:

- Deep inheritance
- Giant base classes
- Abstract framework-style hierarchies

---

## NEVER Optimize Prematurely

Do not introduce:

- Complex caching
- Advanced memoization
- Custom render schedulers
- Performance abstractions

Unless measurable bottlenecks exist.

First:
- Build correctly
- Measure
- Then optimize

---

## Preserve Existing Comments

Do NOT:

- Delete useful comments
- Rewrite comments unnecessarily
- Replace detailed comments with shorter vague comments

Comments preserve architectural reasoning.

---

## Ask Before Major Refactors

Major refactors include:

- Folder restructuring
- State management replacement
- Visualization library replacement
- Compiler pipeline redesign
- Rendering architecture changes

Agents must NOT perform these automatically.

---

# File Modification Rules

## Allowed

- Focused bug fixes
- Small feature additions
- Localized refactors
- Readability improvements

## Forbidden

- Rewriting entire modules unnecessarily
- Converting architecture styles casually
- Massive formatting-only rewrites
- Renaming everything for aesthetics

---

# Architecture Preservation Rules

Agents must respect existing architecture.

Do NOT:

- Replace Zustand casually
- Replace Web Workers
- Introduce backend assumptions
- Replace React Flow/D3 without approval

Read TECH_DECISIONS.md first.

---

# State Management Rules

Prefer:

- Local component state
- Small Zustand stores
- Explicit state transitions

Avoid:

- Global state explosion
- Nested reducers everywhere
- Event bus architectures

---

# Component Rules

Components must:

- Have single responsibility
- Remain readable
- Be independently testable
- Avoid excessive prop drilling

Avoid giant "do everything" components.

---

# UI Rules

UI changes must prioritize:

1. Readability
2. Educational clarity
3. Performance
4. Responsiveness

Not aesthetics.

---

# Animation Rules

Allowed:

- Small transitions
- Lightweight highlights
- Educational emphasis animations

Forbidden:

- Heavy motion systems
- Constant animations
- GPU-heavy effects
- Decorative animations

---

# Educational Priority Rules

Every feature must improve:

- Understanding
- Visualization
- Error comprehension
- Compiler intuition

If not:
Do not implement it.

---

# Performance Rules

Assume users have:

- Weak laptops
- Integrated graphics
- Limited RAM
- Browser constraints

Agents must optimize for accessibility and stability.

---

# Refactoring Rules

Before refactoring ask:

1. Is current code causing real problems?
2. Is complexity actually reduced?
3. Is readability improved?
4. Is performance measurably improved?

If not:
Avoid refactor.

---

# Error Handling Rules

Never fail silently.

Errors must:

- Be understandable
- Preserve app stability
- Avoid cascading failures

Follow ERROR_HANDLING.md.

---

# Code Style Rules

Prefer:

- Explicit logic
- Predictable behavior
- Readable functions
- Small modules

Avoid:

- Clever code
- Over-abstraction
- Meta-programming
- Hidden behavior

---

# Documentation Rules

When adding major logic:

Document:

- Purpose
- Inputs
- Outputs
- Failure cases
- Performance considerations

---

# Final Principle

A stable, understandable, focused codebase is more valuable than an over-engineered "perfect" architecture.

Keep the system simple.
Keep it educational.
Keep it maintainable.