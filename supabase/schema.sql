-- SimLegacy 3.0. Safe to re-run; requires Supabase project with Auth enabled.
create extension if not exists pgcrypto;
create table if not exists public.trees (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 description text not null default '',
 cover text not null default '',
 gallery jsonb not null default '[]'::jsonb,
 background_enabled boolean not null default false,
 people jsonb not null default '[]'::jsonb,
 public boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.trees add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.trees add column if not exists background_enabled boolean not null default false;
alter table public.trees add column if not exists style jsonb not null default '{}'::jsonb;
alter table public.trees add column if not exists layout_mode text not null default 'manual';
alter table public.trees add column if not exists heir_id text;
create index if not exists trees_owner_idx on public.trees(owner_id);
alter table public.trees enable row level security;
-- IMPORTANT: legacy public-read policy exposes private entries. Remove it and use public snapshots instead.
drop policy if exists "Read owned or public trees" on public.trees;
drop policy if exists "Read own trees" on public.trees;
create policy "Read own trees" on public.trees for select to authenticated using (auth.uid()=owner_id);
drop policy if exists "Insert own trees" on public.trees;
create policy "Insert own trees" on public.trees for insert to authenticated with check (auth.uid()=owner_id);
drop policy if exists "Update own trees" on public.trees;
create policy "Update own trees" on public.trees for update to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists "Delete own trees" on public.trees;
create policy "Delete own trees" on public.trees for delete to authenticated using (auth.uid()=owner_id);

-- Public snapshots deliberately omit notes, unpublished images/events/fields, and cross-dynasty private references.
create table if not exists public.public_tree_snapshots (
 id uuid primary key references public.trees(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 description text not null default '',
 cover text not null default '',
 author_name text not null default 'Автор',
 snapshot jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists snapshots_updated_idx on public.public_tree_snapshots(updated_at desc);
alter table public.public_tree_snapshots enable row level security;
drop policy if exists "Read published snapshots" on public.public_tree_snapshots;
create policy "Read published snapshots" on public.public_tree_snapshots for select to anon,authenticated using (true);
drop policy if exists "Publish own tree" on public.public_tree_snapshots;
create policy "Publish own tree" on public.public_tree_snapshots for insert to authenticated with check (
 auth.uid()=owner_id and exists (select 1 from public.trees t where t.id=public_tree_snapshots.id and t.owner_id=auth.uid() and t.public=true)
);
drop policy if exists "Update own published snapshot" on public.public_tree_snapshots;
create policy "Update own published snapshot" on public.public_tree_snapshots for update to authenticated using (auth.uid()=owner_id) with check (
 auth.uid()=owner_id and exists (select 1 from public.trees t where t.id=public_tree_snapshots.id and t.owner_id=auth.uid() and t.public=true)
);
drop policy if exists "Remove own snapshot" on public.public_tree_snapshots;
create policy "Remove own snapshot" on public.public_tree_snapshots for delete to authenticated using (auth.uid()=owner_id);

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null default 'Автор' check (char_length(username) between 1 and 64),
 bio text not null default '',avatar text not null default '',
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Read public profiles" on public.profiles;
create policy "Read public profiles" on public.profiles for select to anon,authenticated using (true);
drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles for insert to authenticated with check(auth.uid()=id);
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);

create table if not exists public.tree_likes (
 tree_id uuid not null references public.public_tree_snapshots(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(tree_id,user_id)
);
create index if not exists likes_tree_idx on public.tree_likes(tree_id);
alter table public.tree_likes enable row level security;
drop policy if exists "Read likes" on public.tree_likes;
create policy "Read likes" on public.tree_likes for select to anon,authenticated using(true);
drop policy if exists "Like tree" on public.tree_likes;
create policy "Like tree" on public.tree_likes for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Unlike tree" on public.tree_likes;
create policy "Unlike tree" on public.tree_likes for delete to authenticated using(auth.uid()=user_id);

create table if not exists public.tree_comments (
 id uuid primary key default gen_random_uuid(),
 tree_id uuid not null references public.public_tree_snapshots(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 author_name text not null default 'Автор',body text not null check(char_length(body) between 1 and 1000),
 created_at timestamptz not null default now()
);
create index if not exists comments_tree_idx on public.tree_comments(tree_id,created_at desc);
alter table public.tree_comments enable row level security;
drop policy if exists "Read comments" on public.tree_comments;
create policy "Read comments" on public.tree_comments for select to anon,authenticated using(true);
drop policy if exists "Add comment" on public.tree_comments;
create policy "Add comment" on public.tree_comments for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Delete own comment" on public.tree_comments;
create policy "Delete own comment" on public.tree_comments for delete to authenticated using(auth.uid()=user_id);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('sim-images','sim-images',true,8388608,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
drop policy if exists "Upload images under own folder" on storage.objects;
create policy "Upload images under own folder" on storage.objects for insert to authenticated with check (bucket_id='sim-images' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Read public images" on storage.objects;
create policy "Read public images" on storage.objects for select to anon,authenticated using(bucket_id='sim-images');
drop policy if exists "Delete own images" on storage.objects;
create policy "Delete own images" on storage.objects for delete to authenticated using(bucket_id='sim-images' and (storage.foldername(name))[1]=auth.uid()::text);

-- One-time migration: republish each existing public tree from the app to create a sanitized snapshot.
-- 'Private' album controls visibility in the app/snapshot, not cryptographic access to already public media URLs.

-- Guarantee that toggling a tree to private removes its public snapshot, even if a client omits cleanup.
create or replace function public.simlegacy_unpublish_snapshot() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if old.public=true and new.public=false then
  delete from public.public_tree_snapshots where id=new.id;
 end if;
 return new;
end;
$$;
drop trigger if exists simlegacy_privacy_trigger on public.trees;
create trigger simlegacy_privacy_trigger after update of public on public.trees
for each row execute function public.simlegacy_unpublish_snapshot();

-- Explicit grants for projects with hardened default privileges. RLS still restricts individual rows.
grant select,insert,update,delete on public.trees to authenticated;
grant select on public.public_tree_snapshots to anon;
grant select,insert,update,delete on public.public_tree_snapshots to authenticated;
grant select on public.profiles to anon;
grant select,insert,update on public.profiles to authenticated;
grant select on public.tree_likes,public.tree_comments to anon;
grant select,insert,delete on public.tree_likes,public.tree_comments to authenticated;
