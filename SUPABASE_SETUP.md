# Supabase Setup Guide

## 1️⃣ Install Supabase CLI

### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

### Linux / Other
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## 2️⃣ Login to Supabase

```bash
supabase login
```

This will prompt you to create an access token at:
https://app.supabase.com/account/tokens

**Steps:**
1. Go to that URL
2. Create a new token with name "CLI"
3. Copy the token
4. Paste it in the terminal prompt

---

## 3️⃣ Link Project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

You can find `YOUR_PROJECT_ID` in your Supabase dashboard URL:
https://app.supabase.com/project/**YOUR_PROJECT_ID**/

---

## 4️⃣ Run Migrations

### Push migrations to production
```bash
supabase db push
```

### Create new migration locally
```bash
supabase migration new create_folders
```

This creates a new file in `supabase/migrations/` that you can edit.

---

## 5️⃣ Pull latest schema from production

If you made changes in the dashboard, sync them back:
```bash
supabase db pull
```

---

## Directory Structure

```
supabase/
├── migrations/
│   ├── 001_create_folders.sql
│   └── ...
├── config.toml
└── .env.local (git-ignored)
```

---

## Common Commands

| Command | What it does |
|---------|------------|
| `supabase status` | Check if linked to project |
| `supabase db push` | Push all migrations to production |
| `supabase db reset` | Reset local database (local dev only) |
| `supabase migration list` | List all migrations |
| `supabase migration new <name>` | Create new migration |

---

## Environment Variables

Create `.env.local` (git-ignored):
```bash
SUPABASE_ACCESS_TOKEN=your_token_here
```

Or export it:
```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
```

---

## Next Steps

After setup, run:
```bash
npm run db:push
```

This will execute the migration to create the folders table.
