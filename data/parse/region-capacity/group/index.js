import _cloneDeep from 'lodash.clonedeep'
import { GROUP_DETAILED } from '~/constants/capacity-fuel-techs'
import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

export default function ({
  dataset,
  domains
}) {
  perfTime.time()

  const groups = _cloneDeep(domains)
  Object.keys(groups).forEach((key) => {
    groups[key] = [
      ...groups[key],
    ]
  })

  dataset.forEach((d) => {
    Object.keys(groups).forEach((key) => {
      if (key !== GROUP_DETAILED) {
        const groupDomains = groups[key]

        groupDomains.forEach((g) => {
          let groupValue = 0,
            allNulls = true

          g.domainIds.forEach((dId) => {
            groupValue += d[dId]

            if (d[dId] || d[dId] === 0) {
              allNulls = false
            }
          })

          d[g.id] = allNulls ? null : groupValue
        })
      }
    })

    return d
  })

  perfTime.timeEnd('--- data.group (calculated all grouped values)')
}
