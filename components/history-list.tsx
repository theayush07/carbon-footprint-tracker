"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, TrendingDown, TrendingUp, Eye, Trash2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Calculation {
  id: string
  total_emissions: number
  transport_emissions: number
  energy_emissions: number
  food_emissions: number
  waste_emissions: number
  calculation_date: string
}

export function HistoryList({ calculations }: { calculations: Calculation[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this calculation?")) return

    setDeletingId(id)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("calculations").delete().eq("id", id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error("Failed to delete calculation:", err)
    } finally {
      setDeletingId(null)
    }
  }

  // Prepare trend data
  const trendData = calculations
    .slice(0, 10)
    .reverse()
    .map((calc) => ({
      date: new Date(calc.calculation_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      total: calc.total_emissions,
      transport: calc.transport_emissions,
      energy: calc.energy_emissions,
      food: calc.food_emissions,
      waste: calc.waste_emissions,
    }))

  // Calculate statistics
  const avgEmissions =
    calculations.length > 0
      ? calculations.reduce((sum, calc) => sum + calc.total_emissions, 0) / calculations.length
      : 0

  const trend = calculations.length >= 2 ? calculations[0].total_emissions - calculations[1].total_emissions : 0

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {calculations.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-900">{calculations.length}</div>
              <p className="text-sm text-muted-foreground">Total Calculations</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-emerald-900">
                {avgEmissions.toFixed(1)} <span className="text-sm">kg CO₂e</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Emissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                {trend < 0 ? (
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                )}
                <div className="text-2xl font-bold text-emerald-900">
                  {Math.abs(trend).toFixed(1)} <span className="text-sm">kg CO₂e</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{trend < 0 ? "Decrease" : "Increase"} from last</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Emissions Trend</CardTitle>
            <CardDescription>Your carbon footprint over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂e`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" />
                <Line type="monotone" dataKey="transport" stroke="#f59e0b" name="Transport" />
                <Line type="monotone" dataKey="energy" stroke="#3b82f6" name="Energy" />
                <Line type="monotone" dataKey="food" stroke="#22c55e" name="Food" />
                <Line type="monotone" dataKey="waste" stroke="#8b5cf6" name="Waste" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Calculations List */}
      <Card>
        <CardHeader>
          <CardTitle>Past Calculations</CardTitle>
          <CardDescription>
            {calculations.length === 0
              ? "No calculations yet. Start by creating your first one!"
              : `${calculations.length} calculation${calculations.length !== 1 ? "s" : ""} saved`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No calculations yet</p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/calculator">Create Your First Calculation</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {calculations.map((calc) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(calc.calculation_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-900">{calc.total_emissions.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">kg CO₂e</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Transport: {calc.transport_emissions.toFixed(1)}</span>
                      <span>Energy: {calc.energy_emissions.toFixed(1)}</span>
                      <span>Food: {calc.food_emissions.toFixed(1)}</span>
                      <span>Waste: {calc.waste_emissions.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/results/${calc.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleDelete(calc.id)}
                      disabled={deletingId === calc.id}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
