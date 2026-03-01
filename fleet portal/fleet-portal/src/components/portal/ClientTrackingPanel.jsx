import React from 'react'
import { MapPin, Clock3, AlertCircle } from 'lucide-react'

function EmptyState({ title, description }) {
  return (
    <div
      style={{
        border: '1px dashed var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--color-text-dim)',
      }}
    >
      <CircleAlert size={20} style={{ marginBottom: '10px', opacity: 0.8 }} />
      <p style={{ marginBottom: '6px', color: 'var(--color-text)', fontWeight: 600 }}>{title}</p>
      <p style={{ fontSize: '13px' }}>{description}</p>
    </div>
  )
}

export default function ClientTrackingPanel({ milestones }) {
  if (!Array.isArray(milestones)) {
    return (
      <EmptyState
        title="Tracking data unavailable"
        description="We couldn't load delivery milestones right now. Try again later or switch to demo mode."
      />
    )
  }

  if (milestones.length === 0) {
    return (
      <EmptyState
        title="No deliveries to track"
        description="Milestones are connected, but there are no active vehicle jobs yet."
      />
    )
  }

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {milestones.map((milestone) => (
        <div
          key={milestone.id}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '16px',
            background: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
            <div>
              <p style={{ marginBottom: '3px', fontWeight: 700, color: 'var(--color-text)' }}>{milestone.job_name}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
                {milestone.vehicle_name} · {milestone.driver_name || 'No driver assigned'}
              </p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 700 }}>{milestone.status}</span>
          </div>

          <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} />
              Current stop: {milestone.current_milestone}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock3 size={14} />
              ETA: {new Date(milestone.eta).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
