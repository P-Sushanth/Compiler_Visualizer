Philosophy

This product is an educational engineering tool, not a marketing website.

UI priorities:

Clarity
Readability
Performance
Information hierarchy
Low cognitive load

The interface must feel:

technical
minimal
stable
predictable

Avoid trendy startup aesthetics.

Design Principles
DO
Prefer flat UI
Use consistent spacing
Keep layouts clean and dense
Prioritize content over decoration
Make compiler stages visually understandable
Optimize for long sessions
Optimize for weak laptops
DO NOT
No gradients
No glassmorphism
No neumorphism
No parallax
No floating animations
No autoplay motion
No excessive shadows
No oversized rounded corners
No distracting transitions
No animated backgrounds

This is an engineering tool, not a landing page.

Color System
Core Palette
Backgrounds
Primary Background: #0F1115
Secondary Background: #161A22
Tertiary Background: #1D2330
Borders
Primary Border: #2A3140
Secondary Border: #394355
Text
Primary Text: #E6EDF3
Secondary Text: #A9B4C0
Muted Text: #6E7681
Semantic Colors
Success
#238636
Warning
#D29922
Error
#DA3633
Info
#1F6FEB
Typography
Font Stack

Primary:

Inter, system-ui, sans-serif

Monospace:

JetBrains Mono, Consolas, monospace
Typography Scale
Headings
H1
32px
font-weight: 700
H2
24px
font-weight: 600
H3
20px
font-weight: 600
H4
16px
font-weight: 600
Body Text
Primary Body
14px
line-height: 1.6
Secondary Body
13px
line-height: 1.5
Small Text
12px
Code Text
13px
monospace only
line-height: 1.5

Never use decorative fonts.

Spacing System

Use ONLY this spacing scale.

Token	Value
xs	4px
sm	8px
md	12px
lg	16px
xl	24px
2xl	32px
3xl	48px

Rules:

Prefer multiples of 8
No arbitrary spacing values
Use consistent padding across panels
Layout Rules
Application Layout

Use a multi-panel IDE-style layout.

Recommended structure:

-------------------------------------------------
 Top Bar
-------------------------------------------------
 Sidebar | Editor | Visualization / Inspector
-------------------------------------------------
 Bottom Panel (optional)
-------------------------------------------------
Panel Rules

Panels must:

have clear separation
use subtle borders
avoid deep nesting
maintain consistent padding
Panel Style
background: #161A22;
border: 1px solid #2A3140;
border-radius: 8px;
Component Rules
Buttons
Rules
Flat appearance
Small radius
No giant padding
No glowing effects
Standard Button
height: 36px;
padding: 0 14px;
border-radius: 6px;
Inputs
Dark background
Thin border
Clear focus state
No animated borders

Focus state:

border-color: #1F6FEB;
Cards

Use sparingly.

Cards should:

group related data
not replace layout structure

Avoid dashboard-card spam.

Modals
Only for critical interactions
Prefer inline panels instead
No fullscreen modal abuse
Tooltips
Short
Technical
Instant appearance
No fade animations longer than 100ms
Monaco Editor Rules
Monaco theme must match app palette
Minimap OFF by default
Font size: 13px or 14px
Line height: 1.6
Avoid unnecessary plugins
Visualization Rules
AST Visualization

Must remain readable at all times.

Requirements
Collapsible nodes
Virtualized rendering
Zoom limits
Pan limits
Node count safeguards
DO NOT
Render 10,000 SVG elements blindly
Animate entire trees
Auto-expand huge ASTs
Token Visualization
Use compact rows
Monospace alignment
Horizontal scrolling allowed
Syntax-color categories consistently
Animation Rules

Animations must be subtle and functional.

Allowed
hover transitions
panel collapse
opacity fade
small transforms
Forbidden
bouncing
elastic motion
large transforms
continuous animations
scroll hijacking
animated gradients
Timing
Type	Duration
Hover	100ms
Expand/Collapse	150ms
Fade	120ms

Never exceed 200ms for standard UI interactions.

Responsiveness Rules
Desktop First

Primary target:

laptops
desktops

Minimum supported width:

1280px
Tablet

Panels may stack vertically.

Mobile

Mobile support is secondary.

Requirements:

editor usable
visualizations scrollable
no broken layouts

Do NOT spend excessive engineering effort optimizing for phones initially.

Accessibility Rules

Minimum requirements:

keyboard navigation
visible focus states
semantic HTML
contrast ratio compliance
reduced-motion support
Empty States

Empty states must be useful.

Example:

Run the compiler to view the AST.

Avoid:

Nothing here yet :)
Loading States

Use:

skeletons
subtle spinners
progress indicators

Do NOT:

freeze UI
block editor interaction
Error States

Errors must be:

readable
structured
actionable

Bad:

Unhandled Exception

Good:

Parser failed at line 14:
Unexpected token: '}'
Scrollbar Rules

Use thin scrollbars.

Avoid:

oversized custom scrollbars
animated scrollbars
Z-Index Rules

Keep layering simple.

Suggested scale:

Layer	Z-Index
Base	1
Dropdown	10
Sticky Header	20
Modal	100
Toast	200

Avoid z-index chaos.

Performance-Aware UI Rules

UI decisions must respect weak hardware.

Requirements:

avoid expensive shadows
avoid blur filters
avoid giant DOM trees
avoid unnecessary re-renders
prefer CSS transforms over layout thrashing
virtualize large lists
Educational UX Rules

Every visualization must answer:

What is happening?
Why is it happening?
What changed from previous stage?

The UI exists to teach compiler internals clearly.

Decoration is secondary.