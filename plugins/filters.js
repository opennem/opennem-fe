import Vue from 'vue'
import { timeFormat as d3TimeFormat } from 'd3-time-format'
import { format as d3Format } from 'd3-format'
import DateDisplay from '~/services/DateDisplay.js'

function smartFormatString(v) {
  const value = Math.abs(v)
  let fString = ',.0f'
  if (value < 1 && value > 0.1) {
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

Vue.filter('formatDate', time => {
  const f = d3TimeFormat('%d/%m/%Y, %-I:%M %p')
  return f(time)
})

Vue.filter('formatValue', value => {
  const fString = smartFormatString(value)
  const f = d3Format(fString)
  const fValue = f(value)
  return isFinite(value) && !isNaN(value) && value ? fValue : '–'
})

Vue.filter('facilityFormatNumber', value => {
  const fString = value < 10 ? ',.1f' : ',.0f'
  const f = d3Format(fString)
  return f(value)
})

Vue.filter('customFormatValue', (value, { formatter = ',.1f' }) => {
  const f = d3Format(formatter)
  return f(value)
})

Vue.filter('percentageFormatNumber', value => {
  let fString = smartFormatString(value)
  if (fString === ',.0f') {
    fString = ',.1f'
  }
  const f = d3Format(fString)
  const fValue = f(value) + '%'
  return isFinite(value) && !isNaN(value) && value ? fValue : '–'
})

Vue.filter('formatCurrency', value => {
  const f = d3Format('$,.2f')
  const fValue = f(value)
  return isFinite(value) && !isNaN(value) && value ? fValue : '–'
})
