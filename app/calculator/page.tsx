import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { CarbonCalculatorForm } from "@/components/carbon-calculator-form"

export default async function CalculatorPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 mb-2">Carbon Footprint Calculator</h1>
            <p className="text-muted-foreground">
              Enter your daily or weekly activities to calculate your carbon emissions
            </p>
          </div>
          <CarbonCalculatorForm userId={data.user.id} />
        </div>
      </main>
    </div>
  )
}
