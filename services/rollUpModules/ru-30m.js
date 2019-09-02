import { nest as d3Nest } from 'd3-collection'
import { mean as d3Mean } from 'd3-array'

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
  const coeff = 1000 * 60 * 30
  const entries = d3Nest()
    .key(d => Math.round(d.date / coeff) * coeff)
    .rollup(a => {
      let obj = {}
      let priceId = null

      domains.forEach(domain => {
        const id = domain.id
        const type = domain.type
        const isEnergyType = type === 'power' || type === 'energy'
        const isTemperatureType = checkTemperatureType(type)
        const isPriceType = type === 'price' || type === 'volume_weighted_price'
        const isOriginalPrice =
          isPriceType && id !== PRICE_ABOVE_300 && id !== PRICE_BELOW_0

        if (isEnergyType || isPriceType) {
          obj[id] = d3Mean(a, d => d[id] || 0)

          if (type === 'price') {
            // use the first 30min data for period
            obj[id] = a[0][id]
          }

          if (isOriginalPrice) {
            priceId = id
          }
        } else if (isTemperatureType) {
          obj[id] = d3Mean(a, d => d[id])
        }
      })

      const newPrice = obj[priceId]
      obj[PRICE_ABOVE_300] = newPrice > 300 ? newPrice : 0.001
      obj[PRICE_BELOW_0] = newPrice < 0 ? newPrice : -0.001

      return obj
    })
    .entries(data)

  return entries.map(e => {
    const object = {
      date: parseInt(e.key)
    }

    Object.keys(e.value).forEach(k => {
      object[k] = e.value[k]
    })
    return object
  })
}
