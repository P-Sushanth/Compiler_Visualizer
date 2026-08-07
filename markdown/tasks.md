# Project Goal

Build a browser-based compiler execution visualizer that teaches how compilation works internally.

The application must:
* Run fully in-browser
* Use Web Workers
* Support weak hardware
* Visualize compiler stages clearly
* Remain educational and performant

---

# Phase 0 — Project Setup

### Repository Setup
- [x] Initialize Git repository
- [x] Setup README.md
- [x] Setup LICENSE
- [x] Setup .gitignore
- [x] Setup folder structure
- [x] Setup environment config

### Vite + React + TypeScript
- [x] Initialize Vite
- [x] Configure React + TypeScript
- [x] Configure path aliases
- [x] Setup ESLint
- [x] Setup Prettier
- [x] Setup TypeScript strict mode
- [x] Configure build output

### Core Dependencies
- [x] Install Zustand
- [x] Install Monaco Editor
- [x] Install React Flow or graph visualization library
- [x] Setup worker tooling
- [x] Configure code splitting

---

# Phase 1 — Core Architecture

### Application Structure
- [x] Create app shell
- [x] Create IDE-style layout
- [x] Create panel system
- [x] Create responsive layout rules
- [x] Create route structure if needed

### State Management
- [x] Setup Zustand stores
- [x] Separate editor state from visualization state
- [x] Create compiler pipeline state
- [x] Create UI state store
- [x] Add selectors to minimize rerenders

### Web Worker Architecture
- [x] Create lexer worker
- [x] Create parser worker
- [x] Create semantic analysis worker
- [x] Create IR worker
- [x] Create layout worker
- [x] Setup worker communication protocol
- [x] Add worker cancellation support
- [x] Add stale request handling

---

# Phase 2 — Monaco Editor Integration

### Editor Setup
- [x] Integrate Monaco Editor
- [x] Configure editor theme
- [x] Configure syntax highlighting
- [x] Disable minimap by default
- [x] Configure keyboard shortcuts
- [x] Add editor resizing

### Editor Features
- [x] Add compile debounce
- [x] Add error decorations
- [x] Add line highlighting
- [x] Add code examples
- [x] Add language selector

---

# Phase 3 — Compiler Pipeline Foundation

### Pipeline Interfaces
- [x] Define token schema
- [x] Define AST schema
- [x] Define semantic diagnostics schema
- [x] Define IR schema
- [x] Define pipeline event types

### Pipeline Execution
- [x] Create pipeline orchestrator
- [x] Connect worker stages
- [x] Add pipeline timing metrics
- [x] Add stage status tracking
- [x] Add execution cancellation

---

# Phase 4 — Lexer Visualization

### Lexer Engine
- [x] Implement tokenizer
- [x] Generate token metadata
- [x] Add token position tracking
- [x] Add lexer error handling

### Token Visualization
- [x] Build token table
- [x] Add token coloring
- [x] Add virtualization
- [x] Add token hover details
- [x] Add synchronized code highlighting

---

# Phase 5 — Parser + AST Visualization

### Parser
- [x] Implement parser
- [x] Generate AST
- [x] Validate AST schema
- [x] Add parser diagnostics

### AST Visualization
- [x] Build collapsible AST tree
- [x] Add node virtualization
- [x] Add zoom and pan
- [x] Add node highlighting
- [x] Add source-code synchronization
- [x] Add node inspection panel

### AST Performance
- [x] Add lazy node expansion
- [x] Add node render limits
- [x] Add graph simplification
- [x] Add worker-based layout calculation

---

# Phase 6 — Semantic Analysis

### Semantic Engine
- [x] Implement symbol table generation
- [x] Implement scope tracking
- [x] Implement type checking
- [x] Implement semantic diagnostics

### Semantic Visualization
- [x] Build symbol table viewer
- [x] Build scope hierarchy viewer
- [x] Highlight semantic errors
- [x] Add symbol references
- [x] Add variable lifetime visualization

---

# Phase 7 — Intermediate Representation (IR)

### IR Generation
- [x] Generate intermediate representation
- [x] Add control flow information
- [x] Add instruction metadata

### IR Visualization
- [x] Build IR viewer
- [x] Build CFG visualization
- [x] Add basic block visualization
- [x] Add edge rendering
- [x] Add instruction highlighting

---

# Phase 8 — Optimization Visualization

### Optimization Passes
- [x] Implement constant folding
- [x] Implement dead code elimination
- [x] Implement simple propagation optimizations

### Optimization UI
- [x] Show before/after diff
- [x] Highlight changed nodes
- [x] Show optimization explanations
- [x] Add optimization timeline

---

# Phase 9 — Assembly / Machine Code

### Backend Generation
- [x] Generate pseudo assembly
- [x] Add instruction metadata
- [x] Add register allocation basics

### Visualization
- [x] Build assembly viewer
- [x] Add instruction mapping
- [x] Link AST nodes to assembly output
- [x] Add step-by-step mapping

---

# Phase 10 — UI Polish

### UX Improvements
- [x] Improve layout consistency
- [x] Improve panel resizing
- [x] Improve empty states
- [x] Improve loading states
- [x] Improve error states

### Accessibility
- [x] Add keyboard navigation
- [x] Add focus states
- [x] Improve reduced-motion support
- [x] Improve screen-reader support

---

# Phase 11 — Performance Optimization

### Rendering Optimization
- [x] Add memoization
- [x] Eliminate unnecessary rerenders
- [x] Add virtualization everywhere needed
- [x] Optimize graph rendering

### Worker Optimization
- [x] Reduce worker payload sizes
- [x] Optimize serialization
- [x] Add task cancellation
- [x] Add batching

### Bundle Optimization
- [ ] Analyze bundle size
- [ ] Add lazy loading
- [ ] Split visualization chunks
- [ ] Remove unnecessary dependencies

---

# Phase 12 — Error Handling

### Compiler Errors
- [ ] Add structured lexer errors
- [ ] Add structured parser errors
- [ ] Add structured semantic errors

### Runtime Stability
- [ ] Add worker crash recovery
- [ ] Add visualization fallback modes
- [ ] Add safe rendering guards
- [ ] Add panic recovery states

---

# Phase 13 — Educational Features

### Teaching Features
- [ ] Add compiler stage explanations
- [ ] Add inline educational tooltips
- [ ] Add beginner mode
- [ ] Add advanced mode

### Comparison Features
- [ ] Compare source vs AST
- [ ] Compare AST vs IR
- [ ] Compare IR vs assembly
- [ ] Add transformation diff viewer

---

# Phase 14 — Testing

### Unit Testing
- [ ] Test tokenizer
- [ ] Test parser
- [ ] Test semantic analyzer
- [ ] Test IR generation

### UI Testing
- [ ] Test panel behavior
- [ ] Test visualization rendering
- [ ] Test worker communication
- [ ] Test large file handling

### Performance Testing
- [ ] Test weak hardware scenarios
- [ ] Test huge ASTs
- [ ] Test memory usage
- [ ] Test render performance

---

# Phase 15 — MVP Release

### Release Preparation
- [ ] Final cleanup
- [ ] Remove dead code
- [ ] Improve documentation
- [ ] Add screenshots
- [ ] Add usage examples

### Deployment
- [ ] Setup Vercel deployment
- [ ] Configure caching
- [ ] Configure asset compression
- [ ] Configure production builds

---

# Post-MVP Tasks

### Potential Future Features
- [ ] Multi-language support
- [ ] LLVM IR support
- [ ] WebAssembly backend
- [ ] Step-by-step execution mode
- [ ] SSA visualization
- [ ] Data-flow analysis
- [ ] Liveness analysis
- [ ] Register allocation visualization
- [ ] CFG optimization playground
- [ ] Plugin system

---

# Never Do
- [ ] Never block the main thread
- [ ] Never render massive ASTs eagerly
- [ ] Never recompute layouts per keystroke
- [ ] Never add unnecessary dependencies
- [ ] Never prioritize flashy visuals over performance
- [ ] Never merge unrelated refactors into feature tasks