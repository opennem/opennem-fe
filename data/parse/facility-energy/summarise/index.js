import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

export default function({
  isEnergyType,
  currentDataset,
  domainPowerEnergy,
  domainEmissions,
  domainMarketValue
}) {
  perfTime.time()

  currentDataset.forEach(d => {
    let totalPowerEnergy = 0,
      totalMarketValue = 0,
      totalEmissions = 0,
      allPowerEnergyNulls = true,
      allMarketValueNulls = true,
      allEmissionsNulls = true

    domainPowerEnergy.forEach(domain => {
      const id = domain.id
      const value = d[id]
      if (value || value === 0) {
        allPowerEnergyNulls = false
      }
      totalPowerEnergy += value || 0
    })

    domainMarketValue.forEach(domain => {
      const id = domain.id
      const value = d[id]

      if (value || value === 0) {
        allMarketValueNulls = false
      }

      totalMarketValue += value || 0
    })

    domainEmissions.forEach(domain => {
      const id = domain.id
      const value = d[id]
      if (value || value === 0) {
        allEmissionsNulls = false
      }
      totalEmissions += value || 0
    })

    // volume weight price
    const volWeightedPrice = allMarketValueNulls
      ? null
      : totalMarketValue / totalPowerEnergy

    // update summarised values
    d._total = allPowerEnergyNulls ? null : totalPowerEnergy
    d._totalMarketValue = allMarketValueNulls ? null : totalMarketValue
    d._totalEmissions = allEmissionsNulls ? null : totalEmissions

    d._volWeightedPrice = isNaN(volWeightedPrice) ? null : volWeightedPrice
    d._volWeightedPriceAbove300 =
      !isNaN(volWeightedPrice) && volWeightedPrice > 300
        ? volWeightedPrice
        : 0.01
    d._volWeightedPriceBelow0 =
      !isNaN(volWeightedPrice) && volWeightedPrice < 0
        ? volWeightedPrice
        : -0.01
  })

  perfTime.timeEnd('--- data.summarise')
}
