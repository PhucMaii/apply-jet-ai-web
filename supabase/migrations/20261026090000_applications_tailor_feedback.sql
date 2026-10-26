-- Mentor-style tailor feedback stored after AI rewrite pass.

alter table public.applications
	add column if not exists tailor_feedback jsonb;

comment on column public.applications.tailor_feedback is
	'Structured resume review notes from Tailor with AI (items the user can act on)';
