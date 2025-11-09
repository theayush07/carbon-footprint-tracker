-- Seed emission factors with realistic data
INSERT INTO emission_factors (category, subcategory, factor_value, unit, description) VALUES
-- Transportation (kg CO2e per km)
('transport', 'car_petrol', 0.192, 'kg_co2_per_km', 'Average petrol car'),
('transport', 'car_diesel', 0.171, 'kg_co2_per_km', 'Average diesel car'),
('transport', 'car_electric', 0.053, 'kg_co2_per_km', 'Average electric car'),
('transport', 'bus', 0.089, 'kg_co2_per_km', 'Average bus'),
('transport', 'train', 0.041, 'kg_co2_per_km', 'Average train'),
('transport', 'flight_short', 0.255, 'kg_co2_per_km', 'Short-haul flight'),
('transport', 'flight_long', 0.195, 'kg_co2_per_km', 'Long-haul flight'),

-- Energy (kg CO2e per kWh or liter)
('energy', 'electricity', 0.233, 'kg_co2_per_kwh', 'Grid electricity average'),
('energy', 'natural_gas', 0.185, 'kg_co2_per_kwh', 'Natural gas heating'),
('energy', 'heating_oil', 2.52, 'kg_co2_per_liter', 'Heating oil'),

-- Food (kg CO2e per kg)
('food', 'beef', 27.0, 'kg_co2_per_kg', 'Beef production'),
('food', 'pork', 12.1, 'kg_co2_per_kg', 'Pork production'),
('food', 'chicken', 6.9, 'kg_co2_per_kg', 'Chicken production'),
('food', 'dairy', 2.8, 'kg_co2_per_kg', 'Dairy products average'),
('food', 'vegetables', 0.4, 'kg_co2_per_kg', 'Vegetables average'),
('food', 'grains', 0.6, 'kg_co2_per_kg', 'Grains average'),

-- Waste (kg CO2e per kg)
('waste', 'landfill', 0.57, 'kg_co2_per_kg', 'Waste sent to landfill'),
('waste', 'recycling', -0.21, 'kg_co2_per_kg', 'Recycled waste (carbon saved)')
ON CONFLICT DO NOTHING;
