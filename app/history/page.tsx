import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { HistoryList } from "@/components/history-list"

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.user) {
    redirect("/auth/login")
  }

  // Fetch all calculations for the user
  const { data: calculations, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("user_id", user.user.id)
    .order("calculation_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Calculation History</h1>
            <p className="text-muted-foreground">View and compare your past carbon footprint calculations</p>
          </div>
          <HistoryList calculations={calculations || []} />
        </div>
      </main>
    </div>
  )
}
