-- Add private dynasty chronicles storage to each tree. Safe to run repeatedly.
alter table public.trees add column if not exists chronicles jsonb not null default '[]'::jsonb;
