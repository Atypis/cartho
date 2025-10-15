# EU AI Act Evaluator - Design Direction

**Document Type:** Design System Foundation
**Version:** 1.0
**Date:** 2025-10-15
**Status:** Proposal for Discussion

---

## Executive Summary

This document defines the visual and interaction design direction for the EU AI Act Legal Cartography frontend, inspired by Legora's sophisticated legal tech aesthetic. The goal is to shift from a technical/developer tool aesthetic to a professional legal workspace that signals trust, clarity, and authority.

---

## Design Philosophy

### Core Principle
> "Legal work deserves thoughtful, sophisticated interfaces—not dashboards."

The EU AI Act evaluator is a **legal research and compliance tool** used by lawyers, compliance officers, and policy professionals. The interface should feel like a refined legal workspace, not a developer dashboard or gaming interface.

### Target Audience
- **Primary:** Legal practitioners, compliance officers, in-house counsel
- **Secondary:** Policy advisors, regulators, legal academics
- **Tertiary:** Developers implementing AI Act compliance (technical audience)

### Design Values
1. **Clarity over complexity** - Reduce cognitive load through simplicity
2. **Authority through restraint** - Sophisticated typography and generous whitespace
3. **Trust through professionalism** - Clean, established design patterns
4. **Hierarchy through typography** - Size and weight, not color
5. **Focus on content** - The legal text and logic are the stars

---

## Visual Language (Inspired by Legora)

### 1. Typography System

#### Type Scale
```
Hero/Display:    48-64px serif (Playfair Display, Freight Display, or similar)
H1:              32-40px serif
H2:              24-28px serif
H3:              18-20px sans-serif (semi-bold)
Body Large:      16-18px sans-serif
Body:            14-16px sans-serif
Small/Caption:   12-14px sans-serif
Code/Technical:  13-14px monospace (JetBrains Mono, SF Mono)
```

#### Font Families
- **Serif (Headlines):** Playfair Display, Freight Display Pro, or Tiempos
  - Used for: Page titles, section headers, marketing/landing content
  - Character: Elegant, authoritative, timeless
- **Sans-serif (UI/Body):** Inter, -apple-system, or SF Pro
  - Used for: Body text, labels, buttons, node content
  - Character: Clean, readable, professional
- **Monospace (Technical):** JetBrains Mono or SF Mono
  - Used for: Article references, predicate IDs, code-like content
  - Character: Precise, technical, trustworthy

#### Typography Rules
- Large headlines with generous line-height (1.2-1.3)
- Body text with comfortable reading line-height (1.6)
- Ample letter-spacing for uppercase labels (+0.05em)
- No gradient text effects
- Black or near-black (#0a0a0a) on white/cream backgrounds

---

### 2. Color Palette

#### Primary Colors
```
Background:   #FFFFFF (white) or #FAFAF9 (stone-50, warm white)
Text Primary: #0A0A0A (near black)
Text Secondary: #525252 (neutral-600)
Text Tertiary:  #A3A3A3 (neutral-400)
```

#### Accent Colors (Minimal Use)
```
Success:      #16A34A (green-600) - for completed/compliant states
Error:        #DC2626 (red-600) - for non-compliant/error states
Warning:      #EA580C (orange-600) - for warnings/cautions
Neutral:      #3F3F46 (zinc-700) - for default actions

Accent (Link): #2563EB (blue-600) - for links and interactive elements
```

#### Structural Colors
```
Border Light:  #E5E5E5 (neutral-200)
Border Default: #D4D4D4 (neutral-300)
Border Strong:  #A3A3A3 (neutral-400)

Surface Raised: #FFFFFF with shadow
Surface Sunken: #F5F5F5 (neutral-100)
Surface Hover:  #FAFAFA (neutral-50)
```

#### Color Usage Rules
- **No gradients** (except subtle single-color fades for masks)
- **No glows or neon effects**
- **No animated color transitions**
- Color used **sparingly** for status/state, not decoration
- Default to grayscale; use color for semantic meaning only

---

### 3. Layout & Spacing

#### Spacing Scale (Tailwind-based)
```
1:   4px   - tight element spacing
2:   8px   - icon-to-text gaps
3:   12px  - small component padding
4:   16px  - default padding
6:   24px  - section spacing
8:   32px  - large component margins
12:  48px  - section dividers
16:  64px  - major layout spacing
24:  96px  - dramatic whitespace (landing pages)
```

#### Layout Principles
- **Generous whitespace** - Don't pack the interface
- **Breathing room around nodes** - Minimum 400px horizontal spacing between tree nodes
- **Comfortable margins** - 24-32px padding in major containers
- **Single-column or simple two-column** layouts (avoid complex grids)
- **Vertical rhythm** - Consistent spacing between related elements

---

### 4. Components & UI Elements

#### Buttons
```css
/* Primary Action */
bg-black text-white
px-6 py-3 rounded-lg
font-medium text-sm
hover:bg-neutral-800
transition-colors duration-200

/* Secondary Action */
bg-white text-black
border border-neutral-300
px-6 py-3 rounded-lg
font-medium text-sm
hover:bg-neutral-50
transition-colors duration-200

/* Tertiary/Ghost */
text-neutral-700
hover:text-black hover:bg-neutral-50
px-4 py-2 rounded-lg
transition-colors duration-200
```

#### Cards/Panels
```css
/* Standard Card */
bg-white
border border-neutral-200
rounded-lg
shadow-sm
hover:shadow-md
transition-shadow duration-200
p-6

/* No glass morphism */
/* No backdrop blur */
/* No animated gradients */
```

#### Node Design (Requirement Tree)
```css
/* Decision/Primitive Node */
bg-white
border border-neutral-200
rounded-lg
px-6 py-4
shadow-sm
min-w-[280px] max-w-[400px]

/* Status Indicator (Inside Node) */
Pending:    Gray circle ○ (#A3A3A3)
Evaluating: Simple spinner (no glow)
Pass:       Green checkmark ✓ (#16A34A) in circle
Fail:       Red X ✗ (#DC2626) in circle

/* No glows, no pulses, no animated backgrounds */
```

#### Edges/Connections
```css
/* Tree/Graph Connectors */
stroke: #D4D4D4 (neutral-300)
strokeWidth: 1.5px
type: 'smoothstep' or 'straight'
/* No animations on edges */
```

---

### 5. Visual Effects & Motion

#### Shadows (Subtle, Not Dramatic)
```css
/* Elevation Levels */
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07)
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.08)

/* No colored shadows (e.g., shadow-blue-500/20) */
```

#### Transitions (Fast & Purposeful)
```css
/* Standard transition */
transition-all duration-200 ease-out

/* Interaction states only */
hover:shadow-md
hover:bg-neutral-50
hover:border-neutral-400

/* No ambient animations */
/* No pulse effects except for active loading state */
```

#### Animations (Minimal)
- **Allowed:** Loading spinners, smooth page transitions, hover states
- **Prohibited:** Ambient pulses, gradient animations, parallax effects, auto-playing animations

---

### 6. Background & Canvas

#### Main Canvas
```css
/* Preferred */
bg-white or bg-stone-50

/* Not This */
bg-slate-900 (dark theme)
bg-gradient-to-br with multiple colors
Animated gradient overlays
Grid patterns overlays
```

#### React Flow Background
```css
/* Simple dot pattern */
<Background
  gap={32}
  size={1}
  color="#E5E5E5"
/>

/* No grid overlays */
/* No animated elements */
```

---

## Current State vs. Desired State

### Current Implementation (Technical/Dashboard)
| Element | Current Style |
|---------|---------------|
| Background | Dark slate-900 with animated gradients |
| Typography | Sans-serif only, small sizes |
| Node Design | Glass morphism cards, colorful glows |
| Colors | Blue/purple/cyan gradients, neon accents |
| Effects | Pulsing animations, backdrop blur, shadow glows |
| Overall Feel | Developer tool, gaming dashboard, high-tech |

### Desired State (Legora-Inspired Professional)
| Element | Target Style |
|---------|--------------|
| Background | Clean white or warm off-white |
| Typography | Serif headlines + sans body, generous sizing |
| Node Design | Simple white cards with subtle borders |
| Colors | Grayscale default, minimal semantic color |
| Effects | Subtle shadows, no animations except loading |
| Overall Feel | Legal workspace, sophisticated, authoritative |

---

## Component-Specific Guidelines

### 1. Main Layout (page.tsx)

#### Left Sidebar (Input Panel)
```tsx
<div className="w-1/3 bg-white border-r border-neutral-200">
  <div className="p-8 border-b border-neutral-200">
    <h1 className={`${playfair.className} text-3xl text-neutral-900`}>
      EU AI Act Evaluator
    </h1>
    <p className="text-sm text-neutral-600 mt-2">
      Evaluate compliance with prescriptive norms
    </p>
  </div>
  {/* Content sections with generous padding (p-8) */}
</div>
```

#### Right Panel (Visualization)
```tsx
<div className="flex-1 bg-stone-50">
  <div className="p-6 bg-white border-b border-neutral-200">
    <h2 className="text-lg font-semibold text-neutral-900">
      Requirement Tree
    </h2>
    <p className="text-sm text-neutral-600 mt-1">
      Click nodes for detailed evaluation
    </p>
  </div>
  {/* React Flow canvas */}
</div>
```

---

### 2. Requirement Tree (RequirementTree.tsx)

#### Canvas Background
```tsx
<div className="relative w-full h-full bg-stone-50">
  {/* Remove: animated gradients, grid overlays, dark theme */}

  <ReactFlow
    nodes={nodes}
    edges={edges}
    nodeTypes={nodeTypes}
    fitView
    minZoom={0.3}
    maxZoom={1.2}
  >
    <Background
      gap={32}
      size={1}
      color="#E5E5E5"
    />
    <Controls className="!bg-white !border-neutral-200 !shadow-md" />
    <MiniMap
      className="!bg-white !border-neutral-200 !shadow-md"
      maskColor="rgba(255, 255, 255, 0.8)"
      nodeColor={(node) => {
        if (node.data.status === 'completed' && node.data.result?.decision) {
          return '#16A34A'; // green
        }
        if (node.data.status === 'completed' && !node.data.result?.decision) {
          return '#DC2626'; // red
        }
        return '#D4D4D4'; // gray
      }}
    />
  </ReactFlow>
</div>
```

#### Layout Spacing
```tsx
const layerSpacing = 200;      // Vertical space between levels
const baseNodeSpacing = 400;   // Horizontal space between siblings (increased from 280)
```

---

### 3. Node Components

#### Decision Node (Simplified)
```tsx
// Remove: Glass morphism, gradients, glows, animations
// Add: Clean white card with simple status indicator

<div className={`
  bg-white
  border border-neutral-200
  rounded-lg
  px-6 py-4
  shadow-sm
  hover:shadow-md
  transition-shadow duration-200
  cursor-pointer
  min-w-[280px] max-w-[400px]
`}>
  <div className="flex items-start gap-3">
    {/* Simple status icon */}
    <div className="flex-shrink-0 mt-0.5">
      {status === 'completed' && result?.decision && (
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 text-xs font-bold">✓</span>
        </div>
      )}
      {status === 'completed' && !result?.decision && (
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-xs font-bold">✗</span>
        </div>
      )}
      {status === 'evaluating' && (
        <div className="w-5 h-5">
          {/* Simple spinner, no pulse/glow */}
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-200 border-t-neutral-900" />
        </div>
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
      )}
    </div>

    {/* Node content */}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-neutral-900 leading-snug">
        {label}
      </div>

      {/* Confidence badge (minimal) */}
      {status === 'completed' && result && (
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-600">
          <span className="w-1 h-1 rounded-full bg-neutral-400" />
          {(result.confidence * 100).toFixed(0)}% confidence
        </div>
      )}
    </div>
  </div>
</div>
```

#### Edge Style
```tsx
edges.push({
  id: `${node.id}-${childId}`,
  source: node.id,
  target: childId,
  type: 'smoothstep',
  style: {
    stroke: '#D4D4D4',
    strokeWidth: 1.5
  },
  // No animation, no glow
});
```

---

### 4. Detailed Panel (Expanded Node)

When a node is clicked and expanded, show a clean panel:

```tsx
<div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 z-50 w-96 bg-white border border-neutral-200 rounded-lg shadow-lg p-6">
  {/* Close button */}
  <button
    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"
    onClick={handleClose}
  >
    <svg>...</svg>
  </button>

  {/* Content sections with clear hierarchy */}
  <div className="space-y-4">
    {/* Question */}
    {question && (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          Question
        </div>
        <div className="text-sm text-neutral-900 leading-relaxed">
          {question.prompt}
        </div>
      </div>
    )}

    {/* Legal Context */}
    {context?.items && (
      <div className="border-t border-neutral-200 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          Legal Context
        </div>
        <div className="space-y-3">
          {context.items.map((item, idx) => (
            <div key={idx} className="pl-3 border-l-2 border-neutral-200">
              <div className="text-xs font-medium text-neutral-700">{item.label}</div>
              <div className="text-sm text-neutral-600 mt-1 leading-relaxed">{item.text}</div>
              {/* Source citation */}
              {item.sources?.[0] && (
                <div className="text-xs font-mono text-neutral-500 mt-1">
                  Art. {item.sources[0].article}
                  {item.sources[0].paragraph && `(${item.sources[0].paragraph})`}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Evaluation Result */}
    {status === 'completed' && result && (
      <div className="border-t border-neutral-200 pt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          Evaluation Result
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${result.decision ? 'text-green-600' : 'text-red-600'}`}>
              {result.decision ? 'YES ✓' : 'NO ✗'}
            </span>
            <span className="text-xs text-neutral-500">
              ({(result.confidence * 100).toFixed(0)}% confidence)
            </span>
          </div>
          <div className="text-sm text-neutral-700 bg-neutral-50 rounded p-3 leading-relaxed">
            {result.reasoning}
          </div>
        </div>
      </div>
    )}
  </div>
</div>
```

---

## Design Tokens (Reference)

### Tailwind Config Extensions
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Freight Display Pro', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // Keep standard Tailwind neutrals
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'soft': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 15px rgba(0, 0, 0, 0.08)',
      },
    },
  },
}
```

---

## Implementation Strategy

### Phase 1: Foundation (Quick Wins)
1. Switch background from dark to light (`bg-white` / `bg-stone-50`)
2. Add serif font for headlines
3. Remove all glass morphism effects (backdrop-blur, gradient overlays)
4. Simplify node styling (white cards with borders)
5. Replace colored glows with simple shadows

### Phase 2: Refinement
1. Increase spacing between nodes (280px → 400px)
2. Improve typography scale and line-heights
3. Simplify status indicators (remove animations)
4. Clean up edge styling
5. Refine expanded panel design

### Phase 3: Polish
1. Add article citation badges
2. Improve information hierarchy in expanded views
3. Add graceful loading states
4. Implement subtle micro-interactions
5. Ensure accessibility (contrast, focus states)

---

## Open Questions for Discussion

1. **Primary Use Case Priority:**
   - Is the main goal case-based evaluation (current) or obligation discovery?
   - Should we show the legal_consequence (the obligation itself) more prominently?

2. **Shared Primitives Visualization:**
   - How should we surface reused predicates like `qp:is_high_risk`?
   - Show full tree expansion or treat as atomic with hover definition?

3. **Multi-PN Comparison:**
   - Do users need to compare multiple prescriptive norms side-by-side?
   - Should we support "all provider obligations" aggregated views?

4. **Temporal Filtering:**
   - How important is date-based filtering (2025 vs 2026 vs 2027 effective dates)?
   - Should effective dates be visible in node cards?

5. **Legal Traceability:**
   - How prominent should article references be?
   - Inline badges, hover tooltips, or dedicated source panel?

6. **Confidence & Uncertainty:**
   - How to distinguish factual uncertainty vs interpretive open-texture?
   - Visual indicators for interpretation_flags?

7. **Responsive Design:**
   - Desktop-only or tablet/mobile support needed?
   - If mobile, how to adapt tree visualization?

8. **Theme Toggle:**
   - Keep current "technical" dark theme as an option?
   - Or fully commit to the professional light aesthetic?

---

## References

- **Legora Screenshots:** `/stylebook/Screenshot 2025-10-15 at *.png`
- **Current Implementation:** `/eu-ai-act-evaluator/`
- **Design Inspiration:** Legora.com, Linear.app (typography), Notion (clean interfaces)

---

## Approval & Next Steps

**Status:** ⏸️ Awaiting stakeholder review and discussion

**Decision Points:**
- [ ] Approve overall design direction (Legora-inspired professional aesthetic)
- [ ] Answer open questions above
- [ ] Prioritize implementation phases
- [ ] Decide on theme toggle vs. full replacement

**After Approval:**
1. Create detailed component mockups (if needed)
2. Implement Phase 1 (foundation changes)
3. User testing and iteration
4. Implement Phase 2 & 3

---

**Document Owner:** EU AI Act Legal Cartography Project
**Last Updated:** 2025-10-15
**Next Review:** After stakeholder discussion
