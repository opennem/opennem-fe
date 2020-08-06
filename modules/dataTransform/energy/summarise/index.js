import * as FT from '@/constants/fuel-tech.js'
import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

/*
  - Mutate and summarise each data point
  - Reverse value for imports and load types
*/
export default function(datasetAll, powerEnergyDomains) {
  perfTime.time()

  datasetAll.forEach((d, i) => {
    let batteryChargingId = null,
      batteryDischargingId = null,
      hydroId = null,
      pumpsId = null,
      exportsId = null,
      importsId = null
    let totalDemand = 0,
      totalSources = 0,
      totalGeneration = 0,
      totalNetGeneration = 0,
      min = 0,
      lowest = 0,
      highest = 0,
      totalEmissionsVol = 0,
      totalRenewables = 0,
      totalMarketValue = 0

    powerEnergyDomains.forEach(domain => {
      const id = domain.id
      const ft = domain.fuelTech

      if (FT.isNetFuelTech(ft)) {
        if (ft === FT.BATTERY_CHARGING) batteryChargingId = id
        if (ft === FT.BATTERY_DISCHARGING) batteryDischargingId = id
        if (ft === FT.HYDRO) hydroId = id
        if (ft === FT.PUMPS) pumpsId = id
        if (ft === FT.EXPORTS) exportsId = id
        if (ft === FT.IMPORTS) importsId = id
      }

      if (d[id] > highest) {
        highest = d[id]
      }
      if (d[id] < lowest) {
        lowest = d[id]
      }
      d._highest = highest
      d._lowest = lowest
    })

    //  Derived net values
    datasetAll[i]._netBattery =
      (d[batteryDischargingId] || 0) - (d[batteryChargingId] || 0)
    datasetAll[i]._netHydro = (d[hydroId] || 0) - (d[pumpsId] || 0)
    datasetAll[i]._netImports = -(d[importsId] || 0) - (d[exportsId] || 0) // imports comes in as negative

    if (isNaN(datasetAll[i]._netBattery) || datasetAll[i]._netBattery < 0) {
      datasetAll[i]._netBattery = 0
    }
    if (isNaN(datasetAll[i]._netHydro) || datasetAll[i]._netHydro < 0) {
      datasetAll[i]._netHydro = 0
    }
    if (isNaN(datasetAll[i]._netImports) || datasetAll[i]._netImports < 0) {
      datasetAll[i]._netImports = 0
    }

    powerEnergyDomains.forEach(domain => {
      const id = domain.id
      const ft = domain.fuelTech

      if (domain.category === FT.SOURCE) {
        if (ft === FT.BATTERY_DISCHARGING) {
          totalNetGeneration += datasetAll[i]._netBattery
        } else if (ft === FT.HYDRO) {
          totalNetGeneration += datasetAll[i]._netHydro
        } else if (ft === FT.IMPORTS) {
          totalNetGeneration += datasetAll[i]._netImports
        } else {
          totalNetGeneration += d[id]
        }
      }
    })

    powerEnergyDomains.forEach(domain => {
      const id = domain.id
      const ft = domain.fuelTech

      if (domain.category === FT.LOAD || ft === FT.IMPORTS) {
        const negValue = -d[id]
        d[id] = negValue
      }

      if (domain.category === FT.SOURCE) {
        totalSources += d[id] || 0
      }

      if (domain.category === FT.SOURCE && ft !== FT.IMPORTS) {
        totalGeneration += d[id] || 0
      }

      if (domain.category !== FT.LOAD || ft === FT.EXPORTS) {
        totalDemand += d[id] || 0
      }

      if (domain.renewable) {
        totalRenewables += d[id] || 0
      }

      if (d[id] < 0) {
        min += d[id] || 0
      }
    })

    // calculate vol weighted pricing
    // marketValueDomains.forEach(domain => {
    //   totalMarketValue += d[domain.id] || 0
    // })

    // emissionDomains.forEach(domain => {
    //   totalEmissionsVol += d[domain.id] || 0
    // })

    // const volWeightedPrice =
    //   interval === 'Year' || interval === 'Fin Year'
    //     ? totalMarketValue / totalDemand / 1000 / 1000
    //     : totalMarketValue / totalDemand / 1000

    datasetAll[i]._total = totalDemand
    datasetAll[i]._totalRenewables = totalRenewables
    datasetAll[i]._totalDemandRenewablesPercentage =
      (totalRenewables / totalDemand) * 100
    datasetAll[i]._totalGenerationRenewablesPercentage =
      (totalRenewables / totalGeneration) * 100
    if (isNaN(datasetAll[i]._totalDemandRenewablesPercentage)) {
      datasetAll[i]._totalDemandRenewablesPercentage = null
    }
    if (isNaN(datasetAll[i]._totalGenerationRenewablesPercentage)) {
      datasetAll[i]._totalGenerationRenewablesPercentage = null
    }
    datasetAll[i]._totalSources = totalSources
    datasetAll[i]._totalGeneration = totalGeneration
    datasetAll[i]._totalNetGeneration = totalNetGeneration
    datasetAll[i]._totalSourcesRenewables =
      (totalRenewables / totalSources) * 100
    datasetAll[i]._totalGenerationRenewables =
      (totalRenewables / totalGeneration) * 100

    datasetAll[i]._stackedTotalMin = min
    datasetAll[i]._stackedTotalMax = totalDemand
    // dataset[i]._totalEmissionsVol = totalEmissionsVol
    // const emissionsIntensity =
    //   interval === 'Year' || interval === 'Fin Year'
    //     ? totalEmissionsVol / totalDemand / 1000
    //     : totalEmissionsVol / totalDemand
    // dataset[i]._emissionsIntensity = emissionsIntensity || 0
    // dataset[i]._actualLastDate = actualLastDate
    // dataset[i]._actualStartDate = actualStartDate
    // dataset[i]._totalMarketValue = totalMarketValue
    // dataset[i]._volWeightedPrice = isNaN(volWeightedPrice)
    //   ? null
    //   : volWeightedPrice

    // dataset[i]._volWeightedPriceAbove300 =
    //   !isNaN(volWeightedPrice) && volWeightedPrice > 300
    //     ? volWeightedPrice
    //     : 0.01
    // dataset[i]._volWeightedPriceBelow0 =
    //   !isNaN(volWeightedPrice) && volWeightedPrice < 0
    //     ? volWeightedPrice
    //     : -0.01
  })

  perfTime.timeEnd('data.summarise')
}
