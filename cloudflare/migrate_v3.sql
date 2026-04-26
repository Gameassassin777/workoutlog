-- TropicalFit D1 Migration v3 — Reactions
-- Run: wrangler d1 execute tropicalfit --remote --file=cloudflare/migrate_v3.sql --config cloudflare/wrangler.toml

CREATE TABLE IF NOT EXISTS reactions (
  id         TEXT PRIMARY KEY,
  item_id    TEXT NOT NULL,
  item_type  TEXT NOT NULL,  -- 'feed' | 'chat'
  user_id    TEXT NOT NULL REFERENCES users(id),
  emoji      TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(item_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_reactions_item ON reactions(item_id);
