-- Seed a realistic original + tailored app_resume tree for UI review.
-- Replace :application_id with a real applications.id owned by your test user before running.
--
-- Example:
--   \set application_id '00000000-0000-0000-0000-000000000001'
-- Or search/replace APP_ID_HERE below.

do $$
declare
  v_application_id uuid := 'APP_ID_HERE'::uuid; -- <-- replace
  v_original_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid;
  v_tailored_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid;
  v_header_section uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid;
  v_summary_section uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid;
  v_exp1_section uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3'::uuid;
  v_exp2_section uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4'::uuid;
  v_skills_section uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5'::uuid;
  v_header_key uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid;
  v_summary_key uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid;
  v_exp1_key uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc3'::uuid;
  v_exp2_key uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc4'::uuid;
  v_skills_key uuid := 'cccccccc-cccc-cccc-cccc-ccccccccccc5'::uuid;
  v_name_key uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid;
  v_email_key uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid;
  v_summary_block uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd3'::uuid;
  v_exp1_heading uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd4'::uuid;
  v_exp1_b1 uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd5'::uuid;
  v_exp1_b2 uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd6'::uuid;
  v_exp1_b3 uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd7'::uuid;
  v_exp1_b4 uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd8'::uuid;
  v_exp2_heading uuid := 'dddddddd-dddd-dddd-dddd-ddddddddddd9'::uuid;
  v_exp2_b1 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd10'::uuid;
  v_exp2_b2 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd11'::uuid;
  v_exp2_b3 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd12'::uuid;
  v_skill1 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd13'::uuid;
  v_skill2 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd14'::uuid;
  v_skill3 uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd15'::uuid;
  v_new_block uuid := 'dddddddd-dddd-dddd-dddd-dddddddddd16'::uuid;
begin
  update public.applications
  set
    job_title = 'Senior Product Designer',
    company_name = 'Northstar Labs',
    job_description = 'We are hiring a Senior Product Designer to lead end-to-end product design for B2B workflows. You will partner with engineering and research, run usability studies, systemize design systems, and ship accessible interfaces. Strong Figma craft, prototyping, and collaboration with PMs required.'
  where id = v_application_id;

  delete from public.app_resume
  where application_id = v_application_id;

  insert into public.app_resume (id, application_id, version, score)
  values
    (v_original_id, v_application_id, 'original', 61),
    (v_tailored_id, v_application_id, 'tailored', 84);

  insert into public.app_resume_section (id, app_resume_id, section_key, type, title, "order")
  values
    (v_header_section, v_original_id, v_header_key, 'header', 'Header', 0),
    (v_summary_section, v_original_id, v_summary_key, 'summary', 'Summary', 1),
    (v_exp1_section, v_original_id, v_exp1_key, 'experience_entry', 'Product Designer · Brightly', 2),
    (v_exp2_section, v_original_id, v_exp2_key, 'experience_entry', 'UX Designer · Orbit Health', 3),
    (v_skills_section, v_original_id, v_skills_key, 'skills', 'Skills', 4);

  insert into public.app_resume_block (
    id, app_resume_section_id, block_key, type, content, "order", is_new, is_removed, is_hidden
  ) values
    (gen_random_uuid(), v_header_section, v_name_key, 'contact_line', 'Alex Rivera', 0, false, false, false),
    (gen_random_uuid(), v_header_section, v_email_key, 'contact_line', 'alex@example.com', 1, false, false, false),
    (gen_random_uuid(), v_summary_section, v_summary_block, 'text',
      'Product designer with 6 years building SaaS experiences across onboarding and analytics.', 0, false, false, false),
    (gen_random_uuid(), v_exp1_section, v_exp1_heading, 'heading', 'Product Designer · Brightly', 0, false, false, false),
    (gen_random_uuid(), v_exp1_section, v_exp1_b1, 'bullet',
      'Led redesign of customer onboarding, improving activation by 18%.', 1, false, false, false),
    (gen_random_uuid(), v_exp1_section, v_exp1_b2, 'bullet',
      'Built a shared Figma component library used by 4 product squads.', 2, false, false, false),
    (gen_random_uuid(), v_exp1_section, v_exp1_b3, 'bullet',
      'Ran quarterly usability studies with 20+ customers.', 3, false, false, false),
    (gen_random_uuid(), v_exp1_section, v_exp1_b4, 'bullet',
      'Helped with office snacks.', 4, false, false, false),
    (gen_random_uuid(), v_exp2_section, v_exp2_heading, 'heading', 'UX Designer · Orbit Health', 0, false, false, false),
    (gen_random_uuid(), v_exp2_section, v_exp2_b1, 'bullet',
      'Designed clinician workflow screens for appointment scheduling.', 1, false, false, false),
    (gen_random_uuid(), v_exp2_section, v_exp2_b2, 'bullet',
      'Partnered with engineers to ship accessible WCAG-compliant UI.', 2, false, false, false),
    (gen_random_uuid(), v_exp2_section, v_exp2_b3, 'bullet',
      'Created interactive prototypes for stakeholder reviews.', 3, false, false, false),
    (gen_random_uuid(), v_skills_section, v_skill1, 'bullet', 'Figma', 0, false, false, false),
    (gen_random_uuid(), v_skills_section, v_skill2, 'bullet', 'User research', 1, false, false, false),
    (gen_random_uuid(), v_skills_section, v_skill3, 'bullet', 'Design systems', 2, false, false, false);

  -- Tailored sections/blocks (matched keys + one new + one removed)
  insert into public.app_resume_section (id, app_resume_id, section_key, type, title, "order")
  values
    (gen_random_uuid(), v_tailored_id, v_header_key, 'header', 'Header', 0),
    (gen_random_uuid(), v_tailored_id, v_summary_key, 'summary', 'Summary', 1),
    (gen_random_uuid(), v_tailored_id, v_exp1_key, 'experience_entry', 'Product Designer · Brightly', 2),
    (gen_random_uuid(), v_tailored_id, v_exp2_key, 'experience_entry', 'UX Designer · Orbit Health', 3),
    (gen_random_uuid(), v_tailored_id, v_skills_key, 'skills', 'Skills', 4);

  insert into public.app_resume_block (
    app_resume_section_id, block_key, type, content, "order", is_new, is_removed, is_hidden
  )
  select s.id, v_name_key, 'contact_line', 'Alex Rivera', 0, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_header_key
  union all
  select s.id, v_email_key, 'contact_line', 'alex@example.com', 1, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_header_key
  union all
  select s.id, v_summary_block, 'text',
    'Senior product designer specializing in B2B workflow design, prototyping, and accessible design systems that help cross-functional teams ship faster.',
    0, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_summary_key
  union all
  select s.id, v_exp1_heading, 'heading', 'Product Designer · Brightly', 0, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_exp1_b1, 'bullet',
    'Led end-to-end redesign of B2B onboarding workflows, improving activation by 18% with research-backed prototyping.',
    1, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_exp1_b2, 'bullet',
    'Systemized a Figma design system adopted by 4 product squads, reducing UI inconsistency and engineering rework.',
    2, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_exp1_b3, 'bullet',
    'Partnered with PMs and engineering to run usability studies and ship accessible interfaces.',
    3, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_exp1_b4, 'bullet', 'Helped with office snacks.', 4, false, true, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_new_block, 'bullet',
    'Created interactive prototypes that aligned stakeholders around workflow complexity before engineering build.',
    5, true, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp1_key
  union all
  select s.id, v_exp2_heading, 'heading', 'UX Designer · Orbit Health', 0, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp2_key
  union all
  select s.id, v_exp2_b1, 'bullet',
    'Designed clinician scheduling workflows that reduced friction in day-to-day B2B healthcare operations.',
    1, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp2_key
  union all
  select s.id, v_exp2_b2, 'bullet',
    'Shipped WCAG-accessible UI in close collaboration with engineering partners.',
    2, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp2_key
  union all
  select s.id, v_exp2_b3, 'bullet',
    'Prototyped concepts for stakeholder reviews and research validation.',
    3, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_exp2_key
  union all
  select s.id, v_skill1, 'bullet', 'Figma', 0, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_skills_key
  union all
  select s.id, v_skill2, 'bullet', 'User research', 1, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_skills_key
  union all
  select s.id, v_skill3, 'bullet', 'Design systems', 2, false, false, false
  from public.app_resume_section s
  where s.app_resume_id = v_tailored_id and s.section_key = v_skills_key;
end $$;
