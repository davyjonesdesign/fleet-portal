import React from 'react'
import { AlertCircle } from 'lucide-react'

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

export default function InvoicingPanel({ invoices }) {
  if (!Array.isArray(invoices)) {
    return (
      <EmptyState
        title="Invoice data unavailable"
        description="We couldn't retrieve invoices from the selected data source."
      />
    )
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoice records"
        description="Invoice feed is connected, but there are no invoices for this period."
      />
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
        <thead>
          <tr>
            <th style={cellHeader}>Invoice #</th>
            <th style={cellHeader}>Client</th>
            <th style={cellHeader}>Amount</th>
            <th style={cellHeader}>Status</th>
            <th style={cellHeader}>Due date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.invoice_id}>
              <td style={cellValue}>{invoice.invoice_id}</td>
              <td style={cellValue}>{invoice.client_name}</td>
              <td style={cellValue}>${Number(invoice.amount).toLocaleString()}</td>
              <td style={cellValue}>{invoice.status}</td>
              <td style={cellValue}>{new Date(invoice.due_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const cellHeader = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text-dim)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const cellValue = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  fontSize: '14px',
}
