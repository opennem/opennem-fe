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
  temperatureDataset: [],
  regions: Regions,
  hoveredRegion: null,
  hiddenRegions: [],
  hasEmissions: false
})

export const getters = {
  isFetching: state => state.isFetching,
  energyDataset: state => state.energyDataset,
  emissionVolDataset: state => state.emissionVolDataset,
  emissionIntDataset: state => state.emissionIntDataset,
  priceDataset: state => state.priceDataset,
  temperatureDataset: state => state.temperatureDataset,
  regions: state => state.regions,
  filteredRegions: state =>
    state.regions.filter(r => state.hiddenRegions.indexOf(r.id) === -1),
  hoveredRegion: state => state.hoveredRegion,
  hiddenRegions: state => state.hiddenRegions,
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
  temperatureDataset(state, temperatureDataset) {
    state.temperatureDataset = temperatureDataset
  },
  hasEmissions(state, hasEmissions) {
    state.hasEmissions = hasEmissions
  },
  hiddenRegions(state, hiddenRegions) {
    state.hiddenRegions = [...hiddenRegions]
  },
  hoveredRegion(state, hoveredRegion) {
    state.hoveredRegion = hoveredRegion
  }
}

export const actions = {
  doGetAllRegions({ commit, state }, period) {
    const perfTime = new PerfTime()
    perfTime.time()

    const regions = state.regions
    const promises = []
    const isMinInterval =
      period.range === '7D' || period.range === '3D' || period.range === '1D'

    commit('hasEmissions', isMinInterval ? false : true)

    regions.forEach(r => {
      const urls = Data.getEnergyUrls(r.id, period.range, hostEnv)
      promises.push(
        http(urls).then(responses =>
          mergeResponses(r.id, responses, period, isMinInterval)
        )
      )
    })

    Promise.all(promises).then(dataset => {
      const regionsObj = {}
      const hasEmissions = dataset[0].emissionDomains.length > 0
      dataset.forEach(d => {
        regionsObj[d.region] = {
          combined: d.data
        }
      })

      commitDatasets(
        commit,
        regions,
        regionsObj,
        hasEmissions,
        period,
        isMinInterval
      )

      perfTime.timeEnd('combine regions dataset')
    })
  },

  hideRegion({ commit, state }, region) {
    let hidden = [...state.hiddenRegions]
    if (hidden.indexOf(region) === -1) {
      hidden.push(region)
      // reset if all are hidden
      if (hidden.length === state.regions.length) {
        hidden = []
      }
    } else {
      hidden = hidden.filter(r => r !== region)
    }
    commit('hiddenRegions', hidden)
  },

  showThisRegionOnly({ commit, state }, region) {
    const filtered = state.regions.filter(r => r.id !== region)
    commit('hiddenRegions', filtered.map(f => f.id))
  },

  clearHiddenRegions({ commit }) {
    commit('hiddenRegions', [])
  }
}

// support functions
function mergeResponses(region, responses, period, isMinInterval) {
  const fuelTechOrder = [...FUEL_TECHS.DEFAULT_FUEL_TECH_ORDER]
  const resEnergyDomains = Domain.getEnergyDomains(responses)
  const fuelTechEnergyOrder = Domain.getDomainObjsOrder(
    resEnergyDomains,
    fuelTechOrder
  )
  const energyDomains = Domain.getDomainObjs(
    region,
    fuelTechEnergyOrder,
    isMinInterval ? 'power' : 'energy'
  )
  const resEmissionDomains = Domain.getEmissionsDomains(responses)
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
    ? Domain.getPriceDomains(responses)
    : Domain.getVolWeightedDomains()
  const temperatureDomainsAndIds = Domain.getTemperatureDomainsAndIds(responses)
  const temperatureDomains = temperatureDomainsAndIds.domains

  return EnergyDataTransform.mergeResponses(
    responses,
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
      energyDomains,
      marketValueDomains,
      temperatureDomains,
      priceDomains,
      emissionDomains,
      data
    }
  })
}

function transformDataset(regions, dataset, prop, regionAppend) {
  let updated = null
  regions.forEach((region, index) => {
    const id = region.id
    const p = regionAppend ? `${id}.${prop}` : prop
    if (index === 0) {
      updated = dataset[id].combined.map(regionData => {
        const obj = {
          date: regionData.date,
          _isIncompleteBucket: regionData._isIncompleteBucket
        }
        obj[id] = regionData[p] === 0 ? null : regionData[p]
        return obj
      })
    } else {
      dataset[id].combined.forEach((regionData, regionDataIndex) => {
        if (updated[regionDataIndex]) {
          updated[regionDataIndex][id] =
            regionData[p] === 0 ? null : regionData[p]
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

function commitDatasets(
  commit,
  regions,
  regionsObj,
  hasEmissions,
  period,
  isMinInterval
) {
  const energyDataset = transformDataset(regions, regionsObj, '_total')
  commit('energyDataset', energyDataset)

  if (hasEmissions) {
    const emissionVolDataset = transformDataset(
      regions,
      regionsObj,
      '_totalEmissionsVol'
    )

    const emissionIntDataset = emissionVolDataset.map((ev, i) => {
      const eObj = { date: ev.date }
      regions.forEach(region => {
        const id = region.id
        let ei = ev[id] / energyDataset[i][id]
        if (period.interval === 'Year' || period.interval === 'Fin Year') {
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
      regions,
      regionsObj,
      isMinInterval ? 'temperature' : 'temperature_mean',
      true
    )
  )

  if (isMinInterval) {
    commit('priceDataset', transformDataset(regions, regionsObj, 'price', true))
  } else {
    commit(
      'priceDataset',
      transformDataset(regions, regionsObj, '_volWeightedPrice')
    )
  }
}
