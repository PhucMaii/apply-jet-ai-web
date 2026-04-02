import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Chrome } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { SiteHeader } from "@/components/layout/site-header"

export function SignupPage() {
	const { user, isLoading, isConfigured } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [pending, setPending] = useState(false);


	if (!isConfigured) {
		return (
			<div className="relative z-10 min-h-screen">
				<SiteHeader />
				<div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
					Configure Supabase environment variables to enable authentication.
				</div>
			</div>
		)
	}

	if (!isLoading && user) {
		return <Navigate to={ROUTES.applications} replace />
	}

	async function handleOAuth(provider: "google" | "github") {
		setError(null)
		setPending(true)
		try {
			const { data: userData, error: oauthError } = await supabase.auth.signInWithOAuth({
				provider,
				options: { redirectTo: `${window.location.origin}${ROUTES.applications}` },
			})
			if (oauthError) {
				console.error("Something went wrong, OAuth failed:", oauthError)
				setError(oauthError.message)
			}
			
			console.log("userData", userData);
		} catch (err) {
			console.error("Something went wrong, OAuth failed:", err)
			setError(err instanceof Error ? err.message : "Unexpected error.")
		} finally {
			setPending(false)
		}
	}

	return (
		<div className="relative z-10 min-h-screen">
			<SiteHeader />
			<div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-glow backdrop-blur-md sm:p-8"
				>
					<p className="text-sm font-semibold text-primary">Create account</p>
					<h1 className="mt-2 font-display text-2xl font-bold">
						Join {APP_NAME}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Upload your baseline resume—the source for every tailored version,
						cover letter, and long answer you generate.
					</p>

					<div className="mt-6 grid gap-2 sm:grid-cols-2">
						<Button
							type="button"
							variant="secondary"
							className="gap-2"
							disabled={pending}
							onClick={() => void handleOAuth("google")}
						>
							<Chrome className="size-4" aria-hidden />
							Google
						</Button>
						<Button
							type="button"
							variant="secondary"
							className="gap-2"
							disabled={pending}
							onClick={() => void handleOAuth("github")}
						>
							GitHub
						</Button>
					</div>

					{error ? (
						<p className="text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}
					<p className="mt-6 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							to={ROUTES.login}
							className="font-semibold text-primary hover:underline"
						>
							Log in
						</Link>
					</p>
				</motion.div>
			</div>
		</div>
	)
}
