CREATE TABLE IF NOT EXISTS public.game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL,
  winner_name text NOT NULL,
  winner_score integer NOT NULL CHECK (winner_score >= 0),
  teams jsonb NOT NULL,
  played_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "game_results_select_public"
  ON public.game_results
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS game_results_played_at_idx
  ON public.game_results (played_at DESC);
