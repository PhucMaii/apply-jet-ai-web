import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/context/auth-context"
import { AppShell } from "@/app-shell"
import { Toaster } from "react-hot-toast"
import { initAnalytics } from "@/lib/analytics"
import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

initAnalytics()

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<QueryClientProvider client={new QueryClient()}>
					<AppShell />

				</QueryClientProvider>
			</AuthProvider>
			<Toaster />
		</BrowserRouter>
	</StrictMode>
)
