# Database Migrations

## Quick Start

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase  # macOS
# or
npm install -g supabase  # Linux/Other
```

### 2. Login
```bash
supabase login
```
Follow the prompt to authenticate.

### 3. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### 4. Push Migrations
```bash
npm run db:push
```

---

## All Migration Commands

```bash
# Push all pending migrations to production
npm run db:push

# Pull latest schema from production
npm run db:pull

# Create new migration
npm run db:migration my_feature_name

# Reset local database (local dev only)
npm run db:reset

# Check Supabase link status
supabase status
```

---

## Migration Files

All migrations live in `supabase/migrations/`:
```
supabase/migrations/
├── 001_create_folders.sql
├── 002_add_feature_x.sql
└── ...
```

Each migration is timestamped and numbered. Supabase runs them in order.

---

## Creating New Migrations

```bash
npm run db:migration add_user_roles
```

This creates: `supabase/migrations/20261027120000_add_user_roles.sql`

Edit the file, then run:
```bash
npm run db:push
```

---

## Current Migrations

| Migration | Purpose |
|-----------|---------|
| `001_create_folders.sql` | Create folders table + RLS policies |

---

## Troubleshooting

### "Not linked to a project"
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### "Permission denied: Invalid access token"
```bash
supabase logout
supabase login
```

### "Migration failed"
Check the error message in the console. Common issues:
- RLS policies not applied
- Foreign key constraints violated
- Table already exists

---

## Best Practices

1. ✅ Create one migration per feature
2. ✅ Use meaningful names
3. ✅ Test locally before pushing to production
4. ✅ Include RLS policies in migrations
5. ❌ Don't edit migrations after pushing to production
6. ❌ Don't manually modify schema in dashboard (pull first)

---

See `SUPABASE_SETUP.md` for full setup guide.
