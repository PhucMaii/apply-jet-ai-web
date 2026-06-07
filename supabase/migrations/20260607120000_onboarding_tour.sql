-- Guided onboarding tour state on profiles
alter table public.profiles
	add column if not exists onboarding_tour_status text
		check (onboarding_tour_status in ('pending', 'active', 'skipped', 'completed')),
	add column if not exists onboarding_current_step text,
	add column if not exists onboarding_welcome_seen_at timestamptz,
	add column if not exists onboarding_completed_at timestamptz;

-- New signups start on the welcome step (existing rows stay null)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (
		id,
		display_name,
		plan,
		onboarding_tour_status,
		onboarding_current_step
	)
	values (
		new.id,
		coalesce(
			new.raw_user_meta_data->>'display_name',
			new.raw_user_meta_data->>'full_name',
			new.raw_user_meta_data->>'name',
			null
		),
		'free',
		'pending',
		'welcome'
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
