import format from 'date-fns/format'

import getStripesDataset from '@/data/transform/energy-to-stripe-metrics.js'
import {
  getEachYearOfInterval,
  getEachMonthOfInterval,
  getEachDayOfInterval
} from '@/constants/stripes/dates.js'
import { getEnergyRegions } from '@/constants/energy-regions.js'

const allBucket = getEachMonthOfInterval()

export const dateFormatString = 'MMM yyyy'

export async function getRegionStripesData(fetchFunc, regions) {
  const regionData = []

  await fetchFunc({ regions }).then(d => {
    regions.forEach(r => {
      const rData = d[r.id]

      regionData.push({
        region: r.label,
        regionId: r.id,
        data: getStripesDataset(
          rData.dataset,
          rData.inflation ? rData.inflation.data : [],
          rData.domainPowerEnergy,
          rData.domainEmissions,
          rData.domainTemperature,
          rData.domainPrice,
          rData.domainMarketValue,
          rData.inflation ? rData.inflation.domain : null,
          false,
          allBucket
        )
      })
    })
  })

  return regionData
}

export async function getYearlyStripesData(fetchFunc, regions) {
  const regionData = []

  regions.forEach((r, i) => {
    const yearlyData = []

    fetchFunc({ region: r.id }).then(d => {
      getEachYearOfInterval.forEach((year, yIndex) => {
        const yearInt = parseInt(year)
        const dataset = d.dataset.filter(e => e.date.getFullYear() === yearInt)

        if (dataset.length > 0) {
          yearlyData.push({
            year,
            data: getStripesDataset(
              dataset,
              d.inflation ? d.inflation.data : [],
              d.domainPowerEnergy,
              d.domainEmissions,
              d.domainTemperature,
              d.domainPrice,
              d.domainMarketValue,
              d.inflation ? d.inflation.domain : null,
              true,
              getEachDayOfInterval(yearInt)
            )
          })
        }
      })
    })

    regionData.push({
      region: r.label,
      regionId: r.id,
      yearlyData
    })
  })

  return regionData
}

export function getStripesDateRange() {
  const firstDate = format(allBucket[0].date, dateFormatString)
  const lastDate = format(
    allBucket[allBucket.length - 1].date,
    dateFormatString
  )
  return `${firstDate} – ${lastDate}`
}

export function getStripesRegion(currentRegionId) {
  const filter =
    currentRegionId === 'au'
      ? d => d.id !== 'au' && d.id !== 'nem'
      : currentRegionId === 'nem'
        ? d => d.id !== 'au' && d.id !== 'nem' && d.id !== 'wem'
        : d => d.id === currentRegionId
  return getEnergyRegions().filter(filter)
}
