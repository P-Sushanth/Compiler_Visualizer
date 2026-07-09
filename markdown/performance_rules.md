Philosophy

Performance is a core feature.

The application must remain usable on:

low-end laptops
integrated GPUs
weak CPUs
8GB RAM systems

Target:

stable 60 FPS during normal usage
minimum acceptable: 30 FPS under heavy load

The app must never freeze the browser tab.

Core Performance Principles
Mandatory Rules
Never block the main thread
Never parse on the UI thread
Never render massive DOM trees
Never recompute expensive structures unnecessarily
Never re-render entire visualization trees
Never animate thousands of elements
Never assume powerful hardware
Threading Architecture
Main Thread Responsibilities

ONLY:

UI rendering
user interactions
lightweight state updates

The main thread must NOT:

lex code
parse code
generate ASTs
run semantic analysis
generate IR
perform graph layouts
process huge JSON payloads
Web Worker Rules

ALL compiler pipeline stages MUST run in Web Workers.

Required worker separation:

Lexer Worker
Parser Worker
Semantic Analysis Worker
IR Worker
Layout Worker

Heavy operations must never execute in React components.

AST Performance Rules
Render Limits
Hard Limits
Structure	Maximum
AST Nodes Rendered Initially	500
Expanded Nodes Simultaneously	300
Token Rows Visible	1000
Graph Edges Visible	1000

Anything larger MUST use:

virtualization
lazy rendering
progressive expansion
Tree Rendering
Required
collapsible nodes
lazy child mounting
memoized node components
virtualization for large trees
Forbidden
recursive full-tree rendering
auto-expanding all nodes
deep rerender cascades
Layout Rules

AST graph layout calculations:

MUST run in worker threads
MUST be cached
MUST debounce updates

Never recompute graph layouts on every keystroke.

React Performance Rules
Component Rules
Required
React.memo where appropriate
useMemo for expensive derived data
useCallback for stable handlers
selector-based Zustand usage
Forbidden
giant parent state objects
prop drilling through many layers
rerendering editor on visualization updates
rerendering visualization on editor cursor changes
State Management Rules

Global state should contain:

compiler outputs
editor state
UI state

Do NOT store:

giant computed layouts
duplicated AST structures
temporary render-only state
Monaco Editor Performance
Rules
Minimap OFF by default
Semantic highlighting optional
Large file safeguards enabled
Debounced compile triggers
Compile Trigger Rules

Compilation MUST:

debounce input
cancel stale worker tasks
ignore outdated responses

Recommended debounce:

300ms
Memory Management Rules
Required
cleanup unused graph data
terminate unused workers
release stale AST references
avoid duplicated compiler outputs
Forbidden
storing full history snapshots
retaining previous ASTs indefinitely
cloning huge trees unnecessarily
Virtualization Requirements
Mandatory Virtualization

The following MUST use virtualization:

token tables
diagnostics lists
large AST lists
symbol tables
IR instruction lists
Rendering Rules
DOM Limits
Soft Limits
Element Type	Recommended Max
Total DOM Nodes	3000
SVG Nodes	1500
Simultaneous React Components	2000

Beyond this:

degrade gracefully
paginate
virtualize
collapse
SVG Rules

SVG rendering is expensive.

Avoid:

huge shadow filters
thousands of paths
animated edges
complex gradients

Prefer:

canvas rendering for very large graphs
simplified edges
level-of-detail rendering
Animation Performance
Rules

Animations must:

use transform and opacity only
avoid layout thrashing
avoid expensive paints

Forbidden:

animating width/height repeatedly
blur animations
giant box-shadow animations
Parsing Rules
Incremental Work

Prefer:

incremental parsing
staged updates
partial recomputation

Avoid:

recompiling entire pipeline per keystroke
Worker Communication Rules
Serialization

Worker messages MUST:

stay minimal
avoid circular references
avoid giant payload duplication

Prefer:

normalized structures
IDs instead of nested duplication
Cancellation

Every worker task must support:

cancellation
stale request invalidation
latest-request-wins behavior
Graph Performance Rules
Layout Engine Rules

Graph layout:

must be cached
must debounce recalculation
must avoid full recomputation
Zoom/Pan Rules

Zooming and panning:

must remain GPU accelerated
must avoid React rerenders

Use:

transform: translate3d(...)
Data Structure Rules
AST Shape

ASTs must:

remain normalized
use stable IDs
avoid deeply duplicated data

Avoid:

circular structures
nested parent duplication
repeated subtree cloning
Error Recovery Performance

Errors must:

fail gracefully
not crash render loops
not trigger infinite rerenders

Worker crashes must:

isolate failure
preserve editor usability
Performance Monitoring
Required Metrics

Track:

compile duration
render duration
AST node count
worker execution time
memory usage estimates
Large File Safeguards
Hard Safety Limits
Resource	Limit
Source File Size	1 MB
Max AST Nodes	10,000
Max Tokens	50,000
Max Graph Edges	20,000

Beyond limits:

warn user
reduce visualization detail
disable expensive views

Never hard-freeze the UI.

Fallback Strategies

When limits are exceeded:

Allowed Degradation
collapse deep trees
disable animations
simplify graph rendering
switch to text-only mode
paginate outputs

Graceful degradation is mandatory.

React Flow / Visualization Rules

If using React Flow or D3:

Required
memoized nodes
hidden offscreen elements
throttled viewport updates
Forbidden
rerendering entire graph on drag
expensive edge recalculation per frame
storing viewport transforms in React state
Bundle Size Rules
Limits
Asset	Target
Initial JS Bundle	< 500KB gzipped
Lazy Loaded Visualization Chunks	preferred
Worker Bundles	isolated
Dependency Rules

Before adding any dependency:

justify necessity
measure bundle impact
prefer lightweight libraries
avoid abandoned packages

Do NOT add dependencies for trivial utilities.

Final Rule

If a feature harms responsiveness:

simplify it
defer it
remove it

Performance is more important than visual complexity.