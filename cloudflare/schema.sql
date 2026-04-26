-- TropicalFit D1 Schema
-- Run once: wrangler d1 execute tropicalfit --file=cloudflare/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  level       INTEGER DEFAULT 0,
  level_title TEXT DEFAULT 'Beach Bum',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workouts (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id),
  title          TEXT,
  volume         REAL DEFAULT 0,
  sets_completed INTEGER DEFAULT 0,
  exercises_json TEXT,   -- full exercise array as JSON
  week_start     TEXT,   -- ISO date of Monday for weekly leaderboard grouping
  logged_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS prs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  exercise   TEXT NOT NULL,
  weight     REAL,
  reps       INTEGER,
  unit       TEXT DEFAULT 'lbs',
  set_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feed (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  username   TEXT NOT NULL,
  avatar_url TEXT,
  type       TEXT NOT NULL,  -- 'workout' | 'pr' | 'streak' | 'join'
  text       TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  username   TEXT NOT NULL,
  avatar_url TEXT,
  text       TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS push_subs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  endpoint   TEXT NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, endpoint)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_workouts_user   ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_week   ON workouts(week_start);
CREATE INDEX IF NOT EXISTS idx_feed_created    ON feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created    ON chat(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_user       ON push_subs(user_id);
