import isBefore from 'date-fns/isBefore'
import isAfter from 'date-fns/isAfter'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import addMinutes from 'date-fns/addMinutes'
import { mutateDate2 } from '@/services/datetime-helpers.js'

import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

const getStartLastDates = (data, prop, displayTz, ignoreTime) => {
  let start, last


  data.forEach((d) => {
    if (d[prop]) {
      const startDate = mutateDate2(d[prop].start, displayTz, ignoreTime)
      const lastDate = mutateDate2(d[prop].last, displayTz, ignoreTime)

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

    if (dataInterval === '1M') {
      allObj = getTimeIndices(start, last, eachMonthOfInterval)
    }
  }

  dataAll.forEach((d) => {
    if (d[prop]) {
      const dStartDate = mutateDate2(d[prop].start, displayTz, ignoreTime)
      const dLastDate = mutateDate2(d[prop].last, displayTz, ignoreTime)

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

export default function (dataInterval, dataAll, displayTz) {
  perfTime.time()

  const propIds = dataAll.map((d) => d.id)

  const allHistory = getAllObj(
    dataAll,
    dataInterval,
    displayTz,
    true,
    'history'
  )



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

  

  perfTime.timeEnd('--- data.process.flatten')

  return allArr
}
