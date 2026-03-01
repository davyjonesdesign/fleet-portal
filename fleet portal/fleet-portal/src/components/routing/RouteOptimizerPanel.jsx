import React, { useMemo, useState } from 'react'
import { Map, ArrowRightLeft } from 'lucide-react'
import { optimizeRoute } from '../../utils/routeOptimization'

export default function RouteOptimizerPanel({ vehicles = [], depot, defaultStops = [] }) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '')
  const [depotLocation, setDepotLocation] = useState(depot?.name || 'Main Depot')
  const [stopsInput, setStopsInput] = useState(
    defaultStops.map((stop) => stop.name).join('\n')
  )

  const parsedStops = useMemo(() => {
    const nameToStopMap = new Map(defaultStops.map((stop) => [stop.name.toLowerCase(), stop]))

    return stopsInput
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name, index) => {
        const knownStop = nameToStopMap.get(name.toLowerCase())
        return (
          knownStop || {
            id: `manual-stop-${index + 1}`,
            name,
          }
        )
      })
  }, [defaultStops, stopsInput])

  const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(selectedVehicleId))

  const optimizationResult = useMemo(() => {
    return optimizeRoute({
      depot: { ...depot, name: depotLocation },
      stops: parsedStops,
    })
  }, [depot, depotLocation, parsedStops])

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        background: 'var(--color-surface)',
        marginBottom: '30px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <Map size={20} style={{ color: 'var(--color-accent)' }} />
        <h2 style={{ fontSize: '22px', color: 'var(--color-text)' }}>Route Optimizer</h2>
      </div>
      <p style={{ color: 'var(--color-text-dim)', fontSize: '13px', marginBottom: '20px' }}>
        Basic optimization for small fleets: this nearest-neighbor suggestion helps compare a manual stop list against a quick optimized order.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
          Vehicle
          <select
            value={selectedVehicleId}
            onChange={(event) => setSelectedVehicleId(event.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicle_name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
          Depot Start Location
          <input
            value={depotLocation}
            onChange={(event) => setDepotLocation(event.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-text-dim)' }}>
          Stops (one per line)
          <textarea
            value={stopsInput}
            onChange={(event) => setStopsInput(event.target.value)}
            rows={6}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ArrowRightLeft size={16} style={{ color: 'var(--color-accent)' }} />
          <strong style={{ color: 'var(--color-text)' }}>Compare original vs optimized</strong>
        </div>

        <p style={{ margin: '0 0 10px', color: 'var(--color-text-dim)', fontSize: '13px' }}>
          Assigned vehicle: <strong style={{ color: 'var(--color-text)' }}>{selectedVehicle?.vehicle_name || 'N/A'}</strong>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Original Route</div>
            <div style={{ color: 'var(--color-text)' }}>{optimizationResult.originalDistanceKm} km</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>{optimizationResult.originalTimeMinutes} min est.</div>
          </div>
          <div style={{ padding: '14px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-bg)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>Optimized Route</div>
            <div style={{ color: 'var(--color-success)' }}>{optimizationResult.estimatedDistanceKm} km</div>
            <div style={{ color: 'var(--color-text-dim)', fontSize: '13px' }}>{optimizationResult.estimatedTimeMinutes} min est.</div>
          </div>
        </div>

        <div style={{ color: 'var(--color-text)', fontSize: '14px', marginBottom: '8px' }}>
          Suggested stop order:
        </div>
        <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-text-dim)', fontSize: '13px', lineHeight: 1.8 }}>
          {optimizationResult.orderedStops.map((stop) => (
            <li key={stop.id}>{stop.name}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
