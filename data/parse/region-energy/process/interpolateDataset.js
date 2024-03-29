import * as FT from '@/constants/energy-fuel-techs/group-detailed.js'
import * as DT from '@/constants/data-types.js'

function findInterpolateSeriesTypes(data) {
  const rooftopSolarItem = data.find(
    (d) => d['fuel_tech'] === FT.SOLAR_ROOFTOP
  )
  const temperatureItem = data.find((d) => DT.isTemperature(d.type))
  const interpolateSeriesTypes = []
  if (rooftopSolarItem) {
    interpolateSeriesTypes.push({
      key: rooftopSolarItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }
  if (temperatureItem) {
    interpolateSeriesTypes.push({
      key: temperatureItem.id,
      interpolation: 'linear',
      startIndex: -1,
      currentValue: null
    })
  }

  return interpolateSeriesTypes
}

export default function (dataAll, datasetAll) {
  const forInterpolate = findInterpolateSeriesTypes(dataAll)

  if (forInterpolate.length > 0) {
    datasetAll.forEach((d, i) => {
      forInterpolate.forEach((type) => {
        if (d[type.key] !== null && typeof d[type.key] !== 'undefined') {
          if (type.interpolation === 'linear') {
            if (type.startIndex === -1) {
              type.startIndex = i
            } else {
              const count = i - type.startIndex
              const addValue = (d[type.key] - type.currentValue) / count
              for (let x = type.startIndex + 1; x <= i; x += 1) {
                datasetAll[x][type.key] = type.currentValue + addValue
                type.currentValue = datasetAll[x][type.key]
              }
              type.startIndex = i
            }
          }
          type.currentValue = d[type.key]
        } else if (d[type.key] === null || typeof d[type.key] === 'undefined') {
          if (type.interpolation === 'step') {
            d[type.key] = type.currentValue
          }
        }
      })
    })
  }
}
