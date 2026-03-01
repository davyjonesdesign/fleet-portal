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

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  client TEXT NOT NULL,
  pickup_at TIMESTAMPTZ NOT NULL,
  dropoff_at TIMESTAMPTZ NOT NULL,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('requested', 'confirmed', 'in-progress', 'completed', 'cancelled')) DEFAULT 'requested',
  special_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT bookings_time_window_valid CHECK (dropoff_at > pickup_at)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_maintenance_due ON vehicles(maintenance_due);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_at ON bookings(pickup_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Prepare route persistence tables for future optimization workflows
CREATE TABLE IF NOT EXISTS routes (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
  route_name TEXT NOT NULL,
  depot_name TEXT NOT NULL,
  optimization_type TEXT NOT NULL DEFAULT 'basic',
  total_distance_km NUMERIC(10,2),
  estimated_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
  id BIGSERIAL PRIMARY KEY,
  route_id BIGINT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_name TEXT NOT NULL,
  stop_order INTEGER NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  estimated_arrival TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_routes_vehicle_id ON routes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);

-- Insert demo data
INSERT INTO vehicles (vehicle_name, license_plate, status, driver_name, location, mileage, fuel_level, next_maintenance, maintenance_due) VALUES
('Sprinter Van 01', 'FLT-2847', 'active', 'Michael Chen', 'Downtown District', 45234, 78, NOW() + INTERVAL '7 days', FALSE),
('Cargo Truck 03', 'FLT-1923', 'active', 'Sarah Rodriguez', 'Warehouse Zone B', 89451, 45, NOW() + INTERVAL '2 days', TRUE),
('Delivery Van 12', 'FLT-5612', 'idle', NULL, 'Main Depot', 34567, 92, NOW() + INTERVAL '14 days', FALSE),
('Box Truck 07', 'FLT-8834', 'maintenance', NULL, 'Service Center', 102341, 15, NOW(), TRUE),
('Sprinter Van 08', 'FLT-4422', 'active', 'James Wilson', 'Airport Route', 56788, 68, NOW() + INTERVAL '21 days', FALSE),
('Pickup Truck 15', 'FLT-7731', 'idle', NULL, 'North Yard', 67234, 55, NOW() + INTERVAL '10 days', FALSE)
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO bookings (client, pickup_at, dropoff_at, vehicle_id, vehicle_type, status, special_notes)
SELECT *
FROM (
  VALUES
    ('Acme Retail', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 1, 'Sprinter Van 01', 'confirmed', 'Fragile goods. Use rear dock.'),
    ('Blue Harbor Foods', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '7 hours', 1, 'Sprinter Van 01', 'requested', 'Potential overlap to demo conflict highlighting.'),
    ('Northline Medical', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours', 2, 'Cargo Truck 03', 'in-progress', ''),
    ('South Plaza Hotel', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '4 hours', 5, 'Sprinter Van 08', 'completed', ''),
    ('City Events Co.', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 7 hours', 6, 'Pickup Truck 15', 'cancelled', 'Cancelled by client.')
) AS demo(client, pickup_at, dropoff_at, vehicle_id, vehicle_type, status, special_notes)
WHERE EXISTS (SELECT 1 FROM vehicles WHERE id = demo.vehicle_id)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON vehicles
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public bookings read access" ON bookings
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated inserts/updates (adjust based on your needs)
CREATE POLICY "Allow authenticated insert" ON vehicles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON vehicles
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated booking insert" ON bookings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated booking update" ON bookings
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

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create driver messages table
CREATE TABLE IF NOT EXISTS driver_messages (
  id BIGSERIAL PRIMARY KEY,
  driver_name TEXT NOT NULL,
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'warning', 'info')),
  text TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_messages_vehicle_id ON driver_messages(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_messages_acknowledged_at ON driver_messages(acknowledged_at);

ALTER TABLE driver_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow client read driver messages" ON driver_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert driver messages" ON driver_messages
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Optional seed messages
INSERT INTO driver_messages (driver_name, vehicle_id, priority, text, sent_at, acknowledged_at) VALUES
('Michael Chen', 1, 'critical', 'Immediate reroute required due to road closure on 7th Avenue.', NOW() - INTERVAL '40 minutes', NULL),
('Sarah Rodriguez', 2, 'warning', 'Fuel stop recommended before next pickup window.', NOW() - INTERVAL '75 minutes', NOW() - INTERVAL '55 minutes'),
('James Wilson', 5, 'info', 'Customer loading dock is available 10 minutes early.', NOW() - INTERVAL '20 minutes', NULL)
ON CONFLICT DO NOTHING;
-- Compliance documents table
CREATE TABLE IF NOT EXISTS compliance_documents (
  id BIGSERIAL PRIMARY KEY,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('inspection', 'insurance', 'registration', 'maintenance log', 'driver hours summary')),
  vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'approved', 'pending', 'rejected', 'missing')),
  due_date TIMESTAMPTZ,
  last_submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_documents_vehicle_id ON compliance_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_compliance_documents_due_date ON compliance_documents(due_date);

ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on compliance_documents" ON compliance_documents
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on compliance_documents" ON compliance_documents
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on compliance_documents" ON compliance_documents
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE TRIGGER update_compliance_documents_updated_at BEFORE UPDATE ON compliance_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generated report runs table
CREATE TABLE IF NOT EXISTS report_runs (
  id BIGSERIAL PRIMARY KEY,
  report_name TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID,
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_runs_generated_at ON report_runs(generated_at DESC);

ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on report_runs" ON report_runs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on report_runs" ON report_runs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
