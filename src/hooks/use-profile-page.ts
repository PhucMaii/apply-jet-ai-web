import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { emptyDisclosure, emptyProfileRow } from "@/lib/profile-defaults";
import { type ProfileNotice } from "@/lib/profile-notice";
import {
  openStripeCustomerPortal,
  startProSubscriptionCheckout,
} from "@/lib/stripe-client";
import { supabase } from "@/lib/supabase";
import type {
  SubscriptionRow,
  UserAdditionalInfoRow,
  UserDisclosureRow,
  UserEducationRow,
  UserLinkRow,
  UserProfileRow,
  UserProjectRow,
  UserSkillRow,
  UserWorkExperienceRow,
} from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import type { AsyncResultMsg } from "@/types/types";

function stringToTagList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function useProfilePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("profile");
  const [billingBusy, setBillingBusy] = useState(false);
  const [notice, setNotice] = useState<ProfileNotice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkoutStatus = searchParams.get("checkout");

  const loadData = useCallback(async () => {
    if (!user) return;
    setError(null);
    const result: any = {
      profile: null,
      subscription: null,
      workExperiences: [],
      educations: [],
      projects: [],
      disclosure: null,
      links: [],
      additionalInfo: null,
      skills: [],
      resumeText: null,
    };
    try {
      const [
        { data: userRow, error: userErr },
        { data: subRow, error: subErr },
        { data: workRows, error: workErr },
        { data: eduRows, error: eduErr },
        { data: projectRows, error: projectErr },
        { data: disclosureRow, error: disclosureErr },
        { data: linkRows, error: linkErr },
        { data: additionalRow, error: additionalErr },
        { data: skillRows, error: skillErr },
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_work_experiences")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false }),
        supabase
          .from("user_educations")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false }),
        supabase
          .from("user_projects")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false }),
        supabase
          .from("user_disclosures")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_links")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("user_additional_info")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_skills")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      const firstError =
        userErr ??
        subErr ??
        workErr ??
        eduErr ??
        projectErr ??
        disclosureErr ??
        linkErr ??
        additionalErr ??
        skillErr;

      if (firstError) {
        console.error("Something went wrong loading profile page:", firstError);
        setNotice(null);
        setError(firstError.message);
        return;
      }

      if (userRow) {
        const r = userRow as UserProfileRow;
        const salaryRaw = r.expected_salary;
        result.profile = {
          ...r,
          expected_salary:
            salaryRaw === null || salaryRaw === undefined
              ? null
              : typeof salaryRaw === "number"
                ? salaryRaw
                : Number(salaryRaw),
        };
      } else {
        result.profile = emptyProfileRow(user.id, user.email ?? "");
      }

      result.subscription = subRow as SubscriptionRow | null;
      result.workExperiences =
        (workRows as UserWorkExperienceRow[] | null) ?? [];
      result.educations = (eduRows as UserEducationRow[] | null) ?? [];
      result.projects = (projectRows as UserProjectRow[] | null) ?? [];
      result.disclosure =
        (disclosureRow as UserDisclosureRow | null) ?? emptyDisclosure(user.id);
      result.links = (linkRows as UserLinkRow[] | null) ?? [];

      const formattedAdditionalInfo = {
        ...additionalRow,
        languages: additionalRow?.languages?.join(",") ?? "",
        certifications: additionalRow?.certifications?.join(",") ?? "",
      };
      result.additionalInfo =
        formattedAdditionalInfo as UserAdditionalInfoRow | null;
      result.skills = (skillRows as UserSkillRow[] | null) ?? [];

      const { data: resume, error: resumeErr } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (resumeErr) {
        console.error("Something went wrong loading resume text:", resumeErr);
        result.resumeText = null;
      } else {
        result.resumeText = resume?.parsed_text ?? null;
      }

      return result;
    } catch (err) {
      console.error("Something went wrong loading profile page:", err);
      setNotice(null);
      setError(err instanceof Error ? err.message : "Load failed.");
    }
  }, [user]);

  const {
    data: userProfile,
    refetch: refetchProfile,
    isLoading: isLoadingProfile,
  } = useQuery<any>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      return await loadData();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (checkoutStatus === "success") {
      setSearchParams({}, { replace: true });
      void refetchProfile();
    } else if (checkoutStatus === "cancel") {
      setSearchParams({}, { replace: true });
      void refetchProfile();
    }
  }, [checkoutStatus, refetchProfile, setSearchParams]);

  async function saveProfile(
    updatedProfile: UserProfileRow,
  ): Promise<AsyncResultMsg> {
    if (!user || !updatedProfile)
      return { success: false, message: "User or updatedProfile is null" };
    try {
      const fullName = [updatedProfile.first_name, updatedProfile.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      const payload = {
        id: user.id,
        email: updatedProfile.email?.trim() || null,
        full_name: fullName || null,
        first_name: updatedProfile.first_name?.trim() || null,
        last_name: updatedProfile.last_name?.trim() || null,
        phone: updatedProfile.phone?.trim() || null,
        address_line1: updatedProfile.address_line1?.trim() || null,
        address_line2: updatedProfile.address_line2?.trim() || null,
        city: updatedProfile.city?.trim() || null,
        province: updatedProfile.province?.trim() || null,
        country: updatedProfile.country?.trim() || null,
        postal_code: updatedProfile.postal_code?.trim() || null,
        expected_salary:
          updatedProfile.expected_salary === null ||
          updatedProfile.expected_salary === undefined ||
          String(updatedProfile.expected_salary) === ""
            ? null
            : Number(updatedProfile.expected_salary),
        summary: updatedProfile.summary?.trim() || null,
      };

      const { error: upErr } = await supabase.from("users").upsert(payload, {
        onConflict: "id",
      });

      if (upErr) {
        console.error("Something went wrong saving profile:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Profile Saved Successfully" };
    } catch (err) {
      console.error("Something went wrong saving profile:", err);
      return { success: false, message: "Profile Save Failed" };
    }
  }

  const addWorkExperience = useCallback(
    async (experience: UserWorkExperienceRow): Promise<AsyncResultMsg> => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const payload = {
        user_id: user.id,
        location: experience.location,
        start_date: experience.start_date ?? null,
        end_date: experience.end_date ?? null,
        currently_working: experience.currently_working ?? false,
        description: experience.description ?? null,
        company: experience.company ?? null,
        title: experience.title ?? null,
        employment_type: experience.employment_type ?? null,
      };

      const { error: insErr } = await supabase
        .from("user_work_experiences")
        .insert(payload);

      if (insErr) {
        console.error("Something went wrong adding experience:", insErr);
        return { success: false, message: insErr.message };
      }

      void refetchProfile();

      return { success: true, message: "Experience added successfully" };
    },
    [user, refetchProfile],
  );

  const saveExperience = useCallback(
    async (experienceId: string, patch: Partial<UserWorkExperienceRow>) => {
      const { error: upErr } = await supabase
        .from("user_work_experiences")
        .update(patch)
        .eq("id", experienceId);

      if (upErr) {
        console.error("Something went wrong saving experience:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();

      return { success: true, message: "Experience saved successfully" };
    },
    [refetchProfile],
  );

  const removeExperience = useCallback(
    async (experienceId: string) => {
      const { error: delErr } = await supabase
        .from("user_work_experiences")
        .delete()
        .eq("id", experienceId);

      if (delErr) {
        console.error("Something went wrong deleting experience:", delErr);
        return { success: false, message: delErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Experience deleted successfully" };
    },
    [refetchProfile],
  );

  const addEducation = useCallback(
    async (newEducation: UserEducationRow) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const { error: insErr } = await supabase.from("user_educations").insert({
        user_id: user.id,
        school: newEducation.school,
        field_of_study: newEducation.field_of_study,
        degree: newEducation.degree,
        start_date: newEducation.start_date,
        end_date: newEducation.end_date,
        gpa: newEducation.gpa,
        description: newEducation.description,
      });
      if (insErr) {
        console.error("Something went wrong adding education:", insErr);
        return { success: false, message: insErr.message };
      }

      refetchProfile();
      return { success: true, message: "Education added successfully" };
    },
    [user, refetchProfile],
  );

  const saveEducation = useCallback(
    async (educationId: string, patch: Partial<UserEducationRow>) => {
      const { error: upErr } = await supabase
        .from("user_educations")
        .update(patch)
        .eq("id", educationId);
      if (upErr) {
        console.error("Something went wrong saving education:", upErr);
        return { success: false, message: upErr.message };
      }

      refetchProfile();
      return { success: true, message: "Education saved successfully" };
    },
    [refetchProfile],
  );

  const removeEducation = useCallback(
    async (educationId: string) => {
      const { error: delErr } = await supabase
        .from("user_educations")
        .delete()
        .eq("id", educationId);
      if (delErr) {
        console.error("Something went wrong deleting education:", delErr);
        return { success: false, message: delErr.message };
      }

      refetchProfile();
      return { success: true, message: "Education deleted successfully" };
    },
    [refetchProfile],
  );

  const addProject = useCallback(
    async (newProject: UserProjectRow): Promise<AsyncResultMsg> => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const { error: insErr } = await supabase.from("user_projects").insert({
        user_id: user.id,
        project_name: newProject.project_name,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        description: newProject.description ?? null,
      });

      if (insErr) {
        console.error("Something went wrong adding project:", insErr);
        return { success: false, message: insErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Project added successfully" };
    },
    [user, refetchProfile],
  );

  const saveProject = useCallback(
    async (
      projectId: string,
      patch: Partial<UserProjectRow>,
    ): Promise<AsyncResultMsg> => {
      const { error: upErr } = await supabase
        .from("user_projects")
        .update(patch)
        .eq("id", projectId);

      if (upErr) {
        console.error("Something went wrong saving project:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Project saved successfully" };
    },
    [refetchProfile],
  );

  const removeProject = useCallback(
    async (projectId: string): Promise<AsyncResultMsg> => {
      const { error: delErr } = await supabase
        .from("user_projects")
        .delete()
        .eq("id", projectId);

      if (delErr) {
        console.error("Something went wrong deleting project:", delErr);
        return { success: false, message: delErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Project deleted successfully" };
    },
    [refetchProfile],
  );

  const onSaveAdditionalInfo = useCallback(
    async (additionalInfo: UserAdditionalInfoRow) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const payload = {
        user_id: user.id,
        languages: stringToTagList(additionalInfo?.languages ?? ""),
        certifications: stringToTagList(additionalInfo?.certifications ?? ""),
      };

      const { error: upErr } = await supabase
        .from("user_additional_info")
        .upsert(payload, { onConflict: "user_id" });
      if (upErr) {
        console.error("Something went wrong saving additional info:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Additional info saved successfully" };
    },
    [user, refetchProfile],
  );

  const onSaveLink = useCallback(
    async (link: UserLinkRow) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const { error: upErr } = await supabase
        .from("user_links")
        .update({
          url: link.url,
          link_type: link.link_type,
        })
        .eq("id", link.id);

      if (upErr) {
        console.error("Something went wrong saving link:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();

      return { success: true, message: "Link saved successfully" };
    },
    [user, refetchProfile],
  );

  const onAddLink = useCallback(
    async (newLink: UserLinkRow) => {
      try {
        if (!user)
          return { success: false, message: "User is not authenticated" };

        const { error: insErr } = await supabase.from("user_links").insert({
          url: newLink.url,
          link_type: newLink.link_type,
          user_id: user.id,
        });

        if (insErr) {
          console.error("Something went wrong adding link:", insErr);
          return { success: false, message: insErr.message };
        }

        void refetchProfile();
        return { success: true, message: "Link added successfully" };
      } catch (err) {
        console.error("Something went wrong adding link:", err);
        return { success: false, message: "Link add failed" };
      }
    },
    [user, refetchProfile],
  );

  const deleteLink = useCallback(
    async (linkId: string) => {
      const { error: delErr } = await supabase
        .from("user_links")
        .delete()
        .eq("id", linkId);

      if (delErr) {
        console.error("Something went wrong deleting link:", delErr);
        return {
          success: false,
          message: delErr.message ?? "Failed to delete link",
        };
      }

      void refetchProfile();
      return { success: true, message: "Link deleted successfully" };
    },
    [refetchProfile],
  );

  const onSaveDisclosure = useCallback(
    async (disclosure: UserDisclosureRow) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };

      const { error: upErr } = await supabase
        .from("user_disclosures")
        .update({
          authorized_to_work: disclosure.authorized_to_work,
          require_sponsorship: disclosure.require_sponsorship,
          willing_to_relocate: disclosure.willing_to_relocate,
          gender: disclosure.gender,
          ethnicity: disclosure.ethnicity,
          veteran_status: disclosure.veteran_status,
          disability_status: disclosure.disability_status,
        })
        .eq("id", disclosure.id);

      if (upErr) {
        console.error("Something went wrong saving disclosure:", upErr);
        return { success: false, message: upErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Disclosure saved successfully" };
    },
    [user, refetchProfile],
  );

  const addSkill = useCallback(
    async (name: string) => {
      if (!user)
        return { success: false, message: "User is not authenticated" };
      const { error: insErr } = await supabase.from("user_skills").insert({
        user_id: user.id,
        name,
        is_from_org_resume: false,
      });
      if (insErr) {
        console.error("Something went wrong adding skill:", insErr);
        return { success: false, message: insErr.message };
      }

      void refetchProfile();
      return { success: true, message: "Skill added successfully" };
    },
    [user, refetchProfile],
  );

  const deleteSkill = useCallback(
    async (skillId: string) => {
      const { error: delErr } = await supabase
        .from("user_skills")
        .delete()
        .eq("id", skillId);
      if (delErr) {
        console.error("Something went wrong deleting skill:", delErr);
        return { success: false, message: delErr.message };
      }
      void refetchProfile();
      return { success: true, message: "Skill deleted successfully" };
    },
    [refetchProfile],
  );

  async function subscribeToPro() {
    setBillingBusy(true);
    setError(null);
    setNotice(null);
    const result = await startProSubscriptionCheckout();
    setBillingBusy(false);
    if (!result.ok) setError(result.message);
  }

  async function openBillingPortal() {
    setBillingBusy(true);
    setError(null);
    setNotice(null);
    const result = await openStripeCustomerPortal();
    setBillingBusy(false);
    if (!result.ok) setError(result.message);
  }

  return {
    user,
    tab,
    setTab,
    loading: isLoadingProfile,
    billingBusy,
    notice,
    error,
    resumeText: userProfile?.resumeText,
    subscription: userProfile?.subscription,
    userProfile,

    refetchProfile,
    saveProfile,
    saveExperience,
    saveEducation,
    addWorkExperience,
    removeExperience,
    addEducation,
    addProject,
    saveProject,
    removeProject,
    onSaveAdditionalInfo,
    removeEducation,
    deleteLink,
    addSkill,
    deleteSkill,
    subscribeToPro,
    openBillingPortal,
    onSaveDisclosure,
    onAddLink,
    onSaveLink,
  };
}
