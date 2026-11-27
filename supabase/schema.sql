-- ============================================================
--  Kroma Review : base de données
--  À coller dans Supabase > SQL Editor > New query, puis "Run".
--  Le script peut être relancé sans risque.
-- ============================================================

-- 1. Les membres du studio (seuls ces e-mails ont accès à l'espace studio)
create table if not exists public.studio_members (
  email text primary key
);

create or replace function public.is_studio()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.studio_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 2. Tables
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  client text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'review' check (status in ('review', 'changes', 'approved')),
  share_token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now()
);

create table if not exists public.versions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  n int not null,
  path text not null,
  thumb text,
  duration double precision,
  fps double precision not null default 25,
  width int,
  height int,
  size bigint,
  created_at timestamptz not null default now(),
  unique (video_id, n)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.versions(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  t double precision,
  body text not null check (char_length(body) between 1 and 4000),
  author text not null default '',
  author_kind text not null default 'studio' check (author_kind in ('studio', 'client')),
  drawing jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists videos_project_idx on public.videos(project_id);
create index if not exists versions_video_idx on public.versions(video_id);
create index if not exists comments_version_idx on public.comments(version_id);

-- 3. Sécurité : seul le studio lit et écrit directement dans les tables
alter table public.studio_members enable row level security;
alter table public.projects enable row level security;
alter table public.videos enable row level security;
alter table public.versions enable row level security;
alter table public.comments enable row level security;

drop policy if exists studio_read_members on public.studio_members;
create policy studio_read_members on public.studio_members
  for select to authenticated using (public.is_studio());

drop policy if exists studio_all on public.projects;
create policy studio_all on public.projects
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.videos;
create policy studio_all on public.videos
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.versions;
create policy studio_all on public.versions
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

drop policy if exists studio_all on public.comments;
create policy studio_all on public.comments
  for all to authenticated using (public.is_studio()) with check (public.is_studio());

-- 4. Accès client par lien de partage (sans compte)
create or replace function public.share_get(p_token text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'video', (
      select row_to_json(x) from (
        select v.id, v.title, v.status, v.created_at, p.name as project, p.client
        from public.videos v join public.projects p on p.id = v.project_id
        where v.share_token = p_token
      ) x
    ),
    'versions', coalesce((
      select json_agg(row_to_json(s) order by s.n)
      from public.versions s join public.videos v on v.id = s.video_id
      where v.share_token = p_token
    ), '[]'::json),
    'comments', coalesce((
      select json_agg(row_to_json(c) order by c.created_at)
      from public.comments c
      join public.versions s on s.id = c.version_id
      join public.videos v on v.id = s.video_id
      where v.share_token = p_token
    ), '[]'::json)
  )
  where char_length(coalesce(p_token, '')) >= 32
    and exists (select 1 from public.videos where share_token = p_token);
$$;

create or replace function public.share_comment(
  p_token text, p_version uuid, p_parent uuid, p_t double precision,
  p_body text, p_author text, p_drawing jsonb
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.comments;
begin
  if char_length(coalesce(p_token, '')) < 32 or not exists (
    select 1 from public.versions s join public.videos v on v.id = s.video_id
    where s.id = p_version and v.share_token = p_token
  ) then
    raise exception 'Lien de partage invalide';
  end if;
  if p_parent is not null and not exists (
    select 1 from public.comments where id = p_parent and version_id = p_version
  ) then
    raise exception 'Commentaire introuvable';
  end if;
  if p_drawing is not null and pg_column_size(p_drawing) > 200000 then
    raise exception 'Dessin trop lourd';
  end if;
  insert into public.comments (version_id, parent_id, t, body, author, author_kind, drawing)
  values (
    p_version, p_parent, p_t, left(trim(p_body), 4000),
    left(coalesce(nullif(trim(p_author), ''), 'Client'), 80), 'client', p_drawing
  )
  returning * into r;
  return row_to_json(r);
end;
$$;

create or replace function public.share_status(p_token text, p_status text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.videos;
begin
  if p_status not in ('changes', 'approved') then
    raise exception 'Statut non autorisé';
  end if;
  update public.videos set status = p_status
  where share_token = p_token and char_length(coalesce(p_token, '')) >= 32
  returning * into r;
  if r.id is null then
    raise exception 'Lien de partage invalide';
  end if;
  return json_build_object('status', r.status);
end;
$$;

revoke all on function public.share_get(text) from public;
revoke all on function public.share_comment(text, uuid, uuid, double precision, text, text, jsonb) from public;
revoke all on function public.share_status(text, text) from public;
grant execute on function public.share_get(text) to anon, authenticated;
grant execute on function public.share_comment(text, uuid, uuid, double precision, text, text, jsonb) to anon, authenticated;
grant execute on function public.share_status(text, text) to anon, authenticated;

-- 5. Stockage des vidéos (50 Mo max par fichier sur l'offre gratuite)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review', 'review', true, 52428800,
        array['video/mp4', 'video/quicktime', 'video/webm', 'image/jpeg'])
on conflict (id) do nothing;

drop policy if exists kroma_review_insert on storage.objects;
create policy kroma_review_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'review' and public.is_studio());

drop policy if exists kroma_review_select on storage.objects;
create policy kroma_review_select on storage.objects
  for select to authenticated using (bucket_id = 'review' and public.is_studio());

drop policy if exists kroma_review_update on storage.objects;
create policy kroma_review_update on storage.objects
  for update to authenticated using (bucket_id = 'review' and public.is_studio());

drop policy if exists kroma_review_delete on storage.objects;
create policy kroma_review_delete on storage.objects
  for delete to authenticated using (bucket_id = 'review' and public.is_studio());

-- 6. Commentaires en direct pour le studio
do $$
begin
  alter publication supabase_realtime add table public.comments;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 7. À MODIFIER : mets ici ton e-mail et celui de ton associé,
--    exactement ceux des comptes créés dans Authentication > Users.
-- ============================================================
insert into public.studio_members (email) values
  ('toi@tondomaine.com'),
  ('associe@tondomaine.com')
on conflict do nothing;
