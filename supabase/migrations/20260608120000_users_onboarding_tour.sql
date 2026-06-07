-- Onboarding tour state on public.users (autofill profile table)
alter table public.users
	add column if not exists onboarding_tour_status text
		check (onboarding_tour_status in ('pending', 'active', 'idle')),
	add column if not exists onboarding_current_step text;

-- Existing rows: done with onboarding. New signups get pending via handle_new_user.
update public.users
set
	onboarding_tour_status = coalesce(onboarding_tour_status, 'idle'),
	onboarding_current_step = coalesce(onboarding_current_step, 'completed');

alter table public.users
	alter column onboarding_tour_status set default 'pending';

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
