-- Create folders table
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  parent_folder_id uuid references folders(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes
create index folders_project_id_idx on folders(project_id);
create index folders_user_id_idx on folders(user_id);
create index folders_parent_folder_id_idx on folders(parent_folder_id);

-- Row Level Security
alter table folders enable row level security;

create policy "Users can read folders in their projects"
  on folders for select
  using (auth.uid() = user_id);

create policy "Users can insert folders in their projects"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own folders"
  on folders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on folders for delete
  using (auth.uid() = user_id);

-- Add folder_id to photos table
alter table photos add column folder_id uuid references folders(id) on delete set null;
create index photos_folder_id_idx on photos(folder_id);
