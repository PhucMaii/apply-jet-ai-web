import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "@/context/auth-context"
import {
	emptyDisclosure,
	emptyEducation,
	emptyLink,
	emptyProfileRow,
	emptySkill,
	emptyWorkExperience,
} from "@/lib/profile-defaults"
import { NOTICE_VARIANT, type ProfileNotice } from "@/lib/profile-notice"
import {
	openStripeCustomerPortal,
	startProSubscriptionCheckout,
} from "@/lib/stripe-client"
import { supabase } from "@/lib/supabase"
import type {
	SubscriptionRow,
	UserAdditionalInfoRow,
	UserDisclosureRow,
	UserEducationRow,
	UserLinkRow,
	UserProfileRow,
	UserSkillRow,
	UserWorkExperienceRow,
} from "@/types/database"

function stringToTagList(s: string): string[] {
	return s
		.split(",")
		.map((x) => x.trim())
		.filter(Boolean)
}

export function useProfilePage() {
	const { user } = useAuth()
	const [searchParams, setSearchParams] = useSearchParams()
	const [tab, setTab] = useState("profile")
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [billingBusy, setBillingBusy] = useState(false)
	const [notice, setNotice] = useState<ProfileNotice | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [profile, setProfile] = useState<UserProfileRow | null>(null)
	const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
	const [workExperiences, setWorkExperiences] = useState<UserWorkExperienceRow[]>(
		[],
	)
	const [educations, setEducations] = useState<UserEducationRow[]>([])
	const [disclosure, setDisclosure] = useState<UserDisclosureRow | null>(null)
	const [links, setLinks] = useState<UserLinkRow[]>([])
	const [additionalInfo, setAdditionalInfo] =
		useState<UserAdditionalInfoRow | null>(null)
	const [skills, setSkills] = useState<UserSkillRow[]>([])

	const checkoutStatus = searchParams.get("checkout")

	const loadData = useCallback(async () => {
		if (!user) return
		setError(null)
		setLoading(true)
		try {
			const [
				{ data: userRow, error: userErr },
				{ data: subRow, error: subErr },
				{ data: workRows, error: workErr },
				{ data: eduRows, error: eduErr },
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
			])

			const firstError =
				userErr ??
				subErr ??
				workErr ??
				eduErr ??
				disclosureErr ??
				linkErr ??
				additionalErr ??
				skillErr

			if (firstError) {
				console.error("Something went wrong loading profile page:", firstError)
				setNotice(null)
				setError(firstError.message)
				return
			}

			if (userRow) {
				const r = userRow as UserProfileRow
				const salaryRaw = r.expected_salary
				setProfile({
					...r,
					expected_salary:
						salaryRaw === null || salaryRaw === undefined
							? null
							: typeof salaryRaw === "number"
								? salaryRaw
								: Number(salaryRaw),
				})
			} else {
				setProfile(emptyProfileRow(user.id, user.email ?? ""))
			}

			setSubscription(subRow as SubscriptionRow | null)
			setWorkExperiences((workRows as UserWorkExperienceRow[] | null) ?? [])
			setEducations((eduRows as UserEducationRow[] | null) ?? [])
			setDisclosure(
				(disclosureRow as UserDisclosureRow | null) ?? emptyDisclosure(user.id),
			)
			setLinks((linkRows as UserLinkRow[] | null) ?? [])

			const formattedAdditionalInfo = {
				...additionalRow,
				languages: additionalRow?.languages?.join(",") ?? "",
				certifications: additionalRow?.certifications?.join(",") ?? "",
			}
			setAdditionalInfo(
				formattedAdditionalInfo as UserAdditionalInfoRow | null,
			)
			setSkills((skillRows as UserSkillRow[] | null) ?? [])
		} catch (err) {
			console.error("Something went wrong loading profile page:", err)
			setNotice(null)
			setError(err instanceof Error ? err.message : "Load failed.")
		} finally {
			setLoading(false)
		}
	}, [user])

	useEffect(() => {
		void loadData()
	}, [loadData])

	useEffect(() => {
		if (checkoutStatus === "success") {
			setNotice({
				variant: NOTICE_VARIANT.success,
				text:
					"Checkout completed. Your plan will update in a few seconds once " +
					"Stripe confirms the subscription.",
			})
			setTab("billing")
			setSearchParams({}, { replace: true })
			void loadData()
		} else if (checkoutStatus === "cancel") {
			setNotice({
				variant: NOTICE_VARIANT.info,
				text: "Checkout canceled—no changes were made.",
			})
			setTab("billing")
			setSearchParams({}, { replace: true })
		}
	}, [checkoutStatus, loadData, setSearchParams])

	async function saveProfile(e: React.FormEvent) {
		e.preventDefault()
		if (!user || !profile) return
		setSaving(true)
		setError(null)
		setNotice(null)
		try {
			const fullName = [profile.first_name, profile.last_name]
				.filter(Boolean)
				.join(" ")
				.trim()

			const payload = {
				id: user.id,
				email: profile.email?.trim() || null,
				full_name: fullName || null,
				first_name: profile.first_name?.trim() || null,
				last_name: profile.last_name?.trim() || null,
				phone: profile.phone?.trim() || null,
				address_line1: profile.address_line1?.trim() || null,
				address_line2: profile.address_line2?.trim() || null,
				city: profile.city?.trim() || null,
				province: profile.province?.trim() || null,
				country: profile.country?.trim() || null,
				postal_code: profile.postal_code?.trim() || null,
				expected_salary:
					profile.expected_salary === null ||
					profile.expected_salary === undefined ||
					String(profile.expected_salary) === ""
						? null
						: Number(profile.expected_salary),
				summary: profile.summary?.trim() || null,
			}

			const { error: upErr } = await supabase.from("users").upsert(payload, {
				onConflict: "id",
			})

			if (upErr) {
				console.error("Something went wrong saving profile:", upErr)
				setError(upErr.message)
				return
			}

			await loadData()
			setNotice({
				variant: NOTICE_VARIANT.success,
				text: "Profile saved. Autofill will use these details.",
			})
		} catch (err) {
			console.error("Something went wrong saving profile:", err)
			setError(err instanceof Error ? err.message : "Save failed.")
		} finally {
			setSaving(false)
		}
	}

	const saveExperience = useCallback(
		async (experienceId: string, patch: Partial<UserWorkExperienceRow>) => {
			const { error: upErr } = await supabase
				.from("user_work_experiences")
				.update(patch)
				.eq("id", experienceId)
			if (upErr) throw new Error(upErr.message)
			toast.success("Experience saved")
		},
		[],
	)

	const saveEducation = useCallback(
		async (educationId: string, patch: Partial<UserEducationRow>) => {
			const { error: upErr } = await supabase
				.from("user_educations")
				.update(patch)
				.eq("id", educationId)
			if (upErr) throw new Error(upErr.message)
			toast.success("Education saved")
		},
		[],
	)

	const addWorkExperience = useCallback(() => {
		if (!user) return
		setWorkExperiences((prev) => [...prev, emptyWorkExperience(user.id)])
	}, [user])

	const addEducation = useCallback(() => {
		if (!user) return
		setEducations((prev) => [...prev, emptyEducation(user.id)])
	}, [user])

	const saveLinksAndAdditionalInfo = useCallback(async () => {
		if (!user) return
		const { error: upErr } = await supabase.from("user_links").upsert(
			links.map((link) => ({
				url: link.url,
				link_type: link.link_type,
				user_id: user.id,
			})),
			{ onConflict: "user_id,link_type" },
		)
		if (upErr) throw new Error(upErr.message)

		const { error: addErr } = await supabase.from("user_additional_info").upsert(
			{
				user_id: user.id,
				languages: stringToTagList(additionalInfo?.languages ?? ""),
				certifications: stringToTagList(additionalInfo?.certifications ?? ""),
			},
			{ onConflict: "user_id" },
		)
		if (addErr) throw new Error(addErr.message)

		toast.success("Links and additional info saved")
	}, [links, additionalInfo, user])

	const deleteLink = useCallback(async (linkId: string) => {
		const { error: delErr } = await supabase
			.from("user_links")
			.delete()
			.eq("id", linkId)
		if (delErr) throw new Error(delErr.message)
		toast.success("Link deleted")
	}, [])

	const addLink = useCallback(() => {
		if (!user) return
		setLinks((prev) => [...prev, emptyLink(user.id)])
	}, [user])

	const addSkill = useCallback(
		async (name: string) => {
			if (!user) return
			const { error: insErr } = await supabase.from("user_skills").insert({
				user_id: user.id,
				name,
				is_from_org_resume: false,
			})
			if (insErr) throw new Error(insErr.message)

			toast.success("Skill added")
			setSkills((prev) => [...prev, { ...emptySkill(user.id), name }])
		},
		[user],
	)

	const deleteSkill = useCallback(async (skillId: string) => {
		const { error: delErr } = await supabase
			.from("user_skills")
			.delete()
			.eq("id", skillId)
		if (delErr) throw new Error(delErr.message)
		toast.success("Skill deleted")
	}, [])

	async function subscribeToPro() {
		setBillingBusy(true)
		setError(null)
		setNotice(null)
		const result = await startProSubscriptionCheckout()
		setBillingBusy(false)
		if (!result.ok) setError(result.message)
	}

	async function openBillingPortal() {
		setBillingBusy(true)
		setError(null)
		setNotice(null)
		const result = await openStripeCustomerPortal()
		setBillingBusy(false)
		if (!result.ok) setError(result.message)
	}

	return {
		user,
		tab,
		setTab,
		loading,
		saving,
		billingBusy,
		notice,
		error,
		profile,
		setProfile,
		subscription,
		workExperiences,
		setWorkExperiences,
		educations,
		setEducations,
		disclosure,
		setDisclosure,
		links,
		setLinks,
		additionalInfo,
		setAdditionalInfo,
		skills,
		setSkills,
		loadData,
		saveProfile,
		saveExperience,
		saveEducation,
		addWorkExperience,
		addEducation,
		saveLinksAndAdditionalInfo,
		deleteLink,
		addLink,
		addSkill,
		deleteSkill,
		subscribeToPro,
		openBillingPortal,
	}
}
