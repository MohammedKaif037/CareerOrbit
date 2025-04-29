import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/**
 * Creates a new job application in the database
 * @param applicationData The application data to insert
 * @returns The result of the insertion operation or null if failed
 */
export const createApplication = async (applicationData) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
    
    if (error) {
      console.error("Error inserting application:", error)
      return null
    }
    
    return data ? data[0] : null
  } catch (error) {
    console.error("Exception in createApplication:", error)
    return null
  }
}

/**
 * Fetches all applications for a user
 * @param userId The ID of the user whose applications to fetch
 * @returns Array of applications or empty array if none found
 */
export const getApplications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", userId)
      .order("application_date", { ascending: false })
    
    if (error) {
      console.error("Error fetching applications:", error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error("Exception in getApplications:", error)
    return []
  }
}

/**
 * Updates an existing application
 * @param id The ID of the application to update
 * @param applicationData The new application data
 * @returns True if successful, false otherwise
 */
export const updateApplication = async (id, applicationData) => {
  try {
    const { error } = await supabase
      .from("applications")
      .update(applicationData)
      .eq("id", id)
    
    if (error) {
      console.error("Error updating application:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Exception in updateApplication:", error)
    return false
  }
}

/**
 * Deletes an application
 * @param id The ID of the application to delete
 * @returns True if successful, false otherwise
 */
export const deleteApplication = async (id) => {
  try {
    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
    
    if (error) {
      console.error("Error deleting application:", error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Exception in deleteApplication:", error)
    return false
  }
}
