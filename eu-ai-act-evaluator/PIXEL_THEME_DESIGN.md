# 📜 EU AI Act Evaluator - "Medieval Legal Scrolls" Pixel Theme

## 🎨 Design Vision

Transform the modern, minimalistic compliance tool into a **charming pixel-art legal office** where a diligent pixel lawyer helps users navigate the EU AI Act through ancient scrolls and legal tomes.

**Core Aesthetic**: Papyrus scrolls meet pixel art - think "Papers, Please" meets medieval manuscript illuminations, with a warm, approachable legal tech vibe.

---

## 🎭 Character Design: The Pixel Lawyer

### Main Character States

#### 1. **Idle State** (Default - Welcome Screen)
```
Animation: 2-3 frame loop
┌─────────┐
│  📖👤   │  - Pixel lawyer sitting at desk
│  ═══╤═  │  - Open law book in front
│     │   │  - Occasional page turn (every 3-4 seconds)
│    ╱ ╲  │  - Head bob slightly
└─────────┘
Frame 1: Looking at book
Frame 2: Turn page slightly
Frame 3: Return to reading
```

#### 2. **Analyzing State** (During AI Processing)
```
Animation: 4-6 frame loop
┌─────────┐
│ 📖👤💭  │  - Rapidly flipping through pages
│  ═══╤═  │  - Thought bubble appears/disappears
│     │   │  - Papers shuffling around desk
│    ╱ ╲  │  - Occasional quill writing
└─────────┘
Frame 1: Look at document
Frame 2: Flip page quickly
Frame 3: Scratch head with quill
Frame 4: Write notes
Frame 5: Check another book
Frame 6: Nod thoughtfully
```

#### 3. **Evaluating State** (During Requirement Evaluation)
```
Animation: 3-4 frame loop
┌─────────┐
│  📋👤✓  │  - Checking items on checklist
│  ═══╤═  │  - Stamping documents with wax seal
│     │   │  - Stack of scrolls beside desk
│    ╱ ╲  │  - Magnifying glass inspection
└─────────┘
Frame 1: Read requirement
Frame 2: Apply stamp/seal
Frame 3: Move to next item
Frame 4: Check mark appears
```

#### 4. **Success State** (Evaluation Complete)
```
Animation: One-shot 6-8 frames
┌─────────┐
│  ⭐👤🎉  │  - Stand up from desk
│   ╲╤╱   │  - Raise arms in celebration
│    │    │  - Sparkles/stars appear
│   ╱ ╲   │  - Return to sitting (idle)
└─────────┘
Frame 1: Notice completion
Frame 2: Stand up
Frame 3-4: Raise arms
Frame 5: Sparkle effect
Frame 6: Sit back down
Frame 7-8: Transition to idle
```

#### 5. **Error State** (Something Goes Wrong)
```
Animation: 3 frame loop
┌─────────┐
│  ❌👤😰 │  - Scratch head confused
│  ═══╤═  │  - Papers scattered
│     │   │  - Sweat drop appears
│    ╱ ╲  │  - Frantically search through books
└─────────┘
```

### Character Design Specifications
- **Size**: 64x64px to 128x128px (scalable)
- **Color Palette**:
  - Lawyer robe: Dark brown/black (`#2B1810`)
  - Skin tone: Warm beige (`#E8B088`)
  - Books: Brown leather (`#5C3A21`) with golden clasps (`#D4AF37`)
  - Desk: Dark oak (`#4A2511`)
  - Paper: Cream/papyrus (`#F4E5C2`)
- **Position**: Bottom-right corner of main canvas (floating, non-intrusive)
- **Interactive**: Click to toggle animation states or show random legal facts

---

## 🎨 Color Palette: "Aged Papyrus & Wax Seal"

### Primary Colors
```css
--pixel-papyrus-bg: #F4E5C2      /* Aged papyrus background */
--pixel-papyrus-dark: #E8D4A8    /* Darker papyrus (cards) */
--pixel-ink-black: #1A1210       /* Medieval ink text */
--pixel-ink-brown: #3D2817       /* Brown ink for secondary text */
--pixel-seal-red: #8B1A1A        /* Wax seal red (primary actions) */
--pixel-seal-gold: #D4AF37       /* Gold foil accents */
--pixel-parchment-border: #C4A574 /* Scroll edge/border color */
```

### Status Colors (Legal Stamps)
```css
--pixel-stamp-approved: #2D5016   /* Green wax - "Applies" */
--pixel-stamp-denied: #6B1B1B     /* Dark red - "Not Applicable" */
--pixel-stamp-pending: #4A5D7C    /* Blue wax - "Pending" */
--pixel-stamp-reviewing: #7C5C2D  /* Brown wax - "Evaluating" */
--pixel-stamp-error: #8B3A3A      /* Bright red - "Error" */
```

### Accent Colors
```css
--pixel-quill-tip: #1A1210        /* Quill pen ink */
--pixel-ribbon-blue: #2B4C7E      /* Ribbon bookmarks */
--pixel-ribbon-red: #7E2B2B       /* Important markers */
--pixel-candle-flame: #FFB347     /* Warm candlelight glow */
--pixel-shadow: rgba(26,18,16,0.3) /* Subtle shadow */
```

### Semantic Mapping
| Current Variable | Pixel Theme Equivalent |
|------------------|------------------------|
| `--background` | `--pixel-papyrus-bg` |
| `--foreground` | `--pixel-ink-black` |
| `--primary` | `--pixel-seal-red` |
| `--secondary` | `--pixel-papyrus-dark` |
| `--accent` | `--pixel-seal-gold` |
| `--destructive` | `--pixel-stamp-error` |
| `--border` | `--pixel-parchment-border` |

---

## 🖌️ Typography: Pixel Fonts

### Font Choices

#### Primary Font: **"Press Start 2P"** or **"Silkscreen"**
- Use for: Body text, form inputs
- Size: 12px-14px (maintains readability)
- Google Fonts: Easy to integrate
- Fallback: Monospace

#### Heading Font: **"MedievalSharp"** (Google Fonts)
- Use for: Page titles, section headers
- Adds medieval manuscript flair
- Fallback: Serif

#### Alternative: **"VT323"** (Terminal Style)
- Use for: Code blocks, technical details
- Monospace pixel font
- Great for data/numbers

### Typography Scale
```css
--pixel-font-xs: 10px    /* Labels, captions */
--pixel-font-sm: 12px    /* Body text */
--pixel-font-base: 14px  /* Default */
--pixel-font-lg: 18px    /* Subheadings */
--pixel-font-xl: 24px    /* Page titles */
--pixel-font-2xl: 32px   /* Hero text */

letter-spacing: 0.05em   /* Slightly wider for readability */
line-height: 1.6         /* Generous spacing */
```

---

## 🧱 UI Component Transformations

### 1. **Buttons** - Wax Seal Style

#### Primary Button (Red Wax Seal)
```
Visual:
┌────────────────┐
│  ╔════════╗   │  - Thick 2-4px border
│  ║  SEAL  ║   │  - Inner border for 3D effect
│  ╚════════╝   │  - Slight pixel offset on press
└────────────────┘

States:
- Default: Red wax with gold border
- Hover: Glow effect (2px lighter border)
- Active: Pressed down (shift 1-2px)
- Disabled: Gray wax, cracked texture
```

#### Secondary Button (Parchment Scroll)
```
Visual:
┌────────────────┐
│  ═══════════  │  - Rolled parchment edges
│  │  ACTION  │  │  - Lighter background
│  ═══════════  │  - Brown ink text
└────────────────┘
```

#### Icon Buttons (Quill Tools)
```
Visual: Small tool icons
- 16x16px pixel icons
- Tooltip appears as hanging scroll tag
```

### 2. **Cards** - Parchment Scrolls

#### Standard Card
```
Visual:
╔═══════════════════════════════╗
║ ┌─────────────────────────┐ ║  - Double border (outer: dark, inner: light)
║ │                         │ ║  - Subtle papyrus texture background
║ │   Card Content Here     │ ║  - Optional: Rolled corners at top
║ │                         │ ║  - Shadow: 2px solid drop shadow
║ └─────────────────────────┘ ║
╚═══════════════════════════════╝

Variants:
- Active: Golden glow border
- Error: Crumpled paper effect (jagged border)
- Success: Green wax seal in corner
```

#### Use Case Cards (Gallery)
```
Visual:
╔═══════════════════════════════╗
║  📜 [Use Case Title]          ║  - Scroll icon at top
║  ─────────────────────────    ║  - Horizontal rule separator
║  Description text here...     ║  - Aged paper background
║                               ║  - Date stamp at bottom
║  [●] [●] [●] Stats            ║  - Wax seal status indicators
║                               ║
║  🕐 Last evaluated: [date]    ║  - Clock icon (pixel)
╚═══════════════════════════════╝
```

### 3. **Sidebar** - Bookshelf

#### Desktop Sidebar (Expanded)
```
Visual:
┌─────────────────┐
│  EU AI Act      │  - Dark brown/oak background
│  📚 Evaluator   │  - Book icon logo
├─────────────────┤
│                 │
│ 📂 Use Cases (5)│  - Folder icon
│                 │  - Badge: wax seal number
│ ➕ New Case     │  - Plus in circle
│                 │
│                 │
├─────────────────┤
│ 👤 User Name    │  - Avatar: pixel portrait
│ ▾               │  - Dropdown arrow
└─────────────────┘

Background: Wood grain texture (pixel art)
Borders: Carved frame effect
```

#### Collapsed Sidebar (Icon Only)
```
Visual:
┌───┐
│ ⚖ │  - Justice scales icon (brand)
├───┤
│   │
│ 📂│  - Folder
│   │
│ ➕│  - Plus
│   │
├───┤
│ 👤│  - User
└───┘

Tooltips: Hanging parchment tags on hover
```

### 4. **Forms** - Manuscript Entry

#### Text Input
```
Visual:
┌─────────────────────────────────┐
│ Label (Quill Icon)              │
├─────────────────────────────────┤
│  |_ Text entry here...          │  - Blinking pixel cursor
└─────────────────────────────────┘
  ──────────────────────────────     - Underline (ink line)

Focus: Animated quill writing at cursor
Error: Red ink splatter border
```

#### Textarea (Long Description)
```
Visual:
╔═══════════════════════════════════╗
║ ┌─────────────────────────────┐ ║  - Looks like open book
║ │ Line 1: Text...             │ ║  - Line numbers on left (optional)
║ │ Line 2: More text...        │ ║  - Scrollbar: ornate scroll handle
║ │ Line 3:                     │ ║
║ └─────────────────────────────┘ ║
╚═══════════════════════════════════╝
```

#### Select Dropdown
```
Visual (Closed):
┌─────────────────────────────┐
│  Selected Option      ▼     │  - Scroll icon dropdown arrow
└─────────────────────────────┘

Visual (Open):
┌─────────────────────────────┐
│  Selected Option      ▲     │
├─────────────────────────────┤
│  Option 1                   │  - Unrolled scroll appearance
│  Option 2           [✓]     │  - Checkmark for selected
│  Option 3                   │
└─────────────────────────────┘
```

### 5. **Progress Bars** - Hourglass / Candle Burn

#### Linear Progress (Candle Melting)
```
Visual:
┌─────────────────────────────┐
│ 🕯                          │  - Candle icon at start
│ ████████░░░░░░░░░░░░░░░░░░ │  - Chunky pixel blocks
│ 35% Complete                │  - Percentage label
└─────────────────────────────┘

Animation: Blocks fill left-to-right with slight flicker
Color: Warm orange/yellow gradient (pixelated)
```

#### Circular Progress (Hourglass)
```
Visual:
     ⏳
   ╱  ╲
  │▓▓▓▓│  - Top chamber (remaining)
  │════│  - Narrow middle (sand falling)
  │░░░░│  - Bottom chamber (completed)
   ╲  ╱
     ▼

Animation: Sand grains fall pixel-by-pixel
```

### 6. **Badges** - Wax Seals & Stamps

#### Status Badges
```
Visual Options:

1. Wax Seal Style:
   ⬢  - Hexagon seal
  ⬡ ⬡  - With embossed symbol inside
   ⬢   - Color: status-dependent

2. Stamp Style:
  ┌───────┐
  │ DONE  │  - Rectangular rubber stamp
  └───────┘  - Slightly rotated (-3° to 3°)

3. Ribbon Style:
  ═══╤═══   - Hanging ribbon bookmark
     │      - Text on ribbon
     ▼      - Color: status-dependent

Status Examples:
- "APPLIES": Green wax seal with checkmark
- "NOT APPLICABLE": Gray stamp "N/A"
- "PENDING": Blue hourglass seal
- "EVALUATING": Brown seal with quill
- "ERROR": Red cracked seal with X
```

### 7. **Navigation** - Page Corners & Bookmarks

#### Breadcrumbs
```
Visual:
📖 Home > 📂 Use Cases > 📋 My Case
   └──────┴────────────┴──────────  - Connected with scroll flourishes

Alternative:
[Home] ➤ [Use Cases] ➤ [My Case]   - Arrow separators
```

#### Pagination
```
Visual:
┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│ ◀ │ │ 1 │ │ 2 │ │ 3 │ │ ▶ │  - Book page style
└───┘ └───┘ └───┘ └───┘ └───┘

Alternative (Scroll):
◀══ Page 2 of 10 ══▶   - Scroll bar with arrows
```

### 8. **Modals/Dialogs** - Floating Scrolls

#### Dialog Window
```
Visual:
        ┌───┐  - Rolled top edge
       ╱     ╲
      ╱       ╲
     ┌─────────┐
     │  TITLE  │  - Header with icon
     ├─────────┤
     │         │
     │ Content │  - Main content area
     │         │
     │         │
     ├─────────┤
     │ [CANCEL]│  - Action buttons
     │ [ACCEPT]│
     └─────────┘
      ╲       ╱
       ╲     ╱
        └───┘  - Rolled bottom edge

Background Overlay: Parchment texture with transparency
Shadow: 4-6px solid shadow
Animation: Unroll from top (slide down + height expand)
```

### 9. **Tables** - Ledger Pages

#### Data Table
```
Visual:
╔════════════╦════════════╦════════════╗
║ Header 1   ║ Header 2   ║ Header 3   ║  - Bold header
╠════════════╬════════════╬════════════╣
║ Data 1.1   ║ Data 1.2   ║ Data 1.3   ║
║ Data 2.1   ║ Data 2.2   ║ Data 2.3   ║  - Alternating row shades
║ Data 3.1   ║ Data 3.2   ║ Data 3.3   ║
╚════════════╩════════════╩════════════╝

Alternative (Simpler):
┌─────────────┬─────────────┬─────────────┐
│ Header 1    │ Header 2    │ Header 3    │
├─────────────┼─────────────┼─────────────┤
│ Row 1       │ ...         │ ...         │
│ Row 2       │ ...         │ ...         │
└─────────────┴─────────────┴─────────────┘
```

### 10. **Icons** - Pixel Art Replacements

Replace Lucide icons with custom 16x16px pixel art:

| Current Icon | Pixel Replacement |
|--------------|-------------------|
| Folder | 📂 Filing cabinet drawer |
| Plus | ➕ Quill in inkwell |
| User | 👤 Pixel portrait bust |
| ChevronDown | ▼ Scroll down arrow |
| ChevronUp | ▲ Scroll up arrow |
| Check | ✓ Wax seal stamp |
| X (Close) | ✗ Ink cross-out |
| Settings | ⚙ Medieval gear/cog |
| Search | 🔍 Magnifying glass |
| Calendar | 📅 Desk calendar |
| Clock | 🕐 Pocket watch |
| Edit | ✒ Quill pen |
| Trash | 🗑 Waste basket |
| Download | ↓ Scroll unrolling |
| Upload | ↑ Scroll rolling up |
| Info | ℹ Illuminated letter "i" |
| Warning | ⚠ Cracked seal |
| Success | ✓ Golden checkmark |
| Error | ✗ Red X stamp |

---

## 🎬 Animations & Transitions

### 1. **Page Transitions**
```
Entry: Scroll unroll from top
- Height: 0 → 100% (300ms)
- Opacity: 0 → 1 (200ms)
- Transform: translateY(-20px) → 0

Exit: Scroll roll up to top
- Height: 100% → 0 (300ms)
- Opacity: 1 → 0 (200ms)
- Transform: 0 → translateY(-20px)
```

### 2. **Button Press**
```
Animation: "Stamp press"
- Scale: 1 → 0.95 (50ms)
- Transform: translateY(0) → translateY(2px)
- Box-shadow: Reduce shadow (pressed into surface)
- Sound effect (optional): *thump*
```

### 3. **Card Hover**
```
Animation: "Parchment lift"
- Transform: translateY(0) → translateY(-4px)
- Shadow: Increase shadow size
- Border: Brighten/glow effect
- Duration: 200ms ease-out
```

### 4. **Loading States**

#### Spinner: Hourglass Flip
```
Frames (4):
  ⏳    ⌛    ⏳    ⌛
Frame 1  Frame 2  Frame 3  Frame 4
Rotation: 0° → 180° → 360° (continuous)
Duration: 1000ms per full rotation
```

#### Progress: Quill Writing
```
Animation: Quill draws horizontal line
  ✒️ ─────────────────
     ████░░░░░░░░░░░
Quill icon moves left-to-right as progress increases
```

#### Skeleton: Papyrus Fade
```
Background: Alternating light/dark papyrus shades
Animation: Gradient slide (shimmer effect)
Color: #F4E5C2 → #E8D4A8 → #F4E5C2
Duration: 1500ms infinite
```

### 5. **Notification Toasts** - Flying Scrolls
```
Entry: Slide in from right + bounce
Position: Top-right corner
Appearance: Small rolled scroll with message
Exit: Fade out + slide right (after 3-5s)

Visual:
  ┌─══════════════════─┐
  │  ℹ Message Here    │  - Icon + text
  │  [DISMISS]         │  - Optional dismiss
  └─══════════════════─┘
```

### 6. **Requirement Tree Expansion**
```
Animation: "Scroll unfurls"
- Parent node clicks
- Children container height: 0 → auto
- Opacity: 0 → 1
- Each child appears sequentially (stagger 50ms)
- Border extends downward
- Duration: 300ms ease-out

Collapse: Reverse animation (roll up)
```

### 7. **Evaluation Progress**
```
Animation: "Seal stamping"
- When requirement completes:
  1. Node border flashes (200ms)
  2. Stamp icon appears above node (scale 0 → 1.2 → 1)
  3. Status badge updates with color change
  4. Confetti pixels (3-5) burst outward (optional)
  5. Node content reveals (slide down)
- Duration: 500ms total
- Sound effect (optional): *stamp thump*
```

### 8. **Character Animations** (Pixel Lawyer)
```
Idle → Analyzing: Quick shuffle papers (200ms)
Analyzing → Evaluating: Grab quill pen (150ms)
Evaluating → Success: Stand up celebration (800ms)
Success → Idle: Sit back down (400ms)

Trigger points:
- Page load: Idle
- API call starts: Analyzing
- First requirement evaluation: Evaluating
- All complete: Success
- Error: Error state (shaking head)
```

---

## 📐 Layout Adaptations

### 1. **Background Texture**
```css
body {
  background-image:
    /* Papyrus grain overlay */
    url('/textures/papyrus-grain.png'),
    /* Aged paper gradient */
    linear-gradient(
      180deg,
      #F4E5C2 0%,
      #E8D4A8 50%,
      #F4E5C2 100%
    );
  background-blend-mode: multiply;
  background-size: 512px 512px, 100% 100%;
}
```

### 2. **Page Margins & Borders**
```
Desktop View:
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐│  - 16-24px margin
│ │                                 ││  - Ornate corner decorations
│ │   Main Content Area             ││  - Optional: Aged edges
│ │                                 ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘

Corner Decorations: Medieval flourishes (4x4px pixel art)
  ┌─  ─┐

  └─  ─┘
```

### 3. **Sidebar Shadow**
```
Shadow: Carved bookshelf depth
- 3D effect: Outer shadow + inner highlight
- Inset border on right edge
- Optional: Candlelight glow from top
```

### 4. **Main Canvas**
```
Content area styling:
- Max-width: 1400px (centered)
- Padding: 24px
- Background: Semi-transparent papyrus overlay
- Border: 2px double border (dark brown)
```

---

## 🎯 Screen-Specific Designs

### 1. **Welcome Screen** (Use Case Gallery)

#### Hero Section
```
╔═══════════════════════════════════════════════╗
║                                               ║
║    📚 EU AI Act Compliance Evaluator 📚       ║  - Large pixel title
║                                               ║  - Animated book icon
║    Navigate the complexities of AI law       ║  - Subtitle in brown ink
║    with your trusted pixel legal advisor     ║
║                                               ║
║    ┌────────────────────────────┐            ║
║    │  📜 Create Your First Case │            ║  - Large wax seal button
║    └────────────────────────────┘            ║
║                                               ║
╚═══════════════════════════════════════════════╝

Character: Pixel lawyer in bottom-right, idle reading pose
Background: Faded law book illustrations (pixel art)
```

#### Use Case Gallery Grid
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│ 📜 Case 1  │ │ 📜 Case 2  │ │ 📜 Case 3  │  - Scroll cards
│ ─────────  │ │ ─────────  │ │ ─────────  │  - Hover: slight lift
│ Description│ │ Description│ │ Description│  - Status seals
│            │ │            │ │            │
│ [OPEN] 🏛  │ │ [OPEN] 🏛  │ │ [OPEN] 🏛  │  - Action button
└────────────┘ └────────────┘ └────────────┘

Empty State:
┌──────────────────────────────────┐
│         📚                       │
│    No cases yet!                 │  - Pixel book icon
│                                  │  - Friendly message
│    [Create Your First Case]     │  - Call-to-action
└──────────────────────────────────┘
```

### 2. **Use Case Creator** (Multi-Stage Flow)

#### Stage 1: Initial Form
```
╔════════════════════════════════════════════╗
║  Create New Use Case                       ║
╠════════════════════════════════════════════╣
║                                            ║
║  Title (Quill Icon)                        ║
║  ┌──────────────────────────────────────┐ ║
║  │  Enter title here...            ✒   │ ║  - Animated quill
║  └──────────────────────────────────────┘ ║
║                                            ║
║  Description                               ║
║  ╔══════════════════════════════════════╗ ║
║  ║ Describe your AI system...           ║ ║  - Open book style
║  ║                                      ║ ║
║  ║                                      ║ ║
║  ╚══════════════════════════════════════╝ ║
║                                            ║
║  ┌──────────────┐                         ║
║  │  📜 SUBMIT   │                         ║  - Wax seal button
║  └──────────────┘                         ║
╚════════════════════════════════════════════╝

Character: Lawyer looking at form, nodding
```

#### Stage 2: Analysis Loader
```
╔════════════════════════════════════════════╗
║                                            ║
║            ⏳ Analyzing...                 ║  - Hourglass animation
║                                            ║
║    Our legal advisor is reviewing         ║
║    your use case against EU AI Act        ║
║                                            ║
║    ████████████░░░░░░░░░░░░░              ║  - Progress bar
║    Checking requirements... 60%           ║
║                                            ║
╚════════════════════════════════════════════╝

Character: Lawyer flipping through pages rapidly
Background: Floating legal text snippets (Easter egg quotes)
```

#### Stage 3: Clarification View
```
╔════════════════════════════════════════════╗
║  📋 Additional Information Needed          ║
╠════════════════════════════════════════════╣
║                                            ║
║  Question 1:                               ║
║  "Does your system process personal data?" ║
║  ┌──────────────────────────────────────┐ ║
║  │  Your answer...                      │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
║  Question 2:                               ║
║  "What is the deployment region?"          ║
║  ┌──────────────────────────────────────┐ ║
║  │  EU, EEA, Switzerland...             │ ║
║  └──────────────────────────────────────┘ ║
║                                            ║
║  [SKIP] [CONTINUE] 📜                     ║
╚════════════════════════════════════════════╝

Character: Lawyer with quill, taking notes
```

#### Stage 4: Completion Summary
```
╔════════════════════════════════════════════╗
║  ✅ Use Case Created!                      ║
╠════════════════════════════════════════════╣
║                                            ║
║  Summary:                                  ║
║  • Title: [Your title]                     ║
║  • Applicable PNs: 12                      ║  - Seal icons
║  • Ready for evaluation                    ║
║                                            ║
║  ┌────────────────────────────┐           ║
║  │  🏛 Open Use Case Cockpit  │           ║  - Primary action
║  └────────────────────────────┘           ║
║                                            ║
╚════════════════════════════════════════════╝

Character: Lawyer celebrating (success animation)
Confetti: Pixel confetti burst
```

### 3. **Use Case Cockpit** (IDE Layout)

#### Left Panel: PN Groups (Collapsed Accordion)
```
┌──────────────────────────────────┐
│  Prohibition Norms               │  - Section header
├──────────────────────────────────┤
│                                  │
│  📦 Group 1: General Prohibit... │  - Accordion item
│  ─────────────────────────────   │  - Status badges
│  ⚫ Not Applicable                │  - Gray seal
│                                  │
│  📦 Group 2: Biometric Systems   │  - Expanded state
│  ────────────────────────────▼   │  - Down arrow
│    ├─ PN 2.1 Remote Biometric    │  - Tree structure
│    │  🟢 Applies                  │  - Green seal
│    ├─ PN 2.2 Real-time Systems   │
│    │  🟠 Evaluating...            │  - Brown seal
│    └─ PN 2.3 Emotion Recognition │
│       ⚫ Pending                  │  - Blue seal
│                                  │
│  📦 Group 3: High-Risk Systems   │
│  ─────────────────────────────   │
│  ⚫ Pending                       │
│                                  │
└──────────────────────────────────┘

Styling:
- Accordion: Folded parchment effect
- Hover: Slight glow
- Active: Golden border highlight
```

#### Right Panel: Tab-Based Inspector
```
┌────────────────────────────────────────────┐
│ [📜 PN 2.1] [📜 PN 2.2] [✕]               │  - Tabs (scroll cards)
├────────────────────────────────────────────┤
│                                            │
│  PN 2.1: Remote Biometric Identification   │  - Title
│  ════════════════════════════════════════  │  - Separator
│                                            │
│  Status: 🟢 APPLIES                        │  - Status badge
│                                            │
│  Shared Applicability Gates:              │
│  ✓ Uses biometric data                    │  - Checklist
│  ✓ Real-time processing                   │  - Green checks
│  ✗ Law enforcement only                   │  - Red X
│                                            │
│  Obligations (3):                          │
│  1. [⚫ Pending] Conformity Assessment     │  - Numbered list
│  2. [🟠 Evaluating] Risk Management        │  - Status seals
│  3. [⚫ Pending] Human Oversight           │
│                                            │
│  ┌──────────────────────┐                 │
│  │  🔍 EVALUATE ALL     │                 │  - Action button
│  └──────────────────────┘                 │
│                                            │
└────────────────────────────────────────────┘

Tab Design:
- Active: Unrolled scroll (light background)
- Inactive: Rolled scroll edge (darker)
- Close: Small X stamp icon
- Max 5 tabs, then horizontal scroll
```

### 4. **Requirements Grid** (Evaluation View)

#### Header Section
```
┌────────────────────────────────────────────┐
│  ← Back to Cockpit                         │  - Back button (arrow)
│                                            │
│  📋 PN 2.1: Remote Biometric ID            │  - Title
│  Status: 🟠 EVALUATING... (35% complete)   │  - Live status
│                                            │
│  ████████░░░░░░░░░░░░░░                   │  - Progress candle
└────────────────────────────────────────────┘
```

#### Requirements Tree
```
┌────────────────────────────────────────────┐
│                                            │
│  Root Requirement                          │
│  ┌──────────────────────────────────────┐ │
│  │  1. Conformity Assessment Required   │ │  - Root node (card)
│  │  ──────────────────────────────────  │ │
│  │  Status: 🟢 Completed                │ │  - Status badge
│  │  Result: YES (93% confidence)        │ │
│  │                                      │ │
│  │  [View Details] ▶                    │ │  - Expand button
│  └──────────────────────────────────────┘ │
│         │                                  │
│         ├─ Sub-Requirement 1.1             │  - Tree branch
│         │  ┌─────────────────────────────┐│
│         │  │ 1.1 System Uses Biometric...││  - Child node
│         │  │ Status: 🟢 Completed        ││
│         │  │ Result: YES                 ││
│         │  └─────────────────────────────┘│
│         │                                  │
│         ├─ Sub-Requirement 1.2             │
│         │  ┌─────────────────────────────┐│
│         │  │ 1.2 Real-time Processing... ││
│         │  │ Status: 🟠 Evaluating...    ││  - Pulsing border
│         │  │ ⏳ Please wait...           ││  - Hourglass
│         │  └─────────────────────────────┘│
│         │                                  │
│         └─ Sub-Requirement 1.3             │
│            ┌─────────────────────────────┐│
│            │ 1.3 Deployment Context      ││
│            │ Status: ⚫ Pending           ││  - Grayed out
│            └─────────────────────────────┘│
│                                            │
└────────────────────────────────────────────┘

Node Styling:
- Completed: Green border, checkmark seal
- Evaluating: Brown border, pulsing glow, hourglass
- Pending: Gray border, faded
- Error: Red border, cracked seal
- Branches: Pixel art tree lines (├ ─ └ │)
```

#### Detail Panel (Click to Open)
```
┌────────────────────────────────────────────┐
│  📜 Requirement Details                    │  - Side panel
├────────────────────────────────────────────┤
│                                            │
│  Question:                                 │
│  "Does your AI system use biometric        │
│  data for identification purposes?"        │
│                                            │
│  ─────────────────────────────────         │
│                                            │
│  Legal Context:                            │
│  📖 Definition: Biometric data means...    │  - Book icon
│  📖 Guidance: Consider whether...          │
│  ⚠️ Exception: Systems used solely for...  │  - Warning icon
│                                            │
│  ─────────────────────────────────         │
│                                            │
│  Sources:                                  │
│  🏛 Article 3(33) - Definition             │  - Building icon
│  🏛 Article 5(1)(d) - Prohibition          │
│                                            │
│  ─────────────────────────────────         │
│                                            │
│  Result:                                   │
│  ✅ YES (Confidence: 93%)                  │
│                                            │
│  Reasoning:                                │
│  "The system explicitly uses facial        │
│  recognition for user authentication,      │
│  which qualifies as biometric              │
│  identification..."                        │
│                                            │
│  [CLOSE]                                   │
└────────────────────────────────────────────┘

Styling:
- Overlay: Semi-transparent papyrus
- Shadow: Heavy drop shadow (modal effect)
- Sections: Separated by ornate dividers
- Scrollable: Ornate scroll handle
```

#### Completion Summary Card
```
┌────────────────────────────────────────────┐
│  🎉 Evaluation Complete!                   │  - Celebration header
├────────────────────────────────────────────┤
│                                            │
│  PN 2.1: Remote Biometric Identification   │
│                                            │
│  Final Result: ✅ APPLIES                  │  - Large seal
│                                            │
│  Summary:                                  │
│  • Total Requirements: 12                  │
│  • Applicable: 8 🟢                        │  - Color-coded
│  • Not Applicable: 3 ⚫                     │
│  • Skipped: 1 ⚪                           │
│                                            │
│  Obligations to Fulfill:                   │
│  1. Conformity Assessment                  │  - Numbered list
│  2. Risk Management System                 │
│  3. Data Governance                        │
│  4. Technical Documentation                │
│  5. Human Oversight Measures               │
│                                            │
│  ┌──────────────────────┐                 │
│  │  📥 DOWNLOAD REPORT  │                 │  - Action button
│  └──────────────────────┘                 │
│                                            │
└────────────────────────────────────────────┘

Character: Lawyer celebrating, arms raised
Animation: Confetti burst, seal stamps flying
Sound: Success chime (optional)
```

---

## 🖼️ Visual Assets Needed

### Pixel Art Assets (16x16, 32x32, 64x64)

1. **Character Sprites**
   - Lawyer idle (3 frames)
   - Lawyer analyzing (6 frames)
   - Lawyer evaluating (4 frames)
   - Lawyer success (8 frames)
   - Lawyer error (3 frames)

2. **UI Icons** (16x16)
   - Folder, Plus, User, Settings
   - Chevrons (up/down/left/right)
   - Check, X, Info, Warning
   - Clock, Calendar, Search
   - Edit (quill), Trash, Download, Upload

3. **Decorative Elements**
   - Corner flourishes (4x4)
   - Scroll edges (horizontal/vertical)
   - Wax seals (various colors)
   - Stamp marks
   - Quill pen + inkwell
   - Hourglass frames
   - Candle + flame animation
   - Book icons (closed/open)

4. **Textures** (Tileable)
   - Papyrus grain (512x512)
   - Wood grain (sidebar)
   - Aged paper spots/stains
   - Ink splatters (subtle)

5. **Background Elements**
   - Law book illustrations (faded)
   - Scales of justice
   - Gavel
   - Legal document scrolls

---

## 🎨 Implementation Strategy

### Phase 1: Theme Foundation (Week 1)
1. **Color Variables**
   - Add pixel theme color variables to `globals.css`
   - Create theme toggle in app state (Zustand)
   - Add CSS custom property switching

2. **Typography**
   - Load pixel fonts (Google Fonts)
   - Create typography scale
   - Add font switching logic

3. **Base Styles**
   - Update background textures
   - Modify border-radius (0px/2px)
   - Adjust shadow styles
   - Update spacing scale

### Phase 2: Component Reskins (Week 2-3)
1. **Core UI Components** (`/components/ui/`)
   - Button → Wax seal style
   - Card → Parchment scroll
   - Input/Textarea → Manuscript entry
   - Badge → Wax seal/stamp
   - Progress → Candle/hourglass
   - Select → Scroll dropdown

2. **Navigation Components**
   - Sidebar → Bookshelf
   - Breadcrumbs → Scroll navigation
   - Tabs → Rolled scroll edges

3. **Domain Components** (`/components/usecase/`, `/components/evaluation/`)
   - UseCaseGallery → Scroll card grid
   - UseCaseCreator stages → Themed forms
   - RequirementsGrid → Tree with pixel borders
   - DetailPanel → Floating scroll

### Phase 3: Character & Animations (Week 4)
1. **Pixel Lawyer Character**
   - Design sprite sheets
   - Implement animation states
   - Add state triggers (API calls, events)
   - Position in layout (floating, non-intrusive)

2. **Micro-Animations**
   - Button press (stamp)
   - Card hover (parchment lift)
   - Loading states (hourglass, quill)
   - Transitions (scroll unfurl)
   - Success effects (confetti)

### Phase 4: Polish & Accessibility (Week 5)
1. **Visual Polish**
   - Adjust colors for contrast
   - Fine-tune animations
   - Add Easter eggs
   - Test on various screens

2. **Accessibility**
   - WCAG color contrast checks
   - Keyboard navigation (unchanged)
   - Screen reader testing
   - Reduced motion support (disable animations)

3. **Performance**
   - Optimize sprite sheets
   - Lazy load character animations
   - Minimize texture file sizes
   - Test on low-end devices

### Phase 5: Theme Toggle & Launch (Week 6)
1. **Theme Switcher**
   - Add toggle button (in sidebar or user menu)
   - Persist preference (localStorage)
   - Smooth transition between themes
   - Default to modern theme (user opt-in to pixel)

2. **Documentation**
   - Update README with theme info
   - Add theme customization guide
   - Document new pixel assets

3. **Launch**
   - Beta testing with users
   - Gather feedback
   - Iterate on UX issues
   - Official release announcement

---

## 🎮 Theme Toggle Implementation

### Toggle Button Design
```
Location: Sidebar footer (below user profile)

Visual:
┌──────────────────┐
│ Theme:           │
│ ◉ Modern         │  - Radio buttons (or)
│ ○ Medieval       │  - Pixel art toggle
│                  │
│ [🎨 Toggle]      │  - Switch button
└──────────────────┘

Alternative (Compact):
┌──────────────────┐
│ [⚖ ⇄ 📜]         │  - Icon toggle (scales ↔ scroll)
└──────────────────┘
```

### State Management
```typescript
// useThemeStore.ts (Zustand)
interface ThemeStore {
  theme: 'modern' | 'medieval';
  toggleTheme: () => void;
  setTheme: (theme: 'modern' | 'medieval') => void;
}

const useThemeStore = create<ThemeStore>((set) => ({
  theme:
    (localStorage.getItem('theme') as 'modern' | 'medieval') || 'modern',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'modern' ? 'medieval' : 'modern';
      localStorage.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
}));
```

### CSS Implementation
```css
/* globals.css */

/* Default (Modern Theme) */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  /* ... other modern colors ... */

  --font-sans: 'Geist', sans-serif;
  --radius: 0.625rem;
}

/* Medieval Theme */
:root[data-theme="medieval"] {
  --background: #F4E5C2; /* Papyrus */
  --foreground: #1A1210; /* Ink black */
  --primary: #8B1A1A; /* Wax seal red */
  /* ... other medieval colors ... */

  --font-sans: 'Press Start 2P', monospace;
  --font-heading: 'MedievalSharp', serif;
  --radius: 0.125rem; /* Sharp corners */
}
```

### React Component Usage
```tsx
// Example: Button component
import { useThemeStore } from '@/stores/useThemeStore';

export function Button({ children, ...props }) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <button
      className={cn(
        'base-button-styles',
        theme === 'medieval' && 'medieval-button-styles'
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 🎯 Easter Eggs & Delightful Details

### Hidden Features
1. **Click the Lawyer Character**
   - Shows random legal fun fact or EU AI Act quote
   - Easter egg animations (juggling law books, etc.)

2. **Konami Code** (↑↑↓↓←→←→BA)
   - Unlocks "Ultra Medieval Mode" with:
     - Latin text tooltips
     - Gregorian chant background music
     - Illuminated manuscript borders

3. **Hover Over Logo**
   - Quill appears and "signs" the logo

4. **Completion Celebrations**
   - Different confetti patterns based on result count
   - Lawyer does different celebration dances

5. **Time-Based Themes**
   - Late evening (6pm-6am): Candlelit version (darker palette, candle glow effects)

### Sound Effects (Optional)
- Button press: Stamp thump
- Page turn: Parchment rustle
- Success: Bell chime
- Error: Quill scratch
- Background: Subtle quill scratching ambiance

---

## 📊 Accessibility Considerations

### Maintaining Usability
1. **Color Contrast**
   - Ensure all text meets WCAG AA standards
   - Test with contrast checkers
   - Provide high-contrast mode variant

2. **Font Legibility**
   - Pixel fonts sized appropriately (min 14px)
   - Generous line-height (1.6+)
   - Fallback to readable monospace if needed

3. **Animation Control**
   - Respect `prefers-reduced-motion`
   - Provide toggle to disable character animations
   - Keep critical info visible without animations

4. **Keyboard Navigation**
   - All interactions keyboard-accessible (unchanged)
   - Focus indicators (themed but visible)
   - Skip links for long pages

5. **Screen Readers**
   - ARIA labels for decorative elements
   - Semantic HTML preserved
   - Status announcements for live regions

---

## 🚀 Performance Optimization

### Asset Loading
1. **Lazy Load Character**
   - Don't load sprite sheets until theme activated
   - Use intersection observer for off-screen animations

2. **Optimize Textures**
   - Compress PNG files (TinyPNG)
   - Use CSS gradients where possible
   - SVG for scalable decorations

3. **Font Loading**
   - `font-display: swap` for pixel fonts
   - Preload critical fonts
   - Subset fonts to needed characters

4. **Animation Performance**
   - Use CSS transforms (GPU-accelerated)
   - Request animation frame for JS animations
   - Debounce scroll/resize handlers

---

## 📝 File Structure

```
/public/
  /assets/
    /pixel/
      /character/
        lawyer-idle.png          (sprite sheet)
        lawyer-analyzing.png
        lawyer-evaluating.png
        lawyer-success.png
        lawyer-error.png
      /icons/
        folder.png
        plus.png
        user.png
        ... (all 16x16 icons)
      /decorations/
        corner-tl.png
        corner-tr.png
        corner-bl.png
        corner-br.png
        scroll-edge-h.png
        scroll-edge-v.png
        wax-seal-red.png
        wax-seal-green.png
        wax-seal-blue.png
        stamp-approved.png
        stamp-denied.png
        ... (decorative elements)
      /textures/
        papyrus-grain.png        (512x512 tileable)
        wood-grain.png
        aged-spots.png
      /backgrounds/
        law-book-faded.png
        scales-justice.png
        gavel-faded.png

/components/
  /pixel/
    PixelLawyer.tsx              (character component)
    ThemeToggle.tsx              (theme switcher)
    PixelIcon.tsx                (icon wrapper)

/styles/
  /themes/
    medieval.css                 (pixel theme overrides)

/stores/
  useThemeStore.ts               (Zustand theme state)

/app/
  globals.css                    (updated with theme vars)
```

---

## 🎨 Design Inspiration & References

### Visual References
1. **Pixel Art Games**
   - Papers, Please (bureaucratic UI)
   - Return of the Obra Dinn (aged document aesthetic)
   - Shovel Knight (clean pixel art style)
   - Stardew Valley (friendly, approachable pixel UI)

2. **Medieval Manuscripts**
   - Illuminated letters
   - Margin decorations
   - Wax seals and stamps
   - Scroll borders

3. **Legal Aesthetics**
   - Old law office interiors
   - Leather-bound law books
   - Parchment documents
   - Quill and ink sets

### Color Palette Examples
- [Lospec: Papyrus 8](https://lospec.com/palette-list/papyrus-8)
- [Lospec: Parchment 16](https://lospec.com/palette-list/parchment-16)
- [Coolors: Aged Paper Palette](https://coolors.co/f4e5c2-e8d4a8-c4a574-8b6f47-5c3a21)

### Pixel Art Resources
- [Piskel](https://www.piskelapp.com/) - Free sprite editor
- [Aseprite](https://www.aseprite.org/) - Professional pixel art tool
- [itch.io Pixel Art Assets](https://itch.io/game-assets/tag-pixel-art)
- [OpenGameArt](https://opengameart.org/)

---

## ✅ Success Metrics

### User Experience Goals
1. **Theme Adoption Rate**: 30%+ of users try medieval theme
2. **Engagement**: Increased time on site (character interactions)
3. **Delight Factor**: Positive feedback on character animations
4. **Usability**: No decrease in task completion rates
5. **Accessibility**: Pass all WCAG AA standards
6. **Performance**: No significant impact on load times (<100ms)

### Technical Goals
1. **Maintainability**: Clean separation of themes (CSS variables)
2. **Scalability**: Easy to add more themes in future
3. **Bundle Size**: <200KB additional assets (lazy loaded)
4. **Browser Support**: Works on all modern browsers
5. **Mobile**: Fully responsive, character adapts to screen size

---

## 🎬 Marketing & Launch Ideas

### Announcement
- **Tagline**: "Navigate the EU AI Act with your personal pixel legal advisor!"
- **Demo Video**: Screen recording showing theme toggle + character animations
- **Tweet**: GIF of lawyer celebrating completion
- **Blog Post**: "How We Added a Pixel Lawyer to Our Legal Tech App"

### User Onboarding
- First-time users see brief intro:
  - "Meet your legal advisor!"
  - Character waves
  - "Toggle between Modern and Medieval themes anytime"

### Community Engagement
- **User-Generated Content**: Encourage screenshots with pixel lawyer
- **Easter Egg Hunt**: Challenge users to find all hidden features
- **Feedback Loop**: Collect requests for new character animations

---

## 📋 Development Checklist

### Pre-Development
- [ ] Review design document with team
- [ ] Gather feedback on visual direction
- [ ] Finalize color palette
- [ ] Confirm font choices
- [ ] Identify pixel artist (commission or DIY)

### Phase 1: Foundation
- [ ] Create medieval CSS variables
- [ ] Implement theme store (Zustand)
- [ ] Add theme toggle component
- [ ] Load pixel fonts
- [ ] Test theme switching

### Phase 2: Component Reskins
- [ ] Button (wax seal style)
- [ ] Card (parchment scroll)
- [ ] Input/Textarea (manuscript)
- [ ] Badge (wax seal)
- [ ] Progress (candle/hourglass)
- [ ] Select (scroll dropdown)
- [ ] Sidebar (bookshelf)
- [ ] Breadcrumbs (scroll navigation)
- [ ] Icons (replace with pixel art)

### Phase 3: Character
- [ ] Design character sprite sheets
- [ ] Implement PixelLawyer component
- [ ] Add animation state logic
- [ ] Position in layout
- [ ] Test on various screens
- [ ] Add click interactions

### Phase 4: Polish
- [ ] Fine-tune colors for contrast
- [ ] Add micro-animations
- [ ] Implement Easter eggs
- [ ] Test accessibility
- [ ] Optimize performance
- [ ] Cross-browser testing

### Phase 5: Launch
- [ ] User acceptance testing
- [ ] Fix bugs and iterate
- [ ] Prepare marketing materials
- [ ] Write documentation
- [ ] Deploy to production
- [ ] Monitor analytics

---

## 🎉 Conclusion

This **"Medieval Legal Scrolls"** pixel theme will transform the EU AI Act Evaluator into a unique, delightful experience that stands out in the legal tech space. By combining:

- **Papyrus/parchment aesthetic** (warm, approachable)
- **Pixel art styling** (nostalgic, fun)
- **Animated lawyer character** (engaging, personality)
- **Legal/medieval elements** (thematically appropriate)

We create a cohesive alternative theme that's both functional and memorable. The theme toggle ensures users can choose their preferred experience while maintaining full accessibility and usability.

**Key Benefits:**
1. **Differentiation**: Unique in legal tech market
2. **Engagement**: Character animations increase user delight
3. **Flexibility**: Easy to toggle between professional/fun modes
4. **Accessibility**: Maintained throughout pixel theme
5. **Scalability**: Foundation for future themes

Let's build this pixel-perfect legal adventure! 🎮⚖️📜
