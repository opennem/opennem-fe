import { sum, mean, rollups } from 'd3-array'
import * as DT from '@/constants/data-types.js'

function reducer(a, domains) {
  let obj = {}
  let priceId = null

  domains.forEach((domain) => {
    let allNulls = true
    const id = domain.id
    const toEnergyId = `${id}_to_energy`
    const type = domain.type
    const isPowerOrEnergy = DT.isPowerOrEnergy(type)
    const isTemperature = DT.isTemperature(type)
    const isPrice = DT.isPrice(type)
    const isEmissionsType = DT.isEmissions(type)
    const isOriginalPrice =
      isPrice &&
      id !== DT.PRICE_ABOVE_300 &&
      id !== DT.PRICE_BELOW_0 &&
      id !== '_volWeightedPriceAbove300' &&
      id !== '_volWeightedPriceBelow0'

    if (isPowerOrEnergy) {
      // calculate mean power values
      obj[id] = mean(a, (d) => d[id] || 0)

      // calculate energy and total energy values
      let totalEnergy = 0
      a.forEach((point) => {
        point[toEnergyId] = point[id] * 5 / 60
        if (domain.category === 'load') {
          point[toEnergyId] = -point[toEnergyId]
        }
        totalEnergy += point[toEnergyId]
      })

      obj[toEnergyId] = sum(a, (d) => d[toEnergyId] || 0)
      obj._totalPowerToEnergy = totalEnergy

    } else if (isPrice) {
      // use the first price value for the rest of the period
      obj[id] = a[0][id]
      if (isOriginalPrice) {
        priceId = id
      }
    } else if (isEmissionsType) {
      const total = sum(a, (d) => {
        let value = d[id]

        if (value || value === 0) {
          allNulls = false
        }
        return value
      })

      obj[id] = allNulls ? null : total
    } else if (isTemperature) {
      obj[id] = mean(a, (d) => d[id])
    }
  })

  if (priceId) {
    const newPrice = obj[priceId]

    obj[DT.PRICE_ABOVE_300] = newPrice > 300 ? newPrice : 0.001
    obj[DT.PRICE_BELOW_0] = newPrice < 0 ? newPrice : -0.001
  }

  return obj
}

export default function (domains, data) {
  const entries = rollups(
    data,
    (v) => reducer(v, domains),
    (d) => d._rollUpDate
  )

  return entries.map((e) => {
    const object = {
      time: e[0],
      date: new Date(e[0])
    }

    Object.keys(e[1]).forEach((k) => {
      object[k] = e[1][k]
    })
    return object
  })
}
