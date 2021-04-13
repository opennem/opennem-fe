import parseAndCheckData from '@/data/parse/region-energy/process/parseAndCheckData.js'
import flattenAndInterpolate from '@/data/parse/region-energy/process/flattenAndInterpolate.js'

export default function(data, displayTz) {
  const {
    dataAll,
    dataPowerEnergy,
    dataEmissions,
    dataPriceMarketValue,
    dataTemperature,
    dataInflation,
    fuelTechDataType,
    isPowerData,
    hasPowerEnergyData
  } = parseAndCheckData(data)

  const mapper = d => {
    const type = d.data_type || ''
    const units = d.units || ''
    const history = d.history || null

    return {
      id: d.id,
      code: d.code,
      type,
      units,
      history
    }
  }

  const domainPowerEnergy = dataPowerEnergy.map(mapper)
  const domainEmissions = dataEmissions.map(mapper)
  const domainMarketValue = dataPriceMarketValue.map(mapper)

  const dataInterval = hasPowerEnergyData
    ? dataPowerEnergy[0].history.interval
    : null
  const dataset = flattenAndInterpolate(
    isPowerData,
    dataInterval,
    dataAll,
    displayTz
  )

  return {
    domains: domainPowerEnergy,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue,
    dataset,
    isEnergyType: !isPowerData
  }
}
