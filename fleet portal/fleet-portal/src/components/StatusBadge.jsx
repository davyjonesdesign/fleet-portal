import React from 'react'

const statusConfig = {
  active: {
    label: 'ACTIVE',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  idle: {
    label: 'IDLE',
    color: '#fbbf24',
    bgColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  maintenance: {
    label: 'MAINTENANCE',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
}

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.idle

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          animation: status === 'active' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      />
      {config.label}
    </span>
  )
}
