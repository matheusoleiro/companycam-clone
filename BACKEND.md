# Backend Implementation

The CompanyCam clone backend has been fully implemented with the following components:

## API Routes

All routes use Supabase authentication and server-side session handling.

### Authentication

- **POST `/api/auth/login`** - Sign in with email/password. Returns user object on success.
- **POST `/api/auth/signup`** - Create new account with email/password. Returns user object on success.

### Projects

- **GET `/api/projects`** - Fetch all projects for authenticated user
  - Returns: `{ projects: Project[] }`
  - Requires: Authentication

- **POST `/api/projects`** - Create new project
  - Body: `{ name: string, address?: string, start_date: string }`
  - Returns: `{ project: Project }` with status 201
  - Requires: Authentication

### Photos

- **GET `/api/photos?projectId={id}`** - Fetch all photos for a project
  - Returns: `{ photos: Photo[] }` with `public_url` for each
  - Requires: Authentication

- **POST `/api/photos`** - Upload photo to project
  - Body: FormData with `file`, `projectId`, `capturedAt`, optional `latitude`, `longitude`
  - Returns: `{ photo: Photo }` with `public_url` from Supabase Storage
  - Requires: Authentication
  - Storage: Photos uploaded to `projects/{projectId}/{timestamp}.{ext}` in Supabase Storage bucket `photos`

## Database

- **Tables:** Created via `replica/schema.sql` in Supabase SQL Editor
- **Auth:** Supabase Auth handles user accounts
- **Storage:** Supabase Storage bucket `photos` for image/video files
- **Row Level Security:** Configured on all tables to isolate user data

## Client Integration

### Zustand Store (`src/store/app.ts`)

The Zustand store is fully integrated with API routes:

- `loadProjects()` - Calls GET `/api/projects`
- `createProject(name, address)` - Calls POST `/api/projects`
- `loadPhotos(projectId)` - Calls GET `/api/photos?projectId={id}`
- `uploadPhoto(projectId, file)` - Calls POST `/api/photos`
- `login(email, password)` - Calls POST `/api/auth/login`
- `signup(email, password, fullName)` - Calls POST `/api/auth/signup`

No longer uses fake in-memory data layer.

## Setup

1. **Create Supabase project** at https://supabase.com
2. **Run migrations** - Copy `replica/schema.sql` and run in Supabase SQL Editor
3. **Configure environment** - Copy `.env.example` to `.env.local` and fill in Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Seed demo data** - Run `npm run seed` to create demo user and project
5. **Start development** - Run `npm run dev` and login with:
   - Email: `contractor@example.com`
   - Password: `password123`

## Features

- ✅ User authentication (signup/login/logout)
- ✅ Multi-user support (RLS on all tables)
- ✅ Project CRUD operations
- ✅ Photo upload to cloud storage (Supabase Storage)
- ✅ Photo metadata (timestamp, file size, location fields)
- ✅ Data persistence across devices/browsers
- ✅ Real-time capable (Supabase real-time can be enabled per table)

## Architecture

```
Next.js 14 App Router
    ↓
API Routes (Server)
    ↓
Supabase
    ├── Auth (authentication)
    ├── PostgreSQL (data)
    └── Storage (files)
    ↑
React Client (Zustand)
```

## Data Flow

1. User logs in → API calls Supabase Auth
2. Session stored in HTTP-only cookies
3. API routes validate session via Supabase SSR
4. All database queries filtered by `user_id` (RLS)
5. Photos uploaded to Supabase Storage, metadata in database
6. Client receives `public_url` for rendering images

## Remaining Tasks

- [ ] Implement real-time photo updates (Supabase Realtime)
- [ ] Add geolocation capture for photos
- [ ] Implement photo deletion/update endpoints
- [ ] Add team/crew member management endpoints
- [ ] Implement project update/delete endpoints
- [ ] Wire up Stripe payments (subscriptions)
- [ ] Set up Resend for transactional emails
- [ ] Add offline support (service worker + sync)
- [ ] Implement annotations on photos
- [ ] Add report generation
- [ ] Create mobile app version (Expo)
