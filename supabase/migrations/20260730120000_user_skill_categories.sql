-- Skill categories for grouping profile skills.

create table if not exists public.user_skill_categories (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users (id) on delete cascade,
	name text not null
);

create index if not exists user_skill_categories_user_id_idx
	on public.user_skill_categories (user_id);

alter table public.user_skill_categories enable row level security;

create policy "user_skill_categories_select_own"
	on public.user_skill_categories for select
	using (auth.uid() = user_id);

create policy "user_skill_categories_insert_own"
	on public.user_skill_categories for insert
	with check (auth.uid() = user_id);

create policy "user_skill_categories_update_own"
	on public.user_skill_categories for update
	using (auth.uid() = user_id);

create policy "user_skill_categories_delete_own"
	on public.user_skill_categories for delete
	using (auth.uid() = user_id);

alter table public.user_skills
	add column if not exists category_id uuid
		references public.user_skill_categories (id)
		on delete set null;

create index if not exists user_skills_category_id_idx
	on public.user_skills (category_id);
