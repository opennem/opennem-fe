import _cloneDeep from 'lodash.clonedeep'
import { GROUP_DETAILED } from '~/constants/energy-fuel-techs'
import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

export default function ({
  dataset,
  domainPowerEnergyGrouped,
  domainEmissionsGrouped,
  domainMarketValueGrouped,
  domainCurtailmentGrouped
}) {
  perfTime.time()

  const groups = _cloneDeep(domainPowerEnergyGrouped)

  Object.keys(groups).forEach((key) => {
    groups[key] = [
      ..._cloneDeep(groups[key]),
      ..._cloneDeep(domainEmissionsGrouped[key]),
      ..._cloneDeep(domainMarketValueGrouped[key])
    ]
  })

  const curtailedGroups = _cloneDeep(domainCurtailmentGrouped)

  if (domainCurtailmentGrouped) {
    Object.keys(curtailedGroups).forEach((key) => {
      curtailedGroups[key] = [
        ..._cloneDeep(curtailedGroups[key])
      ]
    })
  }

  dataset.forEach((d) => {
    Object.keys(groups).forEach((key) => {
      if (key !== GROUP_DETAILED) {
        const groupDomains = groups[key]

        groupDomains.forEach((g) => {
          let groupValue = 0,
            allNulls = true,
            groupPowerToEnergy = 0

          g.domainIds.forEach((dId) => {
            groupValue += d[dId]
            groupPowerToEnergy += d[`${dId}_to_energy`] || 0

            if (d[dId] || d[dId] === 0) {
              allNulls = false
            }
          })

          if (g.type === 'power') {
            d[`${g.id}_to_energy`] = groupPowerToEnergy
          }

          d[g.id] = allNulls ? null : groupValue
        })
      }
    })

    Object.keys(curtailedGroups).forEach((key) => {
      if (key !== GROUP_DETAILED) {
        const groupDomains = curtailedGroups[key]

        groupDomains.forEach((g) => {
          let groupValue = 0,
            allNulls = true,
            groupPowerToEnergy = 0

          g.domainIds.forEach((dId) => {
            groupValue += d[dId]
            groupPowerToEnergy += d[`${dId}_to_energy`] || 0

            if (d[dId] || d[dId] === 0) {
              allNulls = false
            }
          })

          if (g.type === 'power') {
            d[`${g.id}_to_energy`] = groupPowerToEnergy
          }

          d[g.id] = allNulls ? null : groupValue
        })
      }
    })

    return d
  })
  perfTime.timeEnd('--- data.group (calculated all grouped values)')
}
