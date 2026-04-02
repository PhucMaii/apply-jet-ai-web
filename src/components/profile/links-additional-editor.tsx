/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, SetStateAction } from "react"
import { Link2, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserAdditionalInfoRow, UserLinkRow } from "@/types/database"

interface LinksAdditionalEditorProps {
	links: UserLinkRow[]
	setLinks: Dispatch<SetStateAction<UserLinkRow[]>>
	additionalInfo: UserAdditionalInfoRow | null
	setAdditionalInfo: Dispatch<
		SetStateAction<UserAdditionalInfoRow | null>
	>
	onAddLink: () => void
	onDeleteLink: (linkId: string) => void
	onSave: () => void
}

export function LinksAdditionalEditor({
	links,
	setLinks,
	additionalInfo,
	setAdditionalInfo,
	onAddLink,
	onDeleteLink,
	onSave,
}: LinksAdditionalEditorProps) {
	const handleDeleteLink = (index: number) => {
		setLinks((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
		onDeleteLink(links[index].id)
	}

	const handleSave = () => {
		onSave()
	}

	return (
		<Card className="border-border/80 bg-card/40 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<Link2 className="size-4 text-info" aria-hidden />
					Links &amp; additional info
				</CardTitle>
				<CardDescription>
					Links and your languages/certifications live in one section.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{links.map((row, index) => (
					<div
						key={`${row.id}-${index}`}
						className="grid gap-4 rounded-lg border border-border/60 bg-muted/15 p-4 sm:grid-cols-[1fr_180px_auto]"
					>
						<Input
							placeholder="https://linkedin.com/in/your-profile"
							value={row.url}
							onChange={(e) =>
								setLinks((prev) =>
									prev.map((entry, entryIndex) =>
										entryIndex === index
											? { ...entry, url: e.target.value }
											: entry,
									),
								)
							}
						/>
						<Input
							placeholder="linkedin / portfolio / github"
							value={row.link_type ?? ""}
							onChange={(e) =>
								setLinks((prev) =>
									prev.map((entry, entryIndex) =>
										entryIndex === index
											? { ...entry, link_type: e.target.value }
											: entry,
									),
								)
							}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="text-destructive hover:text-destructive"
							onClick={() => handleDeleteLink(index)}
						>
							<Trash2 className="size-4" aria-hidden />
							<span className="sr-only">Remove link</span>
						</Button>
					</div>
				))}

				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={onAddLink}
				>
					<Plus className="size-4" aria-hidden />
					Add link
				</Button>

				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label>Languages (comma separated)</Label>
						<Input
							placeholder="English, Spanish"
							value={additionalInfo?.languages ?? ""}
							onChange={(e) =>
								setAdditionalInfo((prev) =>
									prev
										? {
											...prev,
											languages: e.target.value,
										} as unknown
										: prev as any,
								)
							}
						/>
					</div>
					<div className="space-y-2">
						<Label>Certifications (comma separated)</Label>
						<Input
							placeholder="AWS SAA, PSM I"
							value={additionalInfo?.certifications ?? ""}
							onChange={(e) =>
								setAdditionalInfo((prev) =>
									prev
										? {
											...prev,
											certifications: e.target.value,
										} as unknown
										: prev as any,
								)
							}
						/>
					</div>
				</div>

				<div className="flex gap-2 items-center justify-end">
					<Button
						type="button"
						variant="secondary"
						className="gap-2"
						onClick={handleSave}
					>
						<Save className="size-4" aria-hidden />
						Save</Button>
				</div>
			</CardContent>
		</Card>
	)
}

