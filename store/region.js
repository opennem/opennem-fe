import http from '@/services/Http.js'
import EnergyDataTransform from '@/services/dataTransform/Energy.js'
import Domain from '@/services/Domain.js'
import Data from '@/services/Data.js'
import REGIONS from '@/constants/regions.js'
import * as FUEL_TECHS from '@/constants/fuelTech.js'
import PerfTime from '@/plugins/perfTime.js'

const Regions = REGIONS.filter(
  r => r.id !== 'all' && r.id !== 'nem' && r.id !== 'wa1'
)
const host = window.location.host
let hostEnv = 'local'
if (host === 'opennem.org.au') {
  hostEnv = 'prod'
}
if (host === 'dev.opennem.org.au') {
  hostEnv = 'dev'
}

export const state = () => ({
  isFetching: false,
  datasetEnergy: [],
  datasetEmission: [],
  regions: Regions
})

export const getters = {
  isFetching: state => state.isFetching,
  datasetEnergy: state => state.datasetEnergy,
  datasetEmission: state => state.datasetEmission,
  regions: state => state.regions
}

export const mutations = {
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  datasetEnergy(state, datasetEnergy) {
    state.datasetEnergy = datasetEnergy
  },
  datasetEmission(state, datasetEmission) {
    state.datasetEmission = datasetEmission
  }
}

export const actions = {
  doGetAllRegions({ commit }, period) {
    const perfTime = new PerfTime()
    perfTime.time()

    const isMinInterval = period.range === '7D'
    const urls = getRegionURLS(Regions, period)
    const fuelTechOrder = [...FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER]
    http(urls)
      .then(responses => {
        const promises = []
        responses.forEach(response => {
          const res = response.data || response
          // remove volume_weighted_price obj as there are invalid history
          const resData = res.filter(r => r.type !== 'volume_weighted_price')
          const region = resData[0].region
          const type = resData[0].type // TODO type should be derived

          const resEnergyDomains = Domain.getEnergyDomains([res])
          const fuelTechEnergyOrder = Domain.getDomainObjsOrder(
            resEnergyDomains,
            fuelTechOrder
          )
          const energyDomains = Domain.getDomainObjs(
            region,
            fuelTechEnergyOrder,
            type
          )

          const resEmissionDomains = Domain.getEmissionsDomains([res])
          const emissionsOrder = Domain.getDomainObjsOrder(
            resEmissionDomains,
            fuelTechOrder
          )
          const emissionDomains = Domain.getDomainObjs(
            region,
            emissionsOrder,
            'emissions'
          )

          const marketValueDomains = Domain.getDomainObjs(
            region,
            fuelTechEnergyOrder,
            'market_value'
          )

          const priceDomains = isMinInterval
            ? Domain.getPriceDomains([res])
            : Domain.getVolWeightedDomains()

          const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds([
            res
          ])

          const temperatureDomains = temperatureDomainsAndIds.domains
          const temperatureMeanId = temperatureDomainsAndIds.meanId
          const temperatureMinId = temperatureDomainsAndIds.minId
          const temperatureMaxId = temperatureDomainsAndIds.maxId

          promises.push(
            EnergyDataTransform.mergeResponses(
              [res],
              energyDomains,
              marketValueDomains,
              temperatureDomains,
              priceDomains,
              emissionDomains,
              period.range,
              period.interval
            ).then(data => {
              return {
                region,
                data
              }
            })
          )
        })

        Promise.all(promises).then(dataset => {
          const obj = {}
          dataset.forEach(d => {
            obj[d.region] = {
              combined: d.data
            }
          })

          commit('datasetEnergy', transformDataset(Regions, obj, '_total'))
          commit(
            'datasetEmission',
            transformDataset(Regions, obj, '_totalEmissionsVol')
          )
          perfTime.timeEnd('combine regions dataset')
        })
      })
      .catch(e => {
        console.error(e)
      })
  }
}

// support functions
function getRegionURLS(regions, period) {
  const urls = []
  // const urls = Data.getEnergyUrls(region, range, this.hostEnv)
  regions.forEach(r => {
    console.log(r, Data.getEnergyUrls(r.id, period.range, hostEnv))
    urls.push(Data.getEnergyUrls(r.id, period.range, hostEnv)[0])
  })
  return urls
}

// function combineRegionData(id, dataset, isMinInterval) {
//   let interval = []
//   dataset[id].data.forEach((d, i) => {
//     const ft = d.fuel_tech

//     if (i === 0) {
//       let startDate, lastDate

//       if (isMinInterval) {
//         startDate = isoParse(d.history.start)
//         lastDate = isoParse(d.history.last)
//       } else {
//         startDate = getDateWithoutTz(d.history.start)
//         lastDate = getDateWithoutTz(d.history.last)
//       }

//       dataset[id].start = startDate
//       dataset[id].last = lastDate
//       interval = getDateIntervals(startDate, lastDate, isMinInterval)
//       dataset[id].combined = interval.map(date => {
//         return { date, value: 0 }
//       })
//     }

//     dataset[id].combined.forEach((c, cIndex) => {
//       const value =
//         FuelTechCategory[ft] === 'load' || ft === 'imports'
//           ? -d.history.data[cIndex]
//           : d.history.data[cIndex]
//       if (ft !== 'rooftop_solar') {
//         dataset[id].combined[cIndex].value += value
//       }
//     })
//   })
// }

// function getDateIntervals(start, last, isMinInterval) {
//   if (isMinInterval) {
//     return timeMinute.every(5).range(start, last)
//   }
//   const dates = timeDay.every(1).range(start, last)
//   dates.push(last)
//   return dates
// }

function transformDataset(regions, dataset, prop) {
  let updated = null
  regions.forEach((region, index) => {
    const id = region.id
    if (index === 0) {
      updated = dataset[id].combined.map(regionData => {
        const obj = {
          date: regionData.date
        }
        obj[id] = regionData[prop]
        return obj
      })
    } else {
      dataset[id].combined.forEach((regionData, regionDataIndex) => {
        if (updated[regionDataIndex]) {
          updated[regionDataIndex][id] = regionData[prop]
        }
      })
    }
  })
  updated.forEach(d => {
    let highest = 0
    regions.forEach(r => {
      const id = r.id
      if (d[id] > highest) {
        highest = d[id]
      }
    })
    d._highest = highest
  })
  return updated
}

// function getDateWithoutTz(string) {
//   const a = string.split('-')
//   const year = a[0]
//   const month = a[1]
//   const day = a[2].substring(0, 2)
//   return new Date(year, month - 1, day)
// }
