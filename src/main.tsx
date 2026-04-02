import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "@/context/auth-context"
import { AppShell } from "@/app-shell"
import { Toaster } from "react-hot-toast"
import "./index.css"

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<AppShell />
			</AuthProvider>
			<Toaster />
		</BrowserRouter>
	</StrictMode>
)
