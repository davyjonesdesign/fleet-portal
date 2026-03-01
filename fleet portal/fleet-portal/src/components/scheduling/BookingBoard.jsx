import React from 'react'
import { CalendarClock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import BookingStatusBadge from './BookingStatusBadge'

function formatDateTime(value) {
  return format(new Date(value), 'MMM d, yyyy h:mm a')
}

export default function BookingBoard({ bookings }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', color: 'var(--color-text)' }}>
          <CalendarClock size={20} style={{ color: 'var(--color-accent)' }} />
          Booking Schedule
        </h3>
        <span style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>{bookings.length} bookings</span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            style={{
              border: booking.has_conflict ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '14px',
              background: booking.has_conflict ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>{booking.client}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
                  {booking.vehicle_type} (#{booking.vehicle_id})
                </div>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div style={{ display: 'grid', gap: '4px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
              <span>
                Pickup: <span style={{ color: 'var(--color-text)' }}>{formatDateTime(booking.pickup_at)}</span>
              </span>
              <span>
                Dropoff: <span style={{ color: 'var(--color-text)' }}>{formatDateTime(booking.dropoff_at)}</span>
              </span>
            </div>
            {booking.special_notes && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
                Notes: {booking.special_notes}
              </div>
            )}
            {booking.has_conflict && (
              <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-warning)' }}>
                <AlertTriangle size={14} />
                Conflicts with another booking for this vehicle and time window.
              </div>
            )}
          </div>
        ))}

        {bookings.length === 0 && (
          <div style={{ color: 'var(--color-text-dim)', fontSize: '14px', textAlign: 'center', padding: '30px 0' }}>
            No bookings scheduled.
          </div>
        )}
      </div>
    </div>
  )
}
