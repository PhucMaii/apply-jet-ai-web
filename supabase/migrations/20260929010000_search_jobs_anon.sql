-- Allow anonymous clients to browse the ranked jobs feed.
-- SECURITY DEFINER so invoker RLS on jobs/companies does not block guests.

alter function public.search_jobs(
	text, text[], text, text, text, text, text[], timestamptz, text, int, int
) security definer;

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
