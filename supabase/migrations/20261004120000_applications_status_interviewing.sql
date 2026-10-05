-- Add 'Interviewing' to the application pipeline. Existing values are unchanged.
alter table public.applications
	drop constraint if exists applications_status_check;

alter table public.applications
	add constraint applications_status_check
	check (status in ('Generated', 'Applied', 'Interviewing', 'Rejected', 'Accepted'));
