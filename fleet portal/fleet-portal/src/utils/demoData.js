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
