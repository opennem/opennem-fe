import parseISO from 'date-fns/parseISO'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import {
  timeMinute as d3TimeMinute,
  timeDay as d3TimeDay,
  timeMonday as d3TimeMonday,
  timeMonth as d3TimeMonth,
  timeYear as d3TimeYear
} from 'd3-time'

function getFormatStringDay(showYear) {
  return showYear ? '%-d %b %Y' : '%-d %b'
}

function getSeasonLabel(month) {
  switch (month) {
    case '3':
      return 'Autumn'
    case '6':
      return 'Winter'
    case '9':
      return 'Spring'
    case '12':
      return 'Summer'
  }
}

function getSeasonOffset(season) {
  switch (season) {
    case 'Autumn':
      return 2
    case 'Winter':
      return 5
    case 'Spring':
      return 8
    case 'Summer':
      return -1
  }
}

function getQuarterLabel(month) {
  switch (month) {
    case '1':
      return 'Q1'
    case '4':
      return 'Q2'
    case '7':
      return 'Q3'
    case '10':
      return 'Q4'
  }
}

function getQuarterOffset(quarter) {
  switch (quarter) {
    case 'Q1':
      return 0
    case 'Q2':
      return 3
    case 'Q3':
      return 6
    case 'Q4':
      return 9
  }
}

function getSeasonClosestDate(date, isFloor, filterPeriod) {
  const isFilter = !filterPeriod || filterPeriod !== 'All'
  if (isFilter) {
    const yearDate = isFloor
      ? d3TimeYear.every(1).floor(date)
      : d3TimeYear.every(1).ceil(date)
    return d3TimeMonth.offset(yearDate, getSeasonOffset(filterPeriod))
  } else {
    const quarter = isFloor
      ? d3TimeMonth.every(3).floor(date)
      : d3TimeMonth.every(3).ceil(date)
    return d3TimeMonth.offset(quarter, -1)
  }
}

function getQuarterClosestDate(date, isFloor, filterPeriod) {
  const isFilter = !filterPeriod || filterPeriod !== 'All'
  if (isFilter) {
    const yearDate = isFloor
      ? d3TimeYear.every(1).floor(date)
      : d3TimeYear.every(1).ceil(date)
    return d3TimeMonth.offset(yearDate, getQuarterOffset(filterPeriod))
  } else {
    return isFloor
      ? d3TimeMonth.every(3).floor(date)
      : d3TimeMonth.every(3).ceil(date)
  }
}

function get6MonthClosestDate(date, isFloor, filterPeriod) {
  const isFilter = !filterPeriod || filterPeriod !== 'All'
  return isFloor
    ? d3TimeMonth.every(6).floor(date)
    : d3TimeMonth.every(6).ceil(date)
}

export default {
  specialDateFormats(
    time,
    range,
    interval,
    isStart,
    isEnd,
    showYear,
    showIntervalRange
  ) {
    const now = Date.now()
    const today = d3TimeFormat('%d/%m/%Y')(now)
    const fDate = d3TimeFormat('%d/%m/%Y')(time)
    const thisYear = d3TimeFormat('%Y')(now)
    const fYear = d3TimeFormat('%Y')(time)
    const sYear = showYear || thisYear !== fYear

    let display = ''
    let formatString = ''

    if (!time) {
      return '—'
    }

    switch (range) {
      case '30D':
        formatString = getFormatStringDay(sYear)
        display = d3TimeFormat(formatString)(time)
        break
      case '1Y':
        if (interval === 'Day') {
          formatString = getFormatStringDay(sYear)
          display = d3TimeFormat(formatString)(time)
        } else if (interval === 'Week') {
          formatString = getFormatStringDay(true)
          const newTime = d3TimeMonday
            .every(1)
            .floor(time)
            .getTime()
          if (showIntervalRange) {
            const sixDayslater = newTime + 518400000
            const sDate = d3TimeFormat('%-d')(newTime)
            const eDate = d3TimeFormat(formatString)(sixDayslater)
            display = `${sDate} – ${eDate}`
          } else {
            if (isStart) {
              display = d3TimeFormat(formatString)(newTime)
            } else {
              const sixDayslater = time + 518400000
              display = d3TimeFormat(formatString)(sixDayslater)
            }
          }
        } else {
          display = d3TimeFormat('%b %Y')(time)
        }
        break
      case 'ALL':
        if (interval === 'Month') {
          display = d3TimeFormat('%b %Y')(time)
        } else if (interval === 'Season') {
          let seasonLabel = getSeasonLabel(d3TimeFormat('%-m')(time))
          let year = new Date(time).getFullYear()
          let nextYearStr = ''
          if (seasonLabel === 'Summer') {
            const nextyear = year + 1 + ''
            nextYearStr = `/${nextyear.substr(2, 2)}`
          }
          display = `${seasonLabel} ${year}${nextYearStr}` // eslint-disable-line
        } else if (interval === 'Quarter') {
          display = `${getQuarterLabel(
            d3TimeFormat('%-m')(time)
          )} ${d3TimeFormat('%Y')(time)}` // eslint-disable-line
        } else if (interval === 'Fin Year') {
          let finYearMonth = d3TimeFormat('%-m')(time)
          let finYear = d3TimeFormat('%y')(time)
          if (finYearMonth > 6) {
            finYear = d3TimeFormat('%y')(time + 31557600000)
          }
          display = `FY${finYear}`
        } else if (interval === 'Half Year') {
          const sixMonthsLater = time + 15552000000
          if (showIntervalRange) {
            display = `${d3TimeFormat('%b')(time)} – ${d3TimeFormat('%b %Y')(
              sixMonthsLater
            )}` // eslint-disable-line
          } else {
            if (isStart) {
              display = `${d3TimeFormat('%b %Y')(time)}` // eslint-disable-line
            } else {
              display = `${d3TimeFormat('%b %Y')(sixMonthsLater)}` // eslint-disable-line
            }
          }
        } else if (interval === 'Year') {
          display = d3TimeFormat('%Y')(time)
        } else {
          display = d3TimeFormat('%b %Y')(time)
        }
        break
      default:
        if (today === fDate) {
          formatString = 'Today at %-I:%M %p'
        } else if (thisYear === fYear) {
          formatString = '%d %b, %-I:%M %p'
        } else {
          formatString = '%d %b %Y, %-I:%M %p'
        }
        display = d3TimeFormat(formatString)(time)
    }

    return display
  },

  snapToClosestInterval(interval, date, isLinear) {
    switch (interval) {
      case '5m':
        return d3TimeMinute.every(5).round(date)
      case '30m':
        return d3TimeMinute.every(30).round(date)
      case 'Day':
        return d3TimeDay.every(1).floor(date)
      case 'Week':
        // if (isLinear) {
        //   // is a smooth  line (not area), put point in middle of the week (thu)
        //   const day = date ? date.getDay() : null
        //   if (day > 0 && day < 4) {
        //     return timeThursday.every(1).ceil(date)
        //   }
        //   return timeThursday.every(1).floor(date)
        // }
        return d3TimeMonday.every(1).floor(date)
      case 'Month':
        return d3TimeMonth.every(1).floor(date)
      case 'Season':
        const quarter = d3TimeMonth.every(3).floor(date)
        return d3TimeMonth.offset(quarter, -1)
      case 'Quarter':
        return d3TimeMonth.every(3).floor(date)
      case 'Half Year':
        return d3TimeMonth.every(6).floor(date)
      case 'Fin Year':
        const year = d3TimeYear.every(1).floor(date)
        return d3TimeMonth.offset(year, -6)
      case 'Year':
        return d3TimeYear.every(1).floor(date)
      default:
        return date
    }
  },

  roundToClosestInterval(interval, filterPeriod, date, roundType) {
    const isFloor = roundType === 'floor'
    switch (interval) {
      case '5m':
        return d3TimeMinute.every(5).round(date)
      case '30m':
        return d3TimeMinute.every(30).round(date)
      case 'Day':
        return isFloor
          ? d3TimeDay.every(1).floor(date)
          : d3TimeDay.every(1).ceil(date)
      case 'Week':
        return isFloor
          ? d3TimeMonday.every(1).floor(date)
          : d3TimeMonday.every(1).ceil(date)
      case 'Month':
        return isFloor
          ? d3TimeMonth.every(1).floor(date)
          : d3TimeMonth.every(1).ceil(date)
      case 'Season':
        return getSeasonClosestDate(date, isFloor, filterPeriod)
      case 'Quarter':
        return getQuarterClosestDate(date, isFloor, filterPeriod)
      case 'Half Year':
        return get6MonthClosestDate(date, isFloor, filterPeriod)
      case 'Fin Year':
        const year = isFloor
          ? d3TimeYear.every(1).floor(date)
          : d3TimeYear.every(1).ceil(date)
        return d3TimeMonth.offset(year, -6)
      case 'Year':
        return isFloor
          ? d3TimeYear.every(1).floor(date)
          : d3TimeYear.every(1).ceil(date)
      default:
        return date
    }
  },

  weekendGuides(datasetStart, datasetEnd) {
    const guides = []
    let dStart = datasetStart
    const dEnd = datasetEnd
    const checkWeekend = d3TimeFormat('%a')

    while (dStart <= dEnd) {
      if (checkWeekend(dStart) === 'Sat') {
        guides.push({
          start: dStart,
          end: dStart + 86400000 + 86400000
        })
      }
      dStart = dStart + 86400000
    }
    return guides
  },

  nightGuides(datasetStart, datasetEnd) {
    const guides = []
    let dStart = datasetStart
    const dEnd = datasetEnd

    while (dStart <= dEnd) {
      const startTime = new Date(dStart)
      startTime.setHours(22)
      startTime.setMinutes(0)
      const endTime = new Date(startTime.getTime() + 32400000)
      guides.push({
        start: startTime,
        end: endTime
      })
      dStart = dStart + 86400000
    }
    return guides
  },

  mutateSeasonDate(date, month, filterPeriod) {
    if (filterPeriod === 'Summer' && month !== 11) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === 'Autumn' && month >= 0 && month <= 1) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === 'Winter' && month >= 0 && month <= 5) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === 'Spring' && month >= 0 && month <= 8) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date
  },

  mutateQuarterDate(date, month, filterPeriod) {
    if (filterPeriod === 'Q2' && month >= 0 && month <= 2) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === 'Q3' && month >= 0 && month <= 6) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === 'Q4' && month >= 0 && month <= 9) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date
  },

  getPeriodMonth(interval, period) {
    if (interval === 'Quarter') {
      switch (period) {
        case 'Q1':
          return 0
        case 'Q2':
          return 3
        case 'Q3':
          return 6
        case 'Q4':
          return 9
      }
    }

    if (interval === 'Season') {
      switch (period) {
        case 'Summer':
          return 11
        case 'Autumn':
          return 2
        case 'Winter':
          return 5
        case 'Spring':
          return 8
      }
    }
  },

  getDateTimeWithoutTZ(date) {
    const dateString = date.substring(0, 16)
    return parseISO(dateString)
  }
}
