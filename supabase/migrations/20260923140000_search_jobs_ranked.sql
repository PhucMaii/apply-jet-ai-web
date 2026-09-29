-- Ranked job search: retrieve via ILIKE/trgm, order by geo_tier + title_score + freshness.
-- Caps keep PostgREST latency bounded.

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
	company_slug text
)
language sql
stable
security invoker
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
			greatest(0, coalesce(p_offset, 0)) as page_offset
	),
	scored as (
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
			c.name as company_name,
			c.slug as company_slug,
			case
				when (select location_q from params) is null then 1
				when j.location is null then 5
				when (
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
				) then 1
				when j.location ilike '%remote%' then 2
				when (
					(select country_q from params) is not null
					and j.location ilike '%' || (select country_q from params) || '%'
				) then 3
				when exists (
					select 1
					from unnest((select continent_terms from params)) as peer(term)
					where j.location ilike '%' || peer.term || '%'
				) then 4
				else 5
			end as geo_tier,
			case
				when (select title_q from params) is null then 0
				when j.title ilike '%' || (select title_q from params) || '%' then 3
				when (
					cardinality((select title_tokens from params)) > 0
					and (
						select bool_and(j.title ilike '%' || tok || '%')
						from unnest((select title_tokens from params)) as tok
					)
				) then 2
				when exists (
					select 1
					from unnest((select title_tokens from params)) as tok
					where j.title ilike '%' || tok || '%'
				) then 1
				else 0
			end as title_score
		from public.jobs j
		left join public.companies c on c.id = j.company_id
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
						or j.description_html ilike '%' || tok || '%'
				)
			)
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
		s.company_slug
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
) to authenticated;

grant execute on function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) to service_role;
