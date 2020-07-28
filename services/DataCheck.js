import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInDays from 'date-fns/differenceInDays'
import differenceInMonths from 'date-fns/differenceInMonths'
import addMinutes from 'date-fns/addMinutes'
import addDays from 'date-fns/addDays'
import addMonths from 'date-fns/addMonths'
import intervalParser from '@/plugins/intervalParser.js'

export function checkPowerEnergyExists({ dataPower, dataEnergy }) {
  // check that data should not have both power and energy
  if (dataPower.length > 0 && dataEnergy.length > 0) {
    throw new Error(
      'Parsing json error: data contains both power and energy',
      dataPower,
      dataEnergy
    )
  }

  // check that at least power or energy exists
  if (dataPower.length === 0 && dataEnergy.length === 0) {
    throw new Error(
      'Parsing json error: data doest not contain power or energy',
      dataPower,
      dataEnergy
    )
  }
}

function getDateTime(date) {
  const dateString = date.substring(0, 16)
  return new Date(dateString)
}

function getArrLength({ intervalKey, intervalValue, start, last }) {
  switch (intervalKey) {
    case 'm':
      return differenceInMinutes(last, start) / intervalValue
    case 'd':
      return differenceInDays(last, start) / intervalValue + 1
    case 'M':
      return differenceInMonths(last, start) / intervalValue + 1
    default:
      return 0
  }
}

export function getStartEndNumInterval(dataObj) {
  const history = dataObj.history
  if (!history) {
    throw new Error('No history object found')
  }
  const startDateTime = getDateTime(history.start)
  const lastDateTime = getDateTime(history.last)
  const interval = intervalParser(history.interval)
  const num = getArrLength({
    intervalKey: interval.key,
    intervalValue: interval.value,
    start: startDateTime,
    last: lastDateTime
  })

  return {
    start: startDateTime,
    end: lastDateTime,
    num,
    intervalKey: interval.key,
    intervalValue: interval.value
  }
}

export function incrementTime({ date, intervalKey, intervalValue }) {
  switch (intervalKey) {
    case 'm':
      return addMinutes(date, intervalValue)
    case 'd':
      return addDays(date, intervalValue)
    case 'M':
      return addMonths(date, intervalValue)
    default:
      return null
  }
}
