import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import addMinutes from 'date-fns/addMinutes'

import dateDisplay from '@/services/DateDisplay.js'
import interpolateDataset from './interpolateDataset.js'
import * as DT from '@/constants/data-types.js'

import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

const getStartLastDates = data => {
  let start, last
  data.forEach(d => {
    const dStartDate = dateDisplay.getDateTimeWithoutTZ(d.history.start)
    const dLastDate = dateDisplay.getDateTimeWithoutTZ(d.history.last)

    if (start) {
      if (isBefore(dStartDate, start)) {
        start = dStartDate
      }
    } else {
      start = dStartDate
    }

    if (last) {
      if (isAfter(dLastDate, last)) {
        last = dLastDate
      }
    } else {
      last = dLastDate
    }
  })

  return {
    start,
    last
  }
}

const getMinuteTimeIndices = (start, last, mins) => {
  const obj = {}
  for (let x = start; isBefore(x, last); x = addMinutes(x, mins)) {
    const time = x.getTime()
    obj[time] = {
      time,
      date: x
    }
  }

  const lastTime = last.getTime()
  obj[lastTime] = {
    time: lastTime,
    date: last
  }

  return obj
}

const getTimeIndices = (start, end, intervalFunc) => {
  const obj = {}
  const allTimeArr = intervalFunc({ start, end })
  allTimeArr.forEach(date => {
    const time = date.getTime()
    obj[time] = {
      time,
      date
    }
  })
  return obj
}

export default function(isPowerData, dataInterval, dataAll) {
  perfTime.time()

  const propIds = dataAll.map(d => d.id)
  let allObj = null

  const { start, last } = getStartLastDates(dataAll)

  console.log(dataInterval)

  if (dataInterval === '5m') {
    allObj = getMinuteTimeIndices(start, last, 5)
  }

  if (dataInterval === '30m') {
    allObj = getMinuteTimeIndices(start, last, 30)
  }

  if (dataInterval === '1d') {
    allObj = getTimeIndices(start, last, eachDayOfInterval)
  }

  if (dataInterval === '1M') {
    allObj = getTimeIndices(start, last, eachMonthOfInterval)
  }

  dataAll.forEach(d => {
    const dStartDate = dateDisplay.getDateTimeWithoutTZ(d.history.start)
    const dLastDate = dateDisplay.getDateTimeWithoutTZ(d.history.last)
    const dInterval = d.history.interval
    const dHistoryData = d.history.data

    const updateAllObj = arr => {
      // if (arr.length !== dHistoryData.length) {
      //   console.log(arr.length, dHistoryData.length)
      //   console.warn('!-- length does not match')
      // }

      arr.forEach((time, timeIndex) => {
        allObj[time][d.id] = dHistoryData[timeIndex]
      })
    }

    if (dInterval === '5m') {
      const dMinsObj = getMinuteTimeIndices(dStartDate, dLastDate, 5)
      const dMinsArr = Object.keys(dMinsObj)

      updateAllObj(dMinsArr)
    }

    if (dInterval === '30m') {
      const dMinsObj = getMinuteTimeIndices(dStartDate, dLastDate, 30)
      const dMinsArr = Object.keys(dMinsObj)

      updateAllObj(dMinsArr)
    }

    if (dInterval === '1d') {
      const dDaysArr = eachDayOfInterval({
        start: dStartDate,
        end: dLastDate
      }).map(t => t.getTime())

      updateAllObj(dDaysArr)
    }

    if (dInterval === '1M') {
      const dMonthsArr = eachMonthOfInterval({
        start: dStartDate,
        end: dLastDate
      }).map(t => t.getTime())

      updateAllObj(dMonthsArr)
    }
  })

  // convert to array
  const allArr = Object.keys(allObj).map(o => allObj[o])

  // interpolate and create pos/neg price props
  if (isPowerData) {
    const priceObj = dataAll.find(d => d.type === 'price')
    if (priceObj) {
      const priceId = priceObj.id
      // set up pos/neg properties
      allArr.forEach(d => {
        const priceValue = d[priceId]
        d[DT.PRICE_ABOVE_300] = priceValue > 300 ? priceValue : 0.001
        d[DT.PRICE_BELOW_0] = priceValue < 0 ? priceValue : -0.001
      })
    }

    interpolateDataset(dataAll, allArr)
  }

  // add the rest of the properties to the array
  allArr.forEach(d => {
    propIds.forEach(id => {
      if (typeof d[id] === 'undefined') {
        d[id] = null
      }
    })
  })

  perfTime.timeEnd('--- data.process.flatten')

  return allArr
}
