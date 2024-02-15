import subMonths from 'date-fns/subMonths'
import addMonths from 'date-fns/addMonths'
import isAfter from 'date-fns/isAfter'
import PerfTime from '@/plugins/perfTime.js'
import { isTemperature } from '~/constants/data-types'

const perfTime = new PerfTime()

export default function (data, keys) {
  perfTime.time()
  // console.log('keys', keys)
  for (let x = data.length - 1; x >= 0; x--) {
    const d = data[x]
    const last = subMonths(data[x].date, 12)

    keys.forEach((k) => {
      const id = k.id
      const isTemperatureKey = isTemperature(k.type)
      
      let sum = d[id] || 0
      let index = x - 1
      let hasNulls = false
      let count = 1

      if (index >= 0) {
        while (isAfter(data[index].date, last)) {
          // check whether there are any nulls in the rolling sum for temperature
          if (!data[index][id] && data[index][id] !== 0) {
            if (isTemperatureKey) {
              hasNulls = true
            }
            hasNulls = true
          }

          sum += data[index][id] || 0

          index--
          count++

          if (index < 0) {
            break
          }
        }
        
        // for temperature, if there are nulls in the rolling sum, set the value to null
        // average for temperature, sum for everything else
        if (isTemperatureKey) {
          data[x][id] = hasNulls ? null : sum / count
        } else {
          data[x][id] = sum
        }
      }
    })
  }

  // filter out incomplete rolling sums
  const firstDate = data[0].date
  const firstAvailable = addMonths(firstDate, 11)
  const updated = data.filter((d) => isAfter(d.date, firstAvailable))

  perfTime.timeEnd('--- data.12month-rolling-sum')

  return updated
}
