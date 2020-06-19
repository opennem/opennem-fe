import { timeDay, timeMonday, timeMonth, timeYear } from 'd3-time'

export default function(range, interval, isZoomed) {
  if (range === '3D') {
    return timeDay.every(0.5)
  }
  if (range === '7D') {
    if (isZoomed) return null
    return timeDay.every(1)
  }
  if (range === '30D') {
    if (isZoomed) {
      return timeDay.every(1)
    }
    return timeDay.every(0.5)
  }
  if (range === '1Y') {
    if (interval === 'Day') {
      if (isZoomed) {
        return null
      }
      return timeMonth.every(1)
    }
    if (interval === 'Week') {
      if (isZoomed) {
        return null
      }
      return timeMonday.every(4)
    }
    if (interval === 'Month') {
      return timeMonth.every(1)
    }
  }
  if (range === 'ALL') {
    if (interval === 'Fin Year') {
      return timeMonth.filter(d => d.getMonth() === 6)
    }
    if (isZoomed) {
      return null
    }
    return timeYear.every(1)
  }
  return null
}
