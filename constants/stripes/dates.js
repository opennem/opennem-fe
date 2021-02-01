import eachYearOfInterval from 'date-fns/eachYearOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'

const METRICS_START_YEAR = 2010
const METRICS_START_MONTH = 10 // 0 - Jan, 11 - Dec

export const getEachYearOfInterval = eachYearOfInterval({
  start: new Date(METRICS_START_YEAR, 0, 1),
  end: new Date()
}).map(d => d.getFullYear())

export const getEachDayOfInterval = year => {
  return eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31)
  }).map(d => {
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
    start: new Date(METRICS_START_YEAR, METRICS_START_MONTH, 1),
    end: new Date(year, month, 1)
  }).map(d => {
    return {
      date: d,
      time: d.getTime()
    }
  })
}
