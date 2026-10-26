# CompanyCam iOS – Recon Map

**App:** CompanyCam (Field work documentation & team collaboration)  
**Platform:** iOS 16.0+  
**Scope:** Core loop – photo capture, project organization, team collaboration, reporting  
**Use Case:** B2B SaaS for construction/field service contractors (roofing, HVAC, landscaping, restoration)

---

## Sources

| Source | Value | URL |
|--------|-------|-----|
| App Store listing | Screenshots, ratings (4.8★), feature summary, pricing tier hints | https://apps.apple.com/us/app/companycam/id960043499 |
| Official website & pricing | Core value prop, feature matrix, pricing tiers (Core/Crew/Scale/Enterprise) | https://companycam.com/, https://companycam.com/pricing/ |
| Help center & guides | Feature workflows, checklists, task assignment, reporting, integrations | https://help.companycam.com/ |
| API documentation | Data model (projects, photos, documents, teams, checklists), REST endpoints | https://docs.companycam.com/docs/welcome |
| Resource hub & classes | Video tutorials, user guides, use case patterns, best practices | https://companycam.com/resources/, https://companycam.com/resources/classes |
| Changelog (Sept–Oct 2026) | Recent UI/UX updates: emoji reactions, photo annotations, bulk document ops, per-line markup on proposals | In-app release notes |

---

## Screen Inventory

| ID | Screen | Navigation | Purpose | Key Components | States |
|----|---------|----|---------|---|---|
| **S01** | Onboarding / Login | App launch | Authentication and new user setup | Login form, signup form, forgot password, 14-day trial prompt | First launch, returning user, reset password flow |
| **S02** | Project Dashboard / Home | Bottom tab: Projects | Overview of all active and past projects | Project cards (photo, location, date, crew count), search bar, + New Project button, team section | Empty state (no projects), loaded (list/grid), searching, creating new |
| **S03** | Project Detail | Tap project from S02 | View all photos, documents, and metadata for a single project | Project header (title, location, date range, crew), photo gallery/timeline toggle, photos grid, top actions (+ Photo, Chat, Reports), filter/sort controls | Empty project, photos loaded, loading state, no permissions |
| **S04** | Camera / Photo Capture | S03 > + Photo button or quick action | Capture photos/videos with GPS timestamp and voice annotation | Live camera view, capture button, video toggle, voice recorder button, gallery access, settings (photo quality, location toggle) | Portrait/landscape, flash on/off, front/back camera, voice recording active/paused |
| **S05** | Photo Annotation | S03 > tap photo or S04 post-capture | Add tags, comments, measurements, voice descriptions to a photo | Photo full-screen view, annotation tools (pin, measure, draw), tag input, voice-to-text input, comments section, delete/edit controls | Photo loaded, annotation tools active, comments open/closed, saving state |
| **S06** | Photo Gallery & Timeline | S03 main view (toggle) | View all project photos in grid or chronological timeline | Photo grid (3-col) or timeline view, filter by date/crew, sort controls, select multiple (for bulk actions) | Empty state, photos loaded, search/filter active, multi-select mode |
| **S07** | Chat / Messaging | S03 > Chat tab | In-project team communication with mentions and real-time updates | Chat message list, input field, @mention picker, emoji reactions (added Sept 2026), notifications, crew member avatars | No messages, messages loaded, @mention open, typing indicator, error states |
| **S08** | Checklist Editor | S03 > Checklists or standalone | Create, edit, assign checklists with voice commands | Checklist template picker, list items (editable), assignee selector, status dropdown (not started/in progress/completed), reuse buttons | Empty, items added, saving, completed state, error if offline |
| **S09** | Checklist Tracker | In project view or S08 | View progress of assigned checklists, mark items complete | Checklist title, items with checkboxes, assignee, progress bar, completion timestamp | In progress, all complete, partially complete, overdue |
| **S10** | Report Builder | S03 > Reports button | Select photos, add notes, apply templates to generate client-ready reports | Template picker (before/after, progress, final, custom), photo selector (multi-select), note input, branding preview, export options | Empty, photos selected, preview, generating, ready to share |
| **S11** | Report View / Share | S10 > Generate Report | Preview generated report and share (PDF, gallery, live link, guest link) | Report layout preview, photo carousel/grid, notes, client header, share buttons (email, link copy, export PDF) | Generated (PDF/link ready), loading, error |
| **S12** | Proposal Builder** | S03 or account menu | Create proposal with photo, line items, markup, invoicing | Template selector, photo/item selector, line items (name, qty, unit cost, markup %), tax toggle, total calc, client email input | Empty, items added, calculating, ready to send, sent confirmation |
| **S13** | Team & Crew Management | S03 > Team or Settings > Team | View team members, roles, active crew, assign tasks | Team list (name, role, status online/offline, clock-in time), add member button, role selector, remove option | Empty team, members loaded, adding member, clock-in display |
| **S14** | Settings / Account | Bottom tab or menu | User profile, subscription, notifications, integrations, offline mode | Account info (name, email, photo), subscription tier, storage usage, notification toggles, integration list, app settings | Tier display, integrations connected/not connected, notification states |
| **S15** | Documents / File Management | S03 > Documents or secondary tab | Upload, organize, scan, delete project documents | Document list/grid, filter by type, upload button, scan button, bulk select (added Sept 2026), folder operations | Empty, documents loaded, scanning, upload progress, bulk actions active |
| **S16** | LiDAR Measurement Tool** | S03 (Scale plan+ only) | Measure rooms and create floor plans using device LiDAR | Camera view with measurement overlay, start/end point indicators, measurements list, export as image | Measuring, complete, error (LiDAR unavailable on older devices) |
| **S17** | Live Photo Feed | Standalone or S02 secondary view | Real-time updates of all team member photos across projects | Photo feed chronological list, project tag, crew member avatar, timestamp, comment count | Loaded, refreshing, no photos, notifications badge |
| **S18** | Clock-in / Time Tracking | S03 header or team view | Crew check-in and daily time logging | Clock in/out button, active duration display, crew list with check-in times, history | Clocked out, clocked in, display improved Oct 2026 |
| **S19** | Offline Mode | S14 > Offline or persistent | Sync photos and metadata when offline, queue for upload when online | Photo capture works, local photo list, "pending sync" badge, manual sync trigger, error on offline send | Photos syncing, queued, synced, conflict resolution |
| **S20** | Notification Center / Inbox | Alert or S02 secondary tab | In-app notifications for chat mentions, task assignments, team activity | Notification list, read/unread badge, filter (mentions, tasks, activity), mark as read | New notifications, all read, filtering active |

**\* Crew/Scale/Enterprise features** (not in Core plan)

---

## User Flows

### **F01: Create Project & Capture First Photo**
**Goal:** Contractor arrives at job site and starts documenting.

```
S02 (Project Dashboard) 
  → [Tap + New Project]
  → Project creation form (name, address, GPS auto-fill, start date, crew select)
  → S03 (Project Detail, empty state)
  → [Tap + Photo]
  → S04 (Camera)
  → [Capture photo + optional voice note]
  → S05 (Annotation) [optional: add tags, voice description, save]
  → S03 (Photo now appears in gallery)

Happy path clicks: 6–8
Edge cases: 
  - GPS unavailable (manual address entry)
  - Offline capture (photo queues for sync)
  - Voice note fails (input method fallback to text)
```

### **F02: Organize & Annotate Photos**
**Goal:** Contractor reviews photos, adds context, organizes by location/task.

```
S03 (Project Detail)
  → [Toggle to Timeline view]
  → [Tap photo to detail]
  → S05 (Photo Annotation)
  → [Draw measurement, add tag (e.g., "foundation"), voice comment "looks good"]
  → [Tap Save]
  → S05 updates, emoji reactions visible (Sept 2026 feature)
  → [Swipe or tap back to gallery]
  → [Batch select photos for bulk operations]
  → [Move to folder or tag group]

Happy path clicks: 5–7
Edge cases:
  - Photo annotation drafts lost (unsaved state)
  - @mention in comment triggers search (S07 integration)
```

### **F03: Create & Assign Checklist**
**Goal:** Foreman assigns daily task checklist to crew (Crew tier+).

```
S03 (Project Detail)
  → [Tap Checklists tab]
  → S08 (Checklist Editor)
  → [Tap + New or use template]
  → [Voice command: "Create roofing inspection checklist, add gutters, add shingles, assign to John"]
  → [Items auto-populated, assignee set]
  → [Save checklist]
  → S09 (Checklist Tracker)
  → John receives notification
  → John can mark items complete in S09

Happy path clicks: 4–6 (voice accelerates this)
Edge cases:
  - Voice recognition fails (manual text entry)
  - Checklist assigned to offline crew member (queued)
  - Template picker has many templates (search/filter needed)
```

### **F04: Generate & Share Client Report**
**Goal:** Contractor creates before/after photo report and sends to client.

```
S03 (Project Detail)
  → [Tap Reports]
  → S10 (Report Builder)
  → [Select template: Before/After Progress Recap]
  → [Multi-select photos: 2 before, 4 after]
  → [Add note: "Foundation work complete, next: roofing"]
  → [Preview report]
  → S11 (Report View)
  → [Tap Share]
  → [Choose: Email PDF, copy guest link, send via messaging app]
  → Client receives link or PDF

Happy path clicks: 7–9
Edge cases:
  - No template matches (custom option)
  - Photos too large (compression, offline sync delay)
  - Client email undeliverable (error, fallback to link)
```

### **F05: Create Proposal with Per-Line Markup**
**Goal:** Contractor creates itemized proposal with photos, sends to homeowner (Scale+).

```
S03 (Project Detail) or S14 (Account menu)
  → [Tap Proposals or Invoicing]
  → S12 (Proposal Builder)
  → [Select template: Standard Roofing]
  → [Select photos to include]
  → [Add line items: "Shingle removal: $200 (qty 1), markup +20% → $240"]
  → [Mark line item as non-taxable (Sept 2026 feature)]
  → [Input client email]
  → [Tap Email Proposal]
  → Client receives email with embedded proposal, can view/approve
  → [Optional: deposit collection on-site]

Happy path clicks: 6–8
Edge cases:
  - Client email bounces (fallback to SMS or share link)
  - Multi-page proposal pagination needed
```

### **F06: Team Collaboration & Real-time Sync**
**Goal:** Multiple crew members check in, upload photos, chat in real-time.

```
S02 (Dashboard) with Live Feed widget
  → Team members in S13 (Team view)
  → [John clocks in → S18 time tracking updates for all]
  → [Multiple crew members simultaneously:
      - Mary uploads photo (S04) → appears in S03 for all
      - John updates checklist (S09) → live sync
      - Sarah sends chat message with @Mary (S07) → notification
      - Mary replies in chat]
  → [All changes sync in real-time, emoji reactions added (Sept 2026)]
  → [Offline users queue updates, sync when online]

Happy path clicks: Continuous (async)
Edge cases:
  - Network drop during photo upload (retry, queue)
  - Conflicting edits (last-write-wins or merge needed)
  - Photo sync takes >30s (timeout, queue for batch)
```

---

## Components & UI Patterns

### **Navigation & Layout**
- **Bottom Tab Bar:** Projects (home), Live Feed, Chat, Team, Settings (5 tabs)
- **Project Context Header:** Project name, location, date range, crew count, quick action menu (⋯)
- **Floating Action Button (FAB):** Quick camera access, appears on most screens

### **Buttons & Controls**
- **Primary Actions:** + New Project, + Photo, + Checklist, Send Report, Clock In/Out
- **Secondary Actions:** Edit, Delete, Share, Download, Archive
- **Icon Buttons:** Overflow menu (⋯), back (<), close (×)
- **Toggle:** Gallery ↔ Timeline, Grid ↔ List
- **Segment Control:** Filter by crew, date, status

### **Photo & Media Components**
- **Photo Card:** Thumbnail, crew member avatar, timestamp, comment badge, tap to expand
- **Photo Grid:** 3-column layout, pinch-to-zoom, swipe navigation
- **Photo Viewer:** Full-screen image, annotation tools overlay, comment sidebar
- **Annotation Tools:** Pin (location), Measure (distance/area), Draw (freehand), Text label
- **Media Upload Progress:** Circular progress (% uploaded), pause/cancel options

### **Forms & Input**
- **Text Input:** Single-line (project name, address), multi-line (notes)
- **Voice-to-Text Input:** Mic button → "listening" state → text transcript
- **Dropdown/Picker:** Crew member select, checklist template, report template, role select
- **Date Picker:** Start date, end date, inline calendar
- **Multi-Select Checkbox:** Batch photo/document operations (bulk move, bulk delete)
- **Color/Tag Picker:** Category tags (e.g., "foundation", "roofing", "HVAC")

### **Messaging & Notifications**
- **Chat Bubble:** User name, avatar, timestamp, message text, @mention highlighting
- **Notification Badge:** Red circle with number (unread count)
- **Emoji Reaction Row:** Appears below chat messages (Sept 2026 feature)
- **Toast/Alert:** Inline confirmation ("Photo uploaded"), error ("Sync failed")
- **Mention Autocomplete:** Dropdown picker with team member avatars and names

### **Lists & Tables**
- **Project List:** Scrollable list with cards, pull-to-refresh
- **Checklist:** Checkbox item rows, assignee avatar, status (not started/in progress/done)
- **Team List:** Name, role, online status badge, clock-in time (Oct 2026 redesign)
- **Report Template List:** Icon, title, preview thumbnail, tap to select

### **Modals & Overlays**
- **Project Creation Modal:** Form overlay, GPS map preview, cancel/create buttons
- **Photo Annotation Panel:** Slides up from bottom, toolbar icons, save/discard
- **Report Preview Modal:** Full-screen swipeable carousel of report pages
- **Error/Alert Dialog:** Title, message, single or dual action buttons
- **Loading Spinner:** Centered, subtle animation during sync/upload

### **State Indicators**
- **Upload Progress Ring:** Percentage in center
- **Sync Status Badge:** "Syncing...", "Offline ⚠", "✓ Synced"
- **Presence Indicator:** Green dot = online, gray = offline
- **Checklist Progress Bar:** Visual fill for % complete
- **Pending Sync Indicator:** "Pending sync" label on queued items (offline mode)

---

## Inferred Data Model

### **Project**
```
id, created_by_id, name, address, latitude, longitude, 
start_date, end_date, status (active | archived | completed),
description, crew_ids[] (array of team member refs),
photo_count, document_count, total_storage_used

Evidence: S02 cards, S03 detail, project creation form
Confidence: HIGH
```

### **Photo**
```
id, project_id, uploaded_by_id, file_path (cloud storage ref),
filename, file_size, mime_type (image/jpeg, video/mp4),
latitude, longitude, timestamp (ISO 8601),
aspect_ratio, duration (if video),
annotations[] (see Annotation below),
tags[] (array of tag names),
comments[] (see Comment below),
reactions[] (emoji + user refs, Sept 2026),
is_synced (true | false), pending_upload (true | false)

Evidence: S04 capture, S05 annotation, S06 gallery, metadata export
Confidence: HIGH
```

### **Annotation**
```
id, photo_id, type (pin | measure | draw | text | voice),
coordinates [x, y, ...], label (text),
created_by_id, created_at,
measurement_value (distance or area, if type=measure),
voice_transcript (if type=voice, with auto-translation)

Evidence: S05 annotation panel, measurement export, voice commands
Confidence: MEDIUM-HIGH
```

### **Comment**
```
id, photo_id (or project_id if project-level),
user_id, text, mentions[] (array of user refs),
created_at, updated_at,
reactions[] (emoji + user refs)

Evidence: S05 comment section, S07 chat, email/proposal mentions
Confidence: HIGH
```

### **Checklist** (Crew tier+)
```
id, project_id, created_by_id, template_id (ref to Template),
title, description,
items[] (see ChecklistItem below),
assigned_to_id (single user or array for "team"),
status (not_started | in_progress | completed | overdue),
due_date, created_at, completed_at,
is_reusable (true = save as template)

Evidence: S08 editor, S09 tracker, template system
Confidence: HIGH
```

### **ChecklistItem**
```
id, checklist_id, title, description (optional),
is_completed (true | false), completed_by_id, completed_at,
order_index, required (true | false)

Evidence: S08 item list, voice command parsing
Confidence: HIGH
```

### **Report** (generated from photos & metadata)
```
id, project_id, created_by_id, template_id (ref to ReportTemplate),
title, selected_photo_ids[],
notes (report-level text),
branding (logo, colors, client header),
status (draft | ready | sent | archived),
pages[] (see ReportPage below),
created_at, sent_at, share_link (guest access token)

Evidence: S10 builder, S11 viewer, share links
Confidence: MEDIUM-HIGH
```

### **ReportPage** (page in multi-page report)
```
id, report_id, order_index,
layout_type (before_after | carousel | grid | custom),
photos[] (array of photo refs),
text (notes for this page)

Evidence: S10 template picker, S11 pagination
Confidence: MEDIUM
```

### **Proposal** (Scale+ feature)
```
id, project_id, created_by_id, template_id (ref),
client_name, client_email, client_phone,
line_items[] (see ProposalLineItem below),
subtotal, tax_amount, total,
deposit_requested (optional amount),
status (draft | sent | viewed | accepted | rejected),
created_at, sent_at, viewed_at,
share_link (guest access)

Evidence: S12 builder, Sept 2026 changelog (per-line markup, tax toggle)
Confidence: MEDIUM-HIGH
```

### **ProposalLineItem** (Sept 2026 feature: per-line markup)
```
id, proposal_id, order_index,
description, quantity, unit_cost, markup_percent,
calculated_amount (unit_cost * qty * (1 + markup%)),
is_taxable (true | false, added Sept 2026),
photo_ids[] (array of supporting photos)

Evidence: S12 builder with markup calculator
Confidence: MEDIUM-HIGH
```

### **TeamMember**
```
id, account_id, first_name, last_name, email, phone,
profile_photo_url, role (contractor | crew_member | supervisor | admin),
status (active | inactive | pending_invite),
clock_in_time (timestamp, if currently clocked in),
total_hours_today, last_activity_at,
created_at

Evidence: S13 team view, S18 clock-in, presence indicator
Confidence: HIGH
```

### **Tag** (photo/project categorization)
```
id, project_id (project-level) or account_id (global),
name (e.g., "foundation", "roofing", "HVAC"),
color (hex), icon (optional),
created_by_id, created_at

Evidence: S05 annotation tag input, S06 filter
Confidence: MEDIUM
```

### **Document**
```
id, project_id, uploaded_by_id,
title, file_type (pdf | image | scan),
file_path (cloud storage ref), file_size,
source (upload | camera_scan | external_link),
created_at, is_archived

Evidence: S15 document management, bulk operations (Sept 2026)
Confidence: MEDIUM
```

### **Account & Subscription**
```
id, email, password_hash, name, profile_photo_url,
subscription_tier (free | core | crew | scale | enterprise),
subscription_status (active | trial | expired | cancelled),
trial_started_at, trial_expires_at, billing_cycle_start,
stripe_customer_id, total_storage_used, storage_limit,
settings (notification prefs, offline mode, language, timezone)

Evidence: Pricing page, S14 settings, API authentication
Confidence: HIGH
```

### **APIKey** (for integrations & webhooks)
```
id, account_id, name, key_hash, secret_hash,
scopes (read_projects | write_projects | read_photos | etc.),
created_at, last_used_at, is_active

Evidence: API docs, OAuth 2.0 support, Zapier integration
Confidence: MEDIUM
```

---

## Feature Matrix

See `replica/features.csv` for the complete feature breakdown by area and priority.

---

## What Cannot Be Cloned

| Constraint | Reason |
|-----------|--------|
| **Existing CompanyCam userbase & projects** | Network effects, data ownership, user accounts are CompanyCam's. Clone must be new platform with new users. |
| **Pre-trained AI models** (translation, auto-context) | Proprietary models; clone could use public APIs (Google Translate, AWS) or train new models from scratch. |
| **Native mobile integrations** (deep link sharing, app shelf visibility) | OS-specific; clone needs separate native implementations and App Store distribution. |
| **Third-party integrations** (JobNimbus, ServiceTitan, Jobber, QuickBooks, etc.) | Requires vendor APIs, partner agreements, OAuth setup for each. Clone starts with REST API only. |
| **LiDAR measurement engine** (Scale+ feature) | Proprietary algorithm; clone must use ARKit built-ins or implement from scratch. Limited to devices with LiDAR (iPhone 12 Pro+, iPad Pro). |
| **White-label & enterprise contracts** (Scale/Enterprise) | Business relationships, SLAs, dedicated support; not cloneable as features. |

---

## Size Estimation

**Screens:** 20 (S01–S20)  
**User Flows:** 6 core (project creation, photo organization, checklists, reports, proposals, team collaboration)  
**Entities:** 12 major (Project, Photo, Checklist, Report, Proposal, TeamMember, Comment, Tag, Document, Account, APIKey, Annotation)  
**Hard Parts:**
1. **Real-time sync & offline mode** – Queue system, conflict resolution, eventual consistency
2. **Photo upload & storage management** – Batch uploads, compression, cloud storage (AWS S3/GCS), resume on network loss
3. **Reporting engine** – Dynamic PDF generation, multi-page layouts, template rendering
4. **Team presence & real-time chat** – WebSocket or polling, optimistic UI, notification handling
5. **Voice-to-text & translation** – ML integrations (Whisper API, Google Translate) or local models

**Scope Recommendation:**  
- **MVP (4–6 weeks):** Core loop (F01–F02): create project, capture/annotate photos, basic gallery, text chat, settings. Auth. Cloud storage. No offline mode, no checklists, no reports.
- **Phase 2 (2–3 weeks):** Add checklists (F03), basic reports (F04), team management. Optional: real-time sync improvements.
- **Phase 3 (2–3 weeks):** Proposals (F05), LiDAR (if targeting newer iPhones), offline mode, advanced reporting templates.

**Total:** **S–M estimate** (8–12 weeks for feature-complete clone at Core tier, excluding native OS work and partner integrations).

---

## Next Steps

Run `/replica-architect` to translate this recon map into a technical architecture, database schema, and API design document.
