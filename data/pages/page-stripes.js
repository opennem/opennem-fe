import format from 'date-fns/format'

import getStripesDataset from '@/data/transform/energy-to-stripe-metrics.js'
import {
  getEachOfInterval,
  getEachYearOfInterval,
  getEachMonthOfInterval,
  getEachDayOfInterval
} from '@/constants/stripes/dates.js'
import { getEnergyRegions } from '@/constants/energy-regions.js'

export const allBucket = getEachMonthOfInterval()

export const dateFormatString = 'MMM yyyy'

export async function getRegionCompareData(dataset, regions, interval, filterPeriod) {
  const regionData = []
  const bucket = getEachOfInterval(interval, filterPeriod)

  regions.forEach(region => {
    const rData = dataset[region.id]

    const data = getStripesDataset({
      dataset: rData.originalDataset,
      datasetInflation: rData.inflation ? rData.inflation.data : [],
      domainPowerEnergy: rData.domainPowerEnergy,
      domainEmissions: rData.domainEmissions,
      domainTemperature: rData.domainTemperature,
      domainPrice: rData.domainPrice,
      domainMarketValue: rData.domainMarketValue,
      domainDemandPrice: rData.domainDemandPrice,
      domainDemandEnergy: rData.domainDemandEnergy,
      domainDemandMarketValue: rData.domainDemandMarketValue,
      domainInflation: rData.inflation ? rData.inflation.domain : null,
      topUp: false,
      bucket,
      regionId: region.id
    })

    regionData.push({
      region: region.label,
      regionId: region.id,
      originalDataset: rData.originalDataset,
      domainPowerEnergy: rData.domainPowerEnergy,
      domainEmissions: rData.domainEmissions,
      domainTemperature: rData.domainTemperature,
      domainPrice: rData.domainPrice,
      domainMarketValue: rData.domainMarketValue,
      domainDemandPrice: rData.domainDemandPrice,
      domainDemandEnergy: rData.domainDemandEnergy,
      domainDemandMarketValue: rData.domainDemandMarketValue,
      domainInflation: rData.inflation ? rData.inflation.domain : null,
      data
    })
  })

  return { bucket, regionData }
}

export async function getRegionStripesData(fetchFunc, regions) {
  const regionData = []

  await fetchFunc({ regions }).then((d) => {
    regions.forEach((r) => {
      const rData = d[r.id]

      regionData.push({
        region: r.label,
        regionId: r.id,
        originalDataset: rData.dataset,
        domainPowerEnergy: rData.domainPowerEnergy,
        domainEmissions: rData.domainEmissions,
        domainTemperature: rData.domainTemperature,
        domainPrice: rData.domainPrice,
        domainMarketValue: rData.domainMarketValue,
        domainDemandPrice: rData.domainDemandPrice,
        domainDemandEnergy: rData.domainDemandEnergy,
        domainDemandMarketValue: rData.domainDemandMarketValue,
        domainInflation: rData.inflation ? rData.inflation.domain : null,
        data: getStripesDataset({
          dataset: rData.dataset,
          datasetInflation: rData.inflation ? rData.inflation.data : [],
          domainPowerEnergy: rData.domainPowerEnergy,
          domainEmissions: rData.domainEmissions,
          domainTemperature: rData.domainTemperature,
          domainPrice: rData.domainPrice,
          domainMarketValue: rData.domainMarketValue,
          domainDemandPrice: rData.domainDemandPrice,
          domainDemandEnergy: rData.domainDemandEnergy,
          domainDemandMarketValue: rData.domainDemandMarketValue,
          domainInflation: rData.inflation ? rData.inflation.domain : null,
          topUp: false,
          bucket: allBucket,
          regionId: region.id
        })
      })
    })
  })

  return regionData
}

function transformStripesDataset(d, regionId) {
  const data = []
  getEachYearOfInterval.forEach((year, yIndex) => {
    const yearInt = parseInt(year)
    const dataset = d.dataset.filter((e) => e.date.getFullYear() === yearInt)

    if (dataset.length > 0) {
      data.push({
        year,
        originalDataset: dataset,
        data: getStripesDataset({
          dataset,
          datasetInflation: d.inflation ? d.inflation.data : [],
          domainPowerEnergy: d.domainPowerEnergy,
          domainEmissions: d.domainEmissions,
          domainTemperature: d.domainTemperature,
          domainPrice: d.domainPrice,
          domainMarketValue: d.domainMarketValue,
          domainDemandPrice: d.domainDemandPrice,
          domainDemandEnergy: d.domainDemandEnergy,
          domainDemandMarketValue: d.domainDemandMarketValue,
          domainInflation: d.inflation ? d.inflation.domain : null,
          topUp: true,
          bucket: getEachDayOfInterval(yearInt),
          regionId
        })
      })
    }
  })

  return data
}

export function getYearlyStripesData(fetchFunc, regions) {
  const promises = []

  regions.forEach((r, i) => {
    const yearlyData = []
    promises.push(
      new Promise((resolve, reject) => {
        fetchFunc({ region: r.id }).then((d) => {
          resolve({
            region: r.label,
            regionId: r.id,
            yearlyData: transformStripesDataset(d, r.id)
          })
        })
      })
    )
  })

  return new Promise((resolve, reject) => {
    Promise.all(promises).then((d) => resolve(d))
  })
}

export function getStripesDateRange() {
  const firstDate = format(allBucket[0].date, dateFormatString)
  const lastDate = format(
    allBucket[allBucket.length - 1].date,
    dateFormatString
  )
  return `${firstDate} – ${lastDate}`
}

export function getStripesStartEndDates() {
  const firstDate = format(allBucket[0].date, dateFormatString)
  const lastDate = format(
    allBucket[allBucket.length - 1].date,
    dateFormatString
  )

  return {
    start: allBucket[0].date,
    end: allBucket[allBucket.length - 1].date
  }
}

export function getStripesRegion(currentRegionId) {
  const filter =
    currentRegionId === 'au'
      ? (d) => d.id !== 'au' && d.id !== 'nem'
      : currentRegionId === 'nem'
      ? (d) => d.id !== 'au' && d.id !== 'nem' && d.id !== 'wem'
      : (d) => d.id === currentRegionId
  return getEnergyRegions().filter(filter)
}
