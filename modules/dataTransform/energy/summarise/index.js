import * as FT from '@/constants/energy-fuel-techs/group-default.js'
import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

/*
  - Mutate and summarise each data point
  - Reverse value for imports and load types
*/
export default function({
  isEnergyType,
  currentDataset,
  domainPowerEnergy,
  domainEmissions,
  domainPrice
}) {
  perfTime.time()

  const dataset = currentDataset

  dataset.forEach((d, i) => {
    let batteryChargingId = null,
      batteryDischargingId = null,
      hydroId = null,
      pumpsId = null,
      exportsId = null,
      importsId = null
    let totalDemand = 0,
      totalEnergyForPercentageCalculation = 0,
      totalSources = 0,
      totalGeneration = 0,
      totalNetGeneration = 0,
      min = 0,
      lowest = 0,
      highest = 0,
      totalEmissionsVol = 0,
      totalRenewables = 0,
      totalMarketValue = 0,
      totalCoal = 0,
      totalGas = 0,
      totalWind = 0,
      totalSolar = 0,
      totalImportsExports = 0

    domainPowerEnergy.forEach(domain => {
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
    dataset[i]._netBattery =
      (d[batteryDischargingId] || 0) - (d[batteryChargingId] || 0)
    dataset[i]._netHydro = (d[hydroId] || 0) - (d[pumpsId] || 0)
    dataset[i]._netImports = -(d[importsId] || 0) - (d[exportsId] || 0) // imports comes in as negative

    if (isNaN(dataset[i]._netBattery) || dataset[i]._netBattery < 0) {
      dataset[i]._netBattery = 0
    }
    if (isNaN(dataset[i]._netHydro) || dataset[i]._netHydro < 0) {
      dataset[i]._netHydro = 0
    }
    if (isNaN(dataset[i]._netImports) || dataset[i]._netImports < 0) {
      dataset[i]._netImports = 0
    }

    domainPowerEnergy.forEach(domain => {
      const id = domain.id
      const ft = domain.fuelTech

      if (domain.category === FT.SOURCE) {
        if (ft === FT.BATTERY_DISCHARGING) {
          totalNetGeneration += dataset[i]._netBattery
        } else if (ft === FT.HYDRO) {
          totalNetGeneration += dataset[i]._netHydro
        } else if (ft === FT.IMPORTS) {
          totalNetGeneration += dataset[i]._netImports
        } else {
          totalNetGeneration += d[id]
        }
      }
    })

    domainPowerEnergy.forEach(domain => {
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
        totalEnergyForPercentageCalculation += d[id] || 0
      }

      if (domain.renewable) {
        totalRenewables += d[id] || 0
      }

      if (FT.isCoal(ft)) {
        totalCoal += d[id] || 0
      }

      if (FT.isGas(ft)) {
        totalGas += d[id] || 0
      }

      if (FT.isWind(ft)) {
        totalWind += d[id] || 0
      }

      if (FT.isSolar(ft)) {
        totalSolar += d[id] || 0
      }

      if (ft === FT.IMPORTS || ft === FT.EXPORTS) {
        totalImportsExports += d[id] || 0
      }

      totalDemand += d[id] || 0

      if (d[id] < 0) {
        min += d[id] || 0
      }
    })

    domainEmissions.forEach(domain => {
      totalEmissionsVol += d[domain.id] || 0
    })

    // calculate vol weighted pricing
    let allMarketValueNulls = true
    if (isEnergyType) {
      domainPrice.forEach(domain => {
        totalMarketValue += d[domain.id] || 0
        if (d[domain.id] || d[domain.id] === 0) {
          allMarketValueNulls = false
        }
      })
    }

    const volWeightedPrice = allMarketValueNulls
      ? null
      : totalMarketValue / totalDemand / 1000

    const nanCheck = value => {
      return isNaN(value) ? null : value
    }

    dataset[i]._total = totalDemand
    dataset[
      i
    ]._totalEnergyForPercentageCalculation = totalEnergyForPercentageCalculation
    dataset[i]._totalRenewables = totalRenewables

    dataset[i]._totalDemandRenewablesPercentage = nanCheck(
      (totalRenewables / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalGenerationRenewablesPercentage = nanCheck(
      (totalRenewables / totalGeneration) * 100
    )

    dataset[i]._totalCoal = totalCoal
    dataset[i]._totalDemandCoalProportion = nanCheck(
      (totalCoal / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalGas = totalGas
    dataset[i]._totalDemandGasProportion = nanCheck(
      (totalGas / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalWind = totalWind
    dataset[i]._totalDemandWindProportion = nanCheck(
      (totalWind / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalSolar = totalSolar
    dataset[i]._totalDemandSolarProportion = nanCheck(
      (totalSolar / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalImportsExports = totalImportsExports
    dataset[i]._totalDemandImportsExportsProportion = nanCheck(
      (totalImportsExports / totalEnergyForPercentageCalculation) * 100
    )

    dataset[i]._totalSources = totalSources
    dataset[i]._totalGeneration = totalGeneration
    dataset[i]._totalNetGeneration = totalNetGeneration
    dataset[i]._totalSourcesRenewables = (totalRenewables / totalSources) * 100
    dataset[i]._totalGenerationRenewables =
      (totalRenewables / totalGeneration) * 100

    dataset[i]._stackedTotalMin = min
    dataset[i]._stackedTotalMax = totalDemand
    dataset[i]._totalEmissionsVol = totalEmissionsVol
    dataset[i]._stackedTotalEmissionsMin = 0
    dataset[i]._stackedTotalEmissionsMax = totalEmissionsVol
    dataset[i]._totalMarketValue = totalMarketValue

    dataset[i]._volWeightedPrice = isNaN(volWeightedPrice)
      ? null
      : volWeightedPrice

    dataset[i]._volWeightedPriceAbove300 =
      !isNaN(volWeightedPrice) && volWeightedPrice > 300
        ? volWeightedPrice
        : 0.01
    dataset[i]._volWeightedPriceBelow0 =
      !isNaN(volWeightedPrice) && volWeightedPrice < 0
        ? volWeightedPrice
        : -0.01
  })

  perfTime.timeEnd('--- data.summarise')
}
