import { timeDay, timeMonday, timeMonth, timeYear } from 'd3-time'

export default function(range, interval, isZoomed) {
  if (range === '3D') {
    return timeDay.every(0.5)
  }
  if (range === '7D') {
    return timeDay.every(1)
  }
  if (range === '30D') {
    if (isZoomed) {
      return timeDay.every(1)
    }
    return timeDay.every(0.5)
  }
  if (range === '1Y') {
    if (interval === 'Month') {
      return timeMonth.every(1)
    }
    if (interval === 'Fin Year') {
      return timeMonth.filter(d => d.getMonth() === 6)
    }
    if (isZoomed) {
      return timeMonday.every(4)
    }
    return timeMonth.every(1)
  }
  if (range === 'ALL') {
    return timeYear.every(1)
  }
  return null
}
