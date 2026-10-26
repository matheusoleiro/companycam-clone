-- CompanyCam Clone – PostgreSQL Schema
-- Target: Supabase (Postgres 14+)
-- Run as: Initial migration or via Prisma/Drizzle migration system

-- Enable extensions (uuid-ossp should be available by default in Supabase)
-- Note: earthdistance and cube are optional and not required for basic functionality

-- ============================================================================
-- USERS & AUTH
-- ============================================================================

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
  trial_expires_at timestamptz default (now() + interval '14 days'),
  storage_used_bytes bigint not null default 0,
  storage_limit_bytes bigint not null default 1099511627776, -- 1TB
  timezone text default 'UTC',
  privacy_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_users_email on users (email);
create index idx_users_subscription_tier on users (subscription_tier);
create index idx_users_deleted_at on users (deleted_at);

-- ============================================================================
-- TEAM MEMBERS
-- ============================================================================

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references users(id) on delete cascade,
  role text not null default 'crew_member'
    check (role in ('contractor','crew_member','supervisor','admin')),
  status text not null default 'active'
    check (status in ('active','inactive','pending_invite')),
  invited_at timestamptz,
  invited_by_id uuid references users(id) on delete set null,
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  total_hours_today numeric default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, account_id)
);

create index idx_team_members_account_id on team_members (account_id, status);
create index idx_team_members_user_id on team_members (user_id);
create index idx_team_members_clock_in on team_members (clock_in_at) where clock_in_at is not null;

-- ============================================================================
-- PROJECTS
-- ============================================================================

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
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
  crew_ids uuid[] not null default array[]::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_projects_user_id on projects (user_id, status);
create index idx_projects_start_date on projects (user_id, start_date);
-- Geolocation index (requires earthdistance extension - optional)
-- create index idx_projects_location on projects using gist(ll_to_earth(latitude, longitude))
--   where latitude is not null and longitude is not null;

-- ============================================================================
-- PHOTOS
-- ============================================================================

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by_id uuid not null references users(id) on delete restrict,
  storage_path text not null unique,
  file_size bigint not null,
  mime_type text not null default 'image/jpeg',
  width integer,
  height integer,
  duration_ms integer,
  latitude numeric,
  longitude numeric,
  captured_at timestamptz not null,
  is_video boolean not null default false,
  is_synced boolean not null default true,
  is_pending_upload boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_photos_project_id on photos (project_id, captured_at);
create index idx_photos_uploaded_by_id on photos (uploaded_by_id);
create index idx_photos_is_synced on photos (is_synced, created_at) where is_synced = false;
create index idx_photos_captured_at on photos (captured_at);

-- ============================================================================
-- ANNOTATIONS
-- ============================================================================

create table if not exists annotations (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  type text not null
    check (type in ('pin','measure','draw','text','voice')),
  coordinates jsonb not null,
  label text,
  measurement_value numeric,
  measurement_unit text
    check (measurement_unit in ('ft','m','sq_ft','sq_m')),
  voice_transcript text,
  created_by_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_annotations_photo_id on annotations (photo_id);
create index idx_annotations_created_by_id on annotations (created_by_id);

-- ============================================================================
-- COMMENTS & REACTIONS
-- ============================================================================

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  text text not null,
  mentions uuid[] not null default array[]::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (
    (photo_id is not null and project_id is null) or
    (photo_id is null and project_id is not null)
  )
);

create index idx_comments_photo_id on comments (photo_id);
create index idx_comments_project_id on comments (project_id);
create index idx_comments_user_id on comments (user_id);
create index idx_comments_created_at on comments (project_id, created_at);

create table if not exists comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, emoji)
);

create index idx_comment_reactions_comment_id on comment_reactions (comment_id);

-- ============================================================================
-- TAGS
-- ============================================================================

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  color text,
  icon text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index idx_tags_project_id on tags (project_id);

create table if not exists photo_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (photo_id, tag_id)
);

create index idx_photo_tags_photo_id on photo_tags (photo_id);
create index idx_photo_tags_tag_id on photo_tags (tag_id);

-- ============================================================================
-- CHECKLISTS (Crew+)
-- ============================================================================

create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by_id uuid not null references users(id) on delete restrict,
  template_id uuid,
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

create index idx_checklists_project_id on checklists (project_id, status);
create index idx_checklists_assigned_to_id on checklists (assigned_to_id);
create index idx_checklists_due_date on checklists (due_date) where status != 'completed';

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

create index idx_checklist_items_checklist_id on checklist_items (checklist_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by_id uuid not null references users(id) on delete restrict,
  title text not null,
  storage_path text not null unique,
  file_type text not null
    check (file_type in ('pdf','image','scan')),
  file_size bigint not null,
  source text not null default 'upload'
    check (source in ('upload','scan','external_link')),
  created_at timestamptz not null default now(),
  is_archived boolean not null default false
);

create index idx_documents_project_id on documents (project_id);
create index idx_documents_uploaded_by_id on documents (uploaded_by_id);

-- ============================================================================
-- REPORTS
-- ============================================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by_id uuid not null references users(id) on delete restrict,
  template_id uuid,
  title text not null,
  selected_photo_ids uuid[] not null,
  notes text,
  status text not null default 'draft'
    check (status in ('draft','ready','sent','archived')),
  pdf_storage_path text,
  share_token text unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index idx_reports_project_id on reports (project_id);
create index idx_reports_created_by_id on reports (created_by_id);
create index idx_reports_share_token on reports (share_token);

-- ============================================================================
-- PROPOSALS (Scale+)
-- ============================================================================

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

create index idx_proposals_project_id on proposals (project_id);
create index idx_proposals_created_by_id on proposals (created_by_id);
create index idx_proposals_share_token on proposals (share_token);

create table if not exists proposal_line_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  description text not null,
  quantity numeric not null,
  unit_cost_cents integer not null,
  markup_percent numeric not null default 0,
  calculated_amount_cents integer not null,
  is_taxable boolean not null default true,
  photo_ids uuid[] not null default array[]::uuid[],
  order_index integer not null
);

create index idx_proposal_line_items_proposal_id on proposal_line_items (proposal_id);

-- ============================================================================
-- SUBSCRIPTIONS (Stripe)
-- ============================================================================

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

create index idx_subscriptions_stripe_customer_id on subscriptions (stripe_customer_id);
create index idx_subscriptions_user_id on subscriptions (user_id);

-- ============================================================================
-- API KEYS
-- ============================================================================

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  scopes text[] not null default array[]::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_api_keys_user_id on api_keys (user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  actor_id uuid references users(id) on delete set null,
  type text not null
    check (type in ('mention','task_assigned','photo_uploaded','checklist_due','comment','reaction')),
  related_entity_id uuid,
  related_entity_type text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  content text
);

create index idx_notifications_user_id on notifications (user_id, read_at);
create index idx_notifications_created_at on notifications (created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
alter table users enable row level security;
alter table projects enable row level security;
alter table photos enable row level security;
alter table comments enable row level security;
alter table checklists enable row level security;
alter table proposals enable row level security;
alter table team_members enable row level security;

-- Users can read their own row
create policy "users_read_own" on users
  for select using (auth.uid() = id);

-- Users can read team members in their account or if they are the team member
create policy "team_members_read" on team_members
  for select using (
    auth.uid() = user_id or
    auth.uid() = account_id
  );

-- Users can only read projects they own or are team members of
create policy "projects_read" on projects
  for select using (
    auth.uid() = user_id or
    auth.uid() in (
      select user_id from team_members where account_id = projects.user_id and status = 'active'
    )
  );

-- Users can read photos in projects they have access to
create policy "photos_read" on photos
  for select using (
    project_id in (
      select id from projects where
        auth.uid() = user_id or
        auth.uid() in (
          select user_id from team_members where account_id = projects.user_id and status = 'active'
        )
    )
  );

-- Users can read comments in projects they have access to
create policy "comments_read" on comments
  for select using (
    (photo_id in (
      select id from photos where project_id in (
        select id from projects where
          auth.uid() = user_id or
          auth.uid() in (
            select user_id from team_members where account_id = projects.user_id and status = 'active'
          )
      )
    )) or
    (project_id in (
      select id from projects where
        auth.uid() = user_id or
        auth.uid() in (
          select user_id from team_members where account_id = projects.user_id and status = 'active'
        )
    ))
  );

-- Users can read checklists in projects they have access to
create policy "checklists_read" on checklists
  for select using (
    project_id in (
      select id from projects where
        auth.uid() = user_id or
        auth.uid() in (
          select user_id from team_members where account_id = projects.user_id and status = 'active'
        )
    )
  );

-- Users can read proposals in projects they have access to
create policy "proposals_read" on proposals
  for select using (
    project_id in (
      select id from projects where
        auth.uid() = user_id or
        auth.uid() in (
          select user_id from team_members where account_id = projects.user_id and status = 'active'
        )
    )
  );

-- End of schema
