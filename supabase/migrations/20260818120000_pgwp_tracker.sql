-- PGWP expiry tracker (one row per user, created on first save)
create table if not exists public.pgwp_tracker (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	pgwp_expired_at date not null,
	created_at timestamptz not null default now(),
	constraint pgwp_tracker_user_id_key unique (user_id)
);

alter table public.pgwp_tracker enable row level security;

drop policy if exists "Users can read own pgwp tracker" on public.pgwp_tracker;
drop policy if exists "Users can insert own pgwp tracker" on public.pgwp_tracker;
drop policy if exists "Users can update own pgwp tracker" on public.pgwp_tracker;

create policy "Users can read own pgwp tracker"
	on public.pgwp_tracker
	for select
	using (auth.uid() = user_id);

create policy "Users can insert own pgwp tracker"
	on public.pgwp_tracker
	for insert
	with check (auth.uid() = user_id);

create policy "Users can update own pgwp tracker"
	on public.pgwp_tracker
	for update
	using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
