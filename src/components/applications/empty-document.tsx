export function EmptyDocumentHint({ label }: { label: string }) {
	return (
		<p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-4 py-6 text-center text-sm text-neutral-500">
			{label}
		</p>
	)
}
