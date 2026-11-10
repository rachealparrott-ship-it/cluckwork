CREATE TABLE public.incubators (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 12,
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
CREATE TABLE public.batches (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  incubator_id uuid NOT NULL,
  name text NOT NULL,
  set_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
CREATE TABLE public.eggs (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  batch_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  breed text NOT NULL DEFAULT '',
  breed_uncertain boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'unknown',
  updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
CREATE TABLE public.egg_events (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  egg_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  day integer NOT NULL,
  at bigint NOT NULL,
  updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);
CREATE TABLE public.push_tokens (
  token text PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  timezone text NOT NULL DEFAULT 'Europe/London',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.sent_push_reminders (
  batch_id uuid NOT NULL,
  kind text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (batch_id, kind)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.incubators, public.batches, public.eggs, public.egg_events, public.push_tokens TO authenticated;
GRANT ALL ON public.incubators, public.batches, public.eggs, public.egg_events, public.push_tokens, public.sent_push_reminders TO service_role;

ALTER TABLE public.incubators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eggs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egg_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_push_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own incubators" ON public.incubators FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own batches" ON public.batches FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own eggs" ON public.eggs FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own egg events" ON public.egg_events FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own push tokens" ON public.push_tokens FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE INDEX ON public.incubators (user_id, updated_at);
CREATE INDEX ON public.batches (user_id, updated_at);
CREATE INDEX ON public.batches (status);
CREATE INDEX ON public.eggs (user_id, updated_at);
CREATE INDEX ON public.egg_events (user_id, updated_at);
CREATE INDEX ON public.push_tokens (user_id);