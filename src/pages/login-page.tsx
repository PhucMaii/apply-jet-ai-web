import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Chrome, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { SiteHeader } from "@/components/layout/site-header"
import {
	getOAuthRedirectUrl,
	markOAuthSignInPending,
} from "@/lib/auth-oauth"

export function LoginPage() {
	const { user, isLoading, isConfigured } = useAuth()
	const location = useLocation()
	const from =
		(location.state as { from?: string } | null)?.from ?? ROUTES.applications

	const [error, setError] = useState<string | null>(null)
	const [notice, setNotice] = useState<string | null>(null)
	const [pending, setPending] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

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
		return <Navigate to={from} replace />
	}

	async function handleOAuth(provider: "google") {
		setError(null)
		setNotice(null)
		setPending(true)
		try {
			markOAuthSignInPending(from)
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider,
				options: { redirectTo: getOAuthRedirectUrl() },
			})
			if (oauthError) {
				console.error("Something went wrong, OAuth failed:", oauthError)
				setError(oauthError.message)
			}
		} catch (err) {
			console.error("Something went wrong, OAuth failed:", err)
			setError(err instanceof Error ? err.message : "Unexpected error.")
		} finally {
			setPending(false)
		}
	}

	async function handleEmailPasswordLogin(
		event: FormEvent<HTMLFormElement>,
	) {
		event.preventDefault()
		setError(null)
		setNotice(null)
		setPending(true)

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password,
			})

			if (signInError) {
				console.error("Something went wrong, sign in failed:", signInError)
				setError(signInError.message)
				return
			}

			setNotice("Signed in successfully. Redirecting...")
		} catch (err) {
			console.error("Something went wrong, sign in failed:", err)
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
					<p className="text-sm font-semibold text-primary">Welcome back</p>
					<h1 className="mt-2 font-display text-2xl font-bold">
						Log in to {APP_NAME}
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						Resume vault, match history, and every tailored doc tied to your
						account.
					</p>

					<form className="mt-6 space-y-4" onSubmit={handleEmailPasswordLogin}>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="Enter your password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
						</div>
						<Button className="w-full gap-2" type="submit" disabled={pending}>
							{pending ? <Loader2 className="size-4 animate-spin" /> : null}
							Sign in with email
						</Button>
					</form>

					<div className="my-6 flex items-center gap-3">
						<div className="h-px flex-1 bg-border/70" />
						<span className="text-xs uppercase tracking-wide text-muted-foreground">
							or continue with
						</span>
						<div className="h-px flex-1 bg-border/70" />
					</div>

					<div className="grid gap-2">
						<Button
							type="button"
							variant="secondary"
							className="gap-2"
							disabled={pending}
							onClick={() => void handleOAuth("google")}
						>
							<Chrome className="size-4" aria-hidden />
							Continue with Google
						</Button>
					</div>

					{error ? (
						<p className="mt-4 text-sm text-destructive" role="alert">
							{error}
						</p>
					) : null}
					{notice ? (
						<p className="mt-4 text-sm text-green-600" role="status">
							{notice}
						</p>
					) : null}

					<p className="mt-6 text-center text-sm text-muted-foreground">
						New here?{" "}
						<Link
							to={ROUTES.signup}
							className="font-semibold text-primary hover:underline"
						>
							Create an account
						</Link>
					</p>
				</motion.div>
			</div>
		</div>
	)
}
