# ERROR_HANDLING.md

## Philosophy

Errors must:

- Fail gracefully
- Never crash the UI
- Always provide feedback
- Preserve user input
- Recover automatically when possible
- Be educational when relevant

The system is an educational compiler visualization platform.
Errors should help users understand what went wrong.

---

# General Rules

## DO

- Show actionable error messages
- Highlight source locations
- Keep previous successful state visible
- Log internal failures
- Use safe fallbacks
- Recover without page refresh
- Prevent infinite render loops
- Timeout expensive operations

## DO NOT

- Show raw stack traces to users
- Freeze the interface
- Destroy editor state
- Reload the page automatically
- Leak internal implementation details
- Fail silently

---

# Error Categories

## 1. User Code Errors

These are expected.

Examples:

- Syntax errors
- Missing semicolons
- Invalid tokens
- Type mismatches
- Undefined variables

### Handling

- Show inline diagnostics
- Highlight exact line/column
- Display compiler-style messages
- Continue rendering valid pipeline stages if possible

### Example

```txt
Syntax Error:
Unexpected token ')' at line 12, column 5

2. Compiler Pipeline Errors

These occur during parsing/analysis/transformation.

Examples:

AST generation failed
LLVM generation failed
Tokenizer crashed
Semantic analyzer failed
Handling
Stop only affected stage
Keep other stages functional
Show stage-specific failure UI
Allow retry
Example
Semantic Analysis Failed:
Cannot resolve symbol 'x'
3. WebAssembly Errors

Examples:

WASM load failure
Initialization failure
Memory allocation failure
Worker termination
Handling
Retry initialization once
Show recovery instructions
Fallback to lightweight mode if possible
Example
Compiler Engine Failed to Initialize
Try refreshing the page.
4. Worker Errors

Examples:

Worker timeout
Message corruption
Unexpected termination
Handling
Kill stuck worker
Spawn new worker
Preserve editor content
Restore previous stable state
Timeout Rules
Operation	Timeout
Tokenization	2s
AST Generation	5s
LLVM IR	8s
Full Compile	10s
5. Rendering Errors

Examples:

AST visualization crash
SVG render failure
Graph layout failure
Handling
Show fallback renderer
Disable animation
Render simplified view
Never block editor
6. Network Errors

Even mostly-offline systems have network dependencies.

Examples:

CDN unavailable
Asset load failure
Analytics unavailable
Handling
Retry silently
Use cached assets
Disable non-critical systems
Never block compiler features
Error Boundaries

All major UI regions must have isolated error boundaries.

Required Boundaries
Editor
Token Viewer
AST Viewer
Semantic Analysis Panel
IR Viewer
CFG Viewer
Assembly Viewer
Timeline Visualizer

A crash in one component must not affect others.

Safe Fallback Strategy
Preferred Order
Retry operation
Use cached result
Use simplified renderer
Disable heavy visualization
Show static error state

Never blank the screen.

Logging
Development

Log:

Full stack traces
Performance timings
Worker lifecycle events
WASM initialization state
Production

Log:

Error type
Stage name
Failure frequency
Performance metrics

Never log:

User code permanently
Personal data
Browser-sensitive data
UI Error Design
Rules
Errors must be readable
Use monospace font
Keep messages concise
Avoid large modal popups
Avoid blocking overlays
Severity Levels
Severity	Meaning
Info	Non-blocking issue
Warning	Partial failure
Error	Stage failed
Fatal	System unusable
Compiler-Specific Error Recovery
Parser Recovery

Attempt:

Token skipping
Synchronization points
Partial AST recovery

Goal:

Continue visualization even with invalid code.

Semantic Recovery

Attempt:

Placeholder symbols
Unknown type propagation
Partial symbol table generation

Goal:

Teach users despite incorrect programs.

Performance Protection
Hard Limits
Resource	Limit
Source Code Size	1 MB
AST Nodes	50,000
Render Depth	100
Worker Memory	512 MB

If exceeded:

Stop processing
Explain limitation
Suggest reducing input size
Security Error Handling
Reject Immediately
Infinite recursion attempts
WASM escape attempts
Malicious payload patterns
Worker abuse
Memory exhaustion attacks
Response
Terminate operation
Reset worker
Notify user safely

Never expose security internals.

Accessibility Rules

Errors must:

Support screen readers
Have sufficient contrast
Not rely only on color
Be keyboard navigable
Offline Handling

If offline:

Continue local compilation
Disable remote analytics
Disable update checks
Inform user minimally
Production Stability Rules

The app must never:

Enter infinite render loops
Lock the browser tab
Consume uncontrolled memory
Spawn unlimited workers
Compile on every keystroke without debounce
Debounce Rules
Action	Delay
Typing Compile Trigger	300ms
Visualization Update	200ms
Heavy Graph Layout	500ms
Fatal Error Screen

Only show if:

App initialization fails completely
WASM cannot load after retry
Critical runtime corruption detected

The fatal screen must:

Explain issue clearly
Provide reload option
Preserve editor code if possible
Testing Requirements

Must test:

Invalid syntax
Huge files
Infinite loops
Worker crashes
WASM failures
Mobile browsers
Low RAM systems
Slow CPUs
Browser tab suspension
Final Principle

Educational continuity is more important than technical perfection.

Even when compilation fails,
the system should still teach.