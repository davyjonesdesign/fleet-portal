import React from 'react'
import { MapPin, Fuel, Gauge, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import StatusBadge from './StatusBadge'
import { calculateMaintenanceRisk } from '../utils/maintenancePrediction'

const riskBadgeConfig = {
  critical: {
    text: 'Predicted Service Risk: Critical',
    color: 'var(--color-danger)',
    background: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.45)',
  },
  warning: {
    text: 'Predicted Service Risk: Warning',
    color: 'var(--color-warning)',
    background: 'rgba(251, 191, 36, 0.16)',
    border: 'rgba(251, 191, 36, 0.45)',
  },
  clear: {
    text: 'Predicted Service Risk: Clear',
    color: 'var(--color-success)',
    background: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
  },
}

export default function VehicleCard({ vehicle, risk }) {
export default function VehicleCard({ vehicle, pendingAcknowledgements = 0 }) {
  const lastUpdateTime = formatDistanceToNow(new Date(vehicle.last_update), { addSuffix: true })
  const maintenanceRisk = risk || calculateMaintenanceRisk(vehicle)
  const riskBadge = riskBadgeConfig[maintenanceRisk.status] || riskBadgeConfig.clear

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        animation: 'fadeInUp 0.5s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-surface-hover)'
        e.currentTarget.style.borderColor = 'var(--color-accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-surface)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {vehicle.maintenance_due && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'var(--color-warning)',
            color: 'var(--color-bg)',
            padding: '4px 12px',
            fontSize: '10px',
            fontWeight: 600,
            borderBottomLeftRadius: '8px',
            letterSpacing: '0.05em',
          }}
        >
          MAINTENANCE DUE
        </div>
      )}

      {pendingAcknowledgements > 0 && (
        <div
          style={{
            position: 'absolute',
            top: vehicle.maintenance_due ? '28px' : '0',
            right: 0,
            background: 'rgba(245, 158, 11, 0.18)',
            color: 'var(--color-warning)',
            borderLeft: '1px solid rgba(245, 158, 11, 0.4)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '4px 12px',
            fontSize: '10px',
            fontWeight: 600,
            borderBottomLeftRadius: '8px',
            letterSpacing: '0.05em',
          }}
        >
          AWAITING ACKNOWLEDGEMENT ({pendingAcknowledgements})
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', marginBottom: '4px', color: 'var(--color-text)' }}>
            {vehicle.vehicle_name}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)' }}>
            {vehicle.license_plate}
          </p>
        </div>
        <StatusBadge status={vehicle.status} />
      </div>

      <div
        style={{
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: riskBadge.color,
          background: riskBadge.background,
          border: `1px solid ${riskBadge.border}`,
          borderRadius: '999px',
          padding: '6px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>{riskBadge.text}</span>
        <span style={{ opacity: 0.85 }}>({maintenanceRisk.score})</span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {vehicle.driver_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
            <User size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ color: 'var(--color-text)' }}>{vehicle.driver_name}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <MapPin size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{ color: 'var(--color-text)' }}>{vehicle.location}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <Clock size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>
            Updated {lastUpdateTime}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Fuel size={16} style={{ color: vehicle.fuel_level < 30 ? 'var(--color-warning)' : 'var(--color-accent)' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Fuel</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
                {vehicle.fuel_level}%
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gauge size={16} style={{ color: 'var(--color-accent)' }} />
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Mileage</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
                {vehicle.mileage.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
