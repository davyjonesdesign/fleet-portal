import React from 'react'
import { FileText, AlertCircle } from 'lucide-react'

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

export default function ReportingHub({ reports }) {
  if (!Array.isArray(reports)) {
    return (
      <EmptyState
        title="Report metadata unavailable"
        description="The reporting service is not reachable, so report history can't be displayed."
      />
    )
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="No generated reports"
        description="Report history is connected, but no reports have been generated yet."
      />
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
      {reports.map((report, index) => (
        <div
          key={`${report.report_type}-${report.generated_at}-${index}`}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '16px',
            background: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FileText size={16} style={{ color: 'var(--color-accent)' }} />
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>{report.report_type}</p>
          </div>
          <p style={{ marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
            Period: {report.period}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-dim)' }}>
            Generated: {new Date(report.generated_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
