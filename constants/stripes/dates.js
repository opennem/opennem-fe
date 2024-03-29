import eachYearOfInterval from 'date-fns/eachYearOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import { NEM_START_YEAR, NEM_START_MONTH } from '../nem-start-date'
import {
  INTERVAL_MONTH,
  INTERVAL_YEAR,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  FILTER_MONTH_NUM,
  FILTER_NONE
} from '../interval-filters'

export const getEachYearOfInterval = eachYearOfInterval({
  start: new Date(NEM_START_YEAR, 0, 1),
  end: new Date()
}).map((d) => d.getFullYear())

export const getEachDayOfInterval = (year) => {
  return eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31)
  }).map((d) => {
    return {
      date: d,
      time: d.getTime()
    }
  })
}

export const getEachMonthOfInterval = () => {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() - 1

  if (month < 0) {
    month = 11
    year = year - 1
  }

  return eachMonthOfInterval({
    start: new Date(NEM_START_YEAR, NEM_START_MONTH, 1),
    end: new Date(year, month, 1)
  }).map((d) => {
    return {
      date: d,
      time: d.getTime()
    }
  })
}

export const getEachOfInterval = (interval, filterPeriod) => {
  if (interval === INTERVAL_MONTH) {
    return filterPeriod === FILTER_NONE
      ? getEachMonthOfInterval()
      : getEachMonthOfInterval().filter(d => d.date.getMonth() === FILTER_MONTH_NUM[filterPeriod])
  }

  if (interval === INTERVAL_SEASON) {
    console.log('Season interval', filterPeriod)

    const months = getEachMonthOfInterval().filter(d => {
      const m = d.date.getMonth()
      return m === 11 || m === 2 || m === 5 || m === 8
    })

    return filterPeriod === FILTER_NONE
      ? months
      : months.filter(d => d.date.getMonth() === FILTER_MONTH_NUM[filterPeriod])
  }

  if (interval === INTERVAL_QUARTER) {
    console.log('Quarter interval', filterPeriod)

    const months = getEachMonthOfInterval().filter(d => {
      const m = d.date.getMonth()
      return m === 0 || m === 3 || m === 6 || m === 9
    })

    return filterPeriod === FILTER_NONE
      ? months
      : months.filter(d => d.date.getMonth() === FILTER_MONTH_NUM[filterPeriod])
  }

  if (interval === INTERVAL_HALFYEAR) {
    console.log('Half year interval', filterPeriod)

    const months = getEachMonthOfInterval().filter(d => {
      const m = d.date.getMonth()
      return m === 0 || m === 6
    })

    return filterPeriod === FILTER_NONE
      ? months
      : months.filter(d => d.date.getMonth() === FILTER_MONTH_NUM[filterPeriod])
  }

  if (interval === INTERVAL_FINYEAR) {
    console.log('Fin year interval')

    const months = getEachMonthOfInterval().filter(d => {
      const m = d.date.getMonth()
      return m === 6
    })

    return months
  }

  if (interval === INTERVAL_YEAR) {
    console.log('Year interval')

    return eachYearOfInterval({
      start: new Date(NEM_START_YEAR, 0, 1),
      end: new Date()
    }).map((d) => {
      return {
        date: d,
        time: d.getTime()
      }
    })
  }
}
