import DateDisplay from '@/services/DateDisplay.js'
import * as SI from '@/constants/si.js'

// assume average power is MW
export default function({ data, domains, range, interval, exponent }) {
  const datasetLength = data.length - 1
  const dataset = data.map((d, i) => {
    const isStart = i === 0
    const isEnd = i === datasetLength
    const obj = {
      date: d.date,
      time: d.time,
      _isIncompleteBucket: d._isIncompleteBucket
    }
    const seconds = DateDisplay.getSecondsByInterval(
      range,
      interval,
      d.date,
      d._incompleteDate,
      isStart,
      isEnd
    )
    let totalPower = 0
    domains.forEach(domain => {
      // convert energy to average power
      obj[domain.id] =
        d[domain.id] === 0 ? null : (d[domain.id] / seconds) * 3600
      if (exponent === SI.GIGA) {
        obj[domain.id] = obj[domain.id] * 1000
      }
      totalPower += obj[domain.id] || 0
    })
    obj._totalPower = totalPower
    return obj
  })

  dataset.forEach(p => {
    let min = 0,
      max = 0
    domains.forEach(domain => {
      const id = domain.id

      if (p[id] < min) {
        min = p[id]
      }
      if (p[id] > max) {
        max = p[id]
      }
    })
    p._lowest = min
    p._highest = max
  })

  console.log(dataset)

  return dataset
}
