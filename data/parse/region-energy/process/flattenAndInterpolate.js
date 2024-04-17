import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import addMinutes from 'date-fns/addMinutes'
import { mutateDate } from '@/services/datetime-helpers.js'
import { isLoad } from '@/constants/energy-fuel-techs/group-detailed.js'
import * as DT from '@/constants/data-types.js'
import interpolateDataset from './interpolateDataset.js'

import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

const getStartLastDates = (data, prop, displayTz, ignoreTime) => {
  let start, last

  data.forEach((d) => {
    if (d[prop]) {
      const startDate = mutateDate(d[prop].start, displayTz, ignoreTime)
      const lastDate = mutateDate(d[prop].last, displayTz, ignoreTime)

      if (start) {
        if (isBefore(startDate, start)) {
          start = startDate
        }
      } else {
        start = startDate
      }

      if (last) {
        if (isAfter(lastDate, last)) {
          last = lastDate
        }
      } else {
        last = lastDate
      }
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

  // for instantaneous data
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
  allTimeArr.forEach((date) => {
    const time = date.getTime()
    obj[time] = {
      time,
      date
    }
  })
  return obj
}

const getAllObj = (dataAll, dataInterval, displayTz, ignoreTime, prop) => {
  let allObj = null
  const { start, last } = getStartLastDates(
    dataAll,
    prop,
    displayTz,
    ignoreTime
  )

  if (start && last) {
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
  }

  dataAll.forEach((d) => {
    if (d[prop]) {
      const dStartDate = mutateDate(d[prop].start, displayTz, ignoreTime)
      const dLastDate = mutateDate(d[prop].last, displayTz, ignoreTime)

      const dInterval = d[prop].interval
      const dData = d[prop].data

      const updateAllObj = (arr) => {
        let curr = null
        arr.forEach((time, timeIndex) => {
          if (allObj[time]) {
            allObj[time][d.id] = dData[timeIndex]
            curr = dData[timeIndex]
          }
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
        }).map((t) => t.getTime())

        updateAllObj(dDaysArr)
      }

      if (dInterval === '1M') {
        const dMonthsArr = eachMonthOfInterval({
          start: dStartDate,
          end: dLastDate
        }).map((t) => t.getTime())

        updateAllObj(dMonthsArr)
      }
    }
  })

  return allObj
}

export default function (isPowerData, dataInterval, dataAll, displayTz) {
  perfTime.time()

  const propIds = dataAll.map((d) => d.id)
  const idsWithForecast = dataAll.filter((d) => d.forecast).map((d) => d.id)

  const allHistory = getAllObj(
    dataAll,
    dataInterval,
    displayTz,
    !isPowerData,
    'history'
  )

  const allForecast = getAllObj(
    dataAll,
    dataInterval,
    displayTz,
    !isPowerData,
    'forecast'
  )

  // combine forecast into history
  if (idsWithForecast.length > 0) {
    // interpolate forecast data as well
    const forecastObj = {}
    const allForecastArr = Object.keys(allForecast).map((o) => allForecast[o])
    const allForecastData = dataAll.filter((d) => d.forecast)
    allForecastArr.forEach((d) => {
      idsWithForecast.forEach((id) => {
        if (typeof d[id] === 'undefined') {
          d[id] = null
        }
      })
    })

    interpolateDataset(allForecastData, allForecastArr)

    allForecastArr.forEach((d) => {
      forecastObj[d.time] = d
    })

    Object.keys(forecastObj).forEach((fKey) => {
      if (allHistory[fKey]) {
        idsWithForecast.forEach((id) => {
          if (!allHistory[fKey][id]) {
            // only replace if the value is not available
            allHistory[fKey][id] = forecastObj[fKey][id]
          }
        })
      }
    })
  }

  // convert to array
  const allArr = Object.keys(allHistory).map((o) => allHistory[o])

  // add the rest of the properties to the array
  allArr.forEach((d) => {
    propIds.forEach((id) => {
      if (typeof d[id] === 'undefined') {
        d[id] = null
      }
    })
  })

  // interpolate and create pos/neg price props
  // convert power to energy
  if (isPowerData) {
    interpolateDataset(dataAll, allArr)
    const powerData = dataAll.filter((d) => d.type === 'power')
    const powerIds = powerData.map((d) => { return {
      id: d.id,
      fuelTech: d.fuel_tech
    }})

    allArr.forEach((d) => {
      let totalEnergy = 0
      powerIds.forEach(({id, fuelTech}) => {
        d[`${id}_to_energy`] = d[id] * 5 / 60

        if (isLoad(fuelTech)) {
          d[`${id}_to_energy`] = -d[`${id}_to_energy`]
        }
        
        totalEnergy += d[`${id}_to_energy`]
      })
      d._totalPowerToEnergy = totalEnergy
    })

    const priceObj = dataAll.find((d) => d.type === 'price')
    if (priceObj) {
      const priceId = priceObj.id
      // set up pos/neg properties
      allArr.forEach((d) => {
        const priceValue = d[priceId]
        d[DT.PRICE_ABOVE_300] = priceValue > 300 ? priceValue : 0.001
        d[DT.PRICE_BELOW_0] = priceValue < 0 ? priceValue : -0.001
      })
    }
  }

  perfTime.timeEnd('--- data.process.flatten')

  return allArr
}
