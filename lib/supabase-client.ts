import { createClient } from "@supabase/supabase-js"

// Only create the client if we're in the browser and have the required environment variables
let supabase: ReturnType<typeof createClient> | null = null

if (typeof window !== "undefined") {
  // We're in the browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
}

export { supabase }
