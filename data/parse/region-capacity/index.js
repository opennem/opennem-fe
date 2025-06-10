import { getAllGroups } from '@/constants/capacity-fuel-techs'
import timeGroups from '@/data/helpers/time-groups'

import { CAPACITY } from '@/constants/data-types'
import parseAndCheckData from './process/parseAndCheckData.js'
import { getFuelTechInOrder, getFuelTechDomains } from './process/getDomains.js'
import flattenAndInterpolate from './process/flattenAndInterpolate.js'
import groupData from './group/index.js'
import rollUp from './rollUp/index.js'

export function dataRollUp({
  datasetFlat,
  domainCapacityGrouped,
  range,
  interval
}) {
  let currentDataset = null

  currentDataset = rollUp({
    domains: domainCapacityGrouped,
    datasetFlat: datasetFlat,
    interval
  })

  groupData({
    dataset: currentDataset,
    domains: domainCapacityGrouped
  })

  return currentDataset
}

export function dataProcess(res, range, interval, period, displayTz) {

  const {
    dataCapacity, fuelTechDataType, units
  } = parseAndCheckData(res, displayTz)

  const dataCapacityInterval =
    dataCapacity.length > 0
      ? dataCapacity[0].interval
      : null

  const fuelTechIdTypes = getFuelTechInOrder(dataCapacity)
  const domainCapacity = getFuelTechDomains(
    fuelTechIdTypes,
    fuelTechDataType
  )
  const domainCapacityGrouped = getAllGroups(domainCapacity, CAPACITY)

  const datasetFlat = flattenAndInterpolate(
    dataCapacityInterval,
    dataCapacity,
    displayTz
  )

  let currentDataset = null

  currentDataset = rollUp({
    domains: domainCapacity,
    datasetFlat: datasetFlat,
    interval
  })

  groupData({
    dataset: currentDataset,
    domains: domainCapacityGrouped
  })
  
  return {
    dataset: currentDataset,
    domainCapacity,
    domainCapacityGrouped,
    units
  }
}