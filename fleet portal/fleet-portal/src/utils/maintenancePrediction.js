/**
 * Heuristic constants for predicted service risk.
 * Tune these values with real fleet maintenance outcomes as feedback becomes available.
 */
export const MAINTENANCE_RISK_CONSTANTS = {
  DEFAULT_AVG_DAILY_MILES: 55,
  HIGH_UTILIZATION_MILES_PER_DAY: 100,
  VERY_HIGH_UTILIZATION_MILES_PER_DAY: 140,
  SERVICE_INTERVAL_MILES: 10000,
  LOW_FUEL_PERCENT: 25,
  VERY_LOW_FUEL_PERCENT: 15,
  WARNING_SCORE_THRESHOLD: 40,
  CRITICAL_SCORE_THRESHOLD: 70,
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getDaysDifference(targetDate) {
  if (!targetDate) return null
  const parsedDate = new Date(targetDate)
  if (Number.isNaN(parsedDate.getTime())) return null
  return (parsedDate.getTime() - Date.now()) / DAY_IN_MS
}

function getDaysSince(dateValue) {
  const daysDifference = getDaysDifference(dateValue)
  if (daysDifference === null) return null
  return Math.max(0, -daysDifference)
}

function estimateMileageSinceLastService(vehicle) {
  const daysSinceService = getDaysSince(vehicle.last_service_date)
  if (daysSinceService === null) {
    return vehicle.mileage || 0
  }

  const avgDailyMiles = vehicle.avg_daily_miles || MAINTENANCE_RISK_CONSTANTS.DEFAULT_AVG_DAILY_MILES
  const estimatedMileage = daysSinceService * avgDailyMiles

  return clamp(estimatedMileage, 0, vehicle.mileage || estimatedMileage)
}

export function calculateMaintenanceRisk(vehicle) {
  let score = 0

  const mileageSinceService = estimateMileageSinceLastService(vehicle)
  const mileageRatio = mileageSinceService / MAINTENANCE_RISK_CONSTANTS.SERVICE_INTERVAL_MILES
  score += clamp(mileageRatio * 40, 0, 40)

  const daysUntilMaintenance = getDaysDifference(vehicle.next_maintenance)
  if (daysUntilMaintenance !== null) {
    if (daysUntilMaintenance <= 0) {
      score += 35
    } else if (daysUntilMaintenance <= 7) {
      score += 25 + (7 - daysUntilMaintenance) * 1.25
    } else if (daysUntilMaintenance <= 14) {
      score += 15 + (14 - daysUntilMaintenance) * 1.43
    } else if (daysUntilMaintenance <= 30) {
      score += 5 + (30 - daysUntilMaintenance) * 0.63
    }
  }

  if (vehicle.fuel_level <= MAINTENANCE_RISK_CONSTANTS.VERY_LOW_FUEL_PERCENT) {
    score += 18
  } else if (vehicle.fuel_level <= MAINTENANCE_RISK_CONSTANTS.LOW_FUEL_PERCENT) {
    score += 12
  }

  if (vehicle.avg_daily_miles >= MAINTENANCE_RISK_CONSTANTS.VERY_HIGH_UTILIZATION_MILES_PER_DAY) {
    score += 14
  } else if (vehicle.avg_daily_miles >= MAINTENANCE_RISK_CONSTANTS.HIGH_UTILIZATION_MILES_PER_DAY) {
    score += 8
  }

  if (vehicle.maintenance_due) {
    score += 20
  }

  const normalizedScore = Math.round(clamp(score, 0, 100))

  let status = 'clear'
  if (normalizedScore >= MAINTENANCE_RISK_CONSTANTS.CRITICAL_SCORE_THRESHOLD) {
    status = 'critical'
  } else if (normalizedScore >= MAINTENANCE_RISK_CONSTANTS.WARNING_SCORE_THRESHOLD) {
    status = 'warning'
  }

  return {
    score: normalizedScore,
    status,
    mileageSinceService: Math.round(mileageSinceService),
  }
}
