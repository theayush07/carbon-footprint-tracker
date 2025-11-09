import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Leaf, TrendingDown, BarChart3, History } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-emerald-900">Carbon Footprint Tracker</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-6 text-balance">
            Track Your Carbon Footprint, Make a Difference
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Calculate your environmental impact across transportation, energy, food, and waste. Get personalized
            recommendations to reduce your carbon emissions and live more sustainably.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/auth/sign-up">Start tracking now</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <TrendingDown className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calculate Emissions</h3>
              <p className="text-muted-foreground">
                Enter your daily activities and get instant calculations of your carbon footprint across all categories.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 mb-4">
                <BarChart3 className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visualize Impact</h3>
              <p className="text-muted-foreground">
                See your emissions broken down by category with beautiful charts and clear comparisons.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 mb-4">
                <History className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Save your calculations and compare over time to see how your sustainable choices make an impact.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Carbon Footprint Tracker - Making sustainability measurable</p>
        </div>
      </footer>
    </div>
  )
}
