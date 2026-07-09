# ARCHITECTURE.md

## Overview

Compiler Execution Visualizer is a fully client-side educational compiler visualization platform built for teaching and understanding compiler internals.

The system accepts C source code and visualizes:
- Lexical Analysis
- Syntax Analysis
- Semantic Analysis
- Intermediate Representation
- Optimization
- Assembly Generation

The architecture prioritizes:
- Low-end device performance
- Deterministic rendering
- Modular compiler phases
- Browser-only execution
- Scalability without backend infrastructure

---

# Core Architecture Principles

## 1. UI Must Never Freeze

Heavy computation MUST run in Web Workers.

The React main thread is only for:
- Rendering
- User interaction
- Lightweight state updates

Never execute parsing or LLVM processing directly in React components.

---

## 2. Compiler Logic Isolated From UI

Compiler systems must return structured JSON only.

UI components must never:
- Parse raw compiler output
- Execute compiler logic
- Call WASM directly

The compiler pipeline and rendering pipeline are separate systems.

---

## 3. One Directional Data Flow

```txt
Monaco Editor
    ↓
Debounced Input
    ↓
Worker Thread
    ↓
Compiler Phase
    ↓
Structured Output
    ↓
Global Store
    ↓
Visualization Components
```

Never create circular UI flow.

---

# High-Level System Architecture

```txt
+--------------------------------------------------+
|                    React App                     |
+--------------------------------------------------+

        ┌──────────────────────────────┐
        │         UI Layer             │
        │                              │
        │ Monaco Editor                │
        │ Visualization Panels         │
        │ Compiler Controls            │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │       State Management       │
        │                              │
        │ Zustand Store               │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │        Worker Layer          │
        │                              │
        │ Lexer Worker                 │
        │ Parser Worker                │
        │ Semantic Worker              │
        │ LLVM Worker                  │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │         WASM Layer           │
        │                              │
        │ Clang                        │
        │ LLVM                         │
        └──────────────────────────────┘
```

---

# Technology Stack

| Concern | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS |
| Editor | Monaco Editor |
| State Management | Zustand |
| Visualization | React Flow / D3 |
| Compiler Runtime | WebAssembly |

---

# Folder Structure

```txt
src/
├── app/
├── pages/
├── layouts/
├── components/
├── features/
│   ├── editor/
│   ├── lexer/
│   ├── parser/
│   ├── semantic/
│   ├── ir/
│   ├── optimizer/
│   └── assembly/
├── workers/
├── wasm/
├── store/
├── hooks/
├── services/
├── utils/
├── constants/
└── types/
```

---

# Folder Responsibilities

| Folder | Responsibility |
|---|---|
| components | Shared reusable UI |
| features | Feature-specific systems |
| workers | Heavy threaded computation |
| wasm | Compiler runtime loading |
| store | Global application state |
| services | Worker communication |
| hooks | Reusable React hooks |
| utils | Pure helper functions |
| types | Shared TypeScript contracts |

---

# State Architecture

## Global Store

The global store contains:
- Source code
- Compiler outputs
- Loading states
- Error states
- UI state

Avoid storing:
- Massive derived trees
- Render-only temporary structures
- Memoizable values

---

## Example Store Shape

```ts
type AppStore = {
  sourceCode: string;

  lexer: LexerState;
  parser: ParserState;
  semantic: SemanticState;
  ir: IRState;
  optimizer: OptimizerState;
  assembly: AssemblyState;

  ui: UIState;
};
```

---

# Worker Architecture

## Worker Responsibilities

| Worker | Responsibility |
|---|---|
| lexer.worker.ts | Token generation |
| parser.worker.ts | AST generation |
| semantic.worker.ts | Semantic analysis |
| llvm.worker.ts | IR + Assembly generation |

---

## Worker Rules

Workers MUST:
- be stateless where possible
- return structured output
- support cancellation
- avoid shared mutable state

Workers MUST NOT:
- access DOM APIs
- render UI
- mutate React state

---

## Worker Communication

All workers use typed message contracts.

Example:

```ts
type WorkerRequest = {
  requestId: string;
  phase: CompilerPhase;
  payload: unknown;
};

type WorkerResponse<T> = {
  requestId: string;
  success: boolean;
  data?: T;
  error?: CompilerError;
};
```

---

# Compiler Pipeline

```txt
Source Code
    ↓
Lexer
    ↓
Token Stream
    ↓
Parser
    ↓
AST
    ↓
Semantic Analyzer
    ↓
Validated AST
    ↓
IR Generator
    ↓
LLVM IR
    ↓
Optimizer
    ↓
Optimized IR
    ↓
Assembly Generator
    ↓
Assembly Output
```

Each phase:
- accepts structured input
- returns structured output
- is independently testable

---

# Compiler Contracts

## Token Structure

```ts
type Token = {
  type: TokenType;
  value: string;
  line: number;
  column: number;
};
```

---

## AST Structure

```ts
type ASTNode = {
  id: string;
  type: string;
  value?: string;
  children?: ASTNode[];
  location?: SourceLocation;
};
```

---

## Semantic Structure

```ts
type SymbolEntry = {
  name: string;
  type: string;
  scope: string;
  declaredAt: SourceLocation;
};
```

---

# Visualization Architecture

Visualization systems consume normalized JSON only.

Visualization components must not understand compiler internals.

---

## AST Visualization

Requirements:
- Expand/collapse nodes
- Lazy rendering
- Virtualization for large trees
- Node highlighting
- Source code synchronization

Never render massive ASTs fully at once.

---

## Token Visualization

Display:
- token type
- token value
- line number
- syntax coloring

---

## IR Visualization

Display:
- LLVM IR
- instruction highlighting
- source-to-IR mapping

---

# Performance Architecture

## Performance Targets

| Metric | Target |
|---|---|
| Initial Load | < 3s |
| Main Thread Blocking | < 16ms |
| AST Render | < 100ms |
| Compilation Time | < 2s |

---

## Required Optimizations

### Mandatory
- Web Workers
- Lazy loading
- Code splitting
- Memoization
- Debounced compilation
- Virtualized rendering

### Recommended Debounce

```txt
300ms
```

---

## Forbidden Performance Mistakes

Never:
- parse on every keystroke instantly
- render giant ASTs directly
- keep huge objects in React state
- reload WASM repeatedly

---

# WASM Architecture

## WASM Loading Strategy

```txt
App Starts
    ↓
Editor Loads
    ↓
User Types Code
    ↓
Compiler Requested
    ↓
WASM Loaded Lazily
```

Do NOT load LLVM during initial app startup.

---

## WASM Rules

WASM modules must:
- load lazily
- be cached
- reuse memory when possible

Avoid repeated initialization.

---

# Error Handling Architecture

## Error Types

| Error Type | Description |
|---|---|
| Syntax Error | Parsing failure |
| Semantic Error | Type/scope issues |
| Worker Error | Worker thread failure |
| WASM Error | Compiler runtime failure |

---

## Error Contract

```ts
type CompilerError = {
  type: string;
  message: string;
  line?: number;
  column?: number;
  phase: CompilerPhase;
};
```

---

## Error Rules

Errors MUST:
- be human-readable
- map to source code
- avoid raw stack traces in UI

Errors MUST NOT:
- crash the app
- freeze rendering
- destroy unrelated compiler states

---

# Dependency Rules

Prefer:
- lightweight libraries
- tree-shakeable packages
- mature stable dependencies

Avoid:
- heavy animation frameworks
- unnecessary abstraction libraries
- bloated UI systems

---

# Security Architecture

User code is untrusted.

The app must:
- sandbox execution
- avoid unrestricted eval
- prevent arbitrary JS execution
- isolate WASM runtime
- avoid filesystem access

---

# Deployment Architecture

## Initial Deployment

| Concern | Solution |
|---|---|
| Hosting | Vercel |
| Assets | CDN |
| WASM Delivery | Static Cached Assets |

---

## Future Scaling

If traffic increases:
- move WASM to edge CDN
- add aggressive caching
- add optional backend only if absolutely necessary

---

# Testing Strategy

| Test Type | Purpose |
|---|---|
| Unit Tests | Compiler phases |
| Integration Tests | Worker communication |
| UI Tests | Visualization correctness |
| Performance Tests | Large AST handling |

---

# Architectural Anti-Patterns

## Never Put Compiler Logic Inside React Components

Bad:
```tsx
<TokenTable tokens={parseLLVMInline()} />
```

---

## Never Call WASM Directly From UI Components

All WASM access goes through workers/services.

---

## Never Render Entire Trees Without Virtualization

Large AST rendering must be incremental.

---

## Never Create Tight Coupling Between Compiler Phases

Lexer must not depend on parser internals.

Parser must not depend on semantic internals.

Each phase is isolated.

---

# Final Architectural Philosophy

The project should feel:
- educational
- responsive
- deterministic
- modular
- lightweight

Not:
- bloated
- enterprise-heavy
- visually chaotic
- backend-dependent

The architecture exists to preserve clarity while scaling complexity safely.