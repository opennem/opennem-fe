import _cloneDeep from 'lodash.clonedeep'
import { getAllGroups } from '@/constants/energy-fuel-techs'
import { EMISSIONS, MARKET_VALUE } from '@/constants/data-types'
import { RANGE_ALL_12MTH_ROLLING } from '@/constants/ranges.js'
import process from './process'
import rollUp from './rollUp'
import summariseDataset from './summarise'
import groupDataset from './group'
import transformTo12MthRollingSum from '../../transform/energy-12-month-rolling-sum'
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
    domainInflation
  })

  return {
    dataset: datasetFlat,
    domainPowerEnergy,
    domainEmissions,
    domainTemperature,
    domainPrice,
    domainMarketValue,
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
    domainMarketValue,
    domainPrice,
    domainPowerEnergy,
    domainTemperature,
    domainEmissions,
    dataPowerEnergyInterval,
    type,
    units
  } = process(responses, displayTz)

  const isEnergyType = type === 'energy'

  const {
    earliestEnergyStartDate,
    latestEnergyLastDate
  } = getEarliestLatestDates(
    domainPowerEnergy,
    responses,
    displayTz,
    isEnergyType
  )

  const datasetFlat = dFlat.filter(
    d => d.date >= earliestEnergyStartDate && d.date <= latestEnergyLastDate
  )

  let datasetFull

  if (range === RANGE_ALL_12MTH_ROLLING) {
    datasetFull = transformTo12MthRollingSum(
      datasetFlat,
      [...domainPowerEnergy, ...domainEmissions, ...domainMarketValue],
      range === RANGE_ALL_12MTH_ROLLING
    )
  } else {
    datasetFull = _cloneDeep(datasetFlat)
  }

  const dataset = filterDatasetByRange(datasetFull, range)

  const currentDataset =
    dataPowerEnergyInterval === interval
      ? _cloneDeep(dataset)
      : rollUp({
          domains: [
            ...domainPowerEnergy,
            ...domainEmissions,
            ...domainMarketValue,
            ...domainPrice,
            ...domainTemperature
          ],
          datasetFlat: dataset,
          interval
        })
  const domainPowerEnergyGrouped = getAllGroups(domainPowerEnergy, type)
  const domainEmissionsGrouped = getAllGroups(domainEmissions, EMISSIONS)
  const domainMarketValueGrouped = getAllGroups(domainMarketValue, MARKET_VALUE)

  summariseDataset({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
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
    datasetFlat: dataset,
    dataPowerEnergyInterval,
    domainPowerEnergy,
    domainPowerEnergyGrouped,
    domainEmissions,
    domainEmissionsGrouped,
    domainMarketValue,
    domainMarketValueGrouped,
    domainPrice,
    domainTemperature,
    currentDataset: filterDatasetByPeriod(currentDataset, interval, period),
    units
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
  range,
  interval,
  isEnergyType
}) {
  const currentDataset = rollUp({
    domains: [
      ...domainPowerEnergy,
      ...domainEmissions,
      ...domainMarketValue,
      ...domainPrice,
      ...domainTemperature
    ],
    datasetFlat: filterDatasetByRange(datasetFlat, range),
    interval
  })

  summariseDataset({
    isEnergyType,
    currentDataset,
    domainPowerEnergy,
    domainEmissions,
    domainPrice: isEnergyType ? domainMarketValue : domainPrice
  })
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

export function dataFilterByPeriod({ currentDataset, interval, period }) {
  return {
    filteredDatasetFlat: filterDatasetByPeriod(currentDataset, interval, period)
  }
}
