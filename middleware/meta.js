// import meta from '~/static/meta/fuel-tech-all.json'
import fuelTechNames from '~/static/meta/fuel-tech-names.json'
// import fuelTechGroup from '~/static/meta/fuel-tech-solar-v-demand.json'
import fuelTechGroup from '~/constants/fuel-tech-solar-v-demand.json'

export default function({ store }) {
  if (!store.getters.fuelTechMeta) {
    store.commit('fuelTechNames', fuelTechNames)
  }
  // if (!store.getters.fuelTechGroup) {
  //   store.commit('fuelTechGroup', fuelTechGroup)
  // }
}
