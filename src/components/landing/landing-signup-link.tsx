import { Link, type LinkProps } from "react-router-dom"
import { ROUTES } from "@/lib/constants"
import { trackCtaClick } from "@/lib/analytics"

interface LandingSignupLinkProps extends Omit<LinkProps, "to"> {
	location: string
	label: string
}

export function LandingSignupLink({
	location,
	label,
	onClick,
	...props
}: LandingSignupLinkProps) {
	return (
		<Link
			to={ROUTES.signup}
			onClick={(event) => {
				trackCtaClick({
					location,
					label,
					destination: ROUTES.signup,
				})
				onClick?.(event)
			}}
			{...props}
		/>
	)
}
