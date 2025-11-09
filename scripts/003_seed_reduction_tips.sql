-- Seed reduction tips
INSERT INTO reduction_tips (category, tip_text, potential_savings_kg_co2, difficulty_level) VALUES
-- Transportation tips
('transport', 'Use public transport or carpool for commuting', 500, 'easy'),
('transport', 'Walk or cycle for short trips under 5km', 200, 'easy'),
('transport', 'Consider switching to an electric or hybrid vehicle', 1500, 'hard'),
('transport', 'Reduce air travel and choose trains for shorter distances', 800, 'medium'),
('transport', 'Maintain proper tire pressure to improve fuel efficiency', 100, 'easy'),

-- Energy tips
('energy', 'Switch to LED bulbs throughout your home', 150, 'easy'),
('energy', 'Lower thermostat by 1°C in winter', 300, 'easy'),
('energy', 'Unplug devices when not in use to avoid phantom power', 80, 'easy'),
('energy', 'Install a smart thermostat', 250, 'medium'),
('energy', 'Improve home insulation', 600, 'hard'),
('energy', 'Switch to renewable energy provider', 1000, 'medium'),

-- Food tips
('food', 'Reduce meat consumption to 2-3 times per week', 700, 'medium'),
('food', 'Choose locally sourced and seasonal produce', 200, 'easy'),
('food', 'Reduce food waste by meal planning', 300, 'easy'),
('food', 'Try "Meatless Mondays" or plant-based meals', 400, 'easy'),
('food', 'Buy in bulk to reduce packaging waste', 100, 'easy'),

-- Waste tips
('waste', 'Start composting organic waste', 150, 'medium'),
('waste', 'Use reusable bags, bottles, and containers', 120, 'easy'),
('waste', 'Properly sort recyclables', 80, 'easy'),
('waste', 'Avoid single-use plastics', 90, 'easy'),
('waste', 'Repair items instead of replacing them', 200, 'medium')
ON CONFLICT DO NOTHING;
