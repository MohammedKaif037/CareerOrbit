"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  UserCircle,
  Lock,
  Bell,
  LogOut,
  Trash2,
  Save
} from "lucide-react"

type UserProfile = {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

type UserPreferences = {
  email_notifications: boolean
  dark_mode: boolean
  job_application_reminder: boolean
}

export default function SettingsPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    email: "",
    full_name: "",
    avatar_url: "",
  })

  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: false,
    dark_mode: false,
    job_application_reminder: false,
  })

  const [passwordChange, setPasswordChange] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      setIsLoading(true)
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
          toast({ title: "Error", description: "Unable to fetch user data", variant: "destructive" })
          return
        }

        const userId = authData.user.id
        const userEmail = authData.user.email || ""

        // Fetch profile — upsert a blank row if it doesn't exist yet
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        // Fetch preferences
        const { data: preferencesData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single()

        setProfile({
          id: userId,
          email: userEmail,
          full_name: profileData?.full_name || "",
          avatar_url: profileData?.avatar_url || "",
        })

        if (preferencesData) {
          setPreferences({
            email_notifications: preferencesData.email_notifications || false,
            dark_mode: preferencesData.dark_mode || false,
            job_application_reminder: preferencesData.job_application_reminder || false,
          })
        }
      } catch {
        toast({ title: "Unexpected Error", description: "An unexpected error occurred", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // ✅ FIX: uses profile.id which is now set from auth before saving
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.id) {
      toast({ title: "Not ready", description: "User session not loaded yet.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url },
          { onConflict: "id" }
        )

      if (error) {
        toast({ title: "Update Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Profile Updated", description: "Your profile has been saved." })
      }
    } catch {
      toast({ title: "Unexpected Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordChange.newPassword })
      if (error) {
        toast({ title: "Password Update Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Password Updated", description: "Your password has been changed." })
        setPasswordChange({ newPassword: "", confirmPassword: "" })
      }
    } catch {
      toast({ title: "Unexpected Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: profile.id,
            email_notifications: preferences.email_notifications,
            dark_mode: preferences.dark_mode,
            job_application_reminder: preferences.job_application_reminder,
          },
          { onConflict: "user_id" }
        )

      if (error) {
        toast({ title: "Preferences Update Failed", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Preferences Updated", description: "Your preferences have been saved." })
      }
    } catch {
      toast({ title: "Unexpected Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ FIX: client-side deletion — delete user data first, then call the
  //    Supabase Edge Function / API route you control, then sign out.
  //    supabase.auth.admin.deleteUser() is server-only and will throw on client.
  const handleAccountDeletion = async () => {
    setIsSubmitting(true)
    try {
      // 1. Delete user's own data from your tables
      await supabase.from("applications").delete().eq("user_id", profile.id)
      await supabase.from("user_preferences").delete().eq("user_id", profile.id)
      await supabase.from("profiles").delete().eq("id", profile.id)

      // 2. Call your own API route that runs admin.deleteUser() server-side
      //    Create this at: app/api/delete-account/route.ts  (see note below)
      const res = await fetch("/api/delete-account", { method: "DELETE" })
      if (!res.ok) {
        const { error } = await res.json()
        toast({ title: "Account Deletion Failed", description: error, variant: "destructive" })
        return
      }

      // 3. Sign out and redirect
      await supabase.auth.signOut()
      router.push("/")
    } catch {
      toast({ title: "Unexpected Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch {
      toast({ title: "Sign Out Failed", description: "Unable to sign out", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Profile Section */}
      <Card className="mb-6 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCircle className="mr-2" /> Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <Label>Email (Read Only)</Label>
              <Input type="email" value={profile.email} readOnly className="bg-muted cursor-not-allowed" />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card className="mb-6 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2" /> Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordChange.newPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordChange.confirmPassword}
                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="mb-6 glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2" /> Preferences
          </CardTitle>
          <CardDescription>Customize your application experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, email_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch
              checked={preferences.dark_mode}
              onCheckedChange={(checked) => setPreferences({ ...preferences, dark_mode: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Job Application Reminders</Label>
            <Switch
              checked={preferences.job_application_reminder}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, job_application_reminder: checked })
              }
            />
          </div>
          <Button onClick={handlePreferencesUpdate} disabled={isSubmitting} className="w-full mt-4">
            <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <Trash2 className="mr-2" /> Danger Zone
          </CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Sign Out</h3>
              <p className="text-sm text-muted-foreground">Log out of your account on this device</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all
                    your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDeletion}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
