import addDays from 'date-fns/addDays'
import subDays from 'date-fns/subDays'
import addMonths from 'date-fns/addMonths'
import endOfDay from 'date-fns/endOfDay'
import endOfMonth from 'date-fns/endOfMonth'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import { timeFormat, utcFormat } from 'd3-time-format'
import {
  timeDay as d3TimeDay,
  timeMonday as d3TimeMonday,
  timeMonth as d3TimeMonth,
  timeYear as d3TimeYear,
  utcMinute
} from 'd3-time'
import {
  RANGE_30D,
  RANGE_1Y,
  RANGE_ALL,
  RANGE_ALL_12MTH_ROLLING
} from '~/constants/ranges.js'
import {
  FILTER_NONE,
  INTERVAL_5MIN,
  INTERVAL_30MIN,
  INTERVAL_DAY,
  INTERVAL_WEEK,
  INTERVAL_MONTH,
  INTERVAL_SEASON,
  INTERVAL_QUARTER,
  INTERVAL_HALFYEAR,
  INTERVAL_FINYEAR,
  INTERVAL_YEAR,
  FILTER_MONTH_NUM,
  FILTER_MONTH_1,
  FILTER_MONTH_2,
  FILTER_MONTH_3,
  FILTER_MONTH_4,
  FILTER_MONTH_5,
  FILTER_MONTH_6,
  FILTER_MONTH_7,
  FILTER_MONTH_8,
  FILTER_MONTH_9,
  FILTER_MONTH_10,
  FILTER_MONTH_11,
  FILTER_MONTH_12,
  FILTER_SEASON_SUMMER,
  FILTER_SEASON_AUTUMN,
  FILTER_SEASON_WINTER,
  FILTER_SEASON_SPRING,
  FILTER_QUARTER_Q1,
  FILTER_QUARTER_Q2,
  FILTER_QUARTER_Q3,
  FILTER_QUARTER_Q4,
  FILTER_HALFYEAR_2ND,
  hasIntervalFilters
} from '@/constants/interval-filters.js'

function getFormatStringDay(showYear) {
  return showYear ? '%a, %-d %b %Y' : '%a, %-d %b'
}

function getFormatStringDetailed(showYear) {
  return showYear ? '%-d %b %Y, %-I:%M %p' : '%-d %b, %-I:%M %p'
}

function getSeasonLabel(m) {
  const month = parseInt(m, 10)
  if (month === 12 || month <= 2) {
    return FILTER_SEASON_SUMMER
  }
  if (month >= 3 && month <= 5) {
    return FILTER_SEASON_AUTUMN
  }
  if (month >= 6 && month <= 8) {
    return FILTER_SEASON_WINTER
  }
  if (month >= 9 && month <= 11) {
    return FILTER_SEASON_SPRING
  }
}

function getSeasonOffset(season) {
  switch (season) {
    case FILTER_SEASON_AUTUMN:
      return 2
    case FILTER_SEASON_WINTER:
      return 5
    case FILTER_SEASON_SPRING:
      return 8
    case FILTER_SEASON_SUMMER:
      return -1
  }
}

function getQuarterLabel(m) {
  const month = parseInt(m, 10)
  if (month >= 1 && month <= 3) {
    return FILTER_QUARTER_Q1
  }
  if (month >= 4 && month <= 6) {
    return FILTER_QUARTER_Q2
  }
  if (month >= 7 && month <= 9) {
    return FILTER_QUARTER_Q3
  }
  if (month >= 10 && month <= 12) {
    return FILTER_QUARTER_Q4
  }
}

function getQuarterOffset(quarter) {
  return FILTER_MONTH_NUM[quarter]
}

function getHalfYearOffset(period) {
  return FILTER_MONTH_NUM[period]
}

function getMonthOffset(period) {
  return FILTER_MONTH_NUM[period]
}

function getSeasonClosestDate(date, isFloor, filterPeriod) {
  const isFilter = !filterPeriod || filterPeriod !== FILTER_NONE
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
  const isFilter = !filterPeriod || filterPeriod !== FILTER_NONE
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
  const isFilter = !filterPeriod || filterPeriod !== FILTER_NONE
  if (isFilter) {
    const yearDate = isFloor
      ? d3TimeYear.every(1).floor(date)
      : d3TimeYear.every(1).ceil(date)
    return d3TimeMonth.offset(yearDate, getHalfYearOffset(filterPeriod))
  } else {
    return isFloor
      ? d3TimeMonth.every(6).floor(date)
      : d3TimeMonth.every(6).ceil(date)
  }
}

function getMonthClosestDate(date, isFloor, filterPeriod) {
  const isFilter = !filterPeriod || filterPeriod !== FILTER_NONE
  if (isFilter) {
    const yearDate = isFloor
      ? d3TimeYear.every(1).floor(date)
      : d3TimeYear.every(1).ceil(date)
    return d3TimeMonth.offset(yearDate, getMonthOffset(filterPeriod))
  } else {
    return isFloor
      ? d3TimeMonth.every(1).floor(date)
      : d3TimeMonth.every(1).ceil(date)
  }
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
    const thisYear = utcFormat('%Y')(now)
    const fYear = utcFormat('%Y')(time)
    const sYear = showYear || thisYear !== fYear

    let display = ''
    let formatString = ''

    if (!time) {
      return '—'
    }

    switch (range) {
      case RANGE_30D:
        formatString = getFormatStringDay(sYear)
        display = timeFormat(formatString)(time)
        break
      case RANGE_1Y:
        if (interval === INTERVAL_DAY) {
          formatString = getFormatStringDay(sYear)
          display = timeFormat(formatString)(time)
        } else if (interval === INTERVAL_WEEK) {
          formatString = '%-d %b %Y'
          
          const newTime = d3TimeMonday.every(1).floor(time).getTime()
          if (showIntervalRange) {
            const sixDayslater = newTime + 518400000

            const timeDate = new Date(time)
            const timeSixDaysLater = new Date(sixDayslater)

            // check year
            const startYear = timeDate.getFullYear()
            const endYear = timeSixDaysLater.getFullYear()

            // check month
            const startMonth = timeDate.getMonth()
            const endMonth = timeSixDaysLater.getMonth()

            let sDate = ''
            const dayString = '%-d'
            const dayMonthString = '%-d %b'

            if (startYear === endYear) {
              if (startMonth === endMonth) {
                sDate = timeFormat(dayString)(newTime) 
              } else {
                sDate = timeFormat(dayMonthString)(newTime) 
              }
            } else {
              sDate = timeFormat(formatString)(newTime)
            }

            const eDate = timeFormat(formatString)(sixDayslater)
            display = `${sDate} – ${eDate}`
          } else {
            if (isStart) {
              display = timeFormat(formatString)(newTime)
            } else {
              const sixDayslater = time + 518400000
              display = timeFormat(formatString)(sixDayslater)
            }
          }
        } else {
          display = timeFormat('%b %Y')(time)
        }
        break
      case RANGE_ALL:
      case RANGE_ALL_12MTH_ROLLING:
        if (interval === INTERVAL_MONTH) {
          display = timeFormat('%b %Y')(time)
        } else if (interval === INTERVAL_SEASON) {
          let seasonLabel = getSeasonLabel(timeFormat('%-m')(time))
          let year = new Date(time).getFullYear()
          let nextYearStr = ''
          if (seasonLabel === FILTER_SEASON_SUMMER) {
            const nextyear = year + 1 + ''
            nextYearStr = `/${nextyear.substr(2, 2)}`
          }
          display = `${seasonLabel} ${year}${nextYearStr}` // eslint-disable-line
        } else if (interval === INTERVAL_QUARTER) {
          display = `${getQuarterLabel(timeFormat('%-m')(time))} ${timeFormat(
            '%Y'
          )(time)}` // eslint-disable-line
        } else if (interval === INTERVAL_FINYEAR) {
          let finYearMonth = timeFormat('%-m')(time)
          let finYear = timeFormat('%y')(time)
          if (finYearMonth > 6) {
            finYear = timeFormat('%y')(time + 31557600000)
          }
          display = `FY${finYear}`
        } else if (interval === INTERVAL_HALFYEAR) {
          const sixMonthsLater = time + 15552000000
          if (showIntervalRange) {
            display = `${timeFormat('%b')(time)} – ${timeFormat('%b %Y')(
              sixMonthsLater
            )}` // eslint-disable-line
          } else {
            if (isStart) {
              display = `${timeFormat('%b %Y')(time)}` // eslint-disable-line
            } else {
              display = `${timeFormat('%b %Y')(sixMonthsLater)}` // eslint-disable-line
            }
          }
        } else if (interval === INTERVAL_YEAR) {
          display = timeFormat('%Y')(time)
        } else {
          display = timeFormat('%b %Y')(time)
        }

        if (range === RANGE_ALL_12MTH_ROLLING && !isStart && !isEnd) {
          display = 'Year to ' + display
        }
        break
      default:
        formatString = getFormatStringDetailed(thisYear === fYear)
        display = utcFormat(formatString)(time)
    }

    return display
  },

  getClosestDateByInterval(date, interval, filterPeriod) {
    let hoverDate = date
    const isFilter = !filterPeriod || filterPeriod !== FILTER_NONE
    if (hoverDate && interval === INTERVAL_FINYEAR) {
      if (hoverDate.getMonth() >= 6) {
        hoverDate.setFullYear(hoverDate.getFullYear() + 1)
      }
    }
    if (isFilter && hoverDate && hasIntervalFilters(interval)) {
      const periodMonth = this.getPeriodMonth(filterPeriod)
      const month = hoverDate.getMonth()
      if (interval === INTERVAL_MONTH) {
        hoverDate = this.mutateMonthDate(hoverDate, month, filterPeriod)
      } else if (interval === INTERVAL_SEASON) {
        hoverDate = this.mutateSeasonDate(hoverDate, month, filterPeriod)
      } else if (interval === INTERVAL_QUARTER) {
        hoverDate = this.mutateQuarterDate(hoverDate, month, filterPeriod)
      } else if (interval === INTERVAL_HALFYEAR) {
        hoverDate = this.mutateHalfYearDate(hoverDate, month, filterPeriod)
      }

      if (interval === INTERVAL_MONTH) {
        hoverDate.setMonth(periodMonth)
      } else {
        hoverDate.setMonth(periodMonth + 1)
      }
    }

    return this.snapToClosestInterval(interval, hoverDate)
  },

  defaultDisplayDate(time) {
    const now = Date.now()
    const thisYear = utcFormat('%Y')(now)
    const fYear = utcFormat('%Y')(time)
    let formatString = ''

    formatString = getFormatStringDetailed(thisYear === fYear)
    return utcFormat(formatString)(time)
  },

  snapToClosestInterval(interval, date, isLinear) {
    switch (interval) {
      case INTERVAL_5MIN:
        return utcMinute.every(5).round(date)
      case INTERVAL_30MIN:
        return utcMinute.every(30).round(date)
      case INTERVAL_DAY:
        return d3TimeDay.every(1).floor(date)
      case INTERVAL_WEEK:
        // if (isLinear) {
        //   // is a smooth  line (not area), put point in middle of the week (thu)
        //   const day = date ? date.getDay() : null
        //   if (day > 0 && day < 4) {
        //     return timeThursday.every(1).ceil(date)
        //   }
        //   return timeThursday.every(1).floor(date)
        // }
        return d3TimeMonday.every(1).floor(date)
      case INTERVAL_MONTH:
        return d3TimeMonth.every(1).floor(date)
      case INTERVAL_SEASON:
        const quarter = d3TimeMonth.every(3).floor(date)
        return d3TimeMonth.offset(quarter, -1)
      case INTERVAL_QUARTER:
        return d3TimeMonth.every(3).floor(date)
      case INTERVAL_HALFYEAR:
        return d3TimeMonth.every(6).floor(date)
      case INTERVAL_FINYEAR:
        const year = d3TimeYear.every(1).floor(date)
        return d3TimeMonth.offset(year, -6)
      case INTERVAL_YEAR:
        return d3TimeYear.every(1).floor(date)
      default:
        return date
    }
  },

  roundToClosestInterval(interval, filterPeriod, date, roundType) {
    const isFloor = roundType === 'floor'
    switch (interval) {
      case INTERVAL_5MIN:
        return utcMinute.every(5).round(date)
      case INTERVAL_30MIN:
        return utcMinute.every(30).round(date)
      case INTERVAL_DAY:
        return isFloor
          ? d3TimeDay.every(1).floor(date)
          : d3TimeDay.every(1).ceil(date)
      case INTERVAL_WEEK:
        return isFloor
          ? d3TimeMonday.every(1).floor(date)
          : d3TimeMonday.every(1).ceil(date)
      case INTERVAL_MONTH:
        return getMonthClosestDate(date, isFloor, filterPeriod)
      case INTERVAL_SEASON:
        return getSeasonClosestDate(date, isFloor, filterPeriod)
      case INTERVAL_QUARTER:
        return getQuarterClosestDate(date, isFloor, filterPeriod)
      case INTERVAL_HALFYEAR:
        return get6MonthClosestDate(date, isFloor, filterPeriod)
      case INTERVAL_FINYEAR:
        const year = isFloor
          ? d3TimeYear.every(1).floor(date)
          : d3TimeYear.every(1).ceil(date)
        return d3TimeMonth.offset(year, -6)
      case INTERVAL_YEAR:
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
    const checkWeekend = timeFormat('%a')

    while (dStart <= dEnd) {
      if (checkWeekend(dStart) === 'Sat') {
        guides.push({
          start: dStart,
          end: addDays(new Date(dStart), 2).getTime()
        })
      }
      dStart = addDays(new Date(dStart), 1).getTime()
    }

    return guides
  },

  nightGuides(datasetStart, datasetEnd) {
    const guides = []
    let dStart = subDays(new Date(datasetStart), 1).getTime()
    const dEnd = datasetEnd

    while (dStart <= dEnd) {
      const startTime = new Date(dStart)
      startTime.setUTCHours(22)
      startTime.setUTCMinutes(0)
      const endTime = new Date(startTime.getTime() + 32400000)
      guides.push({
        start: startTime,
        end: endTime
      })
      dStart = dStart + 86400000
    }

    return guides
  },

  mutateMonthDate(date, month, filterPeriod) {
    if (filterPeriod === FILTER_MONTH_1 && month === 0) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_2 && month >= 0 && month <= 1) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_3 && month >= 0 && month <= 2) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_4 && month >= 0 && month <= 3) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_5 && month >= 0 && month <= 4) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_6 && month >= 0 && month <= 5) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_7 && month >= 0 && month <= 6) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_8 && month >= 0 && month <= 7) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_9 && month >= 0 && month <= 8) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_10 && month >= 0 && month <= 9) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_11 && month >= 0 && month <= 10) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_MONTH_12 && month >= 0 && month <= 11) {
      date.setFullYear(date.getFullYear() - 1)
    }
    date.setDate(1)
    return date
  },

  mutateSeasonDate(date, month, filterPeriod) {
    if (filterPeriod === FILTER_SEASON_SUMMER && month !== 11) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (
      filterPeriod === FILTER_SEASON_AUTUMN &&
      month >= 0 &&
      month <= 1
    ) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (
      filterPeriod === FILTER_SEASON_WINTER &&
      month >= 0 &&
      month <= 5
    ) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (
      filterPeriod === FILTER_SEASON_SPRING &&
      month >= 0 &&
      month <= 8
    ) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date
  },

  mutateQuarterDate(date, month, filterPeriod) {
    if (filterPeriod === FILTER_QUARTER_Q2 && month >= 0 && month <= 2) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_QUARTER_Q3 && month >= 0 && month <= 6) {
      date.setFullYear(date.getFullYear() - 1)
    } else if (filterPeriod === FILTER_QUARTER_Q4 && month >= 0 && month <= 9) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date
  },

  mutateHalfYearDate(date, month, filterPeriod) {
    if (filterPeriod === FILTER_HALFYEAR_2ND && month >= 0 && month <= 6) {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date
  },

  getPeriodMonth(period) {
    return FILTER_MONTH_NUM[period]
  },

  getSecondsByInterval(range, interval, date, incompleteDate, isStart, isEnd) {
    let start, end
    switch (interval) {
      case INTERVAL_DAY:
        start = date
        end = endOfDay(date)

        return differenceInSeconds(end, start)

      case INTERVAL_WEEK:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfDay(addDays(date, 6))
        } else if (isEnd && incompleteDate) {
          start = date
          end = endOfDay(incompleteDate)
        } else {
          start = date
          end = endOfDay(addDays(date, 6))
        }
        return differenceInSeconds(end, start)

      case INTERVAL_MONTH:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfMonth(date)
        } else if (isEnd && incompleteDate) {
          start = date
          end =
            range === '1Y'
              ? endOfDay(incompleteDate)
              : endOfMonth(incompleteDate)
        } else {
          start = date
          end = endOfMonth(date)
        }

        return differenceInSeconds(end, start)

      case INTERVAL_SEASON:
      case INTERVAL_QUARTER:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfMonth(addMonths(date, 2))
        } else if (isEnd && incompleteDate) {
          start = date
          end = endOfMonth(incompleteDate)
        } else {
          start = date
          end = endOfMonth(addMonths(date, 2))
        }

        return differenceInSeconds(end, start)

      case INTERVAL_HALFYEAR:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfMonth(addMonths(date, 5))
        } else if (isEnd && incompleteDate) {
          start = date
          end = endOfMonth(incompleteDate)
        } else {
          start = date
          end = endOfMonth(addMonths(date, 5))
        }

        return differenceInSeconds(end, start)

      case INTERVAL_FINYEAR:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfMonth(addMonths(date, 11))
        } else if (isEnd && incompleteDate) {
          start = date
          end = endOfMonth(incompleteDate)
        } else {
          start = date
          end = endOfMonth(addMonths(date, 11))
        }

        return differenceInSeconds(end, start)

      case INTERVAL_YEAR:
        if (isStart && incompleteDate) {
          start = incompleteDate
          end = endOfMonth(addMonths(date, 11))
        } else if (isEnd && incompleteDate) {
          start = date
          end = endOfMonth(incompleteDate)
        } else {
          start = date
          end = endOfMonth(addMonths(date, 11))
        }

        return differenceInSeconds(end, start)

      default:
        return 0
    }
  }
}
