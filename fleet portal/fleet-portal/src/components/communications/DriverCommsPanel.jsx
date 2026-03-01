import React, { useMemo, useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const severityStyles = {
  critical: {
    label: 'Critical',
    color: '#ef4444',
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  info: {
    label: 'Info',
    color: '#22c55e',
    background: 'rgba(34, 197, 94, 0.15)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
}

export default function DriverCommsPanel({ activeDrivers, messages, onSendMessage }) {
  const [recipient, setRecipient] = useState('all')
  const [priority, setPriority] = useState('info')
  const [text, setText] = useState('')

  const groupedMessages = useMemo(() => {
    const groups = messages.reduce((acc, message) => {
      const key = `${message.vehicle_id}-${message.driver_name}`
      if (!acc[key]) {
        acc[key] = {
          vehicleId: message.vehicle_id,
          driverName: message.driver_name,
          messages: [],
        }
      }
      acc[key].messages.push(message)
      return acc
    }, {})

    return Object.values(groups)
      .map(group => ({
        ...group,
        messages: group.messages.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at)),
      }))
      .sort((a, b) => a.driverName.localeCompare(b.driverName))
  }, [messages])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return

    const selectedRecipients =
      recipient === 'all'
        ? activeDrivers
        : activeDrivers.filter(driver => `${driver.vehicle_id}` === recipient)

    if (selectedRecipients.length === 0) return

    selectedRecipients.forEach(driver => {
      onSendMessage({
        driver_name: driver.driver_name,
        vehicle_id: driver.vehicle_id,
        priority,
        text: text.trim(),
      })
    })

    setText('')
  }

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <MessageSquare size={20} style={{ color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '20px', color: 'var(--color-text)' }}>Driver Communications</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              padding: '10px',
            }}
          >
            <option value="all">All active drivers</option>
            {activeDrivers.map(driver => (
              <option key={driver.vehicle_id} value={driver.vehicle_id}>
                {driver.driver_name} ({driver.vehicle_name})
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              padding: '10px',
            }}
          >
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message for driver dispatch..."
            style={{
              flex: 1,
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              padding: '10px 12px',
            }}
          />
          <button
            type="submit"
            style={{
              border: '1px solid var(--color-accent)',
              borderRadius: '8px',
              background: 'var(--color-accent-glow)',
              color: 'var(--color-accent)',
              padding: '10px 14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Send size={14} /> Send
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gap: '12px' }}>
        {groupedMessages.map(group => (
          <div
            key={`${group.vehicleId}-${group.driverName}`}
            style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px' }}
          >
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: 'var(--color-text)' }}>{group.driverName}</strong>
              <span style={{ color: 'var(--color-text-dim)', marginLeft: '8px', fontSize: '12px' }}>
                Vehicle #{group.vehicleId}
              </span>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {group.messages.map(message => {
                const severity = severityStyles[message.priority] || severityStyles.info
                return (
                  <div
                    key={message.id}
                    style={{
                      border: `1px solid ${severity.borderColor}`,
                      background: severity.background,
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: severity.color, textTransform: 'uppercase' }}>
                        {severity.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                        {formatDistanceToNow(new Date(message.sent_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text)' }}>{message.text}</p>
                    {!message.acknowledged_at && (
                      <span style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px', display: 'inline-block' }}>
                        Awaiting acknowledgement
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {groupedMessages.length === 0 && (
          <div style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>
            No driver communications yet.
          </div>
        )}
      </div>
    </section>
  )
}
