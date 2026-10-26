# CompanyCam Component Library

Design system for CompanyCam iOS/Web clone. All components use `tokens.json` values.

---

## Button

**Purpose:** Primary interactive element for actions.

**Variants:**
- `primary` – Main actions (submit, create, send)
- `secondary` – Secondary actions (cancel, back)
- `ghost` – Low-emphasis actions (skip, more options)
- `danger` – Destructive actions (delete, remove)

**Sizes:**
- `sm` – 32px height, 14px text, used in dense UIs
- `md` – 40px height, 14px text, standard
- `lg` – 48px height, 16px text, touch-friendly, mobile default

**States:**
- `default` – Base state, cursor pointer
- `hover` – Darkened or elevated, visual feedback
- `active` – Pressed state, darker/shadow reduced
- `focus-visible` – 2px outline ring in accent color, 2px offset
- `disabled` – 50% opacity, cursor not-allowed, no interaction
- `loading` – Icon spinner, label hidden or visible (aria-label kept for screen readers)

**Tokens:**
- Primary: bg-accent, text-inverse, rounded-md, font-semibold, shadow-md on hover
- Secondary: bg-surface, text-primary, border border-input, rounded-md
- Ghost: bg-transparent, text-accent, hover:bg-accent-light
- Danger: bg-danger, text-inverse, hover:bg-red-700

**Accessibility:**
- Semantic `<button>` element
- Min 44px touch target (iOS/Android standard)
- Focus ring visible on keyboard tab
- Loading state uses `aria-busy="true"`, label preserved with `aria-label`
- Disabled state uses `disabled` attribute

**Used on:** S02 (+New Project), S03 (+Photo, +Checklist), S04 (Capture), S06 (Select), S08 (Save), S10 (Generate), S12 (Send Proposal), S13 (Add Member)

---

## Input

**Purpose:** Text input for forms.

**Variants:**
- `text` – Single-line text (project name, email)
- `textarea` – Multi-line text (notes, description)
- `password` – Masked input (login)
- `search` – With search icon, clear button
- `tel` – Phone number

**Sizes:**
- `sm` – 32px, smaller fonts/labels
- `md` – 40px, default
- `lg` – 48px, mobile-friendly

**States:**
- `default` – Border in border-input color
- `focus` – Border color changes to focus-ring, shadow-sm
- `filled` – Border-input, text-primary, bg-white
- `error` – Border color changes to danger, error message below
- `disabled` – bg-surface, text-muted, cursor not-allowed
- `readonly` – bg-surface, text-primary (no editing)

**Tokens:**
- Border: border border-input, rounded-md
- Focus: outline-2 outline-offset-2 outline-focus-ring (or border-focus-ring + shadow-md)
- Padding: px-3 py-2 (md size), adjust for sm/lg
- Font: font-sans, text-sm

**Placeholder:**
- Color: text-muted
- Italic or normal weight (iOS default is italic)

**Accessibility:**
- Label always associated via `<label htmlFor>` or aria-label
- Error messages linked with `aria-describedby`
- Required fields marked with `aria-required="true"` or HTML `required`
- Min 44px tap target (including label)

**Used on:** S01 (email, password), S02 (search), S03 (notes), S04 (capture), S05 (comment, tag), S08 (checklist items), S12 (client email, line items)

---

## Select / Dropdown

**Purpose:** Choose from predefined options.

**Variants:**
- `native` – HTML `<select>` for mobile native feel
- `custom` – Styled dropdown with search (crew member, template, tag)
- `multiselect` – Multiple selections (bulk photo select, tag multi-select)

**States:**
- `default` – Border border-input, bg-white
- `open` – Menu visible below, bg-surface items
- `focus` – Outline on select element
- `disabled` – text-muted, cursor not-allowed
- `error` – border-danger

**Tokens:**
- Padding: px-3 py-2 (same as input)
- Border: border border-input, rounded-md
- Menu items: hover:bg-accent-light, selected:bg-accent, text-inverse
- Font: text-sm, font-regular

**Accessibility:**
- Native `<select>` on mobile (iOS picker)
- Custom dropdowns use `role="listbox"`, items as `role="option"`
- Keyboard: arrow keys navigate, Enter/Space to select, Escape to close
- Selected item has `aria-selected="true"`

**Used on:** S02 (filter), S03 (filter by crew/date), S08 (assignee, template), S12 (tax toggle), S13 (role selector)

---

## Checkbox

**Purpose:** Boolean toggle, single or in groups.

**Variants:**
- `default` – Single checkbox
- `group` – Multiple checkboxes (permissions, bulk select)

**States:**
- `unchecked` – Border box, empty, cursor pointer
- `checked` – bg-accent, checkmark icon (text-inverse)
- `indeterminate` – Dash icon (for multi-select parent)
- `focus-visible` – 2px outline ring around checkbox
- `disabled` – opacity-50, cursor not-allowed

**Size:**
- 20px × 20px (standard), min 44px with label for touch target

**Tokens:**
- Border: border-2 border-border-input, rounded-sm
- Checked: bg-accent, checkmark icon (Lucide check)
- Focus: outline-focus-ring

**Accessibility:**
- Checkbox wrapped in `<label>` with visible text or aria-label
- `aria-checked` reflects state
- Keyboard: Space to toggle, Tab to navigate

**Used on:** S06 (bulk select photos), S08 (checklist items completion), S12 (per-line taxable toggle), S15 (bulk select documents)

---

## Radio Button

**Purpose:** Single selection from mutually exclusive options.

**States:**
- `unchecked` – Circle, border-border-input
- `checked` – Circle with center dot, bg-accent or border-accent
- `focus-visible` – Outline ring around radio
- `disabled` – opacity-50, cursor not-allowed

**Size:**
- 20px × 20px circle, min 44px with label

**Tokens:**
- Border: 2px solid border-input
- Checked: bg-accent (outer circle) or border-accent + inner circle (accent)
- Focus: outline-focus-ring around circle

**Accessibility:**
- Grouped in `<fieldset>` with `<legend>` label
- Each radio in `<label>` with visible text
- `aria-checked` reflects state
- Keyboard: arrow keys to navigate group, Space to select

**Used on:** S01 (subscription tier choice), S10 (report template picker), S16 (layout mode toggle)

---

## Toggle / Switch

**Purpose:** On/off toggle, often in settings.

**States:**
- `off` – Gray background, knob on left
- `on` – Accent background, knob on right
- `focus-visible` – Ring around toggle
- `disabled` – opacity-50, cursor not-allowed

**Size:**
- 48px width × 28px height (iOS standard), or smaller 40px × 24px

**Tokens:**
- Off: bg-slate-300, knob white
- On: bg-accent, knob white
- Transition: 150ms ease-in-out

**Animation:**
- Knob slides smoothly; no jump

**Accessibility:**
- Semantic `<button role="switch">` or `<input type="checkbox" role="switch">`
- `aria-checked` reflects state (true/false)
- Keyboard: Space to toggle

**Used on:** S14 (notifications toggle, offline mode, dark mode), S19 (enable offline)

---

## Chip / Tag

**Purpose:** Removable labels, categories.

**Variants:**
- `default` – Static tag (photo tag, category)
- `removable` – With X button (bulk-selected items, search filters)
- `interactive` – Click to apply filter or select

**States:**
- `default` – bg-surface, border border-input, text-primary, rounded-full
- `selected` – bg-accent-light, border-accent, text-accent
- `focused` – outline-focus-ring
- `hover` – bg-surface-hover

**Size:**
- `sm` – 28px height, 12px text, dense
- `md` – 32px height, 14px text, standard

**Tokens:**
- Background: surface or accent-light
- Padding: px-2 py-1 (sm) or px-3 py-1 (md)
- Radius: rounded-full (pill shape)
- Font: text-xs or text-sm, font-medium

**Accessibility:**
- `<button>` for clickable chips
- X button: aria-label="Remove tag"
- Keyboard: Tab to focus, Space/Enter to select, Delete or Backspace to remove

**Used on:** S05 (photo tags), S06 (tag filters), S08 (checklist tags), S12 (proposal tags), S20 (notification filters)

---

## Modal / Dialog

**Purpose:** Overlay UI for confirmation, forms, or content.

**Variants:**
- `alert` – Simple message with OK button
- `confirmation` – Question with OK/Cancel
- `form` – Input fields (new project, edit details)
- `sheet` – Bottom-sheet (mobile default for forms)

**States:**
- `open` – Visible, backdrop (50% black opacity)
- `closed` – Hidden, backdrop removed

**Animation:**
- Slide up from bottom (sheet) or fade in (center modal), 300ms ease-out
- Slide down / fade out on close

**Tokens:**
- Backdrop: bg-black/50 (50% opacity)
- Modal: bg-surface, rounded-lg (top corners) or rounded-xl (center)
- Max width: 600px (desktop), full width on mobile with 16px margin
- Padding: px-lg py-lg (24px)

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for title
- Focus trap: first interactive element focused on open; Tab cycles within modal
- Escape key closes modal
- Backdrop click closes (optional)
- Announce modal open to screen readers

**Used on:** S02 (+New Project), S03 (confirm delete), S04 (camera settings), S08 (checklist template picker), S10 (report template picker), S12 (proposal confirmation)

---

## Toast / Snackbar

**Purpose:** Temporary notifications (success, error, info).

**Variants:**
- `success` – Green, checkmark icon, "Photo uploaded"
- `error` – Red, X icon, "Sync failed"
- `warning` – Yellow, alert icon, "Low storage"
- `info` – Blue, info icon, "Syncing..."

**Position:**
- Mobile: Bottom of screen, safe area
- Desktop: Bottom-right corner

**States:**
- `visible` – Slide up, 300ms ease-out
- `dismiss` – Slide down or fade out, 200ms ease-in
- Auto-dismiss: 4–6 seconds (error longer, success shorter)

**Animation:**
- Enter: slide up from bottom -100px to 0
- Exit: fade out + slide down

**Tokens:**
- Background: bg-success / bg-error / bg-warning / bg-accent
- Text: text-inverse, text-sm, font-medium
- Icon: 20px, margin-right 12px
- Padding: px-4 py-3
- Radius: rounded-md
- Shadow: shadow-lg
- Max width: 90vw on mobile, 400px on desktop

**Accessibility:**
- `role="status"`, `aria-live="polite"` (updates don't interrupt screen reader)
- aria-label summarizes action
- Dismiss button (X) with aria-label="Dismiss"
- Keyboard: Escape to dismiss

**Used on:** S03 (photo uploaded, sync started), S05 (annotation saved), S07 (comment sent), S08 (checklist assigned), S11 (report shared), S12 (proposal sent)

---

## Photo Card / Thumbnail

**Purpose:** Visual preview of photos in gallery or grid.

**Variants:**
- `gallery` – Grid item (3-column on mobile, 4–6 on desktop)
- `list` – Horizontal with metadata
- `detail` – Full-screen preview with annotations

**States:**
- `default` – Thumbnail, border-sm
- `selected` – Checkmark overlay, border-accent
- `loading` – Spinner overlay
- `error` – Gray background, error icon, retry button
- `syncing` – Spinner overlay, "Pending sync" badge

**Elements:**
- Image: Optimized thumbnail (200px for gallery, higher for detail)
- Overlay on hover/focus: Actions (delete, share, annotate)
- Badge: Crew member avatar (uploader), sync status, comment count
- Metadata: Date, crew name, tag chips

**Tokens:**
- Border: border-base rounded-md
- Selected: border-2 border-accent, overlay with checkmark (accent color)
- Badge: bg-surface text-sm, shadow-sm, positioned bottom-right
- Overlay: bg-black/40 with actions (text-inverse)

**Accessibility:**
- `<img alt>` describes photo or includes metadata
- Checkbox for selection: aria-label="Select photo"
- Keyboard: Tab to focus, Space to select, Enter to view detail
- Touch target: Min 44px × 44px

**Used on:** S03 (gallery), S06 (timeline, grid view), S10 (report photo picker), S12 (proposal photo selector), S17 (live feed)

---

## Timeline / Chronological List

**Purpose:** Display events or photos ordered by date.

**Variants:**
- `vertical` – Standard timeline with line, dots, labels (mobile)
- `horizontal` – Scrollable carousel (desktop preview)

**Elements:**
- Dot/node: Accent color at each event
- Line: Thin border connecting dots
- Card: Photo + metadata (date, crew, tags)
- Grouping: By date (today, yesterday, week ago)

**States:**
- `default` – Dots visible, line connects them
- `hover/focus` – Card elevated, shadow-lg
- `active` – Dot filled with accent, card highlighted

**Tokens:**
- Line: border-l border-border, 2px width
- Dot: 12px circle, bg-accent, positioned left (offset -6px from line)
- Card: bg-surface, rounded-md, shadow-md, ml-8 (offset for line)
- Date label: text-muted, font-sm, mb-4

**Accessibility:**
- List markup: `<ol>` or `<ul>`
- Cards are focusable: `tabindex="0"`, semantic labels
- Announce total count: "Timeline with 23 items"

**Used on:** S06 (photo timeline), S09 (checklist progress over time), S17 (activity feed)

---

## Form Group / Fieldset

**Purpose:** Logical grouping of form inputs with label.

**Elements:**
- Label: Bold, left-aligned or above input
- Input/control: Below label
- Help text: Smaller, text-muted, below input
- Error message: text-danger, below input

**Layout:**
- Vertical stacking (mobile-first)
- Label: text-sm font-semibold, margin-bottom 4px
- Input: 100% width, margin-bottom 4px (if help/error)
- Help text: text-xs text-muted, margin-top 2px
- Error: text-xs text-danger, margin-top 2px

**Required indicator:**
- Asterisk (*) next to label in danger color, or aria-required

**States:**
- `default` – Normal layout
- `error` – Border-danger on input, error message visible
- `disabled` – All elements at 50% opacity
- `focused` – Input focused

**Tokens:**
- Label: text-sm font-semibold text-primary
- Help: text-xs text-muted
- Error: text-xs text-danger
- Spacing: margin-bottom 16px between groups

**Accessibility:**
- `<label htmlFor>` explicitly links label to input
- `aria-labelledby` if label not `<label>` element
- `aria-describedby` on input for help text or error
- Required input: `required` attribute + `aria-required="true"`

**Used on:** S01 (login form), S02 (project creation), S05 (annotation form), S08 (checklist editor), S12 (proposal builder)

---

## Header / Top Bar

**Purpose:** Navigation and branding at top of screen.

**Elements:**
- Logo or title: Left side, large text or icon
- Actions: Right side (search, filter, menu)
- Back button: Left side on detail screens
- Status bar: Safe area, translucent

**Height:** 56px (including status bar padding on iOS)

**States:**
- `default` – Static header
- `scrolled` – Subtle shadow-md, border-bottom

**Layout:**
- iOS safe area: 8px top padding on notch devices
- Padding: px-4 py-3 for content (accounting for safe area)
- Flex: space-between (logo on left, actions on right)

**Tokens:**
- Background: bg-surface or bg-white
- Text: text-primary, font-bold (title)
- Divider: border-b border-border (optional, on scroll)
- Shadow: shadow-md (optional, on scroll)

**Accessibility:**
- Title in `<h1>` or role="heading"
- Back button: aria-label="Back", semantic `<button>`
- Menu button: aria-label="Menu", aria-expanded (if menu)

**Used on:** All screens (S01–S20) as persistent header

---

## Tab Bar / Bottom Navigation

**Purpose:** Switch between major views (iOS style).

**Tabs:** Projects, Live Feed, Chat, Team, Settings (5 items max for iOS)

**Elements:**
- Tab item: Icon (24px) + label (10px text)
- Active state: Accent color, label visible
- Inactive state: text-muted, label visible or hidden

**Height:** 56px (including safe area padding on iOS)

**Layout:**
- Flex: distribute evenly, center align
- Icon: centered, 24px size
- Label: Below icon, text-xs, bold
- Safe area: 16px bottom padding on notch devices

**States:**
- `active` – Icon + text in accent color
- `inactive` – Icon in text-muted, text in text-muted
- `hover/focus` – Slight bg-surface highlight (desktop only, mobile is touch)

**Tokens:**
- Background: bg-white, border-t border-border
- Active: text-accent, font-semibold
- Inactive: text-muted, font-regular
- Icon: 24px, centered

**Animation:**
- No animation on tab change (instant switch)

**Accessibility:**
- `role="tablist"`, tab items as `role="tab"`
- Active tab: `aria-selected="true"`
- Keyboard: arrow keys to switch (no wrap on mobile), Enter to activate
- Announce active tab name

**Used on:** All screens (S01–S20) as persistent navigation

---

## Empty State

**Purpose:** Communicate when no content is available.

**Elements:**
- Icon: Large, 64px, in accent or text-muted color
- Heading: text-lg font-semibold, text-primary
- Description: text-sm text-muted, max width 320px
- CTA button: Primary button to create/upload content (optional)

**Layout:**
- Vertical stack, centered
- Padding: 40px–60px on mobile, 80px on desktop
- Min height: 60vh (full visible area)

**Variants:**
- `empty` – No projects, photos, etc. ("Create your first project")
- `no-results` – Search returned nothing ("No projects match your search")
- `error` – Failed to load ("Failed to load photos. Retry?")
- `offline` – No network ("You're offline. Pending photos: 3")

**Tokens:**
- Icon: text-muted or text-accent
- Heading: text-lg font-bold text-primary
- Description: text-sm text-muted, line-height relaxed
- Button: primary, margin-top 20px

**Accessibility:**
- Heading is real `<h2>` or role="heading"
- Icon is decorative: aria-hidden="true"
- Explain empty state in heading + description for screen readers

**Used on:** S02 (no projects), S03 (no photos), S06 (no results), S07 (no chat), S09 (no checklists)

---

## Navigation / Breadcrumb

**Purpose:** Show current location and allow backtracking.

**Variants:**
- `breadcrumb` – Projects > My Project > Photos (desktop)
- `back-button` – Single back button (mobile)

**Back Button:**
- Icon: Lucide chevron-left, 24px
- Position: Top-left of header
- Label: Hidden or "Back"

**Breadcrumb (desktop):**
- Links separated by "/"
- Last item not a link (current page)
- Overflow: "..." if too long

**Tokens:**
- Link: text-accent, underline on hover
- Separator: text-muted
- Current: text-primary, font-semibold, no underline

**Accessibility:**
- Back button: aria-label="Go back"
- Breadcrumb: `nav` with aria-label="Breadcrumb"
- Links are real `<a>` or `<button>`

**Used on:** S03 (project detail from S02), S05 (photo detail from S03), S09 (checklist from S03)

---

## Annotation Tools (Photo Detail)

**Purpose:** Visual annotation overlay on photos.

**Tools:**
1. **Pin** – Marker at point
   - UI: Tap point, optional label
   - Visual: Colored circle with icon
   - State: Removable, movable

2. **Measure** – Line with distance
   - UI: Drag from A to B
   - Visual: Line with length label (ft/m)
   - State: Removable, editable unit

3. **Draw** – Freehand markup
   - UI: Finger/stylus draw
   - Visual: Stroke on image
   - State: Undo/redo, color picker, width slider
   - Colors: Use accent, danger, warning, success

4. **Text** – Label or note
   - UI: Tap, type, confirm
   - Visual: Text bubble or overlay label
   - State: Movable, editable, removable

5. **Voice** – Audio annotation
   - UI: Tap, record, playback, transcribe
   - Visual: Waveform or transcript badge
   - State: Play/pause, delete, use transcript

**States:**
- `idle` – Annotations visible, semi-transparent until hover
- `editing` – Selected annotation highlighted, controls visible
- `complete` – All annotations saved

**Tokens:**
- Pin: 20px circle, bg-accent, border-white
- Measure: 2px stroke, text-inverse bg-accent, rounded-md
- Draw: 3px stroke, color user-selected, opacity 80%
- Text: bg-accent text-inverse rounded-md px-2 py-1, font-sm
- Voice: bg-accent-light text-accent rounded-md, waveform or icon

**Accessibility:**
- Annotations have descriptions: alt-text or aria-label
- Keyboard: Tab through annotations, Delete to remove, arrow keys to move
- Screen reader: "Annotation 1 of 5: Pin at foundation corner"

**Used on:** S05 (photo annotation, central feature)

---

## Summary

**Total Components:** 19 categories
**Design System:** Tokens-based, accessible, mobile-first
**Accessibility:** WCAG AA standard throughout
**Variants:** 60+ total (across all components)
**Motion:** Subtle, respects prefers-reduced-motion
**Responsive:** Mobile (iOS) first, scales to desktop/web

**Next:** Build primitives in code using Expo + React (iOS) and Next.js (web), referencing this spec.
