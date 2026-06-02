import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { UserEducationRow } from '@/types/database'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Textarea } from '../ui/textarea'

interface EducationFormProps {
    register: UseFormRegister<UserEducationRow>
    errors?: FieldErrors<UserEducationRow>
}

export default function EducationForm({
    register,
    errors,
}: EducationFormProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>School</Label>
                    <Input
                        {...register("school", { required: "School is required" })}
                        error={errors?.school?.message}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                        {...register("degree", { required: "Degree is required" })}
                        error={errors?.degree?.message}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Field of study</Label>
                    <Input
                        {...register("field_of_study", { required: "Field of study is required" })}
                        error={errors?.field_of_study?.message}
                    />
                </div>
                <div className="space-y-2">
                    <Label>GPA</Label>
                    <Input
                        type="number"
                        step={0.01}
                        {...register("gpa", { required: "GPA is required" })}
                        error={errors?.gpa?.message}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input
                        type="date"
                        {...register("start_date", { required: "Start date is required" })}
                        error={errors?.start_date?.message}
                    />
                </div>
                <div className="space-y-2">
                    <Label>End date</Label>
                    <Input
                        type="date"
                        {...register("end_date", { required: "End date is required" })}
                        error={errors?.end_date?.message}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                    rows={4}
                    {...register("description")}
                    error={errors?.description?.message as string}
                />
            </div>
        </>
    )
}
