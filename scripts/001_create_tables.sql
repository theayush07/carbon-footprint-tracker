-- Create emission_factors table for storing carbon emission data
CREATE TABLE IF NOT EXISTS emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  factor_value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calculations table for storing user carbon calculations
CREATE TABLE IF NOT EXISTS calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Transportation data
  transport_car_km DECIMAL(10, 2) DEFAULT 0,
  transport_bus_km DECIMAL(10, 2) DEFAULT 0,
  transport_train_km DECIMAL(10, 2) DEFAULT 0,
  transport_flight_km DECIMAL(10, 2) DEFAULT 0,
  
  -- Energy data
  energy_electricity_kwh DECIMAL(10, 2) DEFAULT 0,
  energy_gas_kwh DECIMAL(10, 2) DEFAULT 0,
  energy_heating_oil_liters DECIMAL(10, 2) DEFAULT 0,
  
  -- Food data
  food_meat_kg DECIMAL(10, 2) DEFAULT 0,
  food_dairy_kg DECIMAL(10, 2) DEFAULT 0,
  food_plant_based_kg DECIMAL(10, 2) DEFAULT 0,
  
  -- Waste data
  waste_general_kg DECIMAL(10, 2) DEFAULT 0,
  waste_recycled_kg DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated emissions (in kg CO2e)
  transport_emissions DECIMAL(10, 2) DEFAULT 0,
  energy_emissions DECIMAL(10, 2) DEFAULT 0,
  food_emissions DECIMAL(10, 2) DEFAULT 0,
  waste_emissions DECIMAL(10, 2) DEFAULT 0,
  total_emissions DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reduction_tips table for eco-friendly suggestions
CREATE TABLE IF NOT EXISTS reduction_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  potential_savings_kg_co2 DECIMAL(10, 2),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reduction_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emission_factors (read-only for all authenticated users)
CREATE POLICY "Allow all users to view emission factors"
  ON emission_factors FOR SELECT
  USING (true);

-- RLS Policies for calculations (users can only see their own data)
CREATE POLICY "Users can view their own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON calculations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reduction_tips (read-only for all authenticated users)
CREATE POLICY "Allow all users to view reduction tips"
  ON reduction_tips FOR SELECT
  USING (true);
