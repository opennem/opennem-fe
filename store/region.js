import http from '@/services/Http.js'
import Regions from '@/constants/regions.js'
import * as FUEL_TECHS from '~/constants/fuelTech.js'

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
    const regions = Regions.filter(
      r => r.id !== 'all' && r.id !== 'nem' && r.id !== 'wa1'
    )
    const urls = getRegionURLS(regions)

    console.log(FUEL_TECHS)
    http(urls)
      .then(responses => {
        console.log(responses)

        // break out into region datasets
        const regionEnergyDataset = {}
        const regionEmissionsDataset = {}

        regions.forEach(region => {
          regionEnergyDataset[region.id] = []
          regionEmissionsDataset[region.id] = []
        })

        responses.forEach(res => {
          res.data.forEach(d => {
            if (d.type === 'energy') {
              regionEnergyDataset[d.region].push(d)
            }
            if (d.type === 'emissions') {
              regionEmissionsDataset[d.region].push(d)
            }
          })
        })

        console.log(regionEnergyDataset, regionEmissionsDataset)
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
