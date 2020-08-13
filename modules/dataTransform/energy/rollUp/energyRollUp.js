import { sum, rollups } from 'd3-array'
import * as DT from '@/constants/v2/data-types.js'

function reducer(a, domains) {
  let obj = {},
    temperatureId = null,
    temperatureCount = 0

  a.forEach(point => {
    domains.forEach(domain => {
      const id = domain.id
      const type = domain.type
      let isNew = false
      if (!obj[id]) {
        obj[id] = null
        isNew = true
      }
      const isTemperature = DT.isTemperature(type)
      if (isTemperature) {
        if (type === DT.TEMPERATURE_MEAN && point[id]) {
          obj[id] += point[id]
          temperatureCount += 1
          temperatureId = id
        }
        if (type === DT.TEMPERATURE_MIN && point[id]) {
          if (isNew) {
            obj[id] = point[id]
          }
          if (obj[id] > point[id]) {
            obj[id] = point[id]
          }
        }
        if (type === DT.TEMPERATURE_MAX && point[id]) {
          if (isNew) {
            obj[id] = point[id]
          }
          if (obj[id] < point[id]) {
            obj[id] = point[id]
          }
        }
      }
    })
  })

  domains.forEach(domain => {
    const id = domain.id
    const type = domain.type
    const isPowerOrEnergy = DT.isPowerOrEnergy(type)
    const isMarketValueType = DT.isMarketValue(type)
    const isEmissionsType = DT.isEmissions(type)
    if (isPowerOrEnergy || isMarketValueType || isEmissionsType) {
      obj[id] = sum(a, d => d[id] || 0)
    }
  })
  if (temperatureId) {
    obj[temperatureId] = obj[temperatureId] / temperatureCount
  }

  return obj
}

export default function(domains, data, isIncompleteStart, isIncompleteEnd) {
  const entries = rollups(data, v => reducer(v, domains), d => d._rollUpDate)
  return entries.map((e, i) => {
    const object = {
      time: e[0],
      date: new Date(e[0]),
      _isIncompleteBucket: false
    }

    Object.keys(e[1]).forEach(k => {
      object[k] = e[1][k]
    })

    if (i === 0 && isIncompleteStart) {
      object._isIncompleteBucket = isIncompleteStart
    }
    if (i === entries.length - 1 && isIncompleteEnd) {
      object._isIncompleteBucket = isIncompleteEnd
    }
    return object
  })
}
