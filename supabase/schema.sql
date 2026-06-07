-- ApplyJet AI starter schema for Supabase (run in SQL editor)
-- Adjust policies for your threat model before production.

-- Profiles mirror auth.users
create table if not exists public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text,
	plan text not null default 'free' check (plan in ('free', 'pro')),
	created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
	on public.profiles for select
	using (auth.uid() = id);

create policy "profiles_insert_own"
	on public.profiles for insert
	with check (auth.uid() = id);

create policy "profiles_update_own"
	on public.profiles for update
	using (auth.uid() = id);

-- Resumes metadata (files live in Storage bucket `resumes`)
create table if not exists public.resumes (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	storage_path text not null,
	file_name text not null,
	created_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);

alter table public.resumes enable row level security;

create policy "resumes_select_own"
	on public.resumes for select
	using (auth.uid() = user_id);

create policy "resumes_insert_own"
	on public.resumes for insert
	with check (auth.uid() = user_id);

create policy "resumes_delete_own"
	on public.resumes for delete
	using (auth.uid() = user_id);

-- Subscription + Stripe (webhook updates IDs and period end)
create table if not exists public.subscriptions (
	user_id uuid primary key references auth.users (id) on delete cascade,
	plan text not null default 'free' check (plan in ('free', 'pro')),
	status text not null default 'inactive',
	stripe_customer_id text,
	stripe_subscription_id text,
	current_period_end timestamptz,
	updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_customer_uidx
	on public.subscriptions (stripe_customer_id)
	where stripe_customer_id is not null; 

create unique index if not exists subscriptions_stripe_subscription_uidx
	on public.subscriptions (stripe_subscription_id)
	where stripe_subscription_id is not null;

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
	on public.subscriptions for select
	using (auth.uid() = user_id);

create policy "subscriptions_upsert_own"
	on public.subscriptions for insert
	with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
	on public.subscriptions for update
	using (auth.uid() = user_id);

-- Autofill profile (editable in app; one row per auth user)
create table if not exists public.users (
	id uuid primary key references auth.users (id) on delete cascade,
	email text,
	full_name text,
	first_name text,
	last_name text,
	phone text,
	address_line1 text,
	address_line2 text,
	city text,
	province text,
	country text,
	postal_code text,
	expected_salary numeric,
	summary text,
	onboarding_tour_status text
		not null default 'pending'
		check (onboarding_tour_status in ('pending', 'active', 'idle')),
	onboarding_current_step text default 'welcome',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (email);

alter table public.users enable row level security;

create policy "users_select_own"
	on public.users for select
	using (auth.uid() = id);

create policy "users_insert_own"
	on public.users for insert
	with check (auth.uid() = id);

create policy "users_update_own"
	on public.users for update
	using (auth.uid() = id);

-- Application history from extension (placeholder)
create table if not exists public.application_history (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	job_title text,
	company text,
	match_score numeric,
	created_at timestamptz not null default now()
);

create index if not exists application_history_user_idx
	on public.application_history (user_id desc);

alter table public.application_history enable row level security;

create policy "application_history_select_own"
	on public.application_history for select
	using (auth.uid() = user_id);

create policy "application_history_insert_own"
	on public.application_history for insert
	with check (auth.uid() = user_id);

-- Score history for dashboard charts
create table if not exists public.score_history (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	score numeric not null,
	source text,
	created_at timestamptz not null default now()
);

create index if not exists score_history_user_idx
	on public.score_history (user_id desc);

alter table public.score_history enable row level security;

create policy "score_history_select_own"
	on public.score_history for select
	using (auth.uid() = user_id);

create policy "score_history_insert_own"
	on public.score_history for insert
	with check (auth.uid() = user_id);

-- Applications (user-managed job pipeline)
create table if not exists public.applications (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users (id) on delete cascade,
	company_name text not null,
	job_title text not null,
	job_url text,
	job_description text,
	status text not null default 'Generated'
		check (status in ('Generated', 'Applied', 'Rejected', 'Accepted')),
	created_at timestamptz not null default now(),
	updated_at timestamptz
);

create index if not exists applications_user_id_idx
	on public.applications (user_id desc, created_at desc);

alter table public.applications enable row level security;

create policy "applications_select_own"
	on public.applications for select
	using (auth.uid() = user_id);

create policy "applications_insert_own"
	on public.applications for insert
	with check (auth.uid() = user_id);

create policy "applications_update_own"
	on public.applications for update
	using (auth.uid() = user_id);

create policy "applications_delete_own"
	on public.applications for delete
	using (auth.uid() = user_id);

-- One tailored resume per application (extension / edge writes)
create table if not exists public.generated_resumes (
	id uuid primary key default gen_random_uuid(),
	application_id uuid not null references public.applications (id) on delete cascade,
	user_id uuid not null references auth.users (id) on delete cascade,
	content text not null,
	created_at timestamptz not null default now()
);

create unique index if not exists generated_resumes_application_id_uidx
	on public.generated_resumes (application_id);

create index if not exists generated_resumes_user_id_idx
	on public.generated_resumes (user_id);

alter table public.generated_resumes enable row level security;

create policy "generated_resumes_select_own"
	on public.generated_resumes for select
	using (auth.uid() = user_id);

create policy "generated_resumes_insert_own"
	on public.generated_resumes for insert
	with check (auth.uid() = user_id);

create policy "generated_resumes_update_own"
	on public.generated_resumes for update
	using (auth.uid() = user_id);

create policy "generated_resumes_delete_own"
	on public.generated_resumes for delete
	using (auth.uid() = user_id);

-- One cover letter per application
create table if not exists public.generated_cover_letters (
	id uuid primary key default gen_random_uuid(),
	application_id uuid not null references public.applications (id) on delete cascade,
	user_id uuid not null references auth.users (id) on delete cascade,
	content text not null,
	created_at timestamptz not null default now()
);

create unique index if not exists generated_cover_letters_application_id_uidx
	on public.generated_cover_letters (application_id);

create index if not exists generated_cover_letters_user_id_idx
	on public.generated_cover_letters (user_id);

alter table public.generated_cover_letters enable row level security;

create policy "generated_cover_letters_select_own"
	on public.generated_cover_letters for select
	using (auth.uid() = user_id);

create policy "generated_cover_letters_insert_own"
	on public.generated_cover_letters for insert
	with check (auth.uid() = user_id);

create policy "generated_cover_letters_update_own"
	on public.generated_cover_letters for update
	using (auth.uid() = user_id);

create policy "generated_cover_letters_delete_own"
	on public.generated_cover_letters for delete
	using (auth.uid() = user_id);

-- Auto-create profile, autofill user row, and subscription stub on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, display_name, plan)
	values (
		new.id,
		coalesce(
			new.raw_user_meta_data->>'display_name',
			new.raw_user_meta_data->>'full_name',
			new.raw_user_meta_data->>'name',
			null
		),
		'free'
	)
	on conflict (id) do nothing;

	insert into public.users (
		id,
		email,
		full_name,
		first_name,
		last_name,
		onboarding_tour_status,
		onboarding_current_step
	)
	values (
		new.id,
		new.email,
		coalesce(
			new.raw_user_meta_data->>'full_name',
			new.raw_user_meta_data->>'name',
			null
		),
		new.raw_user_meta_data->>'first_name',
		new.raw_user_meta_data->>'last_name',
		'pending',
		'welcome'
	)
	on conflict (id) do nothing;

	insert into public.subscriptions (user_id, plan, status)
	values (new.id, 'free', 'inactive')
	on conflict (user_id) do nothing;

	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- Storage: create bucket `resumes` in dashboard, then:
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resume_objects_select_own"
	on storage.objects for select
	using (
		bucket_id = 'resumes'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

create policy "resume_objects_insert_own"
	on storage.objects for insert
	with check (
		bucket_id = 'resumes'
		and auth.uid()::text = (storage.foldername(name))[1]
	);

create policy "resume_objects_delete_own"
	on storage.objects for delete
	using (
		bucket_id = 'resumes'
		and auth.uid()::text = (storage.foldername(name))[1]
	);
