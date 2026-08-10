import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/auth-context"
import { AppShell } from "@/app-shell"
import { Toaster } from "react-hot-toast"
import { initAnalytics } from "@/lib/analytics"
import "./index.css"

initAnalytics()

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<AppShell />
				</AuthProvider>
			</QueryClientProvider>
			<Toaster />
		</BrowserRouter>
	</StrictMode>
)
