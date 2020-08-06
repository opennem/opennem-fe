import _cloneDeep from 'lodash.clonedeep'
import { checkIsSameInterval } from '@/services/DataCheck.js'
import interpolateDataset from './interpolateDataset.js'
import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

// TODO move this to a date module
function getDateTimeWithoutTZ(date) {
  const dateString = date.substring(0, 16)
  return new Date(dateString)
}

function createTemporaryDataset(time, date, value) {
  return { time, date, value }
}

export default function(isPowerData, dataInterval, dataAll, datasetAll) {
  perfTime.time()
  dataAll.forEach(d => {
    const isDifferentInterval = !checkIsSameInterval(
      dataInterval,
      d.history.interval
    )
    const updateDataset = () => {
      const historyData = [...d.history.data]
      datasetAll.forEach((h, i) => {
        h[d.id] = historyData[i] || null
      })
    }
    const updateDatasetWithMixedInterval = datasetMixed => {
      datasetAll.forEach(dAll => {
        const find = datasetMixed.find(dMixed => dMixed.time === dAll.time)
        if (find) {
          dAll[d.id] = find.value
        } else {
          dAll[d.id] = null
        }
      })
    }

    // Extend when we have more mixed intervals in the dataset
    const update30mInto5mDataset = () => {
      let date = new Date(getDateTimeWithoutTZ(d.history.start))
      let datasetForecast30m = []

      const dataset30m = d.history.data.map(value => {
        const currentTime = date.getTime()
        const obj = createTemporaryDataset(currentTime, date, value)
        date = new Date(currentTime + 1800000) // 30 mins
        return obj
      })

      if (d.forecast) {
        let dateForecast = new Date(getDateTimeWithoutTZ(d.forecast.start))
        datasetForecast30m = d.forecast.data.map(value => {
          const currentTime = dateForecast.getTime()
          const obj = createTemporaryDataset(currentTime, dateForecast, value)
          dateForecast = new Date(currentTime + 1800000) // 30 mins
          return obj
        })
      }

      updateDatasetWithMixedInterval([...dataset30m, ...datasetForecast30m])
    }

    if (isPowerData) {
      if (isDifferentInterval) {
        if (d.history.interval === '30m') {
          update30mInto5mDataset()
        }
      } else {
        updateDataset()
      }
    } else {
      // assume energy json datas have same history intervals for now
      updateDataset()
    }
  })

  if (isPowerData) {
    interpolateDataset(dataAll, datasetAll)
  }

  perfTime.timeEnd('data.process.flattenAndInterpolate')
}
