-- Update RLS policies for folders to allow unauthenticated requests during development

-- Drop existing policies
drop policy if exists "Users can read folders in their projects" on folders;
drop policy if exists "Users can insert folders in their projects" on folders;
drop policy if exists "Users can update their own folders" on folders;
drop policy if exists "Users can delete their own folders" on folders;

-- Create new permissive policies for development
create policy "Allow read all folders"
  on folders for select
  using (true);

create policy "Allow insert folders"
  on folders for insert
  with check (true);

create policy "Allow update folders"
  on folders for update
  using (true);

create policy "Allow delete folders"
  on folders for delete
  using (true);
