-- App-scoped editable resume builder (original + tailored versions).
-- Ownership is via applications.user_id — do not confuse with public.resumes.

create table if not exists public.app_resume (
	id uuid primary key default gen_random_uuid(),
	application_id uuid not null references public.applications (id) on delete cascade,
	version text not null check (version in ('original', 'tailored')),
	score smallint,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (application_id, version)
);

create index if not exists app_resume_application_id_idx
	on public.app_resume (application_id);

alter table public.app_resume enable row level security;

create policy "app_resume_select_own"
	on public.app_resume for select
	using (
		exists (
			select 1
			from public.applications a
			where a.id = app_resume.application_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_insert_own"
	on public.app_resume for insert
	with check (
		exists (
			select 1
			from public.applications a
			where a.id = app_resume.application_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_update_own"
	on public.app_resume for update
	using (
		exists (
			select 1
			from public.applications a
			where a.id = app_resume.application_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_delete_own"
	on public.app_resume for delete
	using (
		exists (
			select 1
			from public.applications a
			where a.id = app_resume.application_id
				and a.user_id = auth.uid()
		)
	);

create table if not exists public.app_resume_section (
	id uuid primary key default gen_random_uuid(),
	app_resume_id uuid not null references public.app_resume (id) on delete cascade,
	section_key uuid not null default gen_random_uuid(),
	type text not null check (
		type in (
			'header',
			'summary',
			'experience_entry',
			'education_entry',
			'skills',
			'projects',
			'custom'
		)
	),
	title text,
	"order" integer not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists app_resume_section_app_resume_id_idx
	on public.app_resume_section (app_resume_id);

create index if not exists app_resume_section_section_key_idx
	on public.app_resume_section (section_key);

alter table public.app_resume_section enable row level security;

create policy "app_resume_section_select_own"
	on public.app_resume_section for select
	using (
		exists (
			select 1
			from public.app_resume ar
			join public.applications a on a.id = ar.application_id
			where ar.id = app_resume_section.app_resume_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_section_insert_own"
	on public.app_resume_section for insert
	with check (
		exists (
			select 1
			from public.app_resume ar
			join public.applications a on a.id = ar.application_id
			where ar.id = app_resume_section.app_resume_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_section_update_own"
	on public.app_resume_section for update
	using (
		exists (
			select 1
			from public.app_resume ar
			join public.applications a on a.id = ar.application_id
			where ar.id = app_resume_section.app_resume_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_section_delete_own"
	on public.app_resume_section for delete
	using (
		exists (
			select 1
			from public.app_resume ar
			join public.applications a on a.id = ar.application_id
			where ar.id = app_resume_section.app_resume_id
				and a.user_id = auth.uid()
		)
	);

create table if not exists public.app_resume_block (
	id uuid primary key default gen_random_uuid(),
	app_resume_section_id uuid not null references public.app_resume_section (id) on delete cascade,
	block_key uuid not null default gen_random_uuid(),
	type text not null check (
		type in (
			'heading',
			'subheading',
			'bullet',
			'text',
			'date_range',
			'contact_line'
		)
	),
	content text not null default '',
	"order" integer not null default 0,
	is_new boolean not null default false,
	is_removed boolean not null default false,
	is_hidden boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists app_resume_block_section_id_idx
	on public.app_resume_block (app_resume_section_id);

create index if not exists app_resume_block_block_key_idx
	on public.app_resume_block (block_key);

alter table public.app_resume_block enable row level security;

create policy "app_resume_block_select_own"
	on public.app_resume_block for select
	using (
		exists (
			select 1
			from public.app_resume_section s
			join public.app_resume ar on ar.id = s.app_resume_id
			join public.applications a on a.id = ar.application_id
			where s.id = app_resume_block.app_resume_section_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_block_insert_own"
	on public.app_resume_block for insert
	with check (
		exists (
			select 1
			from public.app_resume_section s
			join public.app_resume ar on ar.id = s.app_resume_id
			join public.applications a on a.id = ar.application_id
			where s.id = app_resume_block.app_resume_section_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_block_update_own"
	on public.app_resume_block for update
	using (
		exists (
			select 1
			from public.app_resume_section s
			join public.app_resume ar on ar.id = s.app_resume_id
			join public.applications a on a.id = ar.application_id
			where s.id = app_resume_block.app_resume_section_id
				and a.user_id = auth.uid()
		)
	);

create policy "app_resume_block_delete_own"
	on public.app_resume_block for delete
	using (
		exists (
			select 1
			from public.app_resume_section s
			join public.app_resume ar on ar.id = s.app_resume_id
			join public.applications a on a.id = ar.application_id
			where s.id = app_resume_block.app_resume_section_id
				and a.user_id = auth.uid()
		)
	);
