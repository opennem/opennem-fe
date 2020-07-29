import { checkIsSameInterval } from '@/services/DataCheck.js'
import interpolateDataset from './interpolateDataset.js'

export default function(isPowerData, dataInterval, dataAll, datasetAll) {
  dataAll.forEach(d => {
    // append forecast data into the back of the history data
    const historyData = d.forecast
      ? [...d.history.data, ...d.forecast.data]
      : [...d.history.data]
    const isDifferentInterval = !checkIsSameInterval(
      dataInterval,
      d.history.interval
    )
    const updateDataset = () => {
      datasetAll.forEach((h, i) => {
        h[d.id] = historyData[i] || null
      })
    }
    const update30mInto5mDataset = () => {
      let index = 0
      datasetAll.forEach((h, i) => {
        h[d.id] = null
        if (i === 0) {
          h[d.id] = historyData[index]
        }
        if (i !== 0) {
          if (i % 6 === 0) {
            h[d.id] = historyData[index]
            index += 1
          }
        }
      })
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
}
