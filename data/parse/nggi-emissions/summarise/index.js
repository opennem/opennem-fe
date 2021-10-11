import PerfTime from '@/plugins/perfTime.js'
const perfTime = new PerfTime()

export default function({ currentDataset, domains }) {
  perfTime.time()

  currentDataset.forEach(d => {
    let totalEmissions = 0,
      allEmissionsNulls = true

    domains.forEach(domain => {
      const id = domain.id
      const value = d[id]
      if (value || value === 0) {
        allEmissionsNulls = false
      }
      totalEmissions += value || 0
    })

    d._totalEmissions = allEmissionsNulls ? null : totalEmissions
  })

  perfTime.timeEnd('--- data.summarise')
}
