# 09 — Geography & Archaeology

Location data for map features and contextual study. Static import tables — no RLS.

---

```sql
-- ============================================================
-- GEOGRAPHIC LOCATIONS
-- Biblical locations with coordinates and descriptions
-- ============================================================
CREATE TABLE geographic_locations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  alternate_names text[],                 -- ['Zion', 'City of David', 'Jerusalem']
  modern_name     text,                   -- modern equivalent if known
  lat             numeric,
  lng             numeric,
  location_type   text,                   -- 'city', 'region', 'mountain', 'river', 'sea', 'wilderness'
  description     text,
  significance    text,                   -- theological/historical importance
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_geo_name ON geographic_locations(lower(name));
CREATE INDEX idx_geo_type ON geographic_locations(location_type);
CREATE INDEX idx_geo_names ON geographic_locations USING gin(alternate_names);


-- ============================================================
-- PASSAGE LOCATIONS (link passages to geographic locations)
-- ============================================================
CREATE TABLE passage_locations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     uuid NOT NULL REFERENCES geographic_locations(id) ON DELETE CASCADE,
  book            text NOT NULL,
  chapter         integer NOT NULL,
  verse_start     integer,
  verse_end       integer,
  context_note    text,                   -- 'Jesus healed the blind man here'
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_passage_locations_passage ON passage_locations(book, chapter);
CREATE INDEX idx_passage_locations_loc ON passage_locations(location_id);


-- ============================================================
-- ARCHAEOLOGICAL SITES
-- Relevant digs, discoveries, artifacts that illuminate Scripture
-- ============================================================
CREATE TABLE archaeological_sites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  location_id     uuid REFERENCES geographic_locations(id),
  discovery_year  integer,
  excavated_by    text,
  description     text,
  biblical_link   text,                   -- brief note on how this connects to Scripture
  scripture_refs  text[],
  image_url       text,
  meta            jsonb DEFAULT '{}'
);

CREATE INDEX idx_arch_refs ON archaeological_sites USING gin(scripture_refs);


-- ============================================================
-- USER MAP DISCOVERIES (Fog of War — per-user location reveals)
-- ============================================================
-- Populated when a user reads a chapter that mentions a location.
-- One row per (user × location). Location becomes visible on their map.
CREATE TABLE user_map_discoveries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id     uuid NOT NULL REFERENCES geographic_locations(id),
  discovered_via_book    text,           -- which book's reading triggered this
  discovered_via_chapter integer,
  discovered_at   timestamptz DEFAULT now(),
  meta            jsonb DEFAULT '{}',
  UNIQUE(user_id, location_id)
);

CREATE INDEX idx_map_discoveries_user ON user_map_discoveries(user_id);

ALTER TABLE user_map_discoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own map" ON user_map_discoveries USING (auth.uid() = user_id);
```
