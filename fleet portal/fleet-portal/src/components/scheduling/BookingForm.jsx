import React, { useState } from 'react'

const defaultFormData = {
  client: '',
  pickup_at: '',
  dropoff_at: '',
  vehicle_id: '',
  vehicle_type: '',
  special_notes: '',
  status: 'requested',
}

export default function BookingForm({ vehicles, onCreateBooking, hasConflict }) {
  const [formData, setFormData] = useState(defaultFormData)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    if (name === 'vehicle_id') {
      const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === value)
      setFormData((previous) => ({
        ...previous,
        vehicle_id: value,
        vehicle_type: selectedVehicle?.vehicle_name || '',
      }))
      return
    }

    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!formData.client || !formData.pickup_at || !formData.dropoff_at || !formData.vehicle_id) {
      setError('Please complete all required fields.')
      return
    }

    if (new Date(formData.pickup_at) >= new Date(formData.dropoff_at)) {
      setError('Dropoff must be after pickup.')
      return
    }

    if (hasConflict(formData)) {
      setError('This booking overlaps an existing booking for the selected vehicle.')
      return
    }

    onCreateBooking({
      ...formData,
      vehicle_id: Number(formData.vehicle_id),
      pickup_at: new Date(formData.pickup_at).toISOString(),
      dropoff_at: new Date(formData.dropoff_at).toISOString(),
    })

    setFormData(defaultFormData)
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text)',
    padding: '10px 12px',
    fontSize: '14px',
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px',
        display: 'grid',
        gap: '14px',
      }}
    >
      <h3 style={{ fontSize: '18px', color: 'var(--color-text)' }}>Create Booking</h3>

      <label style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Client *
        <input name="client" value={formData.client} onChange={handleChange} style={inputStyle} />
      </label>

      <label style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Pickup Date/Time *
        <input type="datetime-local" name="pickup_at" value={formData.pickup_at} onChange={handleChange} style={inputStyle} />
      </label>

      <label style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Dropoff Date/Time *
        <input type="datetime-local" name="dropoff_at" value={formData.dropoff_at} onChange={handleChange} style={inputStyle} />
      </label>

      <label style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Vehicle Type *
        <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} style={inputStyle}>
          <option value="">Select vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.vehicle_name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>
        Special Notes
        <textarea
          name="special_notes"
          value={formData.special_notes}
          onChange={handleChange}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </label>

      {error && <div style={{ color: 'var(--color-warning)', fontSize: '12px' }}>{error}</div>}

      <button
        type="submit"
        style={{
          border: '1px solid var(--color-accent)',
          background: 'var(--color-accent-glow)',
          color: 'var(--color-accent)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Add Booking
      </button>
    </form>
  )
}
