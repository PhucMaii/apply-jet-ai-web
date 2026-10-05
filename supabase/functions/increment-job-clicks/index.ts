import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"
import { jsonResponse } from "../_shared/stripe-cors.ts"

declare const Deno: {
	env: { get: (key: string) => string | undefined }
	serve: (handler: (req: Request) => Promise<Response> | Response) => void
}

type Body = {
	jobId?: number | string
}

Deno.serve(async (req: Request) => {
	if (req.method === "OPTIONS") {
		return jsonResponse({ message: "OK" }, 200)
	}

	if (req.method !== "POST") {
		return jsonResponse({ error: "Method not allowed" }, 405)
	}

  const secretKey = Deno.env.get("X-SECRET-KEY");
  const xsecretkey = req.headers.get("X-Secret-Key");
  if (!secretKey || xsecretkey !== secretKey) {
    console.error(
      "Unauthorized increment-usage call",
      {
        hasSecretEnv: Boolean(secretKey),
        hasSecretHeader: Boolean(xsecretkey),
        secretsMatch: Boolean(
          secretKey && xsecretkey && secretKey === xsecretkey,
        ),
      },
    );
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

	let body: Body
	try {
		body = (await req.json()) as Body
	} catch (error) {
		console.error("Something went wrong parsing increment-job-clicks body:", error)
		return jsonResponse({ error: "Invalid JSON body" }, 400)
	}

	const jobId = Number(body.jobId)
	if (!Number.isFinite(jobId) || jobId <= 0) {
		return jsonResponse({ error: "Missing or invalid jobId" }, 400)
	}

	const supabaseUrl = Deno.env.get("SUPABASE_URL")
	const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
	if (!supabaseUrl || !serviceRoleKey) {
		console.error("Something went wrong: Supabase env is not configured for increment-job-clicks")
		return jsonResponse({ error: "Supabase env is not configured" }, 500)
	}

	const supabase = createClient(supabaseUrl, serviceRoleKey)

	const { data, error } = await supabase.rpc("increment_job_clicks", {
		p_job_id: jobId,
	})

	if (error) {
		console.error("Something went wrong incrementing job clicks:", error)
		return jsonResponse({ error: error.message }, 500)
	}

	const clicks = typeof data === "number" ? data : Number(data)
	if (!Number.isFinite(clicks)) {
		return jsonResponse({ error: "Job not found" }, 404)
	}

	return jsonResponse({ jobId, clicks }, 200)
})
