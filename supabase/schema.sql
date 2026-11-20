-- Run in Supabase SQL Editor. Enable email confirmation in Auth settings as needed.
create extension if not exists pgcrypto;
create table if not exists public.trees (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 100),
 description text not null default '',
 cover text not null default '',
 people jsonb not null default '[]'::jsonb,
 public boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists trees_owner_idx on public.trees(owner_id);
create index if not exists trees_gallery_idx on public.trees(updated_at desc) where public=true;
alter table public.trees enable row level security;
drop policy if exists "Read owned or public trees" on public.trees;
create policy "Read owned or public trees" on public.trees for select to anon,authenticated using (public = true or auth.uid() = owner_id);
drop policy if exists "Insert own trees" on public.trees;
create policy "Insert own trees" on public.trees for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Update own trees" on public.trees;
create policy "Update own trees" on public.trees for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Delete own trees" on public.trees;
create policy "Delete own trees" on public.trees for delete to authenticated using (auth.uid() = owner_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('sim-images','sim-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif']) on conflict (id) do nothing;
drop policy if exists "Upload images under own folder" on storage.objects;
create policy "Upload images under own folder" on storage.objects for insert to authenticated with check (bucket_id='sim-images' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Read public images" on storage.objects;
create policy "Read public images" on storage.objects for select to anon,authenticated using (bucket_id='sim-images');
drop policy if exists "Delete own images" on storage.objects;
create policy "Delete own images" on storage.objects for delete to authenticated using (bucket_id='sim-images' and (storage.foldername(name))[1] = auth.uid()::text);
