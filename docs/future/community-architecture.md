# Community Architecture — Tinker

## Overview

The community layer turns Tinker from a solo tool into a creative ecosystem. Kids share projects, discover what others have built, remix them, and learn by exploring.

Built in phases. Phase 1 has zero backend. Phases 2+ use Supabase.

---

## Phase 1: Share Links (No Backend)

### How It Works

Projects are serialized to JSON and encoded into shareable URLs.

```
https://tinker.app/p#eyJuYW1lIjoiTXkgUHJvamVjdCIs...
```

**Flow:**
1. Kid clicks "Share" in the toolbar
2. Project JSON is compressed (LZ-string) and base64-encoded into a URL fragment
3. A modal shows the link with a "Copy" button
4. Anyone with the link can open it — the app decodes the fragment and loads the project

**Why URL fragments (#)?**
- Fragment data never hits the server — it stays in the browser
- No backend needed
- No storage costs
- Links work forever (the project data *is* the link)

**Limitations:**
- URL length (~2KB safe limit for most browsers, ~8KB for modern ones)
- Large projects may exceed this — fall back to a downloadable `.tinker` file
- No browsing or discovery — you need the link

### File Export/Import (Fallback)

- **Export:** Download project as `my-project.tinker` (JSON file with `.tinker` extension)
- **Import:** Drag a `.tinker` file onto the app or use File → Open
- The `.tinker` format is just JSON matching the `Project` type, optionally gzipped

### Project Serialization Format

```typescript
interface SharedProject {
  version: 1;                            // format version for future compat
  name: string;
  author?: string;                       // display name, optional
  description?: string;
  createdAt: string;                     // ISO date
  project: Project;                      // full project state
  thumbnail?: string;                    // base64 encoded small PNG
}
```

---

## Phase 2: Community Gallery (Supabase Backend)

### Infrastructure

| Service | Provider | Purpose |
|---|---|---|
| Auth | Supabase Auth | Sign up, login, session management |
| Database | Supabase Postgres | Projects, profiles, likes, remix chains |
| Storage | Supabase Storage | Thumbnails, custom sprites |
| Edge Functions | Supabase Edge Functions | Moderation, search, AI explanations |
| Hosting | Existing (GitHub Pages / Vercel) | Frontend stays static |

### Database Schema

```sql
-- Users
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  project_count int default 0,
  is_moderator boolean default false
);

-- Shared projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) not null,
  name text not null,
  description text,
  project_data jsonb not null,              -- the full Project JSON
  thumbnail_url text,
  is_public boolean default false,
  is_featured boolean default false,
  remix_of uuid references projects(id),    -- null if original
  view_count int default 0,
  like_count int default 0,
  remix_count int default 0,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  moderation_status text default 'pending'  -- pending | approved | rejected
);

-- Likes
create table likes (
  user_id uuid references profiles(id),
  project_id uuid references projects(id),
  created_at timestamptz default now(),
  primary key (user_id, project_id)
);

-- Studios (curated collections)
create table studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  creator_id uuid references profiles(id),
  is_official boolean default false,
  cover_image_url text,
  created_at timestamptz default now()
);

create table studio_projects (
  studio_id uuid references studios(id),
  project_id uuid references projects(id),
  added_by uuid references profiles(id),
  added_at timestamptz default now(),
  primary key (studio_id, project_id)
);

-- Reports (content moderation)
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  project_id uuid references projects(id),
  reason text not null,
  details text,
  status text default 'open',              -- open | reviewed | dismissed
  created_at timestamptz default now()
);
```

### Row-Level Security (RLS)

```sql
-- Anyone can read public, approved projects
alter table projects enable row level security;
create policy "Public projects are viewable"
  on projects for select
  using (is_public = true and moderation_status = 'approved');

-- Users can only edit their own projects
create policy "Users can edit own projects"
  on projects for update
  using (auth.uid() = author_id);

-- Users can only delete their own projects
create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = author_id);
```

### API Endpoints (Supabase + Edge Functions)

| Action | Method | Endpoint | Auth required |
|---|---|---|---|
| Browse projects | GET | `/rest/v1/projects?is_public=true&order=created_at.desc` | No |
| Search projects | GET | `/rest/v1/rpc/search_projects?query=...` | No |
| Featured projects | GET | `/rest/v1/projects?is_featured=true` | No |
| Get project | GET | `/rest/v1/projects?id=eq.{id}` | No |
| Share project | POST | `/rest/v1/projects` | Yes |
| Update project | PATCH | `/rest/v1/projects?id=eq.{id}` | Yes (owner) |
| Like project | POST | `/rest/v1/likes` | Yes |
| Remix project | POST | `/functions/v1/remix` | Yes |
| Report project | POST | `/rest/v1/reports` | Yes |
| Get profile | GET | `/rest/v1/profiles?id=eq.{id}` | No |
| Get user's projects | GET | `/rest/v1/projects?author_id=eq.{id}` | No |

---

## Community Features — Detail

### Sharing Flow

```
Kid clicks "Share" button
        │
        ▼
┌──────────────────┐
│ Share Modal       │
│                   │
│ [Project Name]    │
│ [Description]     │  ← optional, Cosmo can suggest one
│ [Tags: ▼]         │  ← "game", "animation", "music", "story", etc.
│                   │
│ [Share publicly]  │  ← requires account (Phase 2)
│ [Copy link]       │  ← works without account (Phase 1)
│ [Download file]   │  ← works without account (Phase 1)
└──────────────────┘
```

### Remixing Flow

```
Kid opens a shared project
        │
        ▼
┌──────────────────────────┐
│ Project viewer            │
│                           │
│ "Space Adventure"         │
│ by @coolcoder42           │
│ ❤️ 23 likes  🔀 7 remixes │
│                           │
│ [▶ Run]  [See Inside]     │
│ [🔀 Remix]  [❤️ Like]     │
└──────────────────────────┘
        │
        ▼ (clicks Remix)
┌──────────────────────────┐
│ Opens in editor            │
│ Title: "Space Adventure    │
│         (remix)"           │
│ remix_of: original ID      │
│                           │
│ Cosmo: "This is a remix   │
│ of Space Adventure! What   │
│ do you want to change?"    │
└──────────────────────────┘
```

### "See Inside" + Cosmo Explains

When browsing a shared project, "See Inside" opens a read-only view of the script canvas. Cosmo can explain any block:

- Kid clicks on a block in the shared project
- Cosmo explains: "This 'repeat 10' block makes everything inside it happen 10 times. That's what makes the cat spin!"
- This turns every shared project into an interactive tutorial

### Discovery

The gallery supports multiple browse modes:

| Mode | Sort/Filter | Description |
|---|---|---|
| **Featured** | Curated by moderators | Best-of showcase, rotated weekly |
| **Trending** | Likes + views in last 7 days | What's popular right now |
| **Recent** | `created_at` desc | Newest first |
| **Search** | Full-text on name + description + tags | Find specific projects |
| **By tag** | Filter by tag | "Games", "Animations", "Music", etc. |
| **Remixes of...** | Filter by `remix_of` | See all remixes of a project |

---

## Authentication

### Sign-up Flow

```
[Sign up with Google]      ← one-click, easiest for kids
[Sign up with email]       ← requires parental email for under-13

→ Choose a display name    ← no real names
→ Pick an avatar           ← pre-made options, no uploads for safety
→ Done!
```

### COPPA Compliance (Under 13)

- Age gate on sign-up: "How old are you?" (dropdown, not free-text)
- Under 13: requires a parent/guardian email
- Parent receives a verification email with consent form
- Account is limited until parental consent is confirmed
- No personal data collected beyond display name and parent email
- Parent can delete the account at any time

### Session Management

- Supabase handles sessions with JWT tokens
- Session persists across page reloads (stored in localStorage)
- Auto-refresh tokens before expiry
- Signing out clears the session and returns to anonymous browsing

---

## Content Moderation

### Automated (First Pass)

Before a project goes public:
1. Scan project name and description for profanity (word list + AI)
2. Scan "say" block contents for inappropriate text
3. Flag sprite names that may contain inappropriate content
4. If clean → auto-approve. If flagged → queue for human review.

### Community Reporting

- Every project has a "Report" button (flag icon)
- Reporter selects a reason: "Inappropriate content", "Scary/violent", "Spam", "Other"
- Reported projects are hidden until a moderator reviews
- Three reports from different users → auto-hide until reviewed

### Moderator Tools (Stretch)

- Dashboard for moderators to review flagged/reported content
- Approve / Reject / Ban user actions
- Moderators are trusted community members (by invitation)

---

## Directory Structure (Additions)

```
src/
├── community/
│   ├── client.ts           ← Supabase client setup
│   ├── auth.ts             ← Sign up, login, session hooks
│   ├── projects.ts         ← Share, browse, search, remix API calls
│   ├── moderation.ts       ← Report, content scanning
│   └── types.ts            ← Community-specific types
├── components/
│   ├── Community/
│   │   ├── Gallery.tsx         ← Browse/search shared projects
│   │   ├── ProjectCard.tsx     ← Thumbnail + title + stats card
│   │   ├── ProjectViewer.tsx   ← Full project view (run, see inside, remix)
│   │   ├── ShareModal.tsx      ← Share dialog
│   │   ├── ProfilePage.tsx     ← User profile with their projects
│   │   ├── StudioPage.tsx      ← Studio collection view
│   │   └── AuthModal.tsx       ← Sign up / login dialog
│   └── ...
├── store/
│   ├── community.ts        ← Gallery state, search, filters
│   ├── auth.ts             ← User session state
│   └── ...
```

---

## Key Decisions

1. **Supabase, not custom backend** — BaaS keeps infrastructure minimal. One service for auth + DB + storage + edge functions.
2. **Phase 1 has zero backend** — URL-encoded sharing works offline and costs nothing. Don't gate sharing behind sign-up.
3. **Remixes are first-class** — every remix links back to its parent. Remix chains are visible. This normalizes learning by copying and modifying.
4. **No DMs, no social graph pressure** — This is a creative tool, not a social network. No follower counts on profiles. Likes are low-key.
5. **Moderation before launch** — never launch a community feature without moderation in place. Kids' safety is non-negotiable.
