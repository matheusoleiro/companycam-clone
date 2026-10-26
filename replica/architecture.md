# CompanyCam Clone – Technical Architecture

---

## 1. Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **iOS App** | Expo (React Native) with TypeScript | Write once, run on iOS + Android; shared codebase; fast dev iteration; built-in camera/location APIs |
| **Web Dashboard** | Next.js 14 (App Router) + TypeScript | Server components for auth, SSR for team dashboard, API routes integrated, Vercel deployment |
| **Database** | PostgreSQL on Supabase | Managed Postgres, RLS for security, real-time subscriptions, built-in auth, S3-compatible storage |
| **ORM** | Prisma | Type-safe queries, migrations, seed scripts; alternative: Drizzle (lighter) |
| **Auth** | Supabase Auth (JWT) + OAuth 2.0 | Native iOS support, password-less options, email confirmations, refresh tokens |
| **File Storage** | Supabase Storage (PostgreSQL-backed S3) | Seamless integration, RLS policies, CDN delivery, resumable uploads |
| **Real-time** | Supabase Realtime (WebSocket) | Chat, presence, photo feed subscriptions; alternative: Socket.io on custom server |
| **Jobs & Background** | Trigger.dev or Vercel Cron | Photo processing, report generation, webhook delivery, email, cleanup; runs on edge/serverless |
| **Email** | Resend or Postmark | Transactional emails (proposals, summaries), HTML templates, SMTP optional |
| **Payments** | Stripe | Subscription management, invoicing, metering (storage overage), alternative: Lemon Squeezy (simpler) |
| **PDF Generation** | pdf-lib or Puppeteer on Vercel Functions | Generate reports server-side, email directly |
| **Image Processing** | Sharp + ImageMagick (Vercel Functions) | Photo compression, thumbnail generation, EXIF stripping |
| **Search** | Postgres full-text or Algolia | Projects, photos by metadata; Algolia for scaled search |
| **Monitoring** | Sentry + PostHog | Error tracking, analytics, feature flags |
| **Hosting** | Vercel (web) + EAS Build (iOS) | Next.js native, edge functions for image processing; Expo over-the-air updates |

**One-liner stack:** Expo + Next.js + Postgres/Supabase + Stripe, all TypeScript, deployed on Vercel + EAS.

---

## 2. Database Schema

### Core Tables (SQL)

```sql
-- Users & Auth
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  email_confirmed_at timestamptz,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free','core','crew','scale','enterprise')),
  subscription_status text not null default 'trial'
    check (subscription_status in ('trial','active','past_due','cancelled')),
  trial_started_at timestamptz default now(),
  trial_expires_at timestamptz default now() + interval '14 days',
  storage_used_bytes bigint not null default 0,
  storage_limit_bytes bigint not null default 1099511627776, -- 1TB for core+
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on users (email);
create index on users (subscription_tier);

-- Team members
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references users(id) on delete cascade, -- the owner/contractor
  role text not null default 'crew_member'
    check (role in ('contractor','crew_member','supervisor','admin')),
  status text not null default 'active'
    check (status in ('active','inactive','pending_invite')),
  invited_at timestamptz,
  invited_by_id uuid references users(id) on delete set null,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  total_hours_today numeric not null default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);
create index on team_members (account_id, status);
create index on team_members (user_id);

-- Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade, -- creator/owner
  name text not null,
  description text,
  address text,
  latitude numeric,
  longitude numeric,
  status text not null default 'active'
    check (status in ('active','archived','completed')),
  start_date date not null,
  end_date date,
  photo_count integer not null default 0,
  document_count integer not null default 0,
  total_storage_used bigint not null default 0,
  crew_ids uuid[] not null default array[]::uuid[], -- denormalized for perf
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on projects (user_id, status);
create index on projects (user_id, start_date);
create index on projects using gist(ll_to_earth(latitude, longitude)) where latitude is not null; -- geo index

-- Photos
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by_id uuid not null references users(id) on delete restrict,
  storage_path text not null, -- 'projects/{project_id}/{uuid}.jpg'
  file_size bigint not null,
  mime_type text not null default 'image/jpeg',
  width integer,
  height integer,
  duration_ms integer, -- if video
  latitude numeric,
  longitude numeric,
  captured_at timestamptz not null,
  is_video boolean not null default false,
  is_synced boolean not null default true,
  is_pending_upload boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on photos (project_id, captured_at);
create index on photos (uploaded_by_id);
create index on photos (is_synced, created_at);

-- Annotations (pin, measure, draw, text on photos)
create table if not exists annotations (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  type text not null
    check (type in ('pin','measure','draw','text','voice')),
  coordinates jsonb not null, -- {x, y, ...} for line/polygon
  label text,
  measurement_value numeric, -- distance/area
  measurement_unit text check (measurement_unit in ('ft','m','sq_ft','sq_m')),
  voice_transcript text,
  created_by_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index on annotations (photo_id);

-- Comments on photos or projects
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  text text not null,
  mentions uuid[] not null default array[]::uuid[], -- user IDs mentioned with @
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (photo_id is not null and project_id is null) or
    (photo_id is null and project_id is not null)
  )
);
create index on comments (photo_id);
create index on comments (project_id);
create index on comments (user_id);

-- Comment reactions (emoji)
create table if not exists comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null, -- "👍", "❤️", etc.
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, emoji)
);

-- Checklists (Crew tier+)
create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by_id uuid not null references users(id) on delete restrict,
  template_id uuid, -- ref to saved template
  title text not null,
  description text,
  assigned_to_id uuid references users(id) on delete set null,
  status text not null default 'not_started'
    check (status in ('not_started','in_progress','completed','overdue')),
  due_date date,
  is_reusable boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index on checklists (project_id, status);
create index on checklists (assigned_to_id);

-- Checklist items
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  title text not null,
  description text,
  is_completed boolean not null default false,
  completed_by_id uuid references users(id) on delete set null,
  completed_at timestamptz,
  required boolean not null default true,
  order_index integer not null
);
create index on checklist_items (checklist_id);

-- Tags for photos/projects
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  color text, -- hex color
  icon text, -- emoji or icon name
  created_at timestamptz not null default now(),
  unique (user_id, name) -- per-user tags
);
create index on tags (project_id);

-- Photo-tag association
create table if not exists photo_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (photo_id, tag_id)
);

-- Documents (uploaded or scanned)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by_id uuid not null references users(id) on delete restrict,
  title text not null,
  storage_path text not null,
  file_type text not null, -- pdf, image, scan
  file_size bigint not null,
  source text not null default 'upload'
    check (source in ('upload','scan','external_link')),
  created_at timestamptz not null default now(),
  is_archived boolean not null default false
);
create index on documents (project_id);

-- Reports (generated from photos + metadata)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by_id uuid not null references users(id) on delete restrict,
  template_id uuid, -- ref to report template
  title text not null,
  selected_photo_ids uuid[] not null,
  notes text,
  status text not null default 'draft'
    check (status in ('draft','ready','sent','archived')),
  pdf_storage_path text, -- generated PDF location
  share_token text unique, -- guest access link
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);
create index on reports (project_id);
create index on reports (created_by_id);
create index on reports (share_token);

-- Proposals (Scale+ feature)
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by_id uuid not null references users(id) on delete restrict,
  template_id uuid,
  client_name text not null,
  client_email text,
  client_phone text,
  subtotal_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  deposit_requested_cents integer,
  status text not null default 'draft'
    check (status in ('draft','sent','viewed','accepted','rejected')),
  pdf_storage_path text,
  share_token text unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  viewed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index on proposals (project_id);
create index on proposals (created_by_id);

-- Proposal line items (Sept 2026: per-line markup)
create table if not exists proposal_line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  description text not null,
  quantity numeric not null,
  unit_cost_cents integer not null,
  markup_percent numeric not null default 0,
  calculated_amount_cents integer not null, -- qty * unit_cost * (1 + markup%)
  is_taxable boolean not null default true,
  photo_ids uuid[] not null default array[]::uuid[],
  order_index integer not null
);
create index on proposal_line_items (proposal_id);

-- Subscriptions (Stripe-managed)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_product_id text,
  tier text not null default 'free'
    check (tier in ('free','core','crew','scale','enterprise')),
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on subscriptions (stripe_customer_id);

-- API Keys (for integrations)
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  key_hash text not null unique, -- hashed, not stored in plain
  scopes text[] not null, -- ['read:projects','write:photos']
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on api_keys (user_id);

-- Notifications (chat mentions, assignments, activity)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  actor_id uuid references users(id) on delete set null, -- who triggered it
  type text not null
    check (type in ('mention','task_assigned','photo_uploaded','checklist_due','comment','reaction')),
  related_entity_id uuid, -- photo_id, checklist_id, comment_id
  related_entity_type text, -- photo, checklist, comment
  read_at timestamptz,
  created_at timestamptz not null default now(),
  content text
);
create index on notifications (user_id, read_at);

-- RLS Policies Summary (Supabase)
-- - Users can read their own row + team members (in same account)
-- - Users can only access projects they own or are invited to (via team_members)
-- - Photos/comments/etc inherit project access via project_id
-- - Reports/proposals visible only to creator + project team
```

### Indexes Summary
- **Foreign keys:** All indexed
- **Filters:** `user_id`, `project_id`, `status`, `captured_at`, `is_synced` all indexed
- **Sorts:** `created_at`, `captured_at`, `start_date` indexed
- **Geo:** Postgres earth cube for location-based queries
- **Full-text:** On projects.name, photos storage_path (optional Algolia for scale)

### RLS Access Control
**Strategy:** Row-level security on Supabase (policies), not app-layer checks.

```sql
-- Example: users can only read projects they own or are team members of
create policy "users_read_own_projects" on projects
  for select using (
    auth.uid() = user_id or
    auth.uid() in (
      select user_id from team_members where account_id = projects.user_id
    )
  );

create policy "users_read_project_photos" on photos
  for select using (
    project_id in (
      select id from projects where auth.uid() = user_id or
        auth.uid() in (select user_id from team_members where account_id = projects.user_id)
    )
  );
```

---

## 3. API Routes

### Authentication
```
POST /api/auth/signup
  Input: {email, password, full_name}
  Output: {user, session}
  Access: Public
  Flow: F1 (onboarding)

POST /api/auth/login
  Input: {email, password}
  Output: {user, session}
  Access: Public

POST /api/auth/refresh
  Input: {refresh_token}
  Output: {access_token, expires_in}
  Access: Authenticated (refresh token)

POST /api/auth/logout
  Output: {}
  Access: Authenticated

POST /api/auth/reset-password
  Input: {email}
  Output: {message}
  Access: Public (email-based)

GET /api/auth/me
  Output: {user, subscription, storage_used}
  Access: Authenticated
```

### Projects
```
GET /api/projects
  Query: {skip, limit, status, search}
  Output: {projects: [{id, name, address, photo_count, start_date, crew_ids}]}
  Access: Authenticated (own projects)
  Flow: F1 (dashboard)

POST /api/projects
  Input: {name, address, latitude, longitude, start_date, crew_ids}
  Output: {project}
  Access: Authenticated
  Flow: F1 (create project)

GET /api/projects/{id}
  Output: {project, photos, documents, checklists, team_members}
  Access: Authenticated (project team)
  Flow: F1, F2, F3

PATCH /api/projects/{id}
  Input: {name, description, status, end_date, crew_ids}
  Output: {project}
  Access: Authenticated (creator only)

DELETE /api/projects/{id}
  Output: {}
  Access: Authenticated (creator only)
```

### Photos
```
POST /api/photos/upload
  Input: FormData {project_id, file, latitude, longitude, captured_at, voice_note?}
  Output: {photo, upload_id}
  Access: Authenticated
  Flow: F1 (capture & upload)
  Note: Resumable upload via Tus protocol

GET /api/photos/{id}
  Output: {photo, annotations, comments, reactions}
  Access: Authenticated (project team)
  Flow: F2 (annotation detail)

PATCH /api/photos/{id}
  Input: {is_flagged, captured_at, coordinates}
  Output: {photo}
  Access: Authenticated (uploader)

DELETE /api/photos/{id}
  Output: {}
  Access: Authenticated (uploader or project owner)

POST /api/photos/batch-tag
  Input: {photo_ids: [], tag_ids: []}
  Output: {success, count}
  Access: Authenticated
  Flow: F2 (bulk tag)
```

### Annotations
```
POST /api/photos/{id}/annotations
  Input: {type, coordinates, label, measurement_value?, voice_transcript?}
  Output: {annotation}
  Access: Authenticated (project team)
  Flow: F2 (annotate)

DELETE /api/annotations/{id}
  Output: {}
  Access: Authenticated (creator only)
```

### Comments & Chat
```
POST /api/comments
  Input: {photo_id | project_id, text, mentions: []}
  Output: {comment, mentions_notified}
  Access: Authenticated (project team)
  Flow: F2 (comment), F6 (chat)
  Note: Triggers @mention notifications

GET /api/projects/{id}/chat
  Query: {skip, limit}
  Output: {comments: [...], next_cursor}
  Access: Authenticated
  Flow: F6 (chat history)

POST /api/comments/{id}/reactions
  Input: {emoji}
  Output: {reaction}
  Access: Authenticated
  Flow: F6 (emoji reactions, Sept 2026)

DELETE /api/comments/{id}/reactions/{emoji}
  Output: {}
  Access: Authenticated (reactor only)
```

### Checklists (Crew+)
```
POST /api/checklists
  Input: {project_id, title, items: [{title, required}], assigned_to_id?, due_date?, template_id?}
  Output: {checklist}
  Access: Authenticated (Crew+ tier)
  Flow: F3 (create checklist)

GET /api/checklists/{id}
  Output: {checklist, items}
  Access: Authenticated (project team)
  Flow: F3 (tracker)

PATCH /api/checklists/{id}
  Input: {status, assigned_to_id, due_date}
  Output: {checklist}
  Access: Authenticated (assigned or creator)

POST /api/checklists/{id}/items/{item_id}/complete
  Input: {}
  Output: {item}
  Access: Authenticated (assigned or project owner)
  Flow: F3 (mark complete)

POST /api/checklists/save-as-template
  Input: {checklist_id, name}
  Output: {template}
  Access: Authenticated (checklist creator)
```

### Reports
```
POST /api/reports
  Input: {project_id, template_id, title, selected_photo_ids: [], notes}
  Output: {report, generation_job_id}
  Access: Authenticated (project team)
  Flow: F4 (report builder)
  Background: Trigger.dev job generates PDF

GET /api/reports/{id}
  Output: {report, pdf_url, pages}
  Access: Authenticated (creator or project team) | Guest (via share_token)
  Flow: F4 (report view)

POST /api/reports/{id}/share
  Input: {share_type: 'email' | 'link' | 'pdf'}
  Output: {share_link | email_sent}
  Access: Authenticated
  Flow: F4 (share report)

POST /api/reports/{id}/send-email
  Input: {recipient_email, message}
  Output: {sent}
  Access: Authenticated
  Background: Resend email job
```

### Proposals (Scale+)
```
POST /api/proposals
  Input: {project_id, template_id, client_name, client_email, client_phone, line_items: [{description, qty, unit_cost_cents, markup_percent, is_taxable, photo_ids}]}
  Output: {proposal}
  Access: Authenticated (Scale+ tier)
  Flow: F5 (proposal builder)

PATCH /api/proposals/{id}
  Input: {client_email, client_phone, line_items, deposit_requested_cents}
  Output: {proposal, total_cents}
  Access: Authenticated (creator)
  Note: Recalculates totals with tax per item

POST /api/proposals/{id}/send
  Input: {recipient_email}
  Output: {sent_at}
  Access: Authenticated
  Background: Resend + Stripe integration for deposit collection
  Flow: F5

GET /api/proposals/{id}
  Output: {proposal, line_items}
  Access: Authenticated (creator) | Guest (via share_token)
  Flow: F5

DELETE /api/proposals/{id}
  Output: {}
  Access: Authenticated (creator)
```

### Documents
```
POST /api/documents/upload
  Input: FormData {project_id, file, title?, source}
  Output: {document}
  Access: Authenticated
  Flow: F2 (upload doc)

GET /api/projects/{id}/documents
  Output: {documents: [...]}
  Access: Authenticated (project team)

POST /api/documents/batch-move
  Input: {document_ids: [], project_id}
  Output: {moved}
  Access: Authenticated
  Flow: F2 (bulk move, Sept 2026)

DELETE /api/documents/{id}
  Output: {}
  Access: Authenticated (uploader or project owner)
```

### Team Management
```
GET /api/team
  Output: {members: [{user_id, full_name, role, status, clock_in_at}]}
  Access: Authenticated
  Flow: F6 (team view)

POST /api/team/invite
  Input: {email, role}
  Output: {invite_token}
  Access: Authenticated (Crew+ tier, account owner)
  Background: Send email invite

POST /api/team/{member_id}/role
  Input: {role}
  Output: {member}
  Access: Authenticated (account owner)

DELETE /api/team/{member_id}
  Output: {}
  Access: Authenticated (account owner)

POST /api/clock-in
  Input: {project_id?}
  Output: {clock_in_at}
  Access: Authenticated (team member)
  Flow: F6 (clock in/out)

POST /api/clock-out
  Output: {total_hours_today}
  Access: Authenticated
```

### Subscriptions & Billing
```
GET /api/subscription
  Output: {subscription, tier, usage, next_invoice}
  Access: Authenticated
  Flow: Settings

POST /api/subscription/upgrade
  Input: {tier}
  Output: {checkout_url}
  Access: Authenticated
  Integration: Stripe Checkout

POST /api/webhooks/stripe
  Input: {type, data} (Stripe event)
  Output: {received}
  Access: Public (Stripe signature verification)
  Background: Update subscription tier in DB
```

### Real-time Subscriptions (Supabase)
```
Realtime channels (WebSocket):
  - projects/{project_id}/photos → new photo, photo updated
  - projects/{project_id}/chat → new comment, emoji reaction added
  - projects/{project_id}/presence → team member online/offline, clock in/out
  - user/{user_id}/notifications → mentions, assignments
  - live-feed → all team photos across projects
```

### Webhooks Out
```
POST https://external-api.example.com/webhooks/photo
  Event: photo.uploaded
  Payload: {photo_id, project_id, uploaded_by_id, storage_url}
  Used for: Zapier, third-party integrations

Scheduled jobs (Trigger.dev / Vercel Cron):
  - process-reports: Generate PDFs for queued reports (every 5 min)
  - sync-offline-photos: Batch upload pending photos (every 2 min)
  - daily-summary-email: Email digest of team activity (8am UTC)
  - cleanup-old-shares: Delete expired share links (daily)
  - update-subscription-status: Sync Stripe status (daily)
```

---

## 4. Hard Constraints & Gotchas

### **Time Zones & DST**
- All times stored in UTC (`timestamptz`); convert to user's timezone on display
- Store user timezone in `users.timezone`; use for clock-in/out and report dates
- DST transitions: use `AT TIME ZONE` in queries for user-local time ranges

### **Offline & Sync**
- **Photo queue:** Photos captured offline stored in local SQLite (Expo); UUID generated locally
- **Conflict resolution:** Last-write-wins on annotations; photo metadata conflicts resolved by server timestamp
- **Retries:** Exponential backoff on upload failure; manual sync trigger in UI
- **Queue idempotency:** Deduplicate by UUID; server rejects duplicate uploads

### **Real-time Sync**
- **WebSocket drop handling:** Client reconnects automatically; re-fetches missed messages from server
- **Presence:** User disconnects if no heartbeat for 30s; presence updated on projects/{id}/presence channel
- **Chat typing indicator:** Throttled to 1 per second; cleared after 5s of inactivity
- **Emoji reactions:** Optimistic UI; server revalidates on response

### **File Size & Uploads**
- **Photo limits:** Max 50MB per file; encourage compression (recommend 12MP @ 80% JPEG)
- **Resumable uploads:** Use Tus protocol with 1MB chunks; retry failed chunks
- **Storage quota:** Track in `users.storage_used_bytes`; warn at 80%, block at 100%
- **Cleanup:** Soft-delete photos; hard-delete after 30 days via cron

### **Concurrency & Race Conditions**
- **Proposal line item total:** Use database-side calculation (SQL function) to avoid race conditions
- **Checklist progress:** Aggregate item completion server-side, not client
- **Photo upload & project sync:** Lock row during upload to avoid duplicate increments
- **Notification creation:** Idempotent by entity ID + type; use `ON CONFLICT DO UPDATE`

### **Email Deliverability**
- **SPF/DKIM/DMARC:** Configure for Resend domain; monitor bounce rate
- **Unsubscribe links:** Include in all emails (legal requirement)
- **Retry:** Resend automatically retries transient failures (5xx)
- **Bounce handling:** Listen to Resend webhooks; disable user email if hard-bounce

### **Rate Limiting**
- **API:** 1000 requests/min per user (Vercel rate limiting)
- **Photo uploads:** Max 5 concurrent; queue the rest
- **Chat:** 100 messages/min per user (spam prevention)
- **Report generation:** 1 concurrent per user; queue the rest

### **Search**
- **Full-text:** Postgres `tsvector` on projects.name, photo captions via annotations
- **Scale to Algolia:** Once queries slow; index projects, photos, documents
- **Tags:** Exact match only; case-insensitive

### **GDPR / Data Privacy**
- **Deletion:** Cascade delete on users; soft-delete photos (retain 30 days then purge)
- **Export:** Endpoint to export all user data (projects, photos, documents) as JSON
- **Consent:** Store in `users.privacy_consent_at`; no data processing without it
- **Retention:** Keep deleted project data for 90 days (legal hold), then purge

### **Multi-tenancy**
- **Account isolation:** `user_id` is the tenant; all queries filtered by auth.uid()
- **Shared photos:** Not supported initially; each photo owned by single user/project
- **Team access:** Via `team_members` table; many-to-one with account owner

### **LiDAR (Scale+)**
- **Device support:** iPhone 12 Pro+ and newer only; fallback to manual measurement for older devices
- **Accuracy:** ±10cm for rooms <10m; degrade gracefully
- **Export:** Save measurements as image + metadata JSON

---

## 5. Build Order & Milestones

### **Milestone 0: Vertical Slice (Week 1–2)**
**Goal:** End-to-end proof of concept; ugly but working.

**Screens:** S01 (login), S02 (dashboard), S03 (project detail), S04 (camera), S06 (gallery)

**Tables:** `users`, `projects`, `photos`

**Routes:**
- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/projects`, `GET /api/projects`, `GET /api/projects/{id}`
- `POST /api/photos/upload`, `GET /api/photos/{id}`
- Supabase Storage integration

**Infrastructure:**
- Supabase project (Postgres + Auth + Storage)
- Expo app with camera module
- Next.js API routes boilerplate
- Basic auth flow (email/password)

**Deliverable:** User can sign up, create a project, take a photo, view gallery.

---

### **Milestone 1: Core Loop + Chat (Week 3–4)**
**Goal:** Add annotation, comments, team presence.

**Screens Added:** S05 (annotation), S07 (chat), S13 (team)

**Tables Added:** `annotations`, `comments`, `comment_reactions`, `team_members`, `notifications`

**Routes Added:**
- `POST /api/photos/{id}/annotations`, `DELETE /api/annotations/{id}`
- `POST /api/comments`, `GET /api/projects/{id}/chat`
- `POST /api/comments/{id}/reactions`
- Real-time subscriptions (WebSocket)

**Features:**
- Photo annotation tools (pin, measure, draw, text)
- In-project chat with @mentions
- Emoji reactions on comments
- Team member list & presence

**Deliverable:** Contractor can annotate photos and chat with team in real-time.

---

### **Milestone 2: Checklists + Reports (Week 5–6)**
**Goal:** Crew tier features; basic reporting.

**Screens Added:** S08 (checklist editor), S09 (tracker), S10 (report builder), S11 (report view)

**Tables Added:** `checklists`, `checklist_items`, `tags`, `photo_tags`, `reports`

**Routes Added:**
- `POST /api/checklists`, `GET /api/checklists/{id}`, `PATCH /api/checklists/{id}`
- `POST /api/checklists/{id}/items/{item_id}/complete`
- `POST /api/reports`, `GET /api/reports/{id}`, `POST /api/reports/{id}/share`

**Background Jobs:**
- `process-reports`: Generate PDF from photos + template (Trigger.dev)
- Report generation with pdf-lib or Puppeteer

**Features:**
- Create checklists; assign to crew; reusable templates
- Mark items complete; track progress
- Select photos, add notes, generate PDF report
- Share report via email or guest link

**Deliverable:** Crew can assign checklists; contractor can generate and share photo reports.

---

### **Milestone 3: Documents + Proposals (Week 7–8)**
**Goal:** Scale tier; invoicing pipeline.

**Screens Added:** S12 (proposal builder), S15 (documents)

**Tables Added:** `documents`, `proposals`, `proposal_line_items`, `subscriptions`

**Routes Added:**
- `POST /api/documents/upload`, `GET /api/projects/{id}/documents`
- `POST /api/proposals`, `PATCH /api/proposals/{id}`, `POST /api/proposals/{id}/send`
- `GET /api/subscription`, `POST /api/subscription/upgrade`

**Background Jobs:**
- `process-proposals`: Generate proposal PDF + send email
- Stripe webhook handler for subscription events

**Features:**
- Upload/scan documents; bulk move
- Create proposals with photos, line items, per-line markup, tax
- Email proposals to client; optional deposit collection via Stripe
- Subscription tier upgrades (Stripe)

**Deliverable:** Contractor can create invoices and request deposits from clients.

---

### **Milestone 4: Offline + Mobile Polish (Week 9–10)**
**Goal:** Offline-first photo capture; performance optimization.

**Screens Modified:** S04 (enhanced camera), S06 (sync status)

**Tables Added:** Local SQLite schema (Expo)

**Features:**
- Offline photo capture; queue for sync
- "Pending sync" badge on queued photos
- Manual sync trigger; automatic sync on network restore
- Photo compression before upload
- RLS policies on all tables

**Background Jobs:**
- `sync-offline-photos`: Batch upload pending photos
- Conflict resolution for concurrent edits

**Testing:** Simulate offline mode; verify sync on reconnect.

**Deliverable:** User can work offline; photos queue and sync automatically.

---

### **Milestone 5: Polish + Scale (Week 11–12)**
**Goal:** Performance, monitoring, edge cases.

**Features:**
- Full-text search (Postgres or Algolia)
- Push notifications (Firebase Cloud Messaging for Android; APNs for iOS via Expo)
- Dark mode support
- Accessibility (VoiceOver)
- Error handling & Sentry monitoring
- Analytics (PostHog)
- Rate limiting
- GDPR data export & deletion

**Testing:**
- Load testing (1000 concurrent users)
- Photo stress test (large files, slow network)
- Real-time chat stress (100 simultaneous users in project)

**Deliverable:** Production-ready app.

---

## 6. Riskiest Parts

1. **Real-time Sync & Offline Queue** – WebSocket reconnection + offline-first strategy is complex; test early with unreliable network (airplane mode toggle). Risk: Data loss if queue clears unexpectedly.

2. **Photo Upload Performance** – Large files (50MB+) on slow networks timeout or fail. Risk: Users abandon app if upload > 2 min. Mitigation: resumable uploads (Tus), client-side compression, progress feedback.

3. **PDF Report Generation** – Dynamic layouts, multi-page documents, image embedding scales poorly. Risk: Slow generation time at scale. Mitigation: Use Puppeteer on edge function; pre-render templates; cache static assets.

---

## Next Steps

1. **Start Milestone 0** – Set up Supabase, Expo, Next.js; implement login and photo upload.
2. **Run `/replica-design`** – Design the UI/UX for S01–S06 (core loop).
3. **Iterate on architecture** – Adjust based on design feedback and early performance testing.
