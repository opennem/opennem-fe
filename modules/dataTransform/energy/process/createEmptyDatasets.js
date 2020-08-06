import { getStartEndNumInterval, incrementTime } from '@/services/DataCheck.js'
import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

export default function(dataPowerEnergy) {
  perfTime.time()
  const { start, num, intervalKey, intervalValue } = getStartEndNumInterval(
    dataPowerEnergy[0]
  )
  const datasetFlat = []
  let currentDate = start
  for (let i = 1; i <= num; i++) {
    datasetFlat.push({
      date: currentDate,
      time: currentDate.getTime()
    })
    currentDate = incrementTime({
      date: currentDate,
      intervalKey,
      intervalValue
    })
  }
  perfTime.timeEnd('data.process.createEmptyDataset')
  return datasetFlat
}
