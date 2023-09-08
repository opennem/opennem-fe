import { utcFormat } from 'd3-time-format'
import addMinutes from 'date-fns/addMinutes'
import subDays from 'date-fns/subDays'

export function getDay(d) {
  return utcFormat(`%e %b`)(d)
}

function getDayKeys(range) {
  const keys = []
  let utcCurrent = new Date()
  utcCurrent.setUTCDate(utcCurrent.getDate());
  utcCurrent.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < range; i++) {
    keys.push(getDay(utcCurrent))
    utcCurrent = subDays(utcCurrent, 1)
  }

  return keys
}

export function getTimeLabel(d) {
  const date = new Date(d)
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const hour = function() {
    return hours === 0 || hours === 12 ? 12 : hours % 12
  }()
  const min = minutes === 0 ? '' : `:${(minutes + '').padStart(2, '0')}`
  return `${hour}${min}${ampm}`
}

function getTimebucket(interval) {
  let utcCurrent = new Date()
  utcCurrent.setUTCDate(utcCurrent.getDate());
  utcCurrent.setUTCHours(0, 0, 0, 0)
  const b = []

  let x = getTimeLabel(utcCurrent)

  for (let i = 0; i < 1440 / interval; i++) {
    b.push({ x, date: utcCurrent, time: utcCurrent.getTime() })
    utcCurrent = addMinutes(utcCurrent, interval)
    x = getTimeLabel(utcCurrent)
  }

  return b
}

export function getDataBucket({ data, domain, category, positiveLoads, range, interval }) {
  const dataset = data.map((d) => {
    return {
      date: d.date,
      time: d.time,
      value: positiveLoads && category === 'load' ? -d[domain] : d[domain], // invert load values so it shows up as positive values
    }
  })

  // TODO: maybe create dayKeys using dataset start/last time instead
  const dayKeys = getDayKeys(range)
  const timeBucket = getTimebucket(interval)

  dataset.forEach(d => {
    const date = d.date
    const day = getDay(date)
    const x = getTimeLabel(date)
    const find = timeBucket.find(b => b.x === x)
    find[day] = d.value
  })

  timeBucket.forEach(b => {
    let total = 0
    let keyCount = 0
    dayKeys.forEach(key => {
      if (b[key] !== undefined && b[key] !== null) keyCount++
      total += b[key] || 0
    })

    b._average = total / keyCount
  })

  return timeBucket
}