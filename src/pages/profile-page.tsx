import { useCallback, useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
	AlertCircle,
	AlertTriangle,
	BriefcaseBusiness,
	CalendarDays,
	CheckCircle2,
	CircleDashed,
	CircleOff,
	CreditCard,
	Crown,
	Globe,
	GraduationCap,
	Info,
	LayoutList,
	Link2,
	Loader2,
	LogOut,
	Puzzle,
	ShieldCheck,
	Sparkles,
	UserRound,
	Wrench,
	XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { APP_NAME, BRAND_LOGO_SRC, LINKS, ROUTES } from "@/lib/constants"
import { env } from "@/lib/env"
import {
	openStripeCustomerPortal,
	startProSubscriptionCheckout,
} from "@/lib/stripe-client"
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
import { cn } from "@/lib/utils"
import { ProfileContactEditor } from "@/components/profile/contact-editor"
import { WorkExperienceEditor } from "@/components/profile/work-experience-editor"
import { EducationEditor } from "@/components/profile/education-editor"
import { LinksAdditionalEditor } from "@/components/profile/links-additional-editor"
import { DisclosureEditor } from "@/components/profile/disclosure-editor"
import { SkillsEditor } from "@/components/profile/skills-editor"
import { ResumeSection } from "@/components/profile/resume-section"
import toast from "react-hot-toast"

const PROFILE_SECTION = {
	contact: "contact",
	work: "work",
	education: "education",
	links: "links",
	disclosure: "disclosure",
	skills: "skills",
} as const

type ProfileSection = (typeof PROFILE_SECTION)[keyof typeof PROFILE_SECTION]

const PROFILE_SECTION_META: Record<
	ProfileSection,
	{ label: string; Icon: LucideIcon }
> = {
	[PROFILE_SECTION.contact]: { label: "Contact", Icon: UserRound },
	[PROFILE_SECTION.work]: { label: "Work", Icon: BriefcaseBusiness },
	[PROFILE_SECTION.education]: { label: "Education", Icon: GraduationCap },
	[PROFILE_SECTION.links]: { label: "Links", Icon: Link2 },
	[PROFILE_SECTION.disclosure]: { label: "Disclosure", Icon: ShieldCheck },
	[PROFILE_SECTION.skills]: { label: "Skills", Icon: Wrench },
}

const EMPTY_DISPLAY = "—"

const NOTICE_VARIANT = {
	success: "success",
	info: "info",
	warning: "warning",
} as const

type NoticeVariant = (typeof NOTICE_VARIANT)[keyof typeof NOTICE_VARIANT]

interface ProfileNotice {
	variant: NoticeVariant
	text: string
}

function getSubscriptionStatusPresentation(
	statusRaw: string | null | undefined,
): {
	Icon: LucideIcon
	label: string
	containerClass: string
	textClass: string
} {
	const normalized = (statusRaw ?? "").trim().toLowerCase().replace(/\s+/g, "_")
	if (!normalized) {
		return {
			Icon: CircleOff,
			label: EMPTY_DISPLAY,
			containerClass: "border-border/50 bg-muted/10",
			textClass: "text-muted-foreground",
		}
	}
	const prettyLabel = normalized
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ")

	switch (normalized) {
		case "active":
			return {
				Icon: CheckCircle2,
				label: prettyLabel,
				containerClass: "border-success/35 bg-success/10",
				textClass: "font-medium text-success",
			}
		case "trialing":
			return {
				Icon: Sparkles,
				label: prettyLabel,
				containerClass: "border-info/35 bg-info/10",
				textClass: "font-medium text-info",
			}
		case "past_due":
		case "unpaid":
			return {
				Icon: AlertTriangle,
				label: prettyLabel,
				containerClass: "border-destructive/35 bg-destructive/10",
				textClass: "font-medium text-destructive",
			}
		case "canceled":
		case "cancelled":
			return {
				Icon: XCircle,
				label: prettyLabel,
				containerClass: "border-border/60 bg-muted/20",
				textClass: "font-medium text-muted-foreground",
			}
		case "incomplete":
		case "incomplete_expired":
			return {
				Icon: AlertTriangle,
				label: prettyLabel,
				containerClass: "border-warning/35 bg-warning/10",
				textClass: "font-medium text-warning",
			}
		default:
			return {
				Icon: Info,
				label: prettyLabel,
				containerClass: "border-border/60 bg-muted/15",
				textClass: "font-medium text-foreground",
			}
	}
}

function getPlanPresentation(plan: SubscriptionRow["plan"] | null | undefined) {
	const isPro = plan === "pro"
	return {
		Icon: isPro ? Crown : CircleDashed,
		label: isPro ? "Pro" : "Free",
		containerClass: isPro
			? "border-success/35 bg-success/10"
			: "border-border/60 bg-muted/15",
		valueClass: isPro ? "text-success" : "text-muted-foreground",
	}
}

function emptyProfileRow(id: string, authEmail: string): UserProfileRow {
	return {
		id,
		email: authEmail,
		full_name: null,
		first_name: null,
		last_name: null,
		phone: null,
		address_line1: null,
		address_line2: null,
		city: null,
		province: null,
		country: null,
		postal_code: null,
		expected_salary: null,
		summary: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
}

function emptyWorkExperience(userId: string): UserWorkExperienceRow {
	return {
		id: "",
		user_id: userId,
		location: null,
		start_date: null,
		end_date: null,
		currently_working: false,
		description: null,
		created_at: "",
		company: null,
		title: null,
		employment_type: null,
		updated_at: "",
	}
}

function emptyEducation(userId: string): UserEducationRow {
	return {
		id: "",
		user_id: userId,
		degree: null,
		field_of_study: null,
		start_date: null,
		end_date: null,
		gpa: null,
		description: null,
		created_at: "",
		school: null,
		updated_at: "",
	}
}

function emptyDisclosure(userId: string): UserDisclosureRow {
	return {
		id: "",
		user_id: userId,
		authorized_to_work: null,
		willing_to_relocate: null,
		gender: null,
		ethnicity: null,
		veteran_status: null,
		disability_status: null,
		created_at: "",
		require_sponsorship: null,
	}
}

function emptyLink(userId: string): UserLinkRow {
	return {
		id: "",
		user_id: userId,
		url: "",
		link_type: null,
		created_at: "",
		updated_at: "",
	}
}

function emptySkill(userId: string): UserSkillRow {
	return {
		id: "",
		user_id: userId,
		name: "",
		created_at: "",
		is_from_org_resume: false,
	}
}

export function ProfilePage() {
	const { user, signOut } = useAuth()
	const [searchParams, setSearchParams] = useSearchParams()
	const [tab, setTab] = useState("profile")
	const [profileSection, setProfileSection] = useState<ProfileSection>(
		PROFILE_SECTION.contact,
	)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [billingBusy, setBillingBusy] = useState(false)
	const [notice, setNotice] = useState<ProfileNotice | null>(null)
	const [error, setError] = useState<string | null>(null)

	const [profile, setProfile] = useState<UserProfileRow | null>(null)
	const [subscription, setSubscription] = useState<SubscriptionRow | null>(
		null,
	)
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

			if (userErr) {
				console.error("Something went wrong loading profile:", userErr)
				setNotice(null)
				setError(userErr.message)
				return
			}
			if (subErr) {
				console.error("Something went wrong loading subscription:", subErr)
				setNotice(null)
				setError(subErr.message)
				return
			}
			if (workErr) {
				console.error("Something went wrong loading experiences:", workErr)
				setNotice(null)
				setError(workErr.message)
				return
			}
			if (eduErr) {
				console.error("Something went wrong loading education:", eduErr)
				setNotice(null)
				setError(eduErr.message)
				return
			}
			if (disclosureErr) {
				console.error("Something went wrong loading disclosures:", disclosureErr)
				setNotice(null)
				setError(disclosureErr.message)
				return
			}
			if (linkErr) {
				console.error("Something went wrong loading links:", linkErr)
				setNotice(null)
				setError(linkErr.message)
				return
			}
			if (additionalErr) {
				console.error(
					"Something went wrong loading additional info:",
					additionalErr,
				)
				setNotice(null)
				setError(additionalErr.message)
				return
			}
			if (skillErr) {
				console.error("Something went wrong loading skills:", skillErr)
				setNotice(null)
				setError(skillErr.message)
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
				const seed = emptyProfileRow(user.id, user.email ?? "")
				setProfile(seed)
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
			setAdditionalInfo(formattedAdditionalInfo as UserAdditionalInfoRow | null)
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

	async function handleSaveProfile(e: React.FormEvent) {
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

	const handleSaveExperience = useCallback(async (experienceId: string, patch: Partial<UserWorkExperienceRow>) => {
		const { error: upErr } = await supabase.from("user_work_experiences").update(patch).eq("id", experienceId)
		if (upErr) throw new Error(upErr.message)

		toast.success("Experience saved")
	}, []);

	const handleSaveEducation = useCallback(async (educationId: string, patch: Partial<UserEducationRow>) => {
		const { error: upErr } = await supabase.from("user_educations").update(patch).eq("id", educationId)
		if (upErr) throw new Error(upErr.message)

		toast.success("Education saved")
	}, []);

	const handleAddWorkExperience = useCallback(() => {
		if (!user) return
		setWorkExperiences((prev) => [
			...prev,
			emptyWorkExperience(user.id),
		])
	}, [user])

	const handleAddEducation = useCallback(() => {
		if (!user) return
		setEducations((prev) => [
			...prev,
			emptyEducation(user.id),
		])
	}, [user])

	function stringToTagList(s: string): string[] {
		return s
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean)
	}

	const handleSaveLinksAndAdditionalInfo = useCallback(async () => {
		if (!user) return
		const { error: upErr } = await supabase.from("user_links").upsert(links.map(link => ({
			url: link.url,
			link_type: link.link_type,
			user_id: user.id,
		})), {
			onConflict: "user_id,link_type",
		})
		if (upErr) throw new Error(upErr.message)

		console.log(additionalInfo, "additionalInfo")
		const { error: addErr } = await supabase.from("user_additional_info").upsert({
			user_id: user.id,
			languages: stringToTagList(additionalInfo?.languages ?? ""),
			certifications: stringToTagList(additionalInfo?.certifications ?? ""),
		}, {
			onConflict: "user_id",
		})
		if (addErr) throw new Error(addErr.message)

		toast.success("Links and additional info saved")
	}, [links, additionalInfo, user])

	const handleDeleteLink = useCallback(async (linkId: string) => {
		const { error: delErr } = await supabase.from("user_links").delete().eq("id", linkId)
		if (delErr) throw new Error(delErr.message)

		toast.success("Link deleted")
	}, []);

	const handleAddLink = useCallback(() => {
		if (!user) return
		setLinks((prev) => [...prev, emptyLink(user.id)])
	}, [user])

	const handleAddSkill = useCallback(async (name: string) => {
		if (!user) return
		const { error: insErr } = await supabase.from("user_skills").insert({
			user_id: user.id,
			name,
			is_from_org_resume: false,
		})
		if (insErr) throw new Error(insErr.message)

		toast.success("Skill added")

		setSkills((prev) => [
			...prev,
			{
				...emptySkill(user.id),
				name,
			},
		])
	}, [user])

	const handleDeleteSkill = useCallback(async (skillId: string) => {
		const { error: delErr } = await supabase.from("user_skills").delete().eq("id", skillId)
		if (delErr) throw new Error(delErr.message)

		toast.success("Skill deleted")
	}, []);

	// const handleSaveDisclosure = useCallback(async () => {
	// 	if (!user) return
	// 	const { error: upErr } = await supabase.from("user_disclosure").update({
	// 		authorized_to_work: disclosure?.authorized_to_work,
	// 		require_sponsorship: disclosure?.require_sponsorship,
	// 		willing_to_relocate: disclosure?.willing_to_relocate,
	// 		gender: disclosure?.gender,
	// 		ethnicity: disclosure?.ethnicity,
	// 		veteran_status: disclosure?.veteran_status,
	// 		disability_status: disclosure?.disability_status,
	// 	}).eq("user_id", user?.id ?? "")
	// 	if (upErr) throw new Error(upErr.message)

	// 	toast.success("Disclosure saved")
	// }, [user]);

	async function handleSubscribe() {
		setBillingBusy(true)
		setError(null)
		setNotice(null)
		const result = await startProSubscriptionCheckout()
		setBillingBusy(false)
		if (!result.ok) {
			setError(result.message)
		}
	}

	async function handlePortal() {
		setBillingBusy(true)
		setError(null)
		setNotice(null)
		const result = await openStripeCustomerPortal()
		setBillingBusy(false)
		if (!result.ok) {
			setError(result.message)
		}
	}

	const periodEnd = subscription?.current_period_end
		? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		})
		: null

	const planPresentation = getPlanPresentation(subscription?.plan)
	const statusPresentation = getSubscriptionStatusPresentation(
		subscription?.status,
	)
	const PlanIcon = planPresentation.Icon
	const StatusIcon = statusPresentation.Icon

	const accountInitials = (
		user?.email?.split("@")[0]?.slice(0, 2) || "?"
	).toUpperCase()

	return (
		<div className="relative z-10 min-h-screen pb-20">
			<div
				className={cn(
					"border-b border-border/60 bg-gradient-to-b from-card/50",
					"to-background/90 backdrop-blur-xl",
				)}
			>
				<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
					<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex min-w-0 gap-4">
							<div
								className={cn(
									"flex size-14 shrink-0 items-center justify-center",
									"rounded-2xl bg-gradient-to-br from-primary/25 to-accent/15",
									"text-lg font-bold tracking-tight text-primary-foreground",
									"ring-2 ring-primary/20 shadow-glow-sm",
								)}
								aria-hidden
							>
								{accountInitials}
							</div>
							<div className="min-w-0">
								<div className="mb-1 flex flex-wrap items-center gap-2">
									<span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-border/60">
										<img
											src={BRAND_LOGO_SRC}
											alt=""
											width={32}
											height={32}
											className="size-8 object-contain object-center"
											decoding="async"
										/>
									</span>
									<p className="text-xs font-semibold uppercase tracking-wider text-primary">
										{APP_NAME}
									</p>
								</div>
								<h1 className="font-display text-3xl font-bold tracking-tight">
									Your profile
								</h1>
								<p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
									Fine-tune autofill, resume, and billing in one calm
									workspace—everything saves where you expect it.
								</p>
								<p className="mt-2 truncate text-sm font-medium text-foreground/90">
									{user?.email ?? "Signed in"}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 sm:justify-end">
							<Button variant="secondary" size="sm" className="gap-2" asChild>
								<Link to={ROUTES.applications}>
									<LayoutList className="size-4 shrink-0 opacity-80" aria-hidden />
									Applications
								</Link>
							</Button>
							<Button variant="secondary" size="sm" className="gap-2" asChild>
								<Link to={ROUTES.home}>
									<Globe className="size-4 shrink-0 opacity-80" aria-hidden />
									Marketing
								</Link>
							</Button>
							<Button variant="secondary" size="sm" className="gap-2" asChild>
								<a
									href={LINKS.extensionDownload}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Puzzle className="size-4 shrink-0 opacity-80" aria-hidden />
									Extension
								</a>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="gap-2 text-muted-foreground hover:text-foreground"
								onClick={() => void signOut()}
							>
								<LogOut className="size-4" aria-hidden />
								Log out
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
				{error ? (
					<div
						className={cn(
							"flex gap-3 rounded-lg border px-4 py-3 text-sm",
							"border-destructive/45 bg-destructive/10 text-destructive",
						)}
						role="alert"
					>
						<AlertCircle
							className="mt-0.5 size-5 shrink-0 text-destructive"
							aria-hidden
						/>
						<p className="min-w-0 leading-relaxed">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className={cn(
							"flex gap-3 rounded-lg border px-4 py-3 text-sm",
							notice.variant === NOTICE_VARIANT.success &&
							"border-success/45 bg-success/10 text-foreground",
							notice.variant === NOTICE_VARIANT.info &&
							"border-info/45 bg-info/10 text-foreground",
							notice.variant === NOTICE_VARIANT.warning &&
							"border-warning/45 bg-warning/10 text-foreground",
						)}
						role="status"
						aria-live="polite"
					>
						{notice.variant === NOTICE_VARIANT.success ? (
							<CheckCircle2
								className="mt-0.5 size-5 shrink-0 text-success"
								aria-hidden
							/>
						) : notice.variant === NOTICE_VARIANT.warning ? (
							<AlertTriangle
								className="mt-0.5 size-5 shrink-0 text-warning"
								aria-hidden
							/>
						) : (
							<Info
								className="mt-0.5 size-5 shrink-0 text-info"
								aria-hidden
							/>
						)}
						<p className="min-w-0 leading-relaxed">{notice.text}</p>
					</div>
				) : null}

				{loading || !profile ? (
					<div
						className={cn(
							"flex flex-col items-center justify-center gap-4 rounded-2xl",
							"border border-border/50 bg-card/30 py-24 text-muted-foreground",
							"backdrop-blur-sm",
						)}
					>
						<div
							className={cn(
								"flex size-14 items-center justify-center rounded-2xl",
								"bg-primary/10 text-primary ring-1 ring-primary/20",
							)}
						>
							<Loader2 className="size-7 animate-spin" aria-hidden />
						</div>
						<div className="text-center">
							<p className="text-sm font-medium text-foreground">
								Loading your workspace
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Almost there…
							</p>
						</div>
					</div>
				) : (
					<Tabs value={tab} onValueChange={setTab} className="w-full">
						<TabsList
							className={cn(
								"grid h-12 w-full max-w-md grid-cols-2 gap-1 rounded-xl",
								"border border-border/60 bg-muted/30 p-1",
							)}
						>
							<TabsTrigger
								value="profile"
								className={cn(
									"gap-2 rounded-lg text-sm transition-all duration-200",
									"data-[state=active]:shadow-glow-sm",
								)}
							>
								<UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
								Autofill profile
							</TabsTrigger>
							<TabsTrigger
								value="billing"
								className={cn(
									"gap-2 rounded-lg text-sm transition-all duration-200",
									"data-[state=active]:shadow-glow-sm",
								)}
							>
								<CreditCard className="size-4 shrink-0 opacity-80" aria-hidden />
								Billing
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile" className="mt-6 outline-none">
							<Tabs
								value={profileSection}
								onValueChange={(value) =>
									setProfileSection(value as ProfileSection)
								}
								className="w-full"
							>
								<TabsList
									className={cn(
										"mb-6 flex h-auto w-full flex-wrap",
										"items-stretch justify-start gap-1.5 rounded-xl",
										"border border-border/50 bg-muted/20 p-1.5",
									)}
								>
									{(Object.keys(PROFILE_SECTION) as ProfileSection[]).map(
										(key) => {
											const meta = PROFILE_SECTION_META[key]
											const SectionIcon = meta.Icon
											return (
												<TabsTrigger
													key={key}
													value={key}
													className={cn(
														"min-w-0 gap-1.5 rounded-lg px-2.5 py-2",
														"text-xs font-medium transition-all duration-200",
														"data-[state=active]:bg-background/80",
														"data-[state=active]:text-foreground",
														"data-[state=active]:shadow-sm",
													)}
												>
													<SectionIcon
														className="size-3.5 shrink-0 opacity-80"
														aria-hidden
													/>
													{meta.label}
												</TabsTrigger>
											)
										},
									)}
								</TabsList>

								<div
									className={cn(
										"rounded-2xl border border-border/50 bg-card/25",
										"p-4 shadow-glow-sm backdrop-blur-sm sm:p-6",
									)}
								>
									<ResumeSection
										userId={user?.id ?? null}
										refetchProfile={() => loadData() as Promise<void>}
									/>
									<TabsContent
										value={PROFILE_SECTION.contact}
										className="space-y-4 focus-visible:outline-none"
									>
										<Card
											className={cn(
												"border-border/60 bg-card/50 backdrop-blur-md",
												"transition-shadow duration-300 hover:shadow-glow-sm",
											)}
										>
											<CardHeader className="space-y-3 pb-2">
												<CardTitle className="flex items-start gap-3 font-display text-xl">
													<span
														className={cn(
															"flex size-10 shrink-0 items-center justify-center",
															"rounded-xl bg-primary/15 text-primary",
															"ring-1 ring-primary/20",
														)}
													>
														<UserRound className="size-5" aria-hidden />
													</span>
													<span className="pt-0.5">
														Contact &amp; application details
													</span>
												</CardTitle>
												<CardDescription className="pl-[3.25rem] text-pretty leading-relaxed">
													We use this information for autofill in job applications.
													Your login email is managed by your auth provider; you can
													store a different contact email below if needed.
												</CardDescription>
											</CardHeader>
											<CardContent>
												<ProfileContactEditor
													userEmail={user?.email}
													profile={profile}
													setProfile={setProfile}
													saving={saving}
													onSubmit={handleSaveProfile}
												/>
											</CardContent>
										</Card>
									</TabsContent>

									<TabsContent
										value={PROFILE_SECTION.work}
										className="space-y-4 focus-visible:outline-none"
									>
										<WorkExperienceEditor
											items={workExperiences}
											setItems={setWorkExperiences}
											onAdd={handleAddWorkExperience}
											onSave={handleSaveExperience}
										/>
									</TabsContent>

									<TabsContent
										value={PROFILE_SECTION.education}
										className="space-y-4 focus-visible:outline-none"
									>
										<EducationEditor
											items={educations}
											setItems={setEducations}
											onAdd={handleAddEducation}
											onSave={handleSaveEducation}
										/>

									</TabsContent>

									<TabsContent
										value={PROFILE_SECTION.links}
										className="space-y-4 focus-visible:outline-none"
									>
										<LinksAdditionalEditor
											links={links}
											setLinks={setLinks}
											additionalInfo={additionalInfo}
											setAdditionalInfo={setAdditionalInfo}
											onAddLink={handleAddLink}
											onDeleteLink={handleDeleteLink}
											onSave={handleSaveLinksAndAdditionalInfo}
										/>

									</TabsContent>

									<TabsContent
										value={PROFILE_SECTION.disclosure}
										className="space-y-4 focus-visible:outline-none"
									>
										<DisclosureEditor
											disclosure={disclosure}
											setDisclosure={setDisclosure}
										/>

									</TabsContent>

									<TabsContent
										value={PROFILE_SECTION.skills}
										className="space-y-4 focus-visible:outline-none"
									>
										<SkillsEditor
											items={skills}
											setItems={setSkills}
											onCreateSkill={handleAddSkill}
											onDeleteSkill={handleDeleteSkill}
										/>

									</TabsContent>
								</div>
							</Tabs>
						</TabsContent>

						<TabsContent value="billing" className="mt-6 outline-none">
							<Card
								className={cn(
									"border-border/60 bg-card/50 backdrop-blur-md",
									"transition-shadow duration-300 hover:shadow-glow-sm",
								)}
							>
								<CardHeader className="space-y-3 pb-2">
									<CardTitle className="flex items-start gap-3 font-display text-xl">
										<span
											className={cn(
												"flex size-10 shrink-0 items-center justify-center",
												"rounded-xl bg-accent/15 text-accent",
												"ring-1 ring-accent/25",
											)}
										>
											<CreditCard className="size-5" aria-hidden />
										</span>
										<span className="pt-0.5">Plan &amp; billing</span>
									</CardTitle>
									<CardDescription className="pl-[3.25rem] text-pretty leading-relaxed">
										Subscribe with{" "}
										<a
											href="https://docs.stripe.com/payments/checkout"
											className="font-medium text-primary underline-offset-4 hover:underline"
											target="_blank"
											rel="noreferrer"
										>
											Stripe Checkout
										</a>{" "}
										(hosted payment page). Manage cards, invoices, and
										cancellation in the{" "}
										<a
											href="https://docs.stripe.com/customer-management"
											className="font-medium text-primary underline-offset-4 hover:underline"
											target="_blank"
											rel="noreferrer"
										>
											Stripe Customer Portal
										</a>
										.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<dl className="grid gap-3 sm:grid-cols-2">
										<div
											className={cn(
												"rounded-xl border p-4",
												planPresentation.containerClass,
											)}
										>
											<dt
												className={cn(
													"flex items-center gap-2 text-xs font-semibold uppercase",
													"tracking-wide text-muted-foreground",
												)}
											>
												<PlanIcon className="size-3.5 shrink-0" aria-hidden />
												Plan
											</dt>
											<dd
												className={cn(
													"mt-2 font-display text-lg font-semibold",
													planPresentation.valueClass,
												)}
											>
												{planPresentation.label}
											</dd>
										</div>
										<div
											className={cn(
												"rounded-xl border p-4",
												statusPresentation.containerClass,
											)}
										>
											<dt
												className={cn(
													"text-xs font-semibold uppercase tracking-wide",
													"text-muted-foreground",
												)}
											>
												Status
											</dt>
											<dd
												className={cn(
													"mt-2 flex items-center gap-2 text-sm",
													statusPresentation.textClass,
												)}
											>
												<StatusIcon className="size-4 shrink-0" aria-hidden />
												{statusPresentation.label}
											</dd>
										</div>
										<div
											className={cn(
												"rounded-xl border p-4 sm:col-span-2",
												periodEnd
													? "border-info/30 bg-info/5"
													: "border-border/60 bg-muted/10",
											)}
										>
											<dt
												className={cn(
													"flex items-center gap-2 text-xs font-semibold uppercase",
													"tracking-wide text-muted-foreground",
												)}
											>
												<CalendarDays
													className={cn(
														"size-3.5 shrink-0",
														periodEnd ? "text-info" : "opacity-60",
													)}
													aria-hidden
												/>
												Current period ends
											</dt>
											<dd
												className={cn(
													"mt-2 text-sm font-medium",
													periodEnd
														? "text-foreground"
														: "text-muted-foreground",
												)}
											>
												{periodEnd ?? EMPTY_DISPLAY}
											</dd>
										</div>
									</dl>

									{!env.isStripePriceConfigured ? (
										<div
											className={cn(
												"flex gap-3 rounded-lg border px-4 py-3 text-sm",
												"border-warning/45 bg-warning/10 text-warning",
											)}
											role="status"
										>
											<AlertTriangle
												className="mt-0.5 size-5 shrink-0 text-warning"
												aria-hidden
											/>
											<p className="min-w-0 leading-relaxed">
												Set{" "}
												<code className="rounded bg-muted px-1 py-0.5 text-xs">
													VITE_STRIPE_PRICE_PRO
												</code>{" "}
												in your app env and{" "}
												<code className="rounded bg-muted px-1 py-0.5 text-xs">
													STRIPE_PRICE_PRO
												</code>{" "}
												(or pass{" "}
												<code className="rounded bg-muted px-1 py-0.5 text-xs">
													priceId
												</code>{" "}
												from the client) on the Edge Function to enable
												checkout.
											</p>
										</div>
									) : null}

									<div className="flex flex-wrap gap-3">
										<Button
											type="button"
											disabled={
												billingBusy ||
												!env.isStripePriceConfigured ||
												subscription?.plan === "pro"
											}
											onClick={() => void handleSubscribe()}
											className="gap-2"
										>
											{billingBusy ? (
												<Loader2 className="size-4 animate-spin" aria-hidden />
											) : null}
											Subscribe to Pro
										</Button>
										<Button
											type="button"
											variant="secondary"
											disabled={
												billingBusy ||
												!subscription?.stripe_customer_id
											}
											onClick={() => void handlePortal()}
											className="gap-2"
										>
											{billingBusy ? (
												<Loader2 className="size-4 animate-spin" aria-hidden />
											) : null}
											Manage billing
										</Button>
									</div>

									<div
										className={cn(
											"flex gap-2.5 rounded-lg border border-info/20",
											"bg-info/5 px-3 py-2.5 text-xs leading-relaxed",
											"text-muted-foreground",
										)}
									>
										<Info
											className="mt-0.5 size-3.5 shrink-0 text-info"
											aria-hidden
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				)}
			</div>
		</div>
	)
}
