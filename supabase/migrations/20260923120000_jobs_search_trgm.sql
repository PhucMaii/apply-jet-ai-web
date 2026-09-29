-- Trigram indexes so title / description ILIKE '%token%' stays index-friendly.
create extension if not exists pg_trgm with schema extensions;

create index if not exists jobs_title_trgm_idx
	on public.jobs
	using gin (title extensions.gin_trgm_ops);

create index if not exists jobs_description_html_trgm_idx
	on public.jobs
	using gin (description_html extensions.gin_trgm_ops);

create index if not exists jobs_location_trgm_idx
	on public.jobs
	using gin (location extensions.gin_trgm_ops);
