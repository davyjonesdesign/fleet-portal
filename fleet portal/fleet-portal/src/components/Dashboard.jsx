import React, { useState, useEffect } from 'react'
import { Truck, Activity, Wrench, AlertCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import VehicleCard from './VehicleCard'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { demoVehicles } from '../utils/demoData'
import { calculateMaintenanceRisk } from '../utils/maintenancePrediction'

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    if (isSupabaseConfigured()) {
      try {
        // Try to load from Supabase
        const { data: vehiclesData, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('vehicle_name')

        if (error) throw error

        setVehicles(vehiclesData)
        calculateStats(vehiclesData)
        setIsDemoMode(false)
      } catch (error) {
        console.error('Error loading from Supabase:', error)
        // Fall back to demo mode
        useDemoData()
      }
    } else {
      // Use demo data if Supabase not configured
      useDemoData()
    }

    setLoading(false)
  }

  function useDemoData() {
    setVehicles(demoVehicles)
    calculateStats(demoVehicles)
    setIsDemoMode(true)
  }

  function calculateStats(vehicleData) {
    const total = vehicleData.length
    const active = vehicleData.filter(v => v.status === 'active').length
    const idle = vehicleData.filter(v => v.status === 'idle').length
    const maintenance = vehicleData.filter(v => v.status === 'maintenance').length
    const predictedAtRisk = vehicleData.filter(v => {
      const risk = calculateMaintenanceRisk(v)
      return risk.status !== 'clear'
    }).length
    const mergedAlerts = vehicleData.filter(v => {
      const risk = calculateMaintenanceRisk(v)
      return v.maintenance_due || v.fuel_level < 30 || risk.status !== 'clear'
    }).length
    const avgFuel = total
      ? Math.round(vehicleData.reduce((sum, v) => sum + v.fuel_level, 0) / total)
      : 0

    setStats({
      total_vehicles: total,
      active_vehicles: active,
      idle_vehicles: idle,
      maintenance_vehicles: maintenance,
      average_fuel_level: avgFuel,
      predicted_at_risk: predictedAtRisk,
      maintenance_alerts: mergedAlerts,
    })
  }

  const vehiclesWithRisk = vehicles.map(vehicle => ({
    ...vehicle,
    predictedServiceRisk: calculateMaintenanceRisk(vehicle),
  }))

  const filteredVehicles = vehiclesWithRisk.filter(vehicle => {
    if (filter === 'all') return true
    if (filter === 'predicted-risk') return vehicle.predictedServiceRisk.status !== 'clear'
    if (filter === 'alerts') {
      return vehicle.maintenance_due || vehicle.fuel_level < 30 || vehicle.predictedServiceRisk.status !== 'clear'
    }
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
        {trend && (
          <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
        )}
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
      onMouseEnter={(e) => {
        if (filter !== value) {
          e.currentTarget.style.background = 'var(--color-surface-hover)'
          e.currentTarget.style.borderColor = 'var(--color-accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (filter !== value) {
          e.currentTarget.style.background = 'var(--color-surface)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }
      }}
    >
      {label} {count !== undefined && `(${count})`}
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
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <Truck size={32} style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '48px', color: 'var(--color-text)' }}>Fleet Portal</h1>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--color-text-dim)' }}>
            Real-time vehicle tracking and management
          </p>
          {isDemoMode && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--color-warning)'
            }}>
              <strong>Demo Mode:</strong> Configure Supabase credentials to connect live data
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            <StatCard
              icon={Truck}
              label="Total Vehicles"
              value={stats.total_vehicles}
              color="var(--color-accent)"
            />
            <StatCard
              icon={Activity}
              label="Active Now"
              value={stats.active_vehicles}
              color="var(--color-success)"
            />
            <StatCard
              icon={AlertCircle}
              label="Alerts"
              value={stats.maintenance_alerts}
              color="var(--color-warning)"
            />
            <StatCard
              icon={AlertTriangle}
              label="Predicted At Risk"
              value={stats.predicted_at_risk}
              color="var(--color-warning)"
            />
            <StatCard
              icon={Wrench}
              label="In Maintenance"
              value={stats.maintenance_vehicles}
              color="var(--color-danger)"
            />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <FilterButton value="all" label="All Vehicles" count={vehicles.length} />
          <FilterButton value="active" label="Active" count={stats?.active_vehicles} />
          <FilterButton value="idle" label="Idle" count={stats?.idle_vehicles} />
          <FilterButton value="maintenance" label="Maintenance" count={stats?.maintenance_vehicles} />
          <FilterButton value="predicted-risk" label="Predicted Risk" count={stats?.predicted_at_risk} />
          <FilterButton value="alerts" label="Alerts" count={stats?.maintenance_alerts} />
        </div>

        {/* Vehicles Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <VehicleCard vehicle={vehicle} risk={vehicle.predictedServiceRisk} />
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-dim)' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '16px' }}>No vehicles found matching your filter</p>
          </div>
        )}
      </div>
    </div>
  )
}
