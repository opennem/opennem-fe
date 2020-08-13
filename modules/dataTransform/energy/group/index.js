import _cloneDeep from 'lodash.clonedeep'
import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

export default function(
  dataset,
  domainPowerEnergyGrouped,
  domainEmissionsGrouped
) {
  perfTime.time()

  const groups = _cloneDeep(domainPowerEnergyGrouped)
  Object.keys(groups).forEach(key => {
    groups[key] = [...groups[key], ...domainEmissionsGrouped[key]]
  })

  dataset.forEach(d => {
    Object.keys(groups).forEach(key => {
      if (key !== 'Default') {
        const groupDomains = groups[key]
        groupDomains.forEach(g => {
          let groupValue = 0
          g.domainIds.forEach(dId => {
            groupValue += d[dId]
          })
          d[g.id] = groupValue
        })
      }
    })

    return d
  })
  perfTime.timeEnd('data.group (calculated all grouped values)')
}
