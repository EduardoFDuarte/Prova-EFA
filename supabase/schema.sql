-- ============================================================
-- Evolution Fencing Academy Circuit — Supabase Schema
-- Correr no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensão de UUID
create extension if not exists "pgcrypto";

-- ─── Events ──────────────────────────────────────────────────────────────────
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  date        date not null,
  status      text not null default 'open' check (status in ('open', 'running', 'finished')),
  created_at  timestamptz default now()
);

-- ─── Registrations ───────────────────────────────────────────────────────────
create table if not exists registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid references events(id) on delete cascade,
  club_name     text not null,
  athlete_name  text not null,
  birth_year    int  not null,
  category      text not null check (category in (
                  'benjamins_individual', 'benjamins_teams',
                  'infantis_individual',  'infantis_teams')),
  is_federated  boolean not null default false,
  has_insurance boolean not null default false,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  token         text not null,
  created_at    timestamptz default now()
);

-- ─── Poules ──────────────────────────────────────────────────────────────────
create table if not exists poules (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events(id) on delete cascade,
  category     text not null,
  poule_number int  not null,
  track        text,
  created_at   timestamptz default now()
);

-- ─── Poule Memberships ───────────────────────────────────────────────────────
create table if not exists poule_memberships (
  id              uuid primary key default gen_random_uuid(),
  poule_id        uuid references poules(id) on delete cascade,
  registration_id uuid references registrations(id) on delete cascade,
  position        int not null default 0
);

-- ─── Bouts ───────────────────────────────────────────────────────────────────
create table if not exists bouts (
  id          uuid primary key default gen_random_uuid(),
  poule_id    uuid references poules(id) on delete cascade,
  athlete_a_id uuid references registrations(id),
  athlete_b_id uuid references registrations(id),
  score_a     int,
  score_b     int,
  completed   boolean not null default false,
  created_at  timestamptz default now()
);

-- ─── Elimination Matches ─────────────────────────────────────────────────────
create table if not exists elimination_matches (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events(id) on delete cascade,
  category     text not null,
  round        int  not null,   -- 1 = final, 2 = semi-final, etc.
  match_number int  not null,
  athlete_a_id uuid references registrations(id),
  athlete_b_id uuid references registrations(id),
  score_a      int,
  score_b      int,
  completed    boolean not null default false,
  winner_id    uuid references registrations(id),
  created_at   timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Leitura pública para todas as tabelas (portal Live)
alter table events             enable row level security;
alter table registrations      enable row level security;
alter table poules             enable row level security;
alter table poule_memberships  enable row level security;
alter table bouts              enable row level security;
alter table elimination_matches enable row level security;

-- Políticas de leitura pública (anon)
create policy "Public read events"              on events              for select using (true);
create policy "Public read registrations"       on registrations       for select using (true);
create policy "Public read poules"              on poules              for select using (true);
create policy "Public read poule_memberships"   on poule_memberships   for select using (true);
create policy "Public read bouts"               on bouts               for select using (true);
create policy "Public read elimination_matches" on elimination_matches  for select using (true);

-- Políticas de escrita (anon pode inserir/atualizar — proteção feita no frontend)
-- Em produção, substitui estas por políticas baseadas em JWT / service_role
create policy "Anon insert registrations" on registrations for insert with check (true);
create policy "Anon update registrations" on registrations for update using (true);
create policy "Anon insert events"        on events        for insert with check (true);
create policy "Anon insert poules"        on poules        for insert with check (true);
create policy "Anon delete poules"        on poules        for delete using (true);
create policy "Anon update poules"        on poules        for update using (true);
create policy "Anon insert memberships"   on poule_memberships for insert with check (true);
create policy "Anon delete memberships"   on poule_memberships for delete using (true);
create policy "Anon insert bouts"         on bouts         for insert with check (true);
create policy "Anon update bouts"         on bouts         for update using (true);
create policy "Anon insert elim"          on elimination_matches for insert with check (true);
create policy "Anon update elim"          on elimination_matches for update using (true);
create policy "Anon delete elim"          on elimination_matches for delete using (true);

-- ─── Realtime ─────────────────────────────────────────────────────────────────
-- Habilitar Realtime para as tabelas necessárias no portal Live
-- (Fazer também no Supabase Dashboard → Database → Replication)
alter publication supabase_realtime add table bouts;
alter publication supabase_realtime add table elimination_matches;
alter publication supabase_realtime add table poules;
