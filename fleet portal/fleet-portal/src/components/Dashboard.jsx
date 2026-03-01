import React, { useState, useEffect } from 'react'
import { Truck, Activity, Wrench, AlertCircle, TrendingUp } from 'lucide-react'
import VehicleCard from './VehicleCard'
import ClientTrackingPanel from './portal/ClientTrackingPanel'
import InvoicingPanel from './portal/InvoicingPanel'
import ReportingHub from './portal/ReportingHub'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import {
  demoVehicles,
  demoStats,
  demoDeliveryMilestones,
  demoInvoices,
  demoReports,
} from '../utils/demoData'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('operations')
  const [vehicles, setVehicles] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [milestones, setMilestones] = useState([])
  const [invoices, setInvoices] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    if (isSupabaseConfigured()) {
      try {
        const { data: vehiclesData, error } = await supabase
          .from('vehicles')
          .select('*')
          .order('vehicle_name')

        if (error) throw error

        setVehicles(vehiclesData)
        calculateStats(vehiclesData)
        setMilestones(createMilestonesFromVehicles(vehiclesData))
        setIsDemoMode(false)
      } catch (error) {
        console.error('Error loading vehicles from Supabase:', error)
        useDemoOperationsData()
      }

      await Promise.all([
        loadInvoicesFromSupabase(),
        loadReportsFromSupabase(),
      ])
    } else {
      useDemoOperationsData()
      useDemoClientPortalData()
    }

    setLoading(false)
  }

  function useDemoOperationsData() {
    setVehicles(demoVehicles)
    setStats(demoStats)
    setIsDemoMode(true)
  }

  function useDemoClientPortalData() {
    setMilestones(demoDeliveryMilestones)
    setInvoices(demoInvoices)
    setReports(demoReports)
    setIsDemoMode(true)
  }

  async function loadInvoicesFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_id, client_name, amount, status, due_date')
        .order('due_date', { ascending: true })

      if (error) throw error

      setInvoices(data ?? [])
    } catch (error) {
      console.error('Error loading invoices from Supabase:', error)
      useDemoClientPortalData()
    }
  }

  async function loadReportsFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('report_type, generated_at, period')
        .order('generated_at', { ascending: false })

      if (error) throw error

      setReports(data ?? [])
    } catch (error) {
      console.error('Error loading reports from Supabase:', error)
      useDemoClientPortalData()
    }
  }

  function createMilestonesFromVehicles(vehicleData) {
    if (!Array.isArray(vehicleData) || vehicleData.length === 0) {
      return []
    }

    return vehicleData.slice(0, 5).map((vehicle) => ({
      id: `ms-${vehicle.id}`,
      vehicle_name: vehicle.vehicle_name,
      job_name: `${vehicle.vehicle_name} scheduled delivery`,
      driver_name: vehicle.driver_name,
      current_milestone: vehicle.location || 'Awaiting location update',
      eta: new Date(Date.now() + 60 * 60000).toISOString(),
      status: vehicle.status,
    }))
  }

  function calculateStats(vehicleData) {
    const total = vehicleData.length
    const active = vehicleData.filter((v) => v.status === 'active').length
    const idle = vehicleData.filter((v) => v.status === 'idle').length
    const maintenance = vehicleData.filter((v) => v.status === 'maintenance').length
    const maintenanceAlerts = vehicleData.filter((v) => v.maintenance_due).length
    const avgFuel = total > 0
      ? Math.round(vehicleData.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / total)
      : 0

    setStats({
      total_vehicles: total,
      active_vehicles: active,
      idle_vehicles: idle,
      maintenance_vehicles: maintenance,
      average_fuel_level: avgFuel,
      maintenance_alerts: maintenanceAlerts,
    })
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

  const SectionButton = ({ value, label }) => (
    <button
      onClick={() => setActiveSection(value)}
      style={{
        padding: '10px 18px',
        border: activeSection === value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        background: activeSection === value ? 'var(--color-accent-glow)' : 'var(--color-surface)',
        color: activeSection === value ? 'var(--color-accent)' : 'var(--color-text)',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
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
        <div style={{ marginBottom: '30px' }}>
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
              color: 'var(--color-warning)',
            }}>
              <strong>Demo Mode:</strong> Configure Supabase credentials to connect live data
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <SectionButton value="operations" label="Operations" />
          <SectionButton value="client portal" label="Client Portal" />
        </div>

        {activeSection === 'operations' ? (
          <>
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
                  icon={Wrench}
                  label="In Maintenance"
                  value={stats.maintenance_vehicles}
                  color="var(--color-danger)"
                />
              </div>
            )}

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
                <div
                  key={vehicle.id}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
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
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            <section>
              <h2 style={{ marginBottom: '10px', color: 'var(--color-text)' }}>Client tracking</h2>
              <p style={{ marginBottom: '14px', color: 'var(--color-text-dim)', fontSize: '14px' }}>
                Track delivery milestones by active vehicle and job.
              </p>
              <ClientTrackingPanel milestones={milestones} />
            </section>

            <section>
              <h2 style={{ marginBottom: '10px', color: 'var(--color-text)' }}>Invoicing</h2>
              <p style={{ marginBottom: '14px', color: 'var(--color-text-dim)', fontSize: '14px' }}>
                Review outstanding, paid, and overdue invoice records.
              </p>
              <InvoicingPanel invoices={invoices} />
            </section>

            <section>
              <h2 style={{ marginBottom: '10px', color: 'var(--color-text)' }}>Reporting hub</h2>
              <p style={{ marginBottom: '14px', color: 'var(--color-text-dim)', fontSize: '14px' }}>
                Access metadata for generated operational and billing reports.
              </p>
              <ReportingHub reports={reports} />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
