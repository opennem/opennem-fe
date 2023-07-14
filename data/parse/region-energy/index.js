import _cloneDeep from 'lodash.clonedeep'
import { getAllGroups } from '@/constants/energy-fuel-techs'
import { EMISSIONS, MARKET_VALUE } from '@/constants/data-types'
import { RANGE_ALL_12MTH_ROLLING } from '@/constants/ranges.js'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'
import transformTo12MthRolling from '../../transform/energy-12-month-rolling-sum'
import {
  filterDatasetByRange,
  filterDatasetByPeriod
} from '@/data/helpers/filter'
import combineMultipleResponses from '@/data/helpers/combineMultipleResponses.js'
import { getEarliestLatestDates } from '@/data/helpers/ftStartLast.js'

export function simpleDataProcess(res, displayTz) {
  const responses = combineMultipleResponses(res)

  const {
    datasetFlat,
    datasetInflation,
    domainMarketValue,
    domainPrice,
    domainPowerEnergy,
    domainEmissions,
    domainTemperature,
    domainInflation,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandMarketValue,
    type
  } = process(responses, displayTz)

  const isEnergyType = type === 'energy'

  summariseDataset({
    isEnergyType,
    currentDataset: datasetFlat,
    datasetInflation,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice,
    domainInflation,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandMarketValue
  })

  return {
    dataset: datasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainTemperature,
    domainPrice,
    domainMarketValue,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandMarketValue,
    inflation: {
      data: datasetInflation,
      domain: domainInflation
    }
  }
}

export function dataProcess(res, range, interval, period, displayTz) {
  const responses = combineMultipleResponses(res)

  const {
    datasetFlat: dFlat,
    datasetInflation,
    domainInflation,
    domainMarketValue,
    domainPrice,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandPower,
    domainDemandMarketValue,
    domainPowerEnergy,
    domainTemperature,
    domainEmissions,
    dataPowerEnergyInterval,
    type,
    units
  } = process(responses, displayTz)
  
  const isEnergyType = type === 'energy'
  const { earliestEnergyStartDate, latestEnergyLastDate } =
    getEarliestLatestDates(
      domainPowerEnergy,
      responses,
      displayTz,
      isEnergyType
    )

  const datasetFlat = dFlat.filter(
    (d) => d.date >= earliestEnergyStartDate && d.date <= latestEnergyLastDate
  )

  let datasetFull

  const domains = [
    ...domainPowerEnergy,
    ...domainEmissions,
    ...domainMarketValue,
    ...domainPrice,
    ...domainTemperature,
    ...domainDemandEnergy,
    ...domainDemandPower,
    ...domainDemandMarketValue
  ]

  if (range === RANGE_ALL_12MTH_ROLLING) {
    function rolledUpData(_ds) {
      return rollUp({
        domains,
        datasetFlat: _ds,
        interval
      })
    }

    datasetFull = transformTo12MthRolling(
      rolledUpData(datasetFlat),
      domains
    )
  } else {
    datasetFull = _cloneDeep(datasetFlat)
  }

  const dataset = filterDatasetByRange(datasetFull, range)

  let currentDataset = null

  if (range === RANGE_ALL_12MTH_ROLLING) {
    currentDataset = _cloneDeep(dataset)
  } else {
    currentDataset =
      dataPowerEnergyInterval === interval
        ? _cloneDeep(dataset)
        : rollUp({
            domains,
            datasetFlat: dataset,
            interval
          })
  }
  
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)
  const domainEmissionsGrouped = getAllGroups(domainEmissions, EMISSIONS)
  const domainMarketValueGrouped = getAllGroups(domainMarketValue, MARKET_VALUE)

  summariseDataset({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandPower,
    domainDemandMarketValue,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice,
    datasetInflation,
    domainInflation
  })
  groupDataset({
    dataset: currentDataset,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
  })

  // summarise and group original dataset for power data
  if (!isEnergyType && dataPowerEnergyInterval !== interval) {
    summariseDataset({
      isEnergyType,
      currentDataset: dataset,
      domainPowerEnergy,
      domainEmissions,
      domainDemandPower,
      domainPrice: domainPrice
    })
    groupDataset({
      dataset: dataset,
      domainPowerEnergyGrouped,
      domainEmissionsGrouped,
      domainMarketValueGrouped
    })
  }

  return {
    dataType: type,
    datasetFull,
    datasetFlat,
    dataPowerEnergyInterval,
    domainPowerEnergy,
    domainPowerEnergyGrouped,
    domainEmissions,
    domainEmissionsGrouped,
    domainMarketValue,
    domainMarketValueGrouped,
    domainPrice,
    domainTemperature,
    domainDemandPrice,
    domainDemandEnergy,
    domainDemandPower,
    domainDemandMarketValue,
    currentDataset: filterDatasetByPeriod(currentDataset, interval, period),
    units,
    inflation: {
      data: datasetInflation,
      domain: domainInflation
    }
  }
}

export function dataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainPowerEnergyGrouped,
  domainEmissions,
  domainEmissionsGrouped,
  domainMarketValue,
  domainMarketValueGrouped,
  domainPrice,
  domainTemperature,
  domainDemandPrice,
  domainDemandEnergy,
  domainDemandPower,
  domainDemandMarketValue,
  range,
  interval,
  isEnergyType
}) {
  let currentDataset = null

  const domains = [
    ...domainPowerEnergy,
    ...domainEmissions,
    ...domainMarketValue,
    ...domainPrice,
    ...domainTemperature,
    ...domainDemandEnergy,
    ...domainDemandPower,
    ...domainDemandMarketValue
  ]

  if (range === RANGE_ALL_12MTH_ROLLING) {
    function rolledUpData(_ds) {
      return rollUp({
        domains,
        datasetFlat: _ds,
        interval
      })
    }

    currentDataset = transformTo12MthRolling(
      rolledUpData(datasetFlat),
      domains
    )
  } else {
    currentDataset = rollUp({
      domains,
      datasetFlat: filterDatasetByRange(datasetFlat, range),
      interval
    })
  }

  if (isEnergyType) {
    summariseDataset({
      isEnergyType,
      currentDataset,
      domainPowerEnergy,
      domainEmissions,
      domainDemandPrice,
      domainDemandEnergy,
      domainDemandMarketValue,
      domainPrice: isEnergyType ? domainMarketValue : domainPrice
    })
  } else {
    summariseDataset({
      isEnergyType,
      currentDataset,
      domainPowerEnergy,
      domainDemandPower,
      domainEmissions,
      domainPrice: isEnergyType ? domainMarketValue : domainPrice
    })
  }

  groupDataset({
    dataset: currentDataset,
    domainPowerEnergyGrouped,
    domainEmissionsGrouped,
    domainMarketValueGrouped
  })

  return {
    currentDataset
  }
}

export function simpleDataRollUp({
  datasetFlat,
  domainPowerEnergy,
  domainEmissions,
  domainMarketValue,
  domainPrice,
  domainTemperature,
  domainDemandPrice,
  domainDemandEnergy,
  domainDemandPower,
  domainDemandMarketValue,
  range,
  interval,
  isEnergyType
}) {
  let currentDataset = null

  const domains = [
    ...domainPowerEnergy,
    ...domainEmissions,
    ...domainMarketValue,
    ...domainPrice,
    ...domainTemperature,
    ...domainDemandEnergy,
    ...domainDemandPower,
    ...domainDemandMarketValue
  ]

  if (range === RANGE_ALL_12MTH_ROLLING) {
    function rolledUpData(_ds) {
      return rollUp({
        domains,
        datasetFlat: _ds,
        interval
      })
    }

    currentDataset = transformTo12MthRolling(
      rolledUpData(datasetFlat),
      domains
    )
  } else {
    currentDataset = rollUp({
      domains,
      datasetFlat: filterDatasetByRange(datasetFlat, range),
      interval
    })
  }

  if (isEnergyType) {
    summariseDataset({
      isEnergyType,
      currentDataset,
      domainPowerEnergy,
      domainEmissions,
      domainDemandPrice,
      domainDemandEnergy,
      domainDemandMarketValue,
      domainPrice: isEnergyType ? domainMarketValue : domainPrice
    })
  } else {
    summariseDataset({
      isEnergyType,
      currentDataset,
      domainPowerEnergy,
      domainDemandPower,
      domainEmissions,
      domainPrice: isEnergyType ? domainMarketValue : domainPrice
    })
  }

  return {
    currentDataset
  }
}

export function dataFilterByPeriod({ currentDataset, interval, period }) {
  return {
    filteredDatasetFlat: filterDatasetByPeriod(currentDataset, interval, period)
  }
}
