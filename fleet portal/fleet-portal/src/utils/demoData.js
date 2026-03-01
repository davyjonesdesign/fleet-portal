export const demoVehicles = [
  {
    id: 1,
    vehicle_name: 'Sprinter Van 01',
    license_plate: 'FLT-2847',
    status: 'active',
    driver_name: 'Michael Chen',
    location: 'Downtown District',
    last_update: new Date(Date.now() - 15 * 60000).toISOString(),
    mileage: 45234,
    last_service_date: new Date(Date.now() - 68 * 24 * 60 * 60000).toISOString(),
    avg_daily_miles: 62,
    fuel_level: 78,
    next_maintenance: new Date(Date.now() + 7 * 24 * 60 * 60000).toISOString(),
    maintenance_due: false,
  },
  {
    id: 2,
    vehicle_name: 'Cargo Truck 03',
    license_plate: 'FLT-1923',
    status: 'active',
    driver_name: 'Sarah Rodriguez',
    location: 'Warehouse Zone B',
    last_update: new Date(Date.now() - 8 * 60000).toISOString(),
    mileage: 89451,
    last_service_date: new Date(Date.now() - 110 * 24 * 60 * 60000).toISOString(),
    avg_daily_miles: 128,
    fuel_level: 45,
    next_maintenance: new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString(),
    maintenance_due: true,
  },
  {
    id: 3,
    vehicle_name: 'Delivery Van 12',
    license_plate: 'FLT-5612',
    status: 'idle',
    driver_name: null,
    location: 'Main Depot',
    last_update: new Date(Date.now() - 120 * 60000).toISOString(),
    mileage: 34567,
    last_service_date: new Date(Date.now() - 35 * 24 * 60 * 60000).toISOString(),
    fuel_level: 92,
    next_maintenance: new Date(Date.now() + 14 * 24 * 60 * 60000).toISOString(),
    maintenance_due: false,
  },
  {
    id: 4,
    vehicle_name: 'Box Truck 07',
    license_plate: 'FLT-8834',
    status: 'maintenance',
    driver_name: null,
    location: 'Service Center',
    last_update: new Date(Date.now() - 240 * 60000).toISOString(),
    mileage: 102341,
    last_service_date: new Date(Date.now() - 150 * 24 * 60 * 60000).toISOString(),
    avg_daily_miles: 146,
    fuel_level: 15,
    next_maintenance: new Date().toISOString(),
    maintenance_due: true,
  },
  {
    id: 5,
    vehicle_name: 'Sprinter Van 08',
    license_plate: 'FLT-4422',
    status: 'active',
    driver_name: 'James Wilson',
    location: 'Airport Route',
    last_update: new Date(Date.now() - 5 * 60000).toISOString(),
    mileage: 56788,
    last_service_date: new Date(Date.now() - 52 * 24 * 60 * 60000).toISOString(),
    avg_daily_miles: 88,
    fuel_level: 68,
    next_maintenance: new Date(Date.now() + 21 * 24 * 60 * 60000).toISOString(),
    maintenance_due: false,
  },
  {
    id: 6,
    vehicle_name: 'Pickup Truck 15',
    license_plate: 'FLT-7731',
    status: 'idle',
    driver_name: null,
    location: 'North Yard',
    last_update: new Date(Date.now() - 180 * 60000).toISOString(),
    mileage: 67234,
    last_service_date: new Date(Date.now() - 74 * 24 * 60 * 60000).toISOString(),
    fuel_level: 55,
    next_maintenance: new Date(Date.now() + 10 * 24 * 60 * 60000).toISOString(),
    maintenance_due: false,
  },
]

export const demoBookings = [
  {
    id: 1,
    client: 'Acme Retail',
    pickup_at: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    dropoff_at: new Date(Date.now() + 6 * 60 * 60000).toISOString(),
    vehicle_id: 1,
    vehicle_type: 'Sprinter Van 01',
    status: 'confirmed',
    special_notes: 'Fragile goods. Use rear dock.',
  },
  {
    id: 2,
    client: 'Blue Harbor Foods',
    pickup_at: new Date(Date.now() + 4 * 60 * 60000).toISOString(),
    dropoff_at: new Date(Date.now() + 7 * 60 * 60000).toISOString(),
    vehicle_id: 1,
    vehicle_type: 'Sprinter Van 01',
    status: 'requested',
    special_notes: 'Potential overlap to demo conflict highlighting.',
  },
  {
    id: 3,
    client: 'Northline Medical',
    pickup_at: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
    dropoff_at: new Date(Date.now() + 30 * 60 * 60000).toISOString(),
    vehicle_id: 2,
    vehicle_type: 'Cargo Truck 03',
    status: 'in-progress',
    special_notes: '',
  },
  {
    id: 4,
    client: 'South Plaza Hotel',
    pickup_at: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    dropoff_at: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    vehicle_id: 5,
    vehicle_type: 'Sprinter Van 08',
    status: 'completed',
    special_notes: '',
  },
  {
    id: 5,
    client: 'City Events Co.',
    pickup_at: new Date(Date.now() + 48 * 60 * 60000).toISOString(),
    dropoff_at: new Date(Date.now() + 55 * 60 * 60000).toISOString(),
    vehicle_id: 6,
    vehicle_type: 'Pickup Truck 15',
    status: 'cancelled',
    special_notes: 'Cancelled by client.',
  },
]

export const demoStats = {
  total_vehicles: 6,
  active_vehicles: 3,
  idle_vehicles: 2,
  maintenance_vehicles: 1,
  average_fuel_level: 59,
  maintenance_alerts: 2,
}

export const demoDepot = {
  id: 'depot-main',
  name: 'Main Depot',
  lat: 37.7749,
  lng: -122.4194,
}

export const demoStops = [
  { id: 'stop-1', name: 'Market Street Hub', lat: 37.7897, lng: -122.4011 },
  { id: 'stop-2', name: 'Mission District Drop', lat: 37.7599, lng: -122.4148 },
  { id: 'stop-3', name: 'Embarcadero Pickup', lat: 37.7955, lng: -122.3937 },
  { id: 'stop-4', name: 'Sunset Residential', lat: 37.7534, lng: -122.4944 },
  { id: 'stop-5', name: 'Presidio Supply Point', lat: 37.7989, lng: -122.4662 },
]

export const demoDeliveryMilestones = [
  {
    id: 'ms-1001',
    vehicle_name: 'Sprinter Van 01',
    job_name: 'Downtown medical supplies',
    driver_name: 'Michael Chen',
    current_milestone: 'Checkpoint 3 / 5 - Midtown Clinic',
    eta: new Date(Date.now() + 45 * 60000).toISOString(),
    status: 'in transit',
  },
  {
    id: 'ms-1002',
    vehicle_name: 'Cargo Truck 03',
    job_name: 'Warehouse transfer batch A',
    driver_name: 'Sarah Rodriguez',
    current_milestone: 'Loading complete - Heading to Distribution Center',
    eta: new Date(Date.now() + 90 * 60000).toISOString(),
    status: 'en route',
  },
]

export const demoInvoices = [
  {
    invoice_id: 'INV-2026-001',
    client_name: 'Northwind Pharmacies',
    amount: 12450,
    status: 'pending',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(),
  },
  {
    invoice_id: 'INV-2026-002',
    client_name: 'Rivergate Foods',
    amount: 8650,
    status: 'paid',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
  },
  {
    invoice_id: 'INV-2026-003',
    client_name: 'Apex Retail Group',
    amount: 19320,
    status: 'overdue',
    due_date: new Date(Date.now() - 6 * 24 * 60 * 60000).toISOString(),
  },
]

export const demoReports = [
  {
    report_type: 'Delivery Performance',
    generated_at: new Date(Date.now() - 12 * 60 * 60000).toISOString(),
    period: 'Last 7 days',
  },
  {
    report_type: 'Client Billing Summary',
    generated_at: new Date(Date.now() - 36 * 60 * 60000).toISOString(),
    period: 'Current month',
  },
  {
    report_type: 'Fuel Efficiency',
    generated_at: new Date(Date.now() - 70 * 60 * 60000).toISOString(),
    period: 'Q1 2026',
  },
]

function doTimeRangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB
}

export function hasVehicleTimeConflict(bookings, bookingCandidate, excludeBookingId = null) {
  const candidateStart = new Date(bookingCandidate.pickup_at)
  const candidateEnd = new Date(bookingCandidate.dropoff_at)

  return bookings.some((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) return false
    if (booking.vehicle_id !== Number(bookingCandidate.vehicle_id)) return false

    const existingStart = new Date(booking.pickup_at)
    const existingEnd = new Date(booking.dropoff_at)
    return doTimeRangesOverlap(candidateStart, candidateEnd, existingStart, existingEnd)
  })
}

export function withBookingConflictFlags(bookings) {
  return bookings.map((booking) => ({
    ...booking,
    has_conflict: hasVehicleTimeConflict(bookings, booking, booking.id),
  }))
}

export const demoDriverMessages = [
  {
    id: 1,
    driver_name: 'Michael Chen',
    vehicle_id: 1,
    priority: 'critical',
    text: 'Immediate reroute required due to road closure on 7th Avenue.',
    sent_at: new Date(Date.now() - 40 * 60000).toISOString(),
    acknowledged_at: null,
  },
  {
    id: 2,
    driver_name: 'Sarah Rodriguez',
    vehicle_id: 2,
    priority: 'warning',
    text: 'Fuel stop recommended before next pickup window.',
    sent_at: new Date(Date.now() - 75 * 60000).toISOString(),
    acknowledged_at: new Date(Date.now() - 55 * 60000).toISOString(),
  },
  {
    id: 3,
    driver_name: 'James Wilson',
    vehicle_id: 5,
    priority: 'info',
    text: 'Customer loading dock is available 10 minutes early.',
    sent_at: new Date(Date.now() - 20 * 60000).toISOString(),
    acknowledged_at: null,
  },
]

export const demoComplianceRecords = [
  {
    id: 1,
    doc_type: 'inspection',
    vehicle_id: 1,
    status: 'submitted',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_submitted_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    doc_type: 'insurance',
    vehicle_id: 2,
    status: 'approved',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_submitted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    doc_type: 'registration',
    vehicle_id: 3,
    status: 'approved',
    due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    last_submitted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    doc_type: 'maintenance log',
    vehicle_id: 4,
    status: 'pending',
    due_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_submitted_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    doc_type: 'driver hours summary',
    vehicle_id: 5,
    status: 'missing',
    due_date: null,
    last_submitted_at: null,
  },
]

export const demoGeneratedReports = [
  {
    id: 1,
    report_name: 'Weekly Fleet Compliance Snapshot',
    generated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    download_url: '#',
  },
  {
    id: 2,
    report_name: 'Insurance Renewal Queue',
    generated_at: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    download_url: '#',
  },
  {
    id: 3,
    report_name: 'Driver Hours Monthly Rollup',
    generated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    download_url: '#',
  },
]
