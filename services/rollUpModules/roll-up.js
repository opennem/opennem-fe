/***
 * TODO: Deprecation notice:
 *  Use JavaScript’s built-in Map, Set and Object classes instead of d3-collection’s corresponding methods.
 *  Use d3-array’s group and rollup instead of d3-collection’s nest.
 */
import { nest as d3Nest } from 'd3-collection'
import {
  sum as d3Sum,
  mean as d3Mean,
  min as d3Min,
  max as d3Max
} from 'd3-array'

const PRICE_ABOVE_300 = 'price.above300'
const PRICE_BELOW_0 = 'price.below0'

function checkTemperatureType(type) {
  return (
    type === 'temperature' ||
    type === 'temperature_min' ||
    type === 'temperature_mean' ||
    type === 'temperature_max'
  )
}

export default function(domains, data) {
  const entries = d3Nest()
    .key(d => d.nestDate)
    .rollup(a => {
      let obj = {}
      let priceId = null
      let temperatureCount = 0
      let temperatureId = ''

      a.forEach(point => {
        domains.forEach(domain => {
          const id = domain.id
          const type = domain.type
          let isNew = false
          if (!obj[id]) {
            obj[id] = null
            isNew = true
          }
          const isTemperatureType = checkTemperatureType(type)
          if (isTemperatureType) {
            if (type === 'temperature_mean' && point[id]) {
              obj[id] += point[id]
              temperatureCount += 1
              temperatureId = id
            }
            if (type === 'temperature_min' && point[id]) {
              if (isNew) {
                obj[id] = point[id]
              }
              if (obj[id] > point[id]) {
                obj[id] = point[id]
              }
            }
            if (type === 'temperature_max' && point[id]) {
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
        const isEnergyType = type === 'power' || type === 'energy'
        const isMarketValueType = type === 'market_value'
        const isTemperatureType = checkTemperatureType(type)
        const isPriceType = type === 'price' || type === 'volume_weighted_price'
        const isEmissionsType = type === 'emissions'
        const isOriginalPrice =
          isPriceType && id !== PRICE_ABOVE_300 && id !== PRICE_BELOW_0

        if (isEnergyType || isMarketValueType || isEmissionsType) {
          obj[id] = d3Sum(a, d => d[id] || 0)
        } else if (isPriceType) {
          obj[id] = d3Mean(a, d => d[id] || 0)
          if (isOriginalPrice) priceId = id
        } else if (isTemperatureType) {
          // if (type === 'temperature' || type === 'temperature_mean') {
          //   obj[id] = d3Mean(a, d => d[id] || 0)
          // } else if (type === 'temperature_min') {
          //   obj[id] = d3Min(a, d => d[id] || 0)
          // } else if (type === 'temperature_max') {
          //   obj[id] = d3Max(a, d => d[id] || 0)
          // }
        }
      })

      const newPrice = obj[priceId]
      obj[PRICE_ABOVE_300] = newPrice > 300 ? newPrice : 0.001
      obj[PRICE_BELOW_0] = newPrice < 0 ? newPrice : -0.001
      obj[temperatureId] = obj[temperatureId] / temperatureCount

      return obj
    })
    .entries(data)

  return entries.map(e => {
    const object = {
      date: new Date(e.key).getTime()
    }

    Object.keys(e.value).forEach(k => {
      object[k] = e.value[k]
    })
    return object
  })
}
