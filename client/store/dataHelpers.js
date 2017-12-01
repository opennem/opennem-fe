import * as moment from 'moment'
import * as _ from 'lodash'

import { REGIONS, FUEL_TECH } from '../utils/FuelTechConfig'
import { calculateHorizonValues } from '../utils/AmchartsDataTransform'

export function sumRegionsFuelTech(regions) {
  let data = null
  Object.keys(regions).forEach((regionKey, regionIndex) => {
    const regionFtData = regions[regionKey]
    if (!data) {
      data = _.cloneDeep(regionFtData)
    } else {
      data = _.mergeWith(data, regionFtData, (objValue, srcValue) => {
        if (objValue) {
          const objData = objValue.data
          const srcData = srcValue.data

          objData.forEach((value, index) => {
            objData[index] = value + srcData[index]
          })

          objValue.data = objData

          return objValue
        } else {
          return srcValue
        }
      })
    }
  })
  return data
}

export function sumFuelTechByRegion(regions) {
  const data = []
  REGIONS.forEach(region => {
    const ftRegionObj = {
      regionId: region.id
    }
    let total = 0

    Object.keys(FUEL_TECH).forEach(((key, index) => {
      if (key !== 'NETINTERCHANGE') {
        // ignore NETINTERCHANGE
        const ft = regions[region.id][key]
        const ftTotal = ft ? ft.data.reduce((a, b) => a + b, 0) : 0
        total += ftTotal
        ftRegionObj[key] = ftTotal
      }
    }))

    total = total.toFixed(0)

    Object.keys(ftRegionObj).forEach((key) => {
      if (key !== 'regionId') {
        ftRegionObj[key] = ftRegionObj[key] / total * 100
      }
    })

    data.push(ftRegionObj)
  })
  return data
}

export function sumDemandByRegion(regions) {
  const key = 'DEMAND_AND_NONSCHEDGEN'
  const demand = []
  const nswDemand = regions['nsw'][key]
  const nswDemandData = nswDemand.data
  const qldDemandData = regions['qld'][key].data
  const saDemandData = regions['sa'][key].data
  const tasDemandData = regions['tas'][key].data
  const vicDemandData = regions['vic'][key].data
  const interval = '5'
  const start = moment(nswDemand.start, moment.ISO_8601)

  for (let i = 0; i < nswDemandData.length; i++) {
    const now = moment(start).add(interval * i, 'm')

    const nsw = calculateHorizonValues(nswDemandData[i])
    const qld = calculateHorizonValues(qldDemandData[i])
    const sa = calculateHorizonValues(saDemandData[i])
    const tas = calculateHorizonValues(tasDemandData[i])
    const vic = calculateHorizonValues(vicDemandData[i])

    demand[i] = {
      date: now.toDate(),
      nsw: nswDemandData[i],
      nswMid: 0.5,
      nsw1: nsw[0],
      nsw2: nsw[1],
      nsw3: nsw[2],
      qld: qldDemandData[i],
      qldMid: 0.5,
      qld1: qld[0],
      qld2: qld[1],
      qld3: qld[2],
      sa: saDemandData[i],
      saMid: 0.5,
      sa1: sa[0],
      sa2: sa[1],
      sa3: sa[2],
      tas: tasDemandData[i],
      tasMid: 0.5,
      tas1: tas[0],
      tas2: tas[1],
      tas3: tas[2],
      vic: vicDemandData[i],
      vicMid: 0.5,
      vic1: vic[0],
      vic2: vic[1],
      vic3: vic[2]
    }
  }
  return demand
}