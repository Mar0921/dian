import { createClient } from "@supabase/supabase-js"

// Service-role client for trusted server actions (admin question management).
// Never import this into client components.
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}
