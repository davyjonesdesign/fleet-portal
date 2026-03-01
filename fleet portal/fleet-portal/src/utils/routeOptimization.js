const EARTH_RADIUS_KM = 6371
const DEFAULT_SPEED_KMH = 40

function toRadians(value) {
  return (value * Math.PI) / 180
}

function haversineDistance(from, to) {
  if (
    from?.lat == null ||
    from?.lng == null ||
    to?.lat == null ||
    to?.lng == null
  ) {
    return null
  }

  const latDelta = toRadians(to.lat - from.lat)
  const lngDelta = toRadians(to.lng - from.lng)
  const fromLat = toRadians(from.lat)
  const toLat = toRadians(to.lat)

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

function mockDistance(from, to) {
  if (from?.id != null && to?.id != null) {
    const seed = Math.abs(Number(from.id) - Number(to.id)) + 1
    return 3 + seed * 2
  }

  const fromName = from?.name || from?.location || ''
  const toName = to?.name || to?.location || ''
  const pseudo = Math.abs((fromName.length * 7) - (toName.length * 3))
  return 4 + (pseudo % 12)
}

export function estimateDistanceKm(from, to) {
  const geoDistance = haversineDistance(from, to)
  if (geoDistance != null) {
    return Number(geoDistance.toFixed(2))
  }

  return mockDistance(from, to)
}

function estimateLegMinutes(distanceKm, speedKmh = DEFAULT_SPEED_KMH) {
  const hours = distanceKm / speedKmh
  return Math.round(hours * 60)
}

export function optimizeRoute({ depot, stops = [], speedKmh = DEFAULT_SPEED_KMH }) {
  if (!stops.length) {
    return {
      orderedStops: [],
      estimatedDistanceKm: 0,
      estimatedTimeMinutes: 0,
      originalDistanceKm: 0,
      originalTimeMinutes: 0,
    }
  }

  const remainingStops = [...stops]
  const orderedStops = []
  let currentPoint = depot
  let optimizedDistance = 0

  while (remainingStops.length) {
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    remainingStops.forEach((stop, index) => {
      const distance = estimateDistanceKm(currentPoint, stop)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    const [nextStop] = remainingStops.splice(nearestIndex, 1)
    orderedStops.push(nextStop)
    optimizedDistance += nearestDistance
    currentPoint = nextStop
  }

  const originalDistance = stops.reduce((sum, stop, index) => {
    const from = index === 0 ? depot : stops[index - 1]
    return sum + estimateDistanceKm(from, stop)
  }, 0)

  return {
    orderedStops,
    estimatedDistanceKm: Number(optimizedDistance.toFixed(2)),
    estimatedTimeMinutes: estimateLegMinutes(optimizedDistance, speedKmh),
    originalDistanceKm: Number(originalDistance.toFixed(2)),
    originalTimeMinutes: estimateLegMinutes(originalDistance, speedKmh),
  }
}
