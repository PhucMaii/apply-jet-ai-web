import { useState, type DragEvent } from "react"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface BulletItem {
	id: string
	text: string
}

interface BulletListEditorProps {
	bullets: string[]
	onChange: (bullets: string[]) => void
	label?: string
	addLabel?: string
	placeholder?: string
}

function createBullet(text = ""): BulletItem {
	return {
		id: crypto.randomUUID(),
		text,
	}
}

function toBulletItems(bullets: string[]): BulletItem[] {
	if (bullets.length === 0) return [createBullet()]
	return bullets.map((text) => createBullet(text))
}

function toBulletTexts(items: BulletItem[]): string[] {
	return items.map((item) => item.text)
}

export function BulletListEditor({
	bullets,
	onChange,
	label = "Bullets",
	addLabel = "Add bullet",
	placeholder = "Describe an impact or responsibility…",
}: BulletListEditorProps) {
	const [items, setItems] = useState(() => toBulletItems(bullets))
	const [dragId, setDragId] = useState<string | null>(null)

	function commit(nextItems: BulletItem[]) {
		setItems(nextItems)
		onChange(toBulletTexts(nextItems))
	}

	function handleTextChange(id: string, text: string) {
		commit(
			items.map((item) => (item.id === id ? { ...item, text } : item)),
		)
	}

	function handleAddBullet() {
		commit([...items, createBullet()])
	}

	function handleRemoveBullet(id: string) {
		if (items.length <= 1) {
			commit([createBullet()])
			return
		}
		commit(items.filter((item) => item.id !== id))
	}

	function handleDragStart(event: DragEvent, id: string) {
		event.dataTransfer.effectAllowed = "move"
		event.dataTransfer.setData("text/plain", id)
		setDragId(id)
	}

	function handleDrop(targetId: string) {
		if (!dragId || dragId === targetId) {
			setDragId(null)
			return
		}

		const from = items.findIndex((item) => item.id === dragId)
		const to = items.findIndex((item) => item.id === targetId)
		if (from < 0 || to < 0) {
			setDragId(null)
			return
		}

		const next = [...items]
		const [moved] = next.splice(from, 1)
		next.splice(to, 0, moved)
		commit(next)
		setDragId(null)
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
					{label}
				</p>
				<span className="text-[11px] tabular-nums text-neutral-400">
					{items.length}
				</span>
			</div>

			<ul className="space-y-1.5">
				{items.map((item, index) => (
					<li
						key={item.id}
						onDragOver={(event: DragEvent) => {
							event.preventDefault()
							event.dataTransfer.dropEffect = "move"
						}}
						onDrop={(event: DragEvent) => {
							event.preventDefault()
							handleDrop(item.id)
						}}
						className={cn(
							"group flex items-start gap-1 rounded-lg border border-neutral-200 bg-white p-1.5 transition-colors",
							dragId === item.id && "border-primary/40 bg-primary/5 opacity-70",
							dragId && dragId !== item.id && "border-dashed border-neutral-300",
						)}
					>
						<span
							draggable
							onDragStart={(event) => handleDragStart(event, item.id)}
							onDragEnd={() => setDragId(null)}
							className="mt-1.5 cursor-grab touch-none rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 active:cursor-grabbing"
							aria-label={`Drag bullet ${index + 1}`}
							role="button"
							tabIndex={0}
						>
							<GripVertical className="size-3.5" aria-hidden />
						</span>

						<span
							className="mt-2 select-none text-xs font-medium text-neutral-400"
							aria-hidden
						>
							•
						</span>

						<Textarea
							value={item.text}
							onChange={(event) =>
								handleTextChange(item.id, event.target.value)
							}
							placeholder={placeholder}
							rows={2}
							className="min-h-[56px] flex-1 resize-y border-0 bg-transparent px-1 py-1.5 text-sm shadow-none focus-visible:ring-0"
							aria-label={`Bullet ${index + 1}`}
						/>

						<Button
							type="button"
							size="sm"
							variant="ghost"
							className="mt-0.5 size-7 shrink-0 px-0 text-neutral-400 hover:bg-red-50 hover:text-red-600"
							onClick={() => handleRemoveBullet(item.id)}
							aria-label={`Remove bullet ${index + 1}`}
						>
							<Trash2 className="size-3.5" aria-hidden />
						</Button>
					</li>
				))}
			</ul>

			<Button
				type="button"
				size="sm"
				variant="outline"
				className="h-8 w-full gap-1.5 border-dashed text-xs"
				onClick={handleAddBullet}
			>
				<Plus className="size-3.5" aria-hidden />
				{addLabel}
			</Button>
		</div>
	)
}
