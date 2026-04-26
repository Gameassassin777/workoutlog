-- TropicalFit D1 Migration v2
-- Run: wrangler d1 execute tropicalfit --remote --file=cloudflare/migrate_v2.sql --config cloudflare/wrangler.toml

-- AI usage rate-limiting table
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id  TEXT NOT NULL,
  date_str TEXT NOT NULL,
  count    INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date_str)
);
