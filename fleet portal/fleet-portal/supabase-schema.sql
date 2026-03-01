-- Fleet Portal Database Schema
-- Run this in your Supabase SQL editor

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGSERIAL PRIMARY KEY,
  vehicle_name TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'maintenance')),
  driver_name TEXT,
  location TEXT NOT NULL,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  mileage INTEGER NOT NULL DEFAULT 0,
  fuel_level INTEGER NOT NULL DEFAULT 100 CHECK (fuel_level >= 0 AND fuel_level <= 100),
  next_maintenance TIMESTAMPTZ,
  maintenance_due BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_maintenance_due ON vehicles(maintenance_due);

-- Insert demo data
INSERT INTO vehicles (vehicle_name, license_plate, status, driver_name, location, mileage, fuel_level, next_maintenance, maintenance_due) VALUES
('Sprinter Van 01', 'FLT-2847', 'active', 'Michael Chen', 'Downtown District', 45234, 78, NOW() + INTERVAL '7 days', FALSE),
('Cargo Truck 03', 'FLT-1923', 'active', 'Sarah Rodriguez', 'Warehouse Zone B', 89451, 45, NOW() + INTERVAL '2 days', TRUE),
('Delivery Van 12', 'FLT-5612', 'idle', NULL, 'Main Depot', 34567, 92, NOW() + INTERVAL '14 days', FALSE),
('Box Truck 07', 'FLT-8834', 'maintenance', NULL, 'Service Center', 102341, 15, NOW(), TRUE),
('Sprinter Van 08', 'FLT-4422', 'active', 'James Wilson', 'Airport Route', 56788, 68, NOW() + INTERVAL '21 days', FALSE),
('Pickup Truck 15', 'FLT-7731', 'idle', NULL, 'North Yard', 67234, 55, NOW() + INTERVAL '10 days', FALSE)
ON CONFLICT (license_plate) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON vehicles
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated inserts/updates (adjust based on your needs)
CREATE POLICY "Allow authenticated insert" ON vehicles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON vehicles
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Optional: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
