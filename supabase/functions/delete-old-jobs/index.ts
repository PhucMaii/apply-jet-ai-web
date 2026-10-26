// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js"

const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }

  async function deleteOldJobs(
    retentionDays = 30,
    batchSize = 500,
  ): Promise<{ deleted: number; cutoffIso: string }> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - retentionDays);
    const cutoffIso = cutoff.toISOString();
  
    let deleted = 0;
  
    for (;;) {
      const { data: rows, error: selectError } = await supabase
        .from("jobs")
        .select("id")
        .or(
          `posted_at.lt.${cutoffIso},and(posted_at.is.null,first_seen_at.lt.${cutoffIso})`,
        )
        .limit(batchSize);
  
      if (selectError) {
        console.error("Something went wrong selecting old jobs:", selectError);
        throw new Error(selectError.message);
      }
  
      const ids = (rows ?? []).map((row) => row.id as number);
      if (ids.length === 0) break;
  
      const { error: deleteError } = await supabase
        .from("jobs")
        .delete()
        .in("id", ids);
  
      if (deleteError) {
        console.error("Something went wrong deleting old jobs:", deleteError);
        throw new Error(deleteError.message);
      }
  
      deleted += ids.length;
      console.log(`Deleted ${ids.length} old jobs (total ${deleted})`);
  
      if (ids.length < batchSize) break;
    }
  
    console.log(
      `Done. Deleted ${deleted} jobs older than ${cutoffIso} (${retentionDays} days).`,
    );
  
    return { deleted, cutoffIso };
  }

  const { deleted, cutoffIso } = await deleteOldJobs();

  return Response.json({ deleted, cutoffIso }, { status: 200 });
});
