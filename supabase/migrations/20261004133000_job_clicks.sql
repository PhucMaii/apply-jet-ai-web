-- Track Apply-link clicks on jobs and expose them in search_jobs.

alter table public.jobs
	add column if not exists clicks integer not null default 0;

alter table public.jobs
	alter column clicks set default 0;

update public.jobs
set clicks = 0
where clicks is null;

alter table public.jobs
	alter column clicks set not null;

create or replace function public.increment_job_clicks(p_job_id bigint)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
	next_clicks integer;
begin
	if p_job_id is null or p_job_id <= 0 then
		raise exception 'invalid job id';
	end if;

	update public.jobs
	set clicks = coalesce(clicks, 0) + 1
	where id = p_job_id
	returning clicks into next_clicks;

	if next_clicks is null then
		raise exception 'job not found';
	end if;

	return next_clicks;
end;
$$;

revoke all on function public.increment_job_clicks(bigint) from public;
grant execute on function public.increment_job_clicks(bigint) to service_role;

-- Return clicks from the public job search feed.
create or replace function public.search_jobs(
	p_title text default null,
	p_title_tokens text[] default '{}'::text[],
	p_location text default null,
	p_city text default null,
	p_region text default null,
	p_country text default null,
	p_continent_terms text[] default '{}'::text[],
	p_posted_since timestamptz default null,
	p_sort text default 'relevant',
	p_limit int default 24,
	p_offset int default 0
)
returns table (
	id bigint,
	title text,
	location text,
	department text,
	apply_url text,
	ats text,
	posted_at timestamptz,
	first_seen_at timestamptz,
	is_seed boolean,
	is_active boolean,
	company_id bigint,
	description_html text,
	company_name text,
	company_slug text,
	clicks integer
)
language sql
stable
security definer
set search_path = public
as $$
	with
	params as (
		select
			nullif(trim(p_title), '') as title_q,
			coalesce(
				(
					select array_agg(tok)
					from (
						select distinct lower(trim(t)) as tok
						from unnest(coalesce(p_title_tokens, '{}'::text[])) as t
						where length(trim(t)) >= 2
						limit 6
					) tokens
				),
				'{}'::text[]
			) as title_tokens,
			nullif(trim(p_location), '') as location_q,
			nullif(trim(p_city), '') as city_q,
			nullif(trim(p_region), '') as region_q,
			nullif(trim(p_country), '') as country_q,
			coalesce(
				(
					select array_agg(peer)
					from (
						select distinct trim(t) as peer
						from unnest(coalesce(p_continent_terms, '{}'::text[])) as t
						where length(trim(t)) >= 2
						limit 8
					) peers
				),
				'{}'::text[]
			) as continent_terms,
			p_posted_since as posted_since,
			case
				when lower(coalesce(p_sort, 'relevant')) = 'recent' then 'recent'
				else 'relevant'
			end as sort_mode,
			greatest(1, least(coalesce(p_limit, 24), 50)) as page_limit,
			greatest(0, coalesce(p_offset, 0)) as page_offset,
			800 as candidate_cap
	),
	candidates as materialized (
		select
			j.id,
			j.title,
			j.location,
			j.department,
			j.apply_url,
			j.ats,
			j.posted_at,
			j.first_seen_at,
			j.is_seed,
			j.is_active,
			j.company_id,
			j.description_html,
			j.clicks
		from public.jobs j
		where j.is_active = true
			and (
				(select posted_since from params) is null
				or j.posted_at >= (select posted_since from params)
			)
			and (
				(select location_q from params) is null
				or (
					j.location is not null
					and (
						(
							(select city_q from params) is not null
							and j.location ilike '%' || (select city_q from params) || '%'
						)
						or (
							(select region_q from params) is not null
							and j.location ilike '%' || (select region_q from params) || '%'
						)
						or (
							(select location_q from params) is not null
							and j.location ilike '%' || (select location_q from params) || '%'
						)
						or j.location ilike '%remote%'
						or (
							(select country_q from params) is not null
							and j.location ilike '%' || (select country_q from params) || '%'
						)
						or exists (
							select 1
							from unnest((select continent_terms from params)) as peer(term)
							where j.location ilike '%' || peer.term || '%'
						)
					)
				)
			)
			and (
				(select title_q from params) is null
				or j.title ilike '%' || (select title_q from params) || '%'
				or exists (
					select 1
					from unnest((select title_tokens from params)) as tok
					where j.title ilike '%' || tok || '%'
				)
			)
		order by j.posted_at desc nulls last, j.id desc
		limit (select candidate_cap from params)
	),
	scored as (
		select
			cand.id,
			cand.title,
			cand.location,
			cand.department,
			cand.apply_url,
			cand.ats,
			cand.posted_at,
			cand.first_seen_at,
			cand.is_seed,
			cand.is_active,
			cand.company_id,
			cand.description_html,
			cand.clicks,
			c.name as company_name,
			c.slug as company_slug,
			case
				when (select location_q from params) is null then 1
				when cand.location is null then 5
				when (
					(
						(select city_q from params) is not null
						and cand.location ilike '%' || (select city_q from params) || '%'
					)
					or (
						(select region_q from params) is not null
						and cand.location ilike '%' || (select region_q from params) || '%'
					)
					or (
						(select location_q from params) is not null
						and cand.location ilike '%' || (select location_q from params) || '%'
					)
				) then 1
				when cand.location ilike '%remote%' then 2
				when (
					(select country_q from params) is not null
					and cand.location ilike '%' || (select country_q from params) || '%'
				) then 3
				when exists (
					select 1
					from unnest((select continent_terms from params)) as peer(term)
					where cand.location ilike '%' || peer.term || '%'
				) then 4
				else 5
			end as geo_tier,
			case
				when (select title_q from params) is null then 0
				when cand.title ilike '%' || (select title_q from params) || '%' then 3
				when (
					cardinality((select title_tokens from params)) > 0
					and (
						select bool_and(cand.title ilike '%' || tok || '%')
						from unnest((select title_tokens from params)) as tok
					)
				) then 2
				when exists (
					select 1
					from unnest((select title_tokens from params)) as tok
					where cand.title ilike '%' || tok || '%'
				) then 1
				else 0
			end as title_score
		from candidates cand
		left join public.companies c on c.id = cand.company_id
	)
	select
		s.id,
		s.title,
		s.location,
		s.department,
		s.apply_url,
		s.ats,
		s.posted_at,
		s.first_seen_at,
		s.is_seed,
		s.is_active,
		s.company_id,
		s.description_html,
		s.company_name,
		s.company_slug,
		s.clicks
	from scored s
	order by
		case
			when (select sort_mode from params) = 'recent' then 0
			else s.geo_tier
		end asc,
		case
			when (select sort_mode from params) = 'recent' then 0
			else s.title_score
		end desc,
		s.posted_at desc nulls last,
		s.id desc
	limit (select page_limit from params)
	offset (select page_offset from params);
$$;

revoke all on function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) from public;

grant execute on function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) to anon;

grant execute on function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) to authenticated;

grant execute on function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) to service_role;
