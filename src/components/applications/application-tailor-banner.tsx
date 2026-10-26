import { useEffect, useId, useRef, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import type { TailorStatus } from "@/lib/create-tailored-application"
import { JOBS_COPY } from "@/lib/jobs-copy"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const POLL_MS = 2500
const TERMINAL: TailorStatus[] = ["ready", "partial", "failed"]

function isTailorStatus(value: string | null | undefined): value is TailorStatus {
	return (
		value === "pending" ||
		value === "tailoring" ||
		value === "ready" ||
		value === "partial" ||
		value === "failed"
	)
}

interface ApplicationTailorBannerProps {
	applicationId: string
	initialStatus: string | null | undefined
	onReady?: () => void
}

export function ApplicationTailorBanner({
	applicationId,
	initialStatus,
	onReady,
}: ApplicationTailorBannerProps) {
	const titleId = useId()
	const [status, setStatus] = useState<TailorStatus | null>(() =>
		isTailorStatus(initialStatus) ? initialStatus : null,
	)
	const [modalDismissed, setModalDismissed] = useState(false)
	const onReadyRef = useRef(onReady)
	onReadyRef.current = onReady
	const notifiedReadyRef = useRef(false)

	useEffect(() => {
		setStatus(isTailorStatus(initialStatus) ? initialStatus : null)
		setModalDismissed(false)
		notifiedReadyRef.current = false
	}, [applicationId, initialStatus])

	useEffect(() => {
		if (!status || TERMINAL.includes(status)) return

		const previousStatus = status
		let cancelled = false

		async function poll() {
			const { data, error } = await supabase
				.from("applications")
				.select("tailor_status, tailor_feedback")
				.eq("id", applicationId)
				.maybeSingle()

			if (cancelled) return
			if (error) {
				console.error(
					"Something went wrong polling tailor_status:",
					error,
				)
				return
			}

			const next = data?.tailor_status
			if (!isTailorStatus(next)) return

			const becameTerminal =
				TERMINAL.includes(next) && !TERMINAL.includes(previousStatus)

			setStatus(next)

			if (becameTerminal && !notifiedReadyRef.current) {
				notifiedReadyRef.current = true
				onReadyRef.current?.()
			}
		}

		void poll()
		const timer = window.setInterval(() => {
			void poll()
		}, POLL_MS)

		return () => {
			cancelled = true
			window.clearInterval(timer)
		}
	}, [applicationId, status])

	if (!status) return null

	const isRunning = status === "pending" || status === "tailoring"
	const showModal = isRunning && !modalDismissed
	const message =
		status === "ready"
			? JOBS_COPY.tailorBannerReady
			: status === "partial"
				? JOBS_COPY.tailorBannerPartial
				: status === "failed"
					? JOBS_COPY.tailorBannerFailed
					: JOBS_COPY.tailorBannerRunning

	return (
		<>
			<div
				className={cn(
					"flex items-start gap-2.5 border-b px-4 py-2.5 text-sm",
					isRunning
						? "border-brand/20 bg-brand/5 text-ink"
						: status === "failed"
							? "border-amber-200 bg-amber-50 text-amber-950"
							: status === "partial"
								? "border-amber-200 bg-amber-50 text-amber-950"
								: "border-emerald-200 bg-emerald-50 text-emerald-950",
				)}
				role="status"
				aria-live="polite"
			>
				{isRunning ? (
					<Loader2
						className="mt-0.5 size-4 shrink-0 animate-spin text-brand"
						aria-hidden
					/>
				) : (
					<Sparkles
						className={cn(
							"mt-0.5 size-4 shrink-0",
							status === "ready" ? "text-emerald-600" : "text-amber-600",
						)}
						aria-hidden
					/>
				)}
				<p className="leading-snug">{message}</p>
			</div>

			<Modal
				isOpen={showModal}
				onClose={() => setModalDismissed(true)}
				labelledBy={titleId}
			>
				<div className="pr-8">
					<div className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
						<Loader2 className="size-5 animate-spin" aria-hidden />
					</div>
					<h2
						id={titleId}
						className="mt-4 font-display text-xl font-semibold tracking-tight text-ink"
					>
						{JOBS_COPY.tailorModalTitle}
					</h2>
					<p className="mt-2 text-sm leading-relaxed text-ink-muted">
						{JOBS_COPY.tailorModalBody}
					</p>
					<p className="mt-3 text-xs leading-relaxed text-ink-subtle">
						{JOBS_COPY.tailorModalHint}
					</p>
					<div className="mt-6 flex justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => setModalDismissed(true)}
						>
							{JOBS_COPY.tailorModalDone}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}
