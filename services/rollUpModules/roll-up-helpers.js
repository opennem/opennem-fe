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

export function setStartOfYear(date) {
  const d = moment(date)
  d.set('month', 0)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)
  return d
}

export function setStartOfFinancialYear(date, quarter) {
  // 1, 2 quarter should be -1 year in july
  // 3, 4 quarter should this year in july
  const d = moment(date)
  d.set('month', 6)
  d.set('date', 1)
  d.set('hour', 0)
  d.set('minute', 0)
  d.set('second', 0)

  return quarter === 1 || quarter === 2 ? moment(d).subtract(1, 'year') : d
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
