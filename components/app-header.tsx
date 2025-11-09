"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Leaf, LogOut, Calculator, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/calculator" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-emerald-900">Carbon Tracker</h1>
          </Link>

          <nav className="hidden md:flex gap-1">
            <Button asChild variant={pathname === "/calculator" ? "secondary" : "ghost"} size="sm">
              <Link href="/calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Link>
            </Button>
            <Button asChild variant={pathname === "/history" ? "secondary" : "ghost"} size="sm">
              <Link href="/history">
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
          </nav>
        </div>

        <Button onClick={handleSignOut} variant="ghost" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
