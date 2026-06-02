import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { ApplicationCreateForm } from "@/components/applications/application-create-form"
import { APPLICATION_CREATE_COPY } from "@/lib/application-create-copy"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { APP_NAME, BRAND_LOGO_SRC, ROUTES } from "@/lib/constants"
import { useCreateApplication } from "@/hooks/use-create-application"
import { cn } from "@/lib/utils"

export function ApplicationCreatePage() {
	const {
		form,
		patchForm,
		fieldErrors,
		error,
		submitting,
		submit,
	} = useCreateApplication()

	return (
		<div className={APPLICATIONS_THEME.page}>
			<header className={APPLICATIONS_THEME.header}>
				<div className={APPLICATIONS_THEME.headerInner}>
					<div className="flex min-w-0 flex-col gap-3">
						<Link
							to={ROUTES.applications}
							className={cn(
								"inline-flex w-fit items-center gap-1.5 text-sm font-medium",
								APPLICATIONS_THEME.link,
							)}
						>
							<ArrowLeft className="size-4" aria-hidden />
							{APPLICATION_CREATE_COPY.backLabel}
						</Link>
						<div className="flex items-center gap-2">
							<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
								<img
									src={BRAND_LOGO_SRC}
									alt=""
									width={36}
									height={36}
									className="size-9 object-contain object-center"
									decoding="async"
								/>
							</span>
							<p className={APPLICATIONS_THEME.brandLabel}>{APP_NAME}</p>
						</div>
						<div>
							<h1 className={APPLICATIONS_THEME.titleLg}>
								{APPLICATION_CREATE_COPY.pageTitle}
							</h1>
							<p className={cn("mt-1 max-w-xl", APPLICATIONS_THEME.subtitle)}>
								{APPLICATION_CREATE_COPY.pageSubtitle}
							</p>
						</div>
					</div>
				</div>
			</header>

			<main className={APPLICATIONS_THEME.main}>
				{error ? (
					<p className={APPLICATIONS_THEME.error} role="alert">
						{error}
					</p>
				) : null}

				<ApplicationCreateForm
					form={form}
					fieldErrors={fieldErrors}
					submitting={submitting}
					onPatchForm={patchForm}
					onSubmit={() => void submit()}
				/>
			</main>
		</div>
	)
}
