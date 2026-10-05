import { ApplicationCreateForm } from "@/components/applications/application-create-form"
import { AppPageHeader } from "@/components/layout/app-page-header"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { useCreateApplication } from "@/hooks/use-create-application"
import { APP_PAGE_CONTAINER } from "@/lib/app-nav"
import { APPLICATION_CREATE_COPY } from "@/lib/application-create-copy"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { ROUTES } from "@/lib/constants"
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
		<div className={cn(APP_PAGE_CONTAINER, "max-w-3xl")}>
			<AppPageHeader
				eyebrow={
					<Breadcrumb
						items={[
							{ label: APPLICATIONS_COPY.title, href: ROUTES.applications },
							{ label: APPLICATION_CREATE_COPY.pageTitle },
						]}
					/>
				}
				title={APPLICATION_CREATE_COPY.pageTitle}
				description={APPLICATION_CREATE_COPY.pageSubtitle}
			/>

			<div className="mt-8 space-y-6">
				{error ? (
					<p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
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
			</div>
		</div>
	)
}
