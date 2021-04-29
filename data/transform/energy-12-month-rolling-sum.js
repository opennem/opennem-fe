import subMonths from 'date-fns/subMonths'
import isAfter from 'date-fns/isAfter'
import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'

const perfTime = new PerfTime()

export default function(data, keys) {
  perfTime.time()
  for (let x = data.length - 1; x >= 0; x--) {
    const d = data[x]
    const last = subMonths(data[x].date, 12)

    keys.forEach(k => {
      const id = k.id
      let sum = d[id] || 0
      let index = x - 1
      if (index >= 0) {
        while (isAfter(data[index].date, last)) {
          sum += data[index][id] || 0

          index--
          if (index < 0) {
            break
          }
        }

        data[x][id] = sum
      }
    })
  }
  perfTime.timeEnd('--- data.12month-rolling-sum')
}
