import moment from 'moment'

export function setStartOfDay(day) {
  const d = moment(day)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export function setStartOfMonth(date, currentMonth) {
  const d = moment(date)
  d.set('month', currentMonth)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export function setEndOfMonth(date) {
  const d = moment(date)
  d.set('month', date.month() + 1)
  d.set('date', date.day())
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export function setStartOfYear(date) {
  const d = moment(date)
  d.set('month', 0)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export function getAUSeasonStartMonth(month) {
  switch (month) {
    case 11:
    case 0:
    case 1:
      return 11

    case 2:
    case 3:
    case 4:
      return 2

    case 5:
    case 6:
    case 7:
      return 5

    case 8:
    case 9:
    case 10:
      return 8

    default:
  }
  return null
}

export function getQuarterStartMonth(month) {
  switch (month) {
    case 0:
    case 1:
    case 2:
      return 0

    case 3:
    case 4:
    case 5:
      return 3

    case 6:
    case 7:
    case 8:
      return 6

    case 9:
    case 10:
    case 11:
      return 9

    default:
  }
  return null
}

export function getHalfYearStartMonth(month) {
  switch (month) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return 0

    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
      return 6

    default:
  }
  return null
}

export function getFQ(quarter) {
  switch (quarter) {
    case 1:
      return 0
    case 2:
      return 3
    case 3:
      return 6
    case 4:
      return 9
    default:
  }
  return null
}
