import Vue from 'vue'
import { timeFormat as d3TimeFormat, utcFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import DateDisplay from '~/services/DateDisplay.js'
import * as SI from '@/constants/si.js'

function smartFormatString(v) {
  const value = Math.abs(v)
  let fString = ',.0f'
  if (value === 0) {
    fString = ',.0f'
  } else if (value < 30 && value > 0.1) {
    fString = ',.1f'
  } else if (value < 0.1 && value > 0.01) {
    fString = ',.2f'
  } else if (value < 0.01 && value > 0.001) {
    fString = ',.3f'
  } else if (value < 0.001) {
    fString = ',.4f'
  }
  return fString
}

Vue.filter(
  'customFormatDate',
  (
    time,
    {
      range,
      interval,
      isStart = false,
      isEnd = false,
      showYear = false,
      showIntervalRange = false
    }
  ) => {
    return DateDisplay.specialDateFormats(
      time,
      range,
      interval,
      isStart,
      isEnd,
      showYear,
      showIntervalRange
    )
  }
)

Vue.filter('intervalLabel', interval => {
  if (interval === 'Fin Year') {
    return 'year'
  }
  return interval.toLowerCase()
})

Vue.filter('formatDate', time => {
  const f = utcFormat('%d/%m/%Y, %-I:%M %p')
  return f(time)
})

Vue.filter('formatValue', (value, prepend = '') => {
  const fString = smartFormatString(value)
  const f = d3Format(fString)
  const fValue = f(value)
  return isFinite(value) && !isNaN(value) && value !== null
    ? `${prepend}${fValue}`
    : '–'
})
Vue.filter('formatValue2', value => {
  const fString = smartFormatString(value)
  const f = d3Format(fString)
  const fValue = f(value)
  return isFinite(value) && !isNaN(value) && value ? fValue : '0'
})

Vue.filter('facilityFormatNumber', value => {
  let v = value
  let fString = ',.0f'
  if (v < 10 && v >= 1) {
    fString = ',.1f'
  } else if (v < 1) {
    v = v * Math.pow(10, 3)
  }
  const f = d3Format(fString)
  return f(v)
})

Vue.filter('customFormatValue', value => {
  let fString = smartFormatString(value)
  if (fString === ',.0f') {
    fString = ',.1f'
  }
  const f = d3Format(fString)
  return isFinite(value) && !isNaN(value) && value ? f(value) : '–'
})

Vue.filter('percentageFormatNumber', value => {
  let fString = smartFormatString(value)
  if (fString === ',.0f') {
    fString = ',.1f'
  }
  const f = d3Format(fString)
  const fValue = f(value) + '%'
  return isFinite(value) && !isNaN(value) && value !== null ? fValue : '–'
})

Vue.filter('percentageFormatNumber2', value => {
  let fString = smartFormatString(value)
  if (fString === ',.0f') {
    fString = ',.1f'
  }
  const f = d3Format(fString)
  const fValue = f(value) + '%'
  return isFinite(value) && !isNaN(value) && value ? fValue : '0%'
})

Vue.filter('formatCurrency', (value, formatString = ',.2f') => {
  const f = d3Format(`$${formatString}`)
  const fValue = f(value)
  return isFinite(value) && !isNaN(value) && value !== null && value !== ''
    ? fValue
    : '–'
})

Vue.filter('toLowerCase', string => {
  return string.toLowerCase()
})

Vue.filter('convertValue', (value, fromPrefix, toPrefix) => {
  return SI.convertValue(fromPrefix, toPrefix, value)
})
