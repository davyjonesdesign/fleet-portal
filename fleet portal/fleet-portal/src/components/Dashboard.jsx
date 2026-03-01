import React, { useState, useEffect } from 'react'
import { Truck, Activity, Wrench, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react'
import VehicleCard from './VehicleCard'
import BookingBoard from './scheduling/BookingBoard'
import BookingForm from './scheduling/BookingForm'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import {
  demoVehicles,
  demoStats,
  demoBookings,
  hasVehicleTimeConflict,
  withBookingConflictFlags,
} from '../utils/demoData'

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('fleet')
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    if (isSupabaseConfigured()) {
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .order('vehicle_name')

        if (vehiclesError) throw vehiclesError

        let bookingsData = []
        try {
          const { data, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .order('pickup_at', { ascending: true })

          if (bookingsError) throw bookingsError
          bookingsData = data || []
        } catch (bookingsError) {
          console.error('Error loading bookings from Supabase, using demo bookings:', bookingsError)
          bookingsData = demoBookings
        }

        setVehicles(vehiclesData)
        setBookings(withBookingConflictFlags(bookingsData))
        calculateStats(vehiclesData)
        setIsDemoMode(false)
      } catch (error) {
        console.error('Error loading from Supabase:', error)
        useDemoData()
      }
    } else {
      useDemoData()
    }

    setLoading(false)
  }

  function useDemoData() {
    setVehicles(demoVehicles)
    setStats(demoStats)
    setBookings(withBookingConflictFlags(demoBookings))
    setIsDemoMode(true)
  }

  function calculateStats(vehicleData) {
    const total = vehicleData.length
    const active = vehicleData.filter((vehicle) => vehicle.status === 'active').length
    const idle = vehicleData.filter((vehicle) => vehicle.status === 'idle').length
    const maintenance = vehicleData.filter((vehicle) => vehicle.status === 'maintenance').length
    const maintenanceAlerts = vehicleData.filter((vehicle) => vehicle.maintenance_due).length
    const avgFuel = Math.round(vehicleData.reduce((sum, vehicle) => sum + vehicle.fuel_level, 0) / total)

    setStats({
      total_vehicles: total,
      active_vehicles: active,
      idle_vehicles: idle,
      maintenance_vehicles: maintenance,
      average_fuel_level: avgFuel,
      maintenance_alerts: maintenanceAlerts,
    })
  }

  function addBooking(newBooking) {
    const bookingWithId = {
      ...newBooking,
      id: Date.now(),
      status: newBooking.status || 'requested',
    }

    setBookings((previousBookings) => withBookingConflictFlags([...previousBookings, bookingWithId]))
  }

  function bookingHasConflict(bookingCandidate) {
    return hasVehicleTimeConflict(bookings, bookingCandidate)
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filter === 'all') return true
    if (filter === 'alerts') return vehicle.maintenance_due || vehicle.fuel_level < 30
    return vehicle.status === filter
  })

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
        animation: 'slideIn 0.5s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Icon size={24} style={{ color }} />
        {trend && <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      style={{
        padding: '10px 20px',
        border: filter === value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        background: filter === value ? 'var(--color-accent-glow)' : 'var(--color-surface)',
        color: filter === value ? 'var(--color-accent)' : 'var(--color-text)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
      onMouseEnter={(event) => {
        if (filter !== value) {
          event.currentTarget.style.background = 'var(--color-surface-hover)'
          event.currentTarget.style.borderColor = 'var(--color-accent)'
        }
      }}
      onMouseLeave={(event) => {
        if (filter !== value) {
          event.currentTarget.style.background = 'var(--color-surface)'
          event.currentTarget.style.borderColor = 'var(--color-border)'
        }
      }}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  )

  const TabButton = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        border: activeTab === value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        background: activeTab === value ? 'var(--color-accent-glow)' : 'var(--color-surface)',
        color: activeTab === value ? 'var(--color-accent)' : 'var(--color-text)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  )

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '14px', color: 'var(--color-text-dim)' }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <Truck size={32} style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '48px', color: 'var(--color-text)' }}>Fleet Portal</h1>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--color-text-dim)' }}>Real-time vehicle tracking and management</p>
          {isDemoMode && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--color-warning)',
              }}
            >
              <strong>Demo Mode:</strong> Configure Supabase credentials to connect live data
            </div>
          )}
        </div>

        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px',
            }}
          >
            <StatCard icon={Truck} label="Total Vehicles" value={stats.total_vehicles} color="var(--color-accent)" />
            <StatCard icon={Activity} label="Active Now" value={stats.active_vehicles} color="var(--color-success)" />
            <StatCard icon={AlertCircle} label="Alerts" value={stats.maintenance_alerts} color="var(--color-warning)" />
            <StatCard icon={Wrench} label="In Maintenance" value={stats.maintenance_vehicles} color="var(--color-danger)" />
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <TabButton value="fleet" label="Fleet" icon={Truck} />
          <TabButton value="scheduling" label="Scheduling" icon={CalendarDays} />
        </div>

        {activeTab === 'fleet' && (
          <>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <FilterButton value="all" label="All Vehicles" count={vehicles.length} />
              <FilterButton value="active" label="Active" count={stats?.active_vehicles} />
              <FilterButton value="idle" label="Idle" count={stats?.idle_vehicles} />
              <FilterButton value="maintenance" label="Maintenance" count={stats?.maintenance_vehicles} />
              <FilterButton value="alerts" label="Alerts" count={stats?.maintenance_alerts} />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredVehicles.map((vehicle, index) => (
                <div key={vehicle.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-dim)' }}>
                <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px' }}>No vehicles found matching your filter</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'scheduling' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px' }}>
            <BookingBoard bookings={bookings} />
            <BookingForm vehicles={vehicles} onCreateBooking={addBooking} hasConflict={bookingHasConflict} />
          </div>
        )}
      </div>
    </div>
  )
}
