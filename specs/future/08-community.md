# Spec 08 — Community Gallery & Remixing

**Depends on:** 07-sharing (project serialization), 05-cosmo-ai (Cosmo explains)
**Outcome:** Users can sign up, share projects to a public gallery, browse and search others' projects, and remix them — with content moderation in place.

---

## What to Build

The full community experience. This is what makes Tinker a creative ecosystem instead of just a solo tool. A kid opens Tinker, browses the gallery, finds something cool, hits "Remix", and makes it their own.

**Read `docs/community-architecture.md` first** — it has the database schema, auth flow, Supabase setup, and all the detailed design.

---

## Prerequisites

Before implementing this spec:
1. Create a Supabase project
2. Set up the database tables from `docs/community-architecture.md`
3. Configure Row-Level Security policies
4. Add Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Install `@supabase/supabase-js`

---

## Tasks

### 1. Supabase client

Create `src/community/client.ts`:
- Initialize the Supabase client with the URL and anon key from env vars
- Export the client instance for use across the community module
- Handle connection errors gracefully

### 2. Authentication

Create `src/community/auth.ts`:
- `signUpWithEmail(email, password, displayName)` — create account
- `signInWithEmail(email, password)` — login
- `signInWithGoogle()` — OAuth login
- `signOut()` — clear session
- `getCurrentUser()` — return the current user or null
- `onAuthStateChange(callback)` — subscribe to auth changes

Create `src/store/auth.ts` (Zustand store):
- `user: User | null`
- `isLoading: boolean`
- `signUp`, `signIn`, `signOut` actions that wrap the auth functions

Create `src/components/Community/AuthModal.tsx`:
- Tabbed: "Sign In" / "Sign Up"
- Sign up form: display name, email, password
- Age question: "How old are you?" dropdown (for COPPA)
  - Under 13: show parent email field, send consent email
  - 13+: standard sign-up
- Google sign-in button
- Form validation with clear error messages
- After sign-up: "Welcome to Tinker, {displayName}! 🎉"

### 3. Share to gallery (upgrade Share modal)

Update the Share modal from spec 07:
- Keep the existing link/file sharing (works without account)
- Add a new section: "Share to the Tinker Gallery" (requires sign-in)
  - If not signed in: "Sign in to share with the community" button → opens AuthModal
  - If signed in: show the gallery sharing form
- Gallery sharing form:
  - Project name (pre-filled)
  - Description (text area, optional, Cosmo can suggest)
  - Tags (multi-select: Game, Animation, Music, Story, Art, Tool, Other)
  - [Share to Gallery] button
- On share:
  - Upload project data to Supabase `projects` table
  - Generate and upload thumbnail to Supabase Storage
  - Set `moderation_status = 'pending'`
  - Show success: "Your project is being reviewed and will appear in the gallery soon!"
- Auto-moderation: scan name, description, and "say" block contents for profanity before upload

### 4. Gallery page

Create `src/components/Community/Gallery.tsx`:
- Accessible from a "Community" or "Explore" button in the toolbar
- Replaces the editor view (like navigating to a new page — use client-side routing)

Layout:
```
┌──────────────────────────────────────────────┐
│  [← Back to Editor]      [Search 🔍]  [👤]  │
├──────────────────────────────────────────────┤
│                                              │
│  ★ Featured                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │     │ │     │ │     │ │     │  →         │
│  │card │ │card │ │card │ │card │            │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  🔥 Trending                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │     │ │     │ │     │ │     │  →         │
│  │card │ │card │ │card │ │card │            │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  🆕 New                                      │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │     │ │     │ │     │ │     │  →         │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  Tags: [Game] [Animation] [Music] [Story]    │
└──────────────────────────────────────────────┘
```

### 5. Project card component

Create `src/components/Community/ProjectCard.tsx`:
- Thumbnail image (from Supabase Storage)
- Project name
- Author display name
- Stats: ❤️ like count, 🔀 remix count
- Hover: slight scale-up, show "Open" overlay
- Click: navigate to project viewer

### 6. Project viewer

Create `src/components/Community/ProjectViewer.tsx`:
- Full view of a shared project:

```
┌──────────────────────────────────────────────┐
│  [← Back to Gallery]                         │
├──────────────────────────────────────────────┤
│                                              │
│  "Space Adventure"                           │
│  by @coolcoder42 · 3 days ago                │
│  Tags: [Game] [Animation]                    │
│                                              │
│  ┌────────────────────────────┐              │
│  │                            │              │
│  │    [Sprite Stage Preview]  │              │
│  │                            │              │
│  │   [▶ Run]     [■ Stop]    │              │
│  └────────────────────────────┘              │
│                                              │
│  "Fly through space and dodge asteroids!"    │
│                                              │
│  [🔀 Remix]  [❤️ Like (23)]  [🏠 See Inside]│
│  [⚑ Report]                                 │
│                                              │
│  ── Remixes (7) ──                           │
│  ┌─────┐ ┌─────┐ ┌─────┐                    │
│  │card │ │card │ │card │  →                 │
│  └─────┘ └─────┘ └─────┘                    │
│                                              │
└──────────────────────────────────────────────┘
```

- **Run:** execute the project in a read-only sprite stage (sandboxed)
- **See Inside:** open a read-only view of the script canvas (blocks visible but not editable)
  - Kid can click any block → Cosmo explains what it does
- **Remix:** fork the project into the editor with `remix_of` set
  - Pre-fills the project name as "{name} (remix)"
  - Cosmo greets: "This is a remix of Space Adventure by coolcoder42! What do you want to change?"
- **Like:** toggle like (requires sign-in)
- **Report:** open report modal (requires sign-in)

### 7. Search

Create search functionality:
- Search bar in the gallery header
- Full-text search across project name, description, and tags
- Use Postgres `to_tsvector` / `to_tsquery` via a Supabase RPC function:
  ```sql
  create function search_projects(query text)
  returns setof projects as $$
    select * from projects
    where is_public = true
      and moderation_status = 'approved'
      and (
        to_tsvector('english', name || ' ' || coalesce(description, ''))
        @@ plainto_tsquery('english', query)
        or query = any(tags)
      )
    order by like_count desc, created_at desc
    limit 50;
  $$ language sql;
  ```
- Show results in a grid of ProjectCards
- Empty state: "No projects found. Try a different search?"

### 8. Remix system

Create `src/community/projects.ts`:
- `remixProject(projectId: string): Project` — fetch the project, create a copy with `remix_of` set
- Increment `remix_count` on the original project
- The remix is a full, independent copy — editing it doesn't affect the original
- Show remix lineage: "Remixed from {original} by {author}" with a link

### 9. User profiles

Create `src/components/Community/ProfilePage.tsx`:
- Display name, avatar, join date
- Grid of the user's shared projects
- Remix count (how many of their projects were remixed)
- No follower count, no social graph (keep it light)
- If viewing your own profile: [Edit Profile] button

### 10. Client-side routing

Add `react-router-dom` for navigation between:
- `/` → Editor (the main app)
- `/explore` → Gallery
- `/project/:id` → Project viewer
- `/profile/:id` → User profile
- `/studio/:id` → Studio page (stretch)

The editor state persists when navigating to/from the gallery (Zustand stores survive route changes).

### 11. Content moderation

Create `src/community/moderation.ts`:
- `scanContent(text: string): { clean: boolean, flaggedWords: string[] }` — check against a profanity word list
- `scanProject(project: SharedProject): ModerationResult` — scan name, description, all "say" block contents, sprite names
- If any content is flagged: project stays in `moderation_status = 'pending'` and doesn't appear publicly
- Clean projects are auto-approved (`moderation_status = 'approved'`)

Report modal:
- Reason dropdown: "Inappropriate content", "Scary or violent", "Spam", "Copying my project", "Other"
- Optional details text area
- Submit creates a row in the `reports` table
- 3+ reports from different users → auto-hide project

### 12. Gallery state store

Create `src/store/community.ts`:
- `featuredProjects`, `trendingProjects`, `recentProjects` — cached lists
- `searchResults`, `searchQuery`
- `selectedProject` — for the viewer
- `isLoading`, `error`
- Actions: `fetchFeatured()`, `fetchTrending()`, `search(query)`, `likeProject(id)`, `remixProject(id)`

---

## Acceptance Criteria

- [ ] Users can sign up with email or Google
- [ ] Under-13 sign-up requires parental email
- [ ] Signed-in users can share projects to the gallery
- [ ] Gallery shows featured, trending, and recent projects
- [ ] Project cards show thumbnail, name, author, like/remix counts
- [ ] Clicking a card opens the project viewer
- [ ] "Run" plays the project in a sandboxed stage
- [ ] "See Inside" shows a read-only script canvas
- [ ] "Remix" creates a copy in the editor with remix attribution
- [ ] Likes work (toggle on/off, count updates)
- [ ] Search returns relevant results
- [ ] Profanity in project names/descriptions is caught before publishing
- [ ] Report button works, auto-hides after 3 reports
- [ ] Navigation between editor and gallery preserves editor state
- [ ] Anonymous users can browse and run projects (no sign-in required)
- [ ] Signed-out users see "Sign in" prompts for like/remix/share actions
