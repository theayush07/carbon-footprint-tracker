"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Zap, UtensilsCrossed, Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FormData {
  // Transportation
  transport_car_km: number
  transport_bus_km: number
  transport_train_km: number
  transport_flight_km: number
  // Energy
  energy_electricity_kwh: number
  energy_gas_kwh: number
  energy_heating_oil_liters: number
  // Food
  food_meat_kg: number
  food_dairy_kg: number
  food_plant_based_kg: number
  // Waste
  waste_general_kg: number
  waste_recycled_kg: number
}

export function CarbonCalculatorForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    transport_car_km: 0,
    transport_bus_km: 0,
    transport_train_km: 0,
    transport_flight_km: 0,
    energy_electricity_kwh: 0,
    energy_gas_kwh: 0,
    energy_heating_oil_liters: 0,
    food_meat_kg: 0,
    food_dairy_kg: 0,
    food_plant_based_kg: 0,
    waste_general_kg: 0,
    waste_recycled_kg: 0,
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number.parseFloat(value) || 0,
    }))
  }

  const calculateEmissions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch emission factors
      const { data: factors, error: factorsError } = await supabase.from("emission_factors").select("*")

      if (factorsError) throw factorsError

      // Calculate emissions for each category
      const carFactor = factors?.find((f) => f.subcategory === "car_petrol")?.factor_value || 0.192
      const busFactor = factors?.find((f) => f.subcategory === "bus")?.factor_value || 0.089
      const trainFactor = factors?.find((f) => f.subcategory === "train")?.factor_value || 0.041
      const flightFactor = factors?.find((f) => f.subcategory === "flight_short")?.factor_value || 0.255

      const electricityFactor = factors?.find((f) => f.subcategory === "electricity")?.factor_value || 0.233
      const gasFactor = factors?.find((f) => f.subcategory === "natural_gas")?.factor_value || 0.185
      const oilFactor = factors?.find((f) => f.subcategory === "heating_oil")?.factor_value || 2.52

      const meatFactor = factors?.find((f) => f.subcategory === "beef")?.factor_value || 27.0
      const dairyFactor = factors?.find((f) => f.subcategory === "dairy")?.factor_value || 2.8
      const plantFactor = factors?.find((f) => f.subcategory === "vegetables")?.factor_value || 0.4

      const landfillFactor = factors?.find((f) => f.subcategory === "landfill")?.factor_value || 0.57
      const recyclingFactor = factors?.find((f) => f.subcategory === "recycling")?.factor_value || -0.21

      const transport_emissions =
        formData.transport_car_km * carFactor +
        formData.transport_bus_km * busFactor +
        formData.transport_train_km * trainFactor +
        formData.transport_flight_km * flightFactor

      const energy_emissions =
        formData.energy_electricity_kwh * electricityFactor +
        formData.energy_gas_kwh * gasFactor +
        formData.energy_heating_oil_liters * oilFactor

      const food_emissions =
        formData.food_meat_kg * meatFactor +
        formData.food_dairy_kg * dairyFactor +
        formData.food_plant_based_kg * plantFactor

      const waste_emissions = formData.waste_general_kg * landfillFactor + formData.waste_recycled_kg * recyclingFactor

      const total_emissions = transport_emissions + energy_emissions + food_emissions + waste_emissions

      // Save to database
      const { data: calculation, error: calcError } = await supabase
        .from("calculations")
        .insert({
          user_id: userId,
          ...formData,
          transport_emissions: Number.parseFloat(transport_emissions.toFixed(2)),
          energy_emissions: Number.parseFloat(energy_emissions.toFixed(2)),
          food_emissions: Number.parseFloat(food_emissions.toFixed(2)),
          waste_emissions: Number.parseFloat(waste_emissions.toFixed(2)),
          total_emissions: Number.parseFloat(total_emissions.toFixed(2)),
        })
        .select()
        .single()

      if (calcError) throw calcError

      // Redirect to results page
      router.push(`/results/${calculation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate emissions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Your Activities</CardTitle>
        <CardDescription>Fill in your daily or weekly consumption across different categories</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transport" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transport">
              <Car className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="energy">
              <Zap className="h-4 w-4 mr-2" />
              Energy
            </TabsTrigger>
            <TabsTrigger value="food">
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Food
            </TabsTrigger>
            <TabsTrigger value="waste">
              <Trash2 className="h-4 w-4 mr-2" />
              Waste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transport" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="car">Car distance (km)</Label>
                <Input
                  id="car"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.transport_car_km || ""}
                  onChange={(e) => handleInputChange("transport_car_km", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bus">Bus distance (km)</Label>
                <Input
                  id="bus"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.transport_bus_km || ""}
                  onChange={(e) => handleInputChange("transport_bus_km", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="train">Train distance (km)</Label>
                <Input
                  id="train"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.transport_train_km || ""}
                  onChange={(e) => handleInputChange("transport_train_km", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="flight">Flight distance (km)</Label>
                <Input
                  id="flight"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.transport_flight_km || ""}
                  onChange={(e) => handleInputChange("transport_flight_km", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="energy" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="electricity">Electricity usage (kWh)</Label>
                <Input
                  id="electricity"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.energy_electricity_kwh || ""}
                  onChange={(e) => handleInputChange("energy_electricity_kwh", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gas">Natural gas usage (kWh)</Label>
                <Input
                  id="gas"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.energy_gas_kwh || ""}
                  onChange={(e) => handleInputChange("energy_gas_kwh", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="oil">Heating oil (liters)</Label>
                <Input
                  id="oil"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.energy_heating_oil_liters || ""}
                  onChange={(e) => handleInputChange("energy_heating_oil_liters", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="food" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="meat">Meat consumption (kg)</Label>
                <Input
                  id="meat"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.food_meat_kg || ""}
                  onChange={(e) => handleInputChange("food_meat_kg", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dairy">Dairy products (kg)</Label>
                <Input
                  id="dairy"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.food_dairy_kg || ""}
                  onChange={(e) => handleInputChange("food_dairy_kg", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plant">Plant-based food (kg)</Label>
                <Input
                  id="plant"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.food_plant_based_kg || ""}
                  onChange={(e) => handleInputChange("food_plant_based_kg", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="waste" className="space-y-4 mt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="general">General waste (kg)</Label>
                <Input
                  id="general"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.waste_general_kg || ""}
                  onChange={(e) => handleInputChange("waste_general_kg", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recycled">Recycled waste (kg)</Label>
                <Input
                  id="recycled"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.waste_recycled_kg || ""}
                  onChange={(e) => handleInputChange("waste_recycled_kg", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={calculateEmissions}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Calculate Carbon Footprint
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
