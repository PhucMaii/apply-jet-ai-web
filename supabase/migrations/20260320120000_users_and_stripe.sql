-- User profile row for autofill (one row per auth user)
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

-- Stripe linkage (updated by Edge webhook with service role)
alter table public.subscriptions
	add column if not exists stripe_customer_id text;

alter table public.subscriptions
	add column if not exists stripe_subscription_id text;

create unique index if not exists subscriptions_stripe_customer_uidx
	on public.subscriptions (stripe_customer_id)
	where stripe_customer_id is not null;

create unique index if not exists subscriptions_stripe_subscription_uidx
	on public.subscriptions (stripe_subscription_id)
	where stripe_subscription_id is not null;

alter table public.subscriptions
	add column if not exists current_period_end timestamptz;

-- Create profile + users row on signup
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

	insert into public.users (id, email, full_name, first_name, last_name)
	values (
		new.id,
		new.email,
		coalesce(
			new.raw_user_meta_data->>'full_name',
			new.raw_user_meta_data->>'name',
			null
		),
		new.raw_user_meta_data->>'first_name',
		new.raw_user_meta_data->>'last_name'
	)
	on conflict (id) do nothing;

	insert into public.subscriptions (user_id, plan, status)
	values (new.id, 'free', 'inactive')
	on conflict (user_id) do nothing;

	return new;
end;
$$;
