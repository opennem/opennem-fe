import { checkHistoryObject } from '@/services/DataCheck.js'
import createEmptyDatasets from '@/data/helpers/createEmptyDatasets.js'
import parseAndCheckData from '@/data/parse/region-energy/process/parseAndCheckData.js'

export default function(data) {
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

  const dataset = createEmptyDatasets(domainPowerEnergy)

  dataAll.forEach(u => {
    checkHistoryObject(u)

    const updateDataset = () => {
      const historyData = [...u.history.data]
      dataset.forEach((h, i) => {
        h[u.id] = historyData[i]
      })
    }

    updateDataset()
  })

  return {
    domains: domainPowerEnergy,
    domainPowerEnergy,
    domainEmissions,
    domainMarketValue,
    dataset,
    isEnergyType: !isPowerData
  }
}
