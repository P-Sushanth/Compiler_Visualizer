# Compiler Execution Visualizer

An interactive, browser-based educational platform that visualizes the internal stages of a compiler in real time. It is designed to help students, teachers, and systems enthusiasts build a strong intuition for compiler design.

---

## 🌟 Key Features

The visualizer supports compiling standard subset **C code** through the following stages:

1. **Lexical Analysis (Tokenization)**: Converts raw character streams into token sequences (e.g. keywords, identifiers, operations), highlighting source positions and token details.
2. **Syntax Analysis (Parsing & AST)**: Generates a hierarchical Abstract Syntax Tree (AST) displayed as a collapsible, interactive node graph with layout calculations.
3. **Semantic Analysis**: Checks declarations, tracks scope hierarchies (including parent links), checks symbol table variables, and flags errors (e.g. redeclaring variables, referencing undeclared names).
4. **Intermediate Representation (IR)**: Generates static single assignment / three-address intermediate code representations (like `LOAD`, `STORE`, `JUMPIFNOT`, `JUMP`) and splits it into Control Flow Graph (CFG) basic blocks.
5. **Optimization**: Emits optimization passes (such as Constant Folding, Constant Propagation, and Dead Code Elimination) showing before/after diffs.
6. **Assembly Generation**: Translates optimized IR to pseudo-assembly instructions mapped directly to registers and memory.

---

## ⚙️ Architecture Principles

- **Zero-Backend Execution**: The compiler pipeline runs entirely client-side using WebAssembly and lightweight JavaScript parsers, making hosting extremely low-cost and secure.
- **Multithreaded Performance**: All CPU-intensive analysis (Lexing, Parsing, Semantics, IR generation, and Graph layout calculations) runs inside **Web Workers**, ensuring the Monaco editor and UI rendering never freeze or lag.
- **Zustand State Store**: Features a clean state-store separation separating compiler outputs from the active UI panel state.
- **Responsive Layout**: Powered by `react-resizable-panels` allowing customizable panel sizes.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- **Tooling**: [Vite](https://vite.dev)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Visualizations**: [React Flow (XYFlow)](https://reactflow.dev/) & [Dagre](https://github.com/dagrejs/dagre) for graph layouts
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd compiler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

The project has a comprehensive testing suite verifying compiler pipeline stages, worker communication protocols, UI navigation, and performance boundaries.

- **Test Runner**: [Vitest](https://vitest.dev)
- **Environment**: `jsdom` + mock worker threads (`src/test/setup.ts`)

Run the test suite:
```bash
npm run test:run
```

Start the test runner in watch mode:
```bash
npm run test
```
