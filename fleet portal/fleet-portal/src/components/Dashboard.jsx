import React, { useState, useEffect } from 'react'
import { Truck, Activity, Wrench, AlertCircle, TrendingUp, CalendarDays } from 'lucide-react'
import VehicleCard from './VehicleCard'
import ClientTrackingPanel from './portal/ClientTrackingPanel'
import InvoicingPanel from './portal/InvoicingPanel'
import ReportingHub from './portal/ReportingHub'
import BookingBoard from './scheduling/BookingBoard'
import BookingForm from './scheduling/BookingForm'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { demoVehicles, demoStats, demoDepot, demoStops } from '../utils/demoData'
import RouteOptimizerPanel from './routing/RouteOptimizerPanel'
import {
  demoVehicles,
  demoStats,
  demoDeliveryMilestones,
  demoInvoices,
  demoReports,
  demoBookings,
  hasVehicleTimeConflict,
  withBookingConflictFlags,
} from '../utils/demoData'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('operations')
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
import { Truck, Activity, Wrench, AlertCircle, TrendingUp, BellRing } from 'lucide-react'
import { Truck, Activity, Wrench, AlertCircle, TrendingUp, ShieldAlert, Clock3, ShieldCheck, FileText } from 'lucide-react'
import VehicleCard from './VehicleCard'
import DriverCommsPanel from './communications/DriverCommsPanel'
import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { demoVehicles, demoStats, demoDriverMessages } from '../utils/demoData'
import CompliancePanel from './compliance/CompliancePanel'
import { computeComplianceSummary } from '../utils/compliance'
import { demoVehicles, demoStats, demoComplianceRecords, demoGeneratedReports } from '../utils/demoData'

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([])
  const [driverMessages, setDriverMessages] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('fleet')
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [milestones, setMilestones] = useState([])
  const [invoices, setInvoices] = useState([])
  const [reports, setReports] = useState([])
  const [complianceRecords, setComplianceRecords] = useState([])
  const [generatedReports, setGeneratedReports] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    if (isSupabaseConfigured()) {
      try {
        const { data: vehiclesData, error } = await supabase
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .order('vehicle_name')

        if (error) throw error
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
        setMilestones(createMilestonesFromVehicles(vehiclesData))
        setIsDemoMode(false)
      } catch (error) {
        console.error('Error loading vehicles from Supabase:', error)
        useDemoOperationsData()
        const { data: messagesData, error: messagesError } = await supabase
          .from('driver_messages')
          .select('*')
          .order('sent_at', { ascending: false })

        if (messagesError) {
          console.error('Error loading driver messages from Supabase:', messagesError)
          setDriverMessages([])
        } else {
          setDriverMessages(messagesData || [])
        }

        setVehicles(vehiclesData)
        calculateStats(vehiclesData, messagesData || [])
        setIsDemoMode(false)
      } catch (error) {
        console.error('Error loading from Supabase:', error)
        useDemoData()
      }

      await Promise.all([
        loadInvoicesFromSupabase(),
        loadReportsFromSupabase(),
      ])
    } else {
      useDemoOperationsData()
      useDemoClientPortalData()
      useDemoData()
    }

    setLoading(false)
  }

  function useDemoOperationsData() {
    setVehicles(demoVehicles)
    setDriverMessages(demoDriverMessages)
    calculateStats(demoVehicles, demoDriverMessages)
    setStats(demoStats)
    setBookings(withBookingConflictFlags(demoBookings))
    setComplianceRecords(demoComplianceRecords)
    setGeneratedReports(demoGeneratedReports)
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
  function calculateStats(vehicleData, messageData = []) {
    const total = vehicleData.length
    const active = vehicleData.filter((vehicle) => vehicle.status === 'active').length
    const idle = vehicleData.filter((vehicle) => vehicle.status === 'idle').length
    const maintenance = vehicleData.filter((vehicle) => vehicle.status === 'maintenance').length
    const maintenanceAlerts = vehicleData.filter((vehicle) => vehicle.maintenance_due).length
    const avgFuel = Math.round(vehicleData.reduce((sum, vehicle) => sum + vehicle.fuel_level, 0) / total)
    const active = vehicleData.filter(v => v.status === 'active').length
    const idle = vehicleData.filter(v => v.status === 'idle').length
    const maintenance = vehicleData.filter(v => v.status === 'maintenance').length
    const maintenanceAlerts = vehicleData.filter(v => v.maintenance_due).length
    const unacknowledgedMessages = messageData.filter(m => !m.acknowledged_at).length
    const avgFuel = total
      ? Math.round(vehicleData.reduce((sum, v) => sum + v.fuel_level, 0) / total)
      : 0

    setStats({
      total_vehicles: total,
      active_vehicles: active,
      idle_vehicles: idle,
      maintenance_vehicles: maintenance,
      average_fuel_level: avgFuel,
      maintenance_alerts: maintenanceAlerts,
      unacknowledged_messages: unacknowledgedMessages,
    })
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
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
  async function handleSendMessage(messagePayload) {
    const newMessage = {
      id: Date.now(),
      ...messagePayload,
      sent_at: new Date().toISOString(),
      acknowledged_at: null,
    }

    setDriverMessages(prev => {
      const nextMessages = [newMessage, ...prev]
      calculateStats(vehicles, nextMessages)
      return nextMessages
    })

    if (isSupabaseConfigured() && !isDemoMode) {
      const { error } = await supabase.from('driver_messages').insert({
        driver_name: messagePayload.driver_name,
        vehicle_id: messagePayload.vehicle_id,
        priority: messagePayload.priority,
        text: messagePayload.text,
      })

      if (error) {
        console.error('Error writing driver message:', error)
      }
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'all') return true
    if (filter === 'alerts') return vehicle.maintenance_due || vehicle.fuel_level < 30
    return vehicle.status === filter
  })

  const activeDrivers = vehicles
    .filter(vehicle => vehicle.status === 'active' && vehicle.driver_name)
    .map(vehicle => ({
      vehicle_id: vehicle.id,
      vehicle_name: vehicle.vehicle_name,
      driver_name: vehicle.driver_name,
    }))

  const pendingAcksByVehicle = driverMessages.reduce((acc, message) => {
    if (!message.acknowledged_at) {
      acc[message.vehicle_id] = (acc[message.vehicle_id] || 0) + 1
    }
    return acc
  }, {})
  const complianceSummary = computeComplianceSummary(complianceRecords)

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
        <div style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <Truck size={32} style={{ color: 'var(--color-accent)' }} />
            <h1 style={{ fontSize: '48px', color: 'var(--color-text)' }}>Fleet Portal</h1>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--color-text-dim)' }}>Real-time vehicle tracking and management</p>
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
            <StatCard
              icon={BellRing}
              label="Unacknowledged"
              value={stats.unacknowledged_messages}
              color="var(--color-warning)"
            />
            <StatCard
              icon={Wrench}
              label="In Maintenance"
              value={stats.maintenance_vehicles}
              color="var(--color-danger)"
            />
            <StatCard
              icon={ShieldAlert}
              label="Compliance Overdue"
              value={complianceSummary.critical}
              color="var(--color-danger)"
            />
            <StatCard
              icon={Clock3}
              label="Compliance Due Soon"
              value={complianceSummary.warning}
              color="var(--color-warning)"
            />
            <StatCard
              icon={ShieldCheck}
              label="Compliance Clear"
              value={complianceSummary.clear}
              color="var(--color-success)"
            />
            <StatCard
              icon={FileText}
              label="Missing Metadata"
              value={complianceSummary.info}
              color="var(--color-text-dim)"
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

        <RouteOptimizerPanel vehicles={vehicles} depot={demoDepot} defaultStops={demoStops} />

        {/* Vehicles Grid */}
        <div style={{ marginBottom: '30px' }}>
          <DriverCommsPanel
            activeDrivers={activeDrivers}
            messages={driverMessages}
            onSendMessage={handleSendMessage}
          />
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
              <VehicleCard vehicle={vehicle} pendingAcknowledgements={pendingAcksByVehicle[vehicle.id] || 0} />
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
        )}

        {activeTab === 'scheduling' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px' }}>
            <BookingBoard bookings={bookings} />
            <BookingForm vehicles={vehicles} onCreateBooking={addBooking} hasConflict={bookingHasConflict} />
          </div>
        )}

        <CompliancePanel records={complianceRecords} reports={generatedReports} vehicles={vehicles} />
      </div>
    </div>
  )
}
