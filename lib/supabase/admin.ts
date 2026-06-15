import { createClient } from "@supabase/supabase-js"

// Service-role client for trusted server actions (admin question management).
// Never import this into client components.
export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Create .env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    )
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  )
}
