"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, Zap, UtensilsCrossed, Trash2, TrendingUp, Lightbulb, Download } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface Calculation {
  id: string
  transport_emissions: number
  energy_emissions: number
  food_emissions: number
  waste_emissions: number
  total_emissions: number
  calculation_date: string
}

interface Tip {
  id: string
  category: string
  tip_text: string
  potential_savings_kg_co2: number
  difficulty_level: string
}

export function ResultsDisplay({ calculation, tips }: { calculation: Calculation; tips: Tip[] }) {
  const chartData = [
    { name: "Transport", value: calculation.transport_emissions, color: "#f59e0b" },
    { name: "Energy", value: calculation.energy_emissions, color: "#3b82f6" },
    { name: "Food", value: calculation.food_emissions, color: "#10b981" },
    { name: "Waste", value: calculation.waste_emissions, color: "#8b5cf6" },
  ].filter((item) => item.value > 0)

  const barChartData = [
    { category: "Transport", emissions: calculation.transport_emissions },
    { category: "Energy", emissions: calculation.energy_emissions },
    { category: "Food", emissions: calculation.food_emissions },
    { category: "Waste", emissions: calculation.waste_emissions },
  ]

  const handleDownload = () => {
    const data = {
      date: new Date(calculation.calculation_date).toLocaleDateString(),
      total_emissions_kg: calculation.total_emissions,
      breakdown: {
        transport: calculation.transport_emissions,
        energy: calculation.energy_emissions,
        food: calculation.food_emissions,
        waste: calculation.waste_emissions,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `carbon-footprint-${calculation.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Your Carbon Footprint</h1>
          <p className="text-muted-foreground">
            Results calculated on {new Date(calculation.calculation_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/calculator">New Calculation</Link>
          </Button>
        </div>
      </div>

      {/* Total Emissions Card */}
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Total Carbon Emissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-emerald-900">
            {calculation.total_emissions.toFixed(2)}
            <span className="text-2xl text-muted-foreground ml-2">kg CO₂e</span>
          </div>
          <p className="text-muted-foreground mt-2">Average person produces ~10 tons per year (27 kg/day)</p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Breakdown of your carbon footprint</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂e`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions Comparison</CardTitle>
            <CardDescription>View by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg CO₂e`} />
                <Bar dataKey="emissions" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Car className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold">{calculation.transport_emissions.toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium">Transport</p>
            <p className="text-xs text-muted-foreground">kg CO₂e</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">{calculation.energy_emissions.toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium">Energy</p>
            <p className="text-xs text-muted-foreground">kg CO₂e</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold">{calculation.food_emissions.toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium">Food</p>
            <p className="text-xs text-muted-foreground">kg CO₂e</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Trash2 className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold">{calculation.waste_emissions.toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium">Waste</p>
            <p className="text-xs text-muted-foreground">kg CO₂e</p>
          </CardContent>
        </Card>
      </div>

      {/* Reduction Tips */}
      {tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Reduction Tips
            </CardTitle>
            <CardDescription>Ways to reduce your carbon footprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tips.map((tip) => (
                <div key={tip.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tip.tip_text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {tip.category} · {tip.difficulty_level}
                      </span>
                      {tip.potential_savings_kg_co2 && (
                        <span className="text-xs text-emerald-600 font-medium">
                          Save ~{tip.potential_savings_kg_co2} kg CO₂/year
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
