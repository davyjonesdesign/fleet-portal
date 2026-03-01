import React from 'react'

// Simple status-to-classmap; all color definitions live in CSS tokens.
const statusMap = {
  active: 'badge--active',
  idle: 'badge--idle',
  maintenance: 'badge--maintenance',
}

export default function StatusBadge({ status }) {
  const variant = statusMap[status] || statusMap.idle
  const label = status ? status.toUpperCase() : 'IDLE'

  return (
    <span role="status" className={`badge ${variant}`}>
      <span className="badge__dot" aria-hidden />
      {label}
    </span>
  )
}
