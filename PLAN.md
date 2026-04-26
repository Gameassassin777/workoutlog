# TropicalFit — Full Redesign & Social Plan
_Last updated: 2026-04-25_

---

## Navigation (5 tabs)

| Tab | Icon | Old name | Screen(s) |
|-----|------|----------|-----------|
| Home | 🏠 | Shore | Hero dashboard |
| Logs | 📋 | Logs + Stats merged | History list + Stats tabs |
| Social | 🌊 | (new) | Leaderboard + Feed + Chat |
| AI | 🤖 | Coach | AI coach chat |
| Settings | ⚙️ | Config | Settings + Profile |

---

## Screen Designs

### 1. HOME — Hero Dashboard

```
┌─────────────────────────────────┐
│  TropicalFit          🔔  [av] │  header: notif bell + avatar
│─────────────────────────────────│
│                                 │
│  Good morning, Calvin ☀️        │  greeting (time-based)
│  🌊 Wave Rider  ·  Lv 8         │  level pill (glass)
│  ██████████░░  1,240/1,600 XP  │  XP bar
│                                 │
│         ┌──────────┐            │
│         │          │            │
│         │ CHARACTER│            │  avatar — DiceBear SVG or
│         │  (svg)   │            │  AI portrait (Pollinations)
│         │          │            │  CSS idle float animation
│         └──────────┘            │
│                                 │
│  🔥 47 days    💪 128    📦 ↑12%│  streak · workouts · volume trend
│                                 │
│  ╔═══════════════════════════╗  │
│  ║   ⚡  START SESSION      ║  │  big primary CTA — aqua gradient
│  ╚═══════════════════════════╝  │
│                                 │
│  ─── Live ────────────────────  │
│  🏖️ island_monk crushed a PR   │  2-line social feed teaser
│  ⚡ storm_surfer finished Push  │  tap → Social screen
│                                 │
└──[🏠]──[📋]──[🌊]──[🤖]──[⚙️]──┘
```

Key changes vs current:
- Character/avatar centered above CTA (replaces empty whitespace)
- Level/XP directly under greeting — always visible
- Stats condensed to one icon-pill row
- Social feed teaser at bottom to drive Social tab engagement
- Notification bell in header
- No "Profile" quick link — absorbed into avatar tap

---

### 2. LOGS — Combined History + Stats

Two tabs inside the screen (pill switcher, no nav change):

**History tab** (existing renderHistory, polished):
- Search bar stays
- Workout cards stay, get left accent color by muscle group focus
- Export button stays

**Stats tab** (existing renderStats, enhanced):
- Weekly volume bar chart (bigger, more visual)
- Muscle heatmap
- PRs list
- Streak calendar (heatmap GitHub-style for last 3 months)

```
┌─────────────────────────────────┐
│  Island Logs                    │
│  ┌──────────┬──────────────────┐│
│  │ History  │      Stats       ││  pill tab switcher
│  └──────────┴──────────────────┘│
│                                 │
│  [content of active tab]        │
│                                 │
└─────────────────────────────────┘
```

---

### 3. SOCIAL — New Screen

Three tabs: Leaderboard | Feed | Chat

**Leaderboard tab:**
```
  This Week        Resets in 3d 14h
  ┌────────────────────────────────┐
  │ 🥇 [av] island_deity  Lv16    │
  │         128,400 lbs  ⬆ 12%   │
  │────────────────────────────────│
  │ 🥈 [av] storm_surfer  Lv12    │
  │         95,000 lbs            │
  │────────────────────────────────│
  │ #14 [av] you          Lv8     │  ← your rank, always shown
  │         32,400 lbs            │
  └────────────────────────────────┘
```

**Feed tab:**
```
  ─── Now ──────────────────────
  🏖️ [av] wave_rider_99
         finished Push Day · 2m ago
         32,400 lbs · 4 exercises
  ──────────────────────────────
  🏆 [av] island_monk
         NEW PR — Bench 225 lbs · 5m
  ──────────────────────────────
  🔥 [av] tidal_beast
         60-day streak reached! · 1h
```

**Chat tab:**
```
  ─── Global Chat ───────────────
  [av] island_deity  3:42pm
       bro that PR felt amazing
  
  [av] wave_rider    3:44pm
       lets go!! what weight?
  
                 You  3:45pm
               225lbs finally   [av]
  ──────────────────────────────
  [Type a message...]      [→]
```

First-time user flow:
1. Tap Social tab → modal: "Choose your username to join the community"
2. Username input + avatar style picker
3. Pollinations.ai generates portrait from level + style choice (optional)
4. Username saved to settings, sent to server when backend is live

---

### 4. AI — Coach Chat (polished)

Minor changes to existing renderCoachChat():
- Cleaner header (no gear icon)
- Quick-prompt chips below the greeting bubble:
  - "Analyze last workout"
  - "What should I train today?"
  - "Help me hit a PR"
  - "Recovery advice"
- Typing indicator when AI is generating
- Chat sessions: show last 3 sessions at top, tap to resume

```
┌─────────────────────────────────┐
│  ← AI Coach                    │
│─────────────────────────────────│
│  [bubble] Hey! I'm your coach  │
│           Ask me anything...   │
│                                 │
│  [Analyze last] [What to train]│  quick chips
│  [Help me PR  ] [Recovery     ]│
│                                 │
│  [messages...]                  │
│                                 │
│  [Type anything...]        [→] │
└─────────────────────────────────┘
```

---

### 5. SETTINGS — Expanded

New sections added to existing settings:

**Profile section (new, at top):**
- Username input
- Avatar style picker (DiceBear styles: adventurer, pixel-art, lorelei, etc.)
- "Regenerate AI Portrait" button (calls Pollinations)
- Photo upload for img2img (requires Replicate key)

**Notifications section (new):**
- Enable push notifications toggle
- What to get notified about:
  - ☐ New chat messages
  - ☐ Weekly leaderboard results
  - ☐ Someone beats your streak
  - ☐ Workout reminder (set time)

**Social section (new):**
- Privacy: show volume on leaderboard (toggle)
- Privacy: show workouts in feed (toggle)
- Block list

---

## Push Notifications — Full Plan

### What triggers a push (requires server):
| Trigger | Who gets it | Message |
|---------|------------|---------|
| Workout complete | All followers | "💪 [user] finished [title]" |
| New PR | Global feed subscribers | "🏆 [user] hit a new [exercise] PR" |
| Chat message | All online users | "💬 [user]: [preview]" |
| Weekly board reset | All users | "🌊 New week! Board has reset" |
| Someone beats your streak | You | "🔥 [user] just passed your streak" |
| Workout reminder | You (scheduled) | "⏰ Time to hit the shore!" |

### How it works technically:
1. App requests notification permission on Social tab first open
2. Browser generates a push subscription (endpoint + keys)
3. Subscription sent to Cloudflare Worker → stored in D1
4. Server events trigger Worker to send Web Push to relevant subscriptions
5. Service worker receives `push` event, shows notification
6. Tapping notification deep-links to correct screen (chat, leaderboard, etc.)

### Phase 1 (no server): Local notifications only
- Workout rest timer done → local notification (already close to working)
- Daily workout reminder (user sets time in Settings)
- These use `Notification API` directly, no server needed

### Phase 2 (with server): Full Web Push
- VAPID key pair generated once on server
- Public key baked into app
- Full subscription flow
- All social triggers above

---

## Character System

### Tier 0 — DiceBear (ships immediately, zero cost)
```javascript
const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${username}`;
```
Styles to offer: `adventurer`, `pixel-art`, `lorelei`, `fun-emoji`, `bottts`
Avatar displayed as `<img>` on home screen, 96×96px, with CSS float animation.

### Tier 1 — Pollinations AI Portrait (free, no key)
```javascript
const prompt = `tropical beach warrior, ${levelTitle}, anime style, 
  ${dominantMuscleGroup} athlete, detailed portrait, 512x512`;
const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
```
Generated once, cached in IndexedDB. Regenerate button in Settings.
User can customize prompt via a "describe your character" text field.

### Tier 2 — Photo-to-character (user provides Replicate key)
Upload selfie → Replicate SDXL img2img → stylized beach warrior version.
Stored in IndexedDB. Opt-in, shown as upgrade path in Settings.

---

## Backend Plan — Cloudflare Workers + D1

### Endpoints:
```
POST /api/user/register    { username, avatar_url, push_sub? }
GET  /api/user/:id         → user profile + this-week stats

GET  /api/leaderboard      → top 20 users by weekly volume
POST /api/workout/log      { user_id, volume, exercises, prs[], timestamp }

GET  /api/feed             → last 50 activity items
POST /api/feed/item        (internal, called by workout/log)

GET  /api/chat?since=ts    → messages since timestamp
POST /api/chat             { user_id, text }

POST /api/push/subscribe   { user_id, subscription }
POST /api/push/send        (internal) { user_ids[], title, body, url }
```

### D1 Schema:
```sql
users(id, username, avatar_url, level, level_title, created_at)
workouts(id, user_id, volume, title, exercises_json, timestamp)
prs(id, user_id, exercise, weight, reps, unit, timestamp)
feed(id, user_id, type, text, timestamp)
chat(id, user_id, text, timestamp)
push_subs(id, user_id, endpoint, p256dh, auth, created_at)
```

---

## Implementation Phases

### Phase 1 — UI Redesign (no backend, all mock data) ← START HERE
- [ ] New 5-tab nav (Home, Logs, Social, AI, Settings)
- [ ] Home: hero layout, character placeholder, live feed teaser
- [ ] Logs: tab switcher (History | Stats) with existing content
- [ ] Social: full UI with mock leaderboard, feed, chat data
- [ ] AI: quick-prompt chips, typing indicator
- [ ] Settings: Profile section (username input, avatar picker)
- [ ] Push notification permission request UI

### Phase 2 — Character System
- [ ] DiceBear avatar on home screen
- [ ] Avatar shows in nav bar area + Social entries
- [ ] Pollinations portrait generation (text-to-image, cached)
- [ ] Regenerate button in Settings
- [ ] Username setup modal (first-launch)

### Phase 3 — Push Notifications (no server)
- [ ] Local notification: rest timer done
- [ ] Local notification: daily workout reminder
- [ ] Permission request flow integrated into Settings

### Phase 4 — Backend
- [ ] Cloudflare Worker + D1 setup
- [ ] User register/auth (username only, no email)
- [ ] Workout log endpoint (called on workout complete)
- [ ] Leaderboard endpoint
- [ ] Feed endpoint
- [ ] Chat endpoint (polling first, websocket later)

### Phase 5 — Server Push
- [ ] VAPID key generation
- [ ] Push subscription storage
- [ ] Server-side push on workout complete, PR, chat
- [ ] Weekly leaderboard reset cron (Cloudflare Cron Trigger)
- [ ] Deep-link from notification to correct screen

---

## CSS/Design Tokens needed for new components

```css
/* Tab switcher pill */
.tab-pill         /* container */
.tab-pill-item    /* individual tab */
.tab-pill-item.active

/* Social / leaderboard */
.leaderboard-row
.feed-item
.chat-bubble-global   /* different from AI chat bubbles */
.avatar-ring          /* colored ring around avatar by level */

/* Character display */
.character-container  /* floating on home screen */
.character-float      /* CSS keyframe idle animation */

/* Notification tray */
.notif-tray
.notif-item
.notif-badge          /* red dot on bell */
```

---

## File changes summary

| File | Change |
|------|--------|
| `index.html` | New 5-tab nav HTML, bump to v24 |
| `style.css` | New component styles above, v24 |
| `app.js` | New screens: renderLogs(), renderSocial(); redesign renderHome(), renderSettings() |
| `sw.js` | Add push event listener, bump cache v24 |
| `manifest.json` | Verify push notification fields present |
| `cloudflare/worker.js` | NEW — backend (Phase 4) |
| `cloudflare/schema.sql` | NEW — D1 schema (Phase 4) |
