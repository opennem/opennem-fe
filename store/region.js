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
let hostEnv = 'dev'
if (host === 'opennem.org.au') {
  hostEnv = 'prod'
}
if (host === 'dev.opennem.org.au') {
  hostEnv = 'dev'
}

export const state = () => ({
  isFetching: false,
  energyDataset: [],
  emissionVolDataset: [],
  emissionIntDataset: [],
  priceDataset: [],
  priceAbove300Dataset: [],
  priceBelow0Dataset: [],
  temperatureDataset: [],
  regions: Regions,
  hasEmissions: false
})

export const getters = {
  isFetching: state => state.isFetching,
  energyDataset: state => state.energyDataset,
  emissionVolDataset: state => state.emissionVolDataset,
  emissionIntDataset: state => state.emissionIntDataset,
  priceDataset: state => state.priceDataset,
  priceAbove300Dataset: state => state.priceAbove300Dataset,
  priceBelow0Dataset: state => state.priceBelow0Dataset,
  temperatureDataset: state => state.temperatureDataset,
  regions: state => state.regions,
  hasEmissions: state => state.hasEmissions
}

export const mutations = {
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  energyDataset(state, energyDataset) {
    state.energyDataset = energyDataset
  },
  emissionVolDataset(state, emissionVolDataset) {
    state.emissionVolDataset = emissionVolDataset
  },
  emissionIntDataset(state, emissionIntDataset) {
    state.emissionIntDataset = emissionIntDataset
  },
  priceDataset(state, priceDataset) {
    state.priceDataset = priceDataset
  },
  priceAbove300Dataset(state, priceAbove300Dataset) {
    state.priceAbove300Dataset = priceAbove300Dataset
  },
  priceBelow0Dataset(state, priceBelow0Dataset) {
    console.log(priceBelow0Dataset)
    state.priceBelow0Dataset = priceBelow0Dataset
  },
  temperatureDataset(state, temperatureDataset) {
    state.temperatureDataset = temperatureDataset
  },
  hasEmissions(state, hasEmissions) {
    state.hasEmissions = hasEmissions
  }
}

export const actions = {
  doGetAllRegions({ commit }, period) {
    const perfTime = new PerfTime()
    perfTime.time()

    const isMinInterval =
      period.range === '7D' || period.range === '3D' || period.range === '1D'
    const urls = getRegionURLS(Regions, period)
    const fuelTechOrder = [...FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER]
    let hasEmissions = false

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
          hasEmissions = emissionDomains.length > 0
          commit('hasEmissions', hasEmissions)

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

          console.log(obj)

          const energyDataset = transformDataset(Regions, obj, '_total')
          commit('energyDataset', energyDataset)

          if (hasEmissions) {
            const emissionVolDataset = transformDataset(
              Regions,
              obj,
              '_totalEmissionsVol'
            )

            const emissionIntDataset = emissionVolDataset.map((ev, i) => {
              const eObj = { date: ev.date }
              Regions.forEach(region => {
                const id = region.id
                let ei = ev[id] / energyDataset[i][id]
                if (
                  period.interval === 'Year' ||
                  period.interval === 'Fin Year'
                ) {
                  ei = ei / 1000
                }
                eObj[id] = Number.isFinite(ei) ? ei : null
              })
              return eObj
            })

            commit('emissionVolDataset', emissionVolDataset)
            commit('emissionIntDataset', emissionIntDataset)
          } else {
            commit('emissionVolDataset', [])
            commit('emissionIntDataset', [])
          }
          commit(
            'temperatureDataset',
            transformDataset(
              Regions,
              obj,
              isMinInterval ? 'temperature' : 'temperature_mean',
              true
            )
          )

          if (isMinInterval) {
            commit(
              'priceDataset',
              transformDataset(Regions, obj, 'price', true)
            )
            commit(
              'priceAbove300Dataset',
              transformDataset(Regions, obj, 'price.above300')
            )
            commit(
              'priceBelow0Dataset',
              transformDataset(Regions, obj, 'price.below0')
            )
          } else {
            commit(
              'priceDataset',
              transformDataset(Regions, obj, '_volWeightedPrice')
            )
            commit(
              'priceAbove300Dataset',
              transformDataset(Regions, obj, '_volWeightedPriceAbove300')
            )
            commit(
              'priceBelow0Dataset',
              transformDataset(Regions, obj, '_volWeightedPriceBelow0')
            )
          }

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

function transformDataset(regions, dataset, prop, regionAppend) {
  let updated = null
  regions.forEach((region, index) => {
    const id = region.id
    const p = regionAppend ? `${id}.${prop}` : prop
    if (index === 0) {
      updated = dataset[id].combined.map(regionData => {
        const obj = {
          date: regionData.date
        }
        obj[id] = regionData[p]
        return obj
      })
    } else {
      dataset[id].combined.forEach((regionData, regionDataIndex) => {
        if (updated[regionDataIndex]) {
          updated[regionDataIndex][id] = regionData[p]
        }
      })
    }
  })
  updated.forEach(d => {
    let highest = 0
    let lowest = 0
    regions.forEach(r => {
      const id = r.id
      if (d[id] > highest) {
        highest = d[id]
      }
      if (d[id] < lowest) {
        lowest = d[id]
      }
    })
    d._highest = highest
    d._lowest = lowest
  })
  return updated
}
