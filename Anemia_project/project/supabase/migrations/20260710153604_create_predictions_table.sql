/*
# Create predictions table (single-tenant, no auth)

1. New Tables
- `predictions`
  - `id` (uuid, primary key, default gen_random_uuid())
  - `predicted_hb` (numeric, not null) — predicted hemoglobin in g/dL
  - `severity` (text, not null) — one of Normal / Mild / Moderate / Severe
  - `confidence` (numeric, not null) — model confidence in [0,1]
  - `geo_risk_weight` (numeric, not null) — NFHS-5 derived weight in [0,1]
  - `age` (integer, nullable) — subject age in years
  - `sex` (text, nullable) — 'male' or 'female'
  - `state` (text, not null) — Indian state / UT used for geo-risk
  - `modality_flags` (jsonb, not null) — which modalities were available for this prediction
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `predictions`.
- Allow anon + authenticated CRUD because the data is intentionally public/shared (demo app, no sign-in).
3. Indexes
- Index on `created_at` for time-based queries.
- Index on `severity` for aggregation queries.
*/

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  predicted_hb numeric NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Normal','Mild','Moderate','Severe')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  geo_risk_weight numeric NOT NULL CHECK (geo_risk_weight >= 0 AND geo_risk_weight <= 1),
  age integer,
  sex text CHECK (sex IS NULL OR sex IN ('male','female')),
  state text NOT NULL,
  modality_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_severity ON predictions (severity);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);
