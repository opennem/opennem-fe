import parse from 'date-fns/parse'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'
import http from '@/services/Http.js'
import REGIONS from '@/constants/regions.js'
import * as FUEL_TECHS from '@/constants/fuelTech.js'
import PerfTime from '@/plugins/perfTime.js'

const FuelTechCategory = FUEL_TECHS.FUEL_TECH_CATEGORY
const Regions = REGIONS.filter(
  r => r.id !== 'all' && r.id !== 'nem' && r.id !== 'wa1'
)

export const state = () => ({
  isFetching: false,
  datasetEnergy: []
})

export const getters = {
  isFetching: state => state.isFetching,
  datasetEnergy: state => state.datasetEnergy
}

export const mutations = {
  isFetching(state, isFetching) {
    state.isFetching = isFetching
  },
  datasetEnergy(state, datasetEnergy) {
    state.datasetEnergy = datasetEnergy
  }
}

export const actions = {
  doGetAllRegions({ commit }) {
    const urls = getRegionURLS(Regions)
    http(urls)
      .then(responses => {
        const perfTime = new PerfTime()
        perfTime.time()

        // break out into region type datasets
        const regionEnergyDataset = {}
        const regionEmissionsDataset = {}

        Regions.forEach(region => {
          regionEnergyDataset[region.id] = { data: [] }
          regionEmissionsDataset[region.id] = { data: [] }
        })

        responses.forEach(res => {
          res.data.forEach(d => {
            if (d.type === 'energy') {
              regionEnergyDataset[d.region].data.push(d)
            }
            if (d.type === 'emissions') {
              regionEmissionsDataset[d.region].data.push(d)
            }
          })
        })

        // TODO: check all the start/last date match
        // TODO: check all data.length match
        Regions.forEach(region => {
          const id = region.id
          combineRegionData(id, regionEnergyDataset)
          combineRegionData(id, regionEmissionsDataset)
        })

        commit('datasetEnergy', transformDataset(Regions, regionEnergyDataset))
        perfTime.timeEnd('combine regions dataset')
      })
      .catch(e => {
        console.error(e)
      })
  }
}

// support functions
function getRegionURLS(regions) {
  const urls = []
  const fullYear = '2020'

  regions.forEach(r =>
    urls.push(`/testing/v2/${r.id}/energy/daily/${fullYear}.json`)
  )
  return urls
}

function combineRegionData(id, dataset) {
  let interval = []
  dataset[id].data.forEach((d, i) => {
    const ft = d.fuel_tech
    if (i === 0) {
      const start = removeTz(d.history.start)
      const last = removeTz(d.history.last)
      dataset[id].start = start
      dataset[id].last = last
      interval = eachDayOfInterval({
        start: parse(start, 'yyyy-MM-dd', new Date()),
        end: parse(last, 'yyyy-MM-dd', new Date())
      })
      dataset[id].combined = interval.map(date => {
        return { date, value: 0 }
      })
    }

    dataset[id].combined.forEach((c, cIndex) => {
      const value =
        FuelTechCategory[ft] === 'load' || ft === 'imports'
          ? -d.history.data[cIndex]
          : d.history.data[cIndex]
      dataset[id].combined[cIndex].value += value
    })
  })
}

function transformDataset(regions, dataset) {
  let updated = null
  regions.forEach((region, index) => {
    const id = region.id
    if (index === 0) {
      updated = dataset[id].combined.map(regionData => {
        const obj = {
          date: regionData.date
        }
        obj[id] = regionData.value
        return obj
      })
    } else {
      dataset[id].combined.forEach((regionData, regionDataIndex) => {
        updated[regionDataIndex][id] = regionData.value
      })
    }
  })
  return updated
}

function removeTz(string) {
  const a = string.split('-')
  const year = a[0]
  const month = a[1]
  const day = a[2].substring(0, 2)
  return `${year}-${month}-${day}`
}
