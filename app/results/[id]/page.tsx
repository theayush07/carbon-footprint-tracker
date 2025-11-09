import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { ResultsDisplay } from "@/components/results-display"

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) {
    redirect("/auth/login")
  }

  // Fetch calculation
  const { data: calculation, error: calcError } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.user.id)
    .single()

  if (calcError || !calculation) {
    redirect("/calculator")
  }

  // Fetch reduction tips
  const { data: tips } = await supabase.from("reduction_tips").select("*").limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <ResultsDisplay calculation={calculation} tips={tips || []} />
      </main>
    </div>
  )
}
