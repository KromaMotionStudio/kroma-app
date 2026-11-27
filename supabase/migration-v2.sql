-- ============================================================
--  Kroma v2 : workflow complet (projets, timeline, storyboard,
--  production, stockage, moodboard partagé)
--  À lancer APRÈS schema.sql : Supabase > SQL Editor > New query > Run.
--  Le script peut être relancé sans risque.
-- ============================================================

-- 1. Prénom des membres du studio (pour « Bonjour Ilyane »)
alter table public.studio_members add column if not exists name text not null default '';

-- 2. Le projet devient le fil conducteur de toutes les étapes
alter table public.projects add column if not exists type text not null default 'motion2d';
alter table public.projects add column if not exists stage text not null default 'projet';
alter table public.projects add column if not exists status text not null default 'en_cours';
alter table public.projects add column if not exists deadline date;
alter table public.projects add column if not exists brief text not null default '';
alter table public.projects add column if not exists budget numeric(12,2);
alter table public.projects add column if not exists drive_url text not null default '';
alter table public.projects add column if not exists stage_dates jsonb not null default '{}'::jsonb;
alter table public.projects add column if not exists last_opened_at timestamptz;
alter table public.projects add column if not exists updated_at timestamptz not null default now();
alter table public.projects add column if not exists storyboard_token text
  default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

update public.projects
  set storyboard_token = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  where storyboard_token is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_type_chk') then
    alter table public.projects add constraint projects_type_chk
      check (type in ('motion2d', '3d', 'packshot', 'tournage'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_stage_chk') then
    alter table public.projects add constraint projects_stage_chk
      check (stage in ('projet', 'moodboard', 'storyboard', 'production', 'review', 'stockage'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_status_chk') then
    alter table public.projects add constraint projects_status_chk
      check (status in ('en_cours', 'livre', 'archive'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_storyboard_token_key') then
    alter table public.projects add constraint projects_storyboard_token_key unique (storyboard_token);
  end if;
end $$;

-- 3. Date de changement de statut d'une vidéo (notifications « version validée »)
alter table public.videos add column if not exists status_changed_at timestamptz;

create or replace function public.kroma_video_status_stamp()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists videos_status_stamp on public.videos;
create trigger videos_status_stamp before update on public.videos
  for each row execute function public.kroma_video_status_stamp();

create or replace function public.kroma_touch_updated()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.kroma_touch_updated();

-- 4. Storyboard
create table if not exists public.storyboard_frames (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  position int not null default 0,
  image text not null default '',
  body text not null default '' check (char_length(body) <= 4000),
  duration numeric(6,2) not null default 3 check (duration >= 0 and duration <= 3600),
  created_at timestamptz not null default now()
);

create table if not exists public.storyboard_comments (
  id uuid primary key default gen_random_uuid(),
  frame_id uuid not null references public.storyboard_frames(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  author text not null default '',
  author_kind text not null default 'studio' check (author_kind in ('studio', 'client')),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists storyboard_frames_project_idx on public.storyboard_frames(project_id, position);
create index if not exists storyboard_comments_frame_idx on public.storyboard_comments(frame_id);

-- 5. Production : tâches par scène, avec timer
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene text not null default '' check (char_length(scene) <= 120),
  title text not null check (char_length(title) between 1 and 300),
  assignee text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  seconds int not null default 0 check (seconds >= 0),
  started_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tasks_project_idx on public.tasks(project_id, position);

-- 6. Stockage : liens vers les fichiers (Google Drive), pas d'upload lourd
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null default 'final' check (kind in ('final', 'source', 'da', 'autre')),
  name text not null check (char_length(name) between 1 and 200),
  url text not null check (char_length(url) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists project_files_project_idx on public.project_files(project_id);

-- 7. Moodboard partagé entre associés (remplace le stockage local du navigateur)
create table if not exists public.moodboard_folders (
  id text primary key check (char_length(id) between 1 and 64),
  name text not null check (char_length(name) between 1 and 120),
  client text not null default '',
  brief text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  created bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at timestamptz not null default now()
);

create table if not exists public.moodboard_items (
  id text primary key check (char_length(id) between 1 and 64),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists moodboard_folders_project_idx on public.moodboard_folders(project_id);

-- 8. Sécurité : mêmes règles que le reste, seul le studio lit et écrit
alter table public.storyboard_frames enable row level security;
alter table public.storyboard_comments enable row level security;
alter table public.tasks enable row level security;
alter table public.project_files enable row level security;
alter table public.moodboard_folders enable row level security;
alter table public.moodboard_items enable row level security;

drop policy if exists studio_all on public.storyboard_frames;
create policy studio_all on public.storyboard_frames
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.storyboard_comments;
create policy studio_all on public.storyboard_comments
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.tasks;
create policy studio_all on public.tasks
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.project_files;
create policy studio_all on public.project_files
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.moodboard_folders;
create policy studio_all on public.moodboard_folders
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.moodboard_items;
create policy studio_all on public.moodboard_items
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

-- 9. Storyboard : accès client par lien de partage (sans compte), même logique que la review
create or replace function public.storyboard_share_get(p_token text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'project', (
      select row_to_json(x) from (
        select p.id, p.name, p.client from public.projects p where p.storyboard_token = p_token
      ) x
    ),
    'frames', coalesce((
      select json_agg(row_to_json(f) order by f.position, f.created_at)
      from (
        select f.id, f.position, f.image, f.body, f.duration, f.created_at
        from public.storyboard_frames f join public.projects p on p.id = f.project_id
        where p.storyboard_token = p_token
      ) f
    ), '[]'::json),
    'comments', coalesce((
      select json_agg(row_to_json(c) order by c.created_at)
      from (
        select c.id, c.frame_id, c.body, c.author, c.author_kind, c.resolved, c.created_at
        from public.storyboard_comments c
        join public.storyboard_frames f on f.id = c.frame_id
        join public.projects p on p.id = f.project_id
        where p.storyboard_token = p_token
      ) c
    ), '[]'::json)
  )
  where char_length(coalesce(p_token, '')) >= 32
    and exists (select 1 from public.projects where storyboard_token = p_token);
$$;

create or replace function public.storyboard_share_comment(
  p_token text, p_frame uuid, p_body text, p_author text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.storyboard_comments;
begin
  if char_length(coalesce(p_token, '')) < 32 or not exists (
    select 1 from public.storyboard_frames f join public.projects p on p.id = f.project_id
    where f.id = p_frame and p.storyboard_token = p_token
  ) then
    raise exception 'Lien de partage invalide';
  end if;
  if char_length(trim(coalesce(p_body, ''))) = 0 then
    raise exception 'Commentaire vide';
  end if;
  insert into public.storyboard_comments (frame_id, body, author, author_kind)
  values (p_frame, left(trim(p_body), 4000), left(coalesce(nullif(trim(p_author), ''), 'Client'), 80), 'client')
  returning * into r;
  return row_to_json(r);
end;
$$;

revoke all on function public.storyboard_share_get(text) from public;
revoke all on function public.storyboard_share_comment(text, uuid, text, text) from public;
grant execute on function public.storyboard_share_get(text) to anon, authenticated;
grant execute on function public.storyboard_share_comment(text, uuid, text, text) to anon, authenticated;

-- 10. Images du storyboard : on autorise aussi PNG, WebP et GIF dans le stockage existant
update storage.buckets
  set allowed_mime_types = (
    select array_agg(distinct m) from unnest(
      coalesce(allowed_mime_types, array[]::text[]) || array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    ) m
  )
  where id = 'review';

-- 11. Temps réel : commentaires du storyboard et tâches
do $$
begin
  alter publication supabase_realtime add table public.storyboard_comments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 12. Facultatif : le prénom affiché sur l'accueil.
--     Remplace les e-mails par ceux de studio_members, puis lance.
-- ============================================================
-- update public.studio_members set name = 'Ilyane' where email = 'toi@tondomaine.com';
-- update public.studio_members set name = 'Alexandre' where email = 'associe@tondomaine.com';
