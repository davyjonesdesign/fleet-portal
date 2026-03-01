import React, { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { getComplianceDueState } from '../../utils/compliance'

const REQUIRED_DOCS = ['inspection', 'insurance', 'registration', 'maintenance log', 'driver hours summary']

const stateCopy = {
  critical: { label: 'Overdue', color: 'var(--color-danger)' },
  warning: { label: 'Due Soon', color: 'var(--color-warning)' },
  clear: { label: 'Valid', color: 'var(--color-success)' },
  info: { label: 'Missing Metadata', color: 'var(--color-text-dim)' },
}

const filterToDueState = {
  all: null,
  overdue: 'critical',
  'due soon': 'warning',
}

export default function CompliancePanel({ records = [], reports = [], vehicles = [] }) {
  const [filter, setFilter] = useState('all')

  const recordsByDocType = useMemo(() => {
    const map = new Map()
    records.forEach(record => {
      map.set(record.doc_type, record)
    })
    return map
  }, [records])

  const requiredRecords = useMemo(
    () => REQUIRED_DOCS.map(doc => recordsByDocType.get(doc) || { doc_type: doc, status: 'missing', due_date: null, last_submitted_at: null }),
    [recordsByDocType]
  )

  const filteredRecords = useMemo(() => {
    const targetState = filterToDueState[filter]
    if (!targetState) return requiredRecords
    return requiredRecords.filter(record => getComplianceDueState(record) === targetState)
  }, [filter, requiredRecords])

  const getVehicleName = vehicleId => {
    if (!vehicleId) return 'Unassigned'
    return vehicles.find(vehicle => vehicle.id === vehicleId)?.vehicle_name || `Vehicle #${vehicleId}`
  }

  const FilterChip = ({ value, label }) => (
    <button
      onClick={() => setFilter(value)}
      style={{
        padding: '8px 14px',
        borderRadius: '999px',
        border: filter === value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        background: filter === value ? 'var(--color-accent-glow)' : 'var(--color-surface)',
        color: filter === value ? 'var(--color-accent)' : 'var(--color-text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ marginTop: '40px', display: 'grid', gap: '20px' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: '20px', color: 'var(--color-text)', marginBottom: '8px' }}>Compliance Panel</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>Required documents: {REQUIRED_DOCS.join(', ')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <FilterChip value="all" label="All" />
            <FilterChip value="overdue" label="Overdue" />
            <FilterChip value="due soon" label="Due Soon" />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '10px' }}>
          {filteredRecords.map(record => {
            const dueState = getComplianceDueState(record)
            const badge = stateCopy[dueState]
            return (
              <div
                key={record.doc_type}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr auto',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ color: 'var(--color-text)', fontWeight: 700, textTransform: 'capitalize', marginBottom: '4px' }}>{record.doc_type}</div>
                  <div style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>{getVehicleName(record.vehicle_id)}</div>
                </div>
                <div style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>
                  <div>Status: {record.status}</div>
                  <div>Due: {record.due_date ? new Date(record.due_date).toLocaleDateString() : 'Unknown'}</div>
                </div>
                <span
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: `1px solid ${badge.color}`,
                    color: badge.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badge.label}
                </span>
              </div>
            )
          })}
          {filteredRecords.length === 0 && <p style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>No compliance records in this filter.</p>}
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--color-text)', marginBottom: '14px' }}>Generated Reports</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {reports.map(report => (
            <a
              key={report.id}
              href={report.download_url}
              download
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'var(--color-text)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{report.report_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>{new Date(report.generated_at).toLocaleString()}</div>
              </div>
              <Download size={16} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
