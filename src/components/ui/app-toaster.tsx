import { Toaster, type ToasterProps } from "react-hot-toast"

const TOAST_OPTIONS: ToasterProps["toastOptions"] = {
	duration: 3500,
	style: {
		background: "#1a1a2e",
		color: "#ffffff",
		fontSize: "0.875rem",
		fontWeight: 500,
		borderRadius: "0.625rem",
		padding: "0.625rem 0.875rem",
		boxShadow: "0 16px 40px -16px rgb(26 26 46 / 0.35)",
		maxWidth: "26rem",
	},
	success: {
		iconTheme: { primary: "#34d399", secondary: "#1a1a2e" },
	},
	error: {
		duration: 5000,
		iconTheme: { primary: "#fb7185", secondary: "#1a1a2e" },
	},
}

export function AppToaster() {
	return (
		<Toaster
			position="bottom-center"
			gutter={10}
			containerStyle={{ bottom: "calc(env(safe-area-inset-bottom) + 5rem)" }}
			toastOptions={TOAST_OPTIONS}
		/>
	)
}
