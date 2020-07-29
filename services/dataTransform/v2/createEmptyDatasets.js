import { getStartEndNumInterval, incrementTime } from '@/services/DataCheck.js'

export default function(dataPowerEnergy) {
  const { start, num, intervalKey, intervalValue } = getStartEndNumInterval(
    dataPowerEnergy[0]
  )
  const datasetAll = [],
    datasetTemperature = []
  let currentDate = start
  for (let i = 1; i <= num; i++) {
    datasetAll.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    datasetTemperature.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    currentDate = incrementTime({
      date: currentDate,
      intervalKey,
      intervalValue
    })
  }

  return {
    datasetAll,
    datasetTemperature
  }
}
