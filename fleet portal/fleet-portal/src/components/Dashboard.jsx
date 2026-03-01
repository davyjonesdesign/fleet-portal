import React, { useEffect, useState } from 'react'
import {
  Truck,
  Activity,
  Wrench,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  BellRing,
  ShieldAlert,
  Clock3,
  ShieldCheck,
  FileText,
} from 'lucide-react'

import VehicleCard from './VehicleCard'
import ClientTrackingPanel from './portal/ClientTrackingPanel'
import InvoicingPanel from './portal/InvoicingPanel'
import ReportingHub from './portal/ReportingHub'
import BookingBoard from './scheduling/BookingBoard'
import BookingForm from './scheduling/BookingForm'
import DriverCommsPanel from './communications/DriverCommsPanel'
import CompliancePanel from './compliance/CompliancePanel'

import { supabase, isSupabaseConfigured } from '../supabaseClient'
import { computeComplianceSummary } from '../utils/compliance'
import {
  demoVehicles,
  demoStats,
  demoDeliveryMilestones,
  demoInvoices,
  demoReports,
  demoBookings,
  demoDriverMessages,
  demoComplianceRecords,
  demoGeneratedReports,
  hasVehicleTimeConflict,
  withBookingConflictFlags,
} from '../utils/demoData'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('operations')
  const [activeTab, setActiveTab] = useState('fleet')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [driverMessages, setDriverMessages] = useState([])
  const [stats, setStats] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [invoices, setInvoices] = useState([])
  const [reports, setReports] = useState([])
  const [complianceRecords, setComplianceRecords] = useState([])
  const [generatedReports, setGeneratedReports] = useState([])


  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)

    if (isSupabaseConfigured()) {
      try {
        const { data: vehiclesData, error: vehiclesError } = await supabase.from('vehicles').select('*').order('vehicle_name')
        if (vehiclesError) throw vehiclesError

        let bookingsData = []
        try {
          const { data, error: bookingsError } = await supabase.from('bookings').select('*').order('pickup_at', { ascending: true })
          if (bookingsError) throw bookingsError
          bookingsData = data || []
        } catch (err) {
          console.error('Error loading bookings from Supabase, using demo bookings:', err)
          bookingsData = demoBookings
        }

        let messagesData = []
        try {
          const { data, error: messagesError } = await supabase.from('driver_messages').select('*').order('sent_at', { ascending: false })
          if (messagesError) throw messagesError
          messagesData = data || []
        } catch (err) {
          console.error('Error loading driver messages from Supabase, using demo messages:', err)
          messagesData = demoDriverMessages
        }

        setVehicles(vehiclesData || [])
        setBookings(withBookingConflictFlags(bookingsData || []))
        setDriverMessages(messagesData || [])
        calculateStats(vehiclesData || [], messagesData || [])
        setMilestones(createMilestonesFromVehicles(vehiclesData || []))
        setIsDemoMode(false)

        loadInvoicesFromSupabase()
        loadReportsFromSupabase()
      } catch (err) {
        console.error('Error loading from Supabase, falling back to demo data:', err)
        useDemoOperationsData()
        useDemoClientPortalData()
      }
    } else {
      useDemoOperationsData()
      useDemoClientPortalData()
    }

    setLoading(false)
  }

  function useDemoOperationsData() {
    setVehicles(demoVehicles)
    setDriverMessages(demoDriverMessages)
    calculateStats(demoVehicles, demoDriverMessages)
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
      const { data, error } = await supabase.from('invoices').select('invoice_id, client_name, amount, status, due_date').order('due_date', { ascending: true })
      if (error) throw error
      setInvoices(data ?? [])
    } catch (err) {
      console.error('Error loading invoices from Supabase:', err)
      setInvoices(demoInvoices)
    }
  }

  async function loadReportsFromSupabase() {
    try {
      const { data, error } = await supabase.from('reports').select('report_type, generated_at, period').order('generated_at', { ascending: false })
      if (error) throw error
      setReports(data ?? [])
    } catch (err) {
      console.error('Error loading reports from Supabase:', err)
      setReports(demoReports)
    }
  }

  function createMilestonesFromVehicles(vehicleData) {
    if (!Array.isArray(vehicleData) || vehicleData.length === 0) return []
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

  function calculateStats(vehicleData = [], messageData = []) {
    const total = Array.isArray(vehicleData) ? vehicleData.length : 0
    const active = vehicleData.filter((v) => v.status === 'active').length
    const idle = vehicleData.filter((v) => v.status === 'idle').length
    const maintenance = vehicleData.filter((v) => v.status === 'maintenance').length
    const maintenanceAlerts = vehicleData.filter((v) => v.maintenance_due).length
    const avgFuel = total ? Math.round(vehicleData.reduce((sum, v) => sum + (v.fuel_level || 0), 0) / total) : 0
    const unacknowledgedMessages = messageData.filter((m) => !m.acknowledged_at).length

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

  function addBooking(newBooking) {
    const bookingWithId = { ...newBooking, id: Date.now(), status: newBooking.status || 'requested' }
    setBookings((prev) => withBookingConflictFlags([...prev, bookingWithId]))
  }

  function bookingHasConflict(candidate) {
    return hasVehicleTimeConflict(bookings, candidate)
  }

  async function handleSendMessage(messagePayload) {
    const newMessage = { id: Date.now(), ...messagePayload, sent_at: new Date().toISOString(), acknowledged_at: null }
    setDriverMessages((prev) => {
      const next = [newMessage, ...prev]
      calculateStats(vehicles, next)
      return next
    })

    if (isSupabaseConfigured() && !isDemoMode) {
      const { error } = await supabase.from('driver_messages').insert({
        driver_name: messagePayload.driver_name,
        vehicle_id: messagePayload.vehicle_id,
        priority: messagePayload.priority,
        text: messagePayload.text,
      })
      if (error) console.error('Error writing driver message:', error)
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (filter === 'all') return true
    if (filter === 'alerts') return vehicle.maintenance_due || (vehicle.fuel_level || 0) < 30
    return vehicle.status === filter
  })

  const activeDrivers = vehicles.filter((v) => v.status === 'active' && v.driver_name).map((v) => ({ vehicle_id: v.id, vehicle_name: v.vehicle_name, driver_name: v.driver_name }))

  const pendingAcksByVehicle = driverMessages.reduce((acc, message) => {
    if (!message.acknowledged_at) acc[message.vehicle_id] = (acc[message.vehicle_id] || 0) + 1
    return acc
  }, {})

  const complianceSummary = computeComplianceSummary(complianceRecords || [])

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Icon size={24} style={{ color }} />
        {trend && <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )

  const FilterButton = ({ value, label, count }) => (
    <button
      onClick={() => setFilter(value)}
      className={`button ${filter === value ? 'button--active' : ''}`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  )

  const TabButton = ({ value, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`button ${activeTab === value ? 'button--active' : ''}`}
    >
      <Icon size={16} />
      {label}
    </button>
  )

  if (loading) return <div className="page flex flex-center">Loading...</div>


  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <div className="flex" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
            <Truck size={32} className="text-accent" />
            <h1 className="dashboard-title">Fleet Portal</h1>
          </div>
          <p className="text-muted">Real-time vehicle tracking and management</p>
          {isDemoMode && (
            <div className="alert-info">
              <strong>Demo Mode:</strong> Configure Supabase credentials to connect live data
            </div>
          )}
        </div>

        <div className="flex" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <button
            className={`button ${activeSection === 'operations' ? 'button--active' : ''}`}
            onClick={() => setActiveSection('operations')}
          >
            Operations
          </button>
          <button
            className={`button ${activeSection === 'client portal' ? 'button--active' : ''}`}
            onClick={() => setActiveSection('client portal')}
          >
            Client Portal
          </button>
        </div>

        {activeSection === 'operations' ? (
          <>
            {stats && (
              <div className="stats-grid">
                <StatCard icon={Truck} label="Total Vehicles" value={stats.total_vehicles} color="var(--color-accent)" />
                <StatCard icon={Activity} label="Active Now" value={stats.active_vehicles} color="var(--color-success)" />
                <StatCard icon={AlertCircle} label="Alerts" value={stats.maintenance_alerts} color="var(--color-warning)" />
                <StatCard icon={Wrench} label="In Maintenance" value={stats.maintenance_vehicles} color="var(--color-danger)" />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
              <FilterButton value="all" label="All Vehicles" count={vehicles.length} />
              <FilterButton value="active" label="Active" count={stats?.active_vehicles} />
              <FilterButton value="idle" label="Idle" count={stats?.idle_vehicles} />
              <FilterButton value="maintenance" label="Maintenance" count={stats?.maintenance_vehicles} />
              <FilterButton value="alerts" label="Alerts" count={stats?.maintenance_alerts} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px,1fr))', gap: 20, marginBottom: 30 }}>
              {filteredVehicles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-dim)' }}>
                  <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p style={{ fontSize: 16 }}>No vehicles found matching your filter</p>
                </div>
              )}
              {filteredVehicles.map((vehicle, idx) => (
                <div key={vehicle.id} style={{ animationDelay: `${idx * 0.1}s` }}>
                  <VehicleCard vehicle={vehicle} pendingAcknowledgements={pendingAcksByVehicle[vehicle.id] || 0} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 30 }}>
              <DriverCommsPanel activeDrivers={activeDrivers} messages={driverMessages} onSendMessage={handleSendMessage} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <TabButton value="fleet" label="Fleet" icon={Truck} />
              <TabButton value="scheduling" label="Scheduling" icon={CalendarDays} />
            </div>

            {activeTab === 'scheduling' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: 20, marginBottom: 40 }}>
                <BookingBoard bookings={bookings} />
                <BookingForm vehicles={vehicles} onCreateBooking={addBooking} hasConflict={bookingHasConflict} />
              </div>
            )}

            <div style={{ marginTop: 40 }}>
              <CompliancePanel records={complianceRecords} reports={generatedReports} vehicles={vehicles} />
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gap: 24 }}>
            <section>
              <h2 style={{ marginBottom: 10, color: 'var(--color-text)' }}>Client tracking</h2>
              <p style={{ marginBottom: 14, color: 'var(--color-text-dim)', fontSize: 14 }}>Track delivery milestones by active vehicle and job.</p>
              <ClientTrackingPanel milestones={milestones} />
            </section>

            <section>
              <h2 style={{ marginBottom: 10, color: 'var(--color-text)' }}>Invoicing</h2>
              <p style={{ marginBottom: 14, color: 'var(--color-text-dim)', fontSize: 14 }}>Review outstanding, paid, and overdue invoice records.</p>
              <InvoicingPanel invoices={invoices} />
            </section>

            <section>
              <h2 style={{ marginBottom: 10, color: 'var(--color-text)' }}>Reporting hub</h2>
              <p style={{ marginBottom: 14, color: 'var(--color-text-dim)', fontSize: 14 }}>Access metadata for generated operational and billing reports.</p>
              <ReportingHub reports={reports} />
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
