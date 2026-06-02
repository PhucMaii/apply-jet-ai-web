import { Input } from '../ui/input'
import type { UseFormRegister } from 'node_modules/react-hook-form/dist/types/form'
import type { UserLinkRow } from '@/types/database'

interface LinkFormProps {
    register: UseFormRegister<UserLinkRow>
}

export default function LinkForm({
    register
}: LinkFormProps) {
    return (
        <>
            <Input
                placeholder="https://linkedin.com/in/your-profile"
                {...register("url")}
            />
            <Input
                placeholder="linkedin / portfolio / github"
                {...register("link_type")}
            />
        </>
    )
}
