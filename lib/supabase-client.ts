import { createClient } from "@supabase/supabase-js"

// Only create the client if we're in the browser and have the required environment variables
let supabase: ReturnType<typeof createClient> | null = null

// Check if we're in the browser
const isBrowser = typeof window !== "undefined"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create the Supabase client if we have the required environment variables
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: isBrowser, // Only persist the session in the browser
    },
  })
}

export { supabase }
