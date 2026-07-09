# AGENT.md

## Project Name
Compiler Execution Visualizer

## Vision
Build a browser-based educational compiler visualization platform that allows users to write C code and visually understand every major compiler phase in real time.

The platform is not just a compiler.

It is a teaching tool for:
- Students learning Compiler Design
- Teachers demonstrating compiler internals
- Self learners exploring low-level programming
- Interview preparation
- Systems programming enthusiasts

The core differentiator:
> Show how compilation actually happens internally.

---

# Core Product Goals

## Primary Goals
- Visualize compiler pipeline stages
- Make compiler design intuitive
- Run fully in-browser
- Work on low-end laptops
- Zero signup/login
- No backend dependency initially
- Fast and interactive

## Non Goals (MVP)
- User authentication
- Cloud saves
- Payments
- Multi-language support
- Collaboration
- Remote execution
- Heavy server infrastructure

---

# Tech Stack

## Frontend
- React
- TypeScript
- Vite

## Editor
- Monaco Editor

## Styling
- TailwindCSS

## State Management
- Zustand

## Parsing Visualization
- D3.js or React Flow

## Compiler Toolchain
- WebAssembly (WASM)

### WASM Components
- Clang
- LLVM
- Tree-sitter (optional lightweight parsing)
- Custom tokenizer/parsing layers

---

# Architecture Principles

## 1. Everything Runs Client Side
No server-side compilation.

Reason:
- Eliminates infrastructure costs
- Reduces latency
- Improves privacy
- Scales infinitely via CDN

---

## 2. Weak Laptop First Design
Target:
- 8GB RAM laptops
- Dual core CPUs
- Budget Android phones

Optimization priorities:
- Avoid unnecessary rerenders
- Lazy load heavy modules
- Web Workers for compiler tasks
- Virtualized large trees
- Incremental rendering
- Memoization aggressively

---

## 3. Deterministic Visualization
Every compiler stage should:
- Produce reproducible output
- Be step-by-step understandable
- Highlight transformations clearly

---

## 4. Educational UX Over Raw Power
Do NOT expose LLVM complexity directly.

Instead:
- Simplify outputs
- Color-code stages
- Explain transformations visually
- Collapse noisy nodes

---

# Core Features

# Phase 1 — MVP

## Code Editor
- Monaco editor
- Syntax highlighting
- Line numbers
- Error markers
- Sample programs

---

## Lexical Analysis Visualization

### Show:
- Tokens
- Token types
- Lexemes
- Line numbers

### Visual Examples
```c
int x = 10;