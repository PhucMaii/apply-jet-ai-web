import type { UserDisclosureRow } from '@/types/database';
import type { UseFormRegister } from 'react-hook-form';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { PROFILE_SURFACE } from '@/lib/profile-surface';

export function DisclosureSelectField({
    register,
    field,
    options,
    label,
}: {
    register: UseFormRegister<UserDisclosureRow>
    field: keyof UserDisclosureRow
    options: { value: string; label: string }[]
    label: string
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={field}>{label}</Label>
            <select
                {...register(field)}
                className={cn(
                    PROFILE_SURFACE.select,
                    "transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-background",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                )}
            >
                <option value="">Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}