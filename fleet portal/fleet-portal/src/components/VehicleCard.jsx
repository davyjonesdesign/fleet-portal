import React from 'react'
import { MapPin, Fuel, Gauge, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import StatusBadge from './StatusBadge'
import { calculateMaintenanceRisk } from '../utils/maintenancePrediction'

export default function VehicleCard({ vehicle, risk, pendingAcknowledgements = 0 }) {
  const lastUpdateTime = formatDistanceToNow(new Date(vehicle.last_update), { addSuffix: true })
  const maintenanceRisk = risk || calculateMaintenanceRisk(vehicle)
  const riskClass = `badge badge--risk-${maintenanceRisk.status || 'clear'}`

  return (
    <article
      className="card vehicle-card"
      tabIndex={0}
      aria-label={`Vehicle ${vehicle.vehicle_name}`}
    >
      {vehicle.maintenance_due && (
        <div className="vehicle-card__overlay vehicle-card__overlay--warning" role="alert">
          MAINTENANCE DUE
        </div>
      )}

      {pendingAcknowledgements > 0 && (
        <div className="vehicle-card__overlay vehicle-card__overlay--acknowledgement" role="status">
          AWAITING ACKNOWLEDGEMENT ({pendingAcknowledgements})
        </div>
      )}

      <header className="flex flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h3 className="vehicle-card__title">{vehicle.vehicle_name}</h3>
          <p className="vehicle-card__subtitle">{vehicle.license_plate}</p>
        </div>
        <StatusBadge status={vehicle.status} />
      </header>

      <div className={riskClass} style={{ marginBottom: 'var(--space-md)' }}>
        <span>{maintenanceRisk.status === 'critical' ? 'Predicted Service Risk: Critical' :
               maintenanceRisk.status === 'warning' ? 'Predicted Service Risk: Warning' :
               'Predicted Service Risk: Clear'}</span>
        <span style={{ opacity: 0.85 }}>({maintenanceRisk.score})</span>
      </div>

      <div className="grid gap-md">
        {vehicle.driver_name && (
          <div className="flex" style={{ alignItems: 'center' }}>
            <User size={16} className="text-accent" />
            <span className="text--primary">{vehicle.driver_name}</span>
          </div>
        )}

        <div className="flex" style={{ alignItems: 'center' }}>
          <MapPin size={16} className="text-accent" />
          <span className="text--primary">{vehicle.location}</span>
        </div>

        <div className="flex" style={{ alignItems: 'center' }}>
          <Clock size={16} className="text-accent" />
          <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
            Updated {lastUpdateTime}
          </span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-sm)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-border)' }}>
          <div className="flex" style={{ alignItems: 'center' }}>
            <Fuel size={16} className={vehicle.fuel_level < 30 ? 'text-warning' : 'text-accent'} />
            <div>
              <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Fuel</div>
              <div className="text--primary" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                {vehicle.fuel_level}%
              </div>
            </div>
          </div>

          <div className="flex" style={{ alignItems: 'center' }}>
            <Gauge size={16} className="text-accent" />
            <div>
              <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Mileage</div>
              <div className="text--primary" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                {vehicle.mileage.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
