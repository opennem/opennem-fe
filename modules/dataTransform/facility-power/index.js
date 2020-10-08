import createEmptyDatasets from '@/modules/dataTransform/helpers/createEmptyDatasets.js'
import rollUp from './rollUp'

export function dataProcess(data, interval) {
  // map to existing structure and filter out null histories
  const units = data
    .map(d => {
      const type = d.data_type || ''
      const units = d.units || ''
      const history = d.history || null

      return {
        id: d.code,
        code: d.code,
        type,
        units,
        history
      }
    })
    .filter(d => d.history)

  const dataset = createEmptyDatasets(units)

  units.forEach(u => {
    const updateDataset = () => {
      const historyData = [...u.history.data]
      dataset.forEach((h, i) => {
        h[u.code] = historyData[i]
      })
    }

    updateDataset()
  })

  return {
    dataset: rollUp({
      domains: units,
      datasetFlat: dataset,
      interval
    }),
    datasetFlat: dataset,
    units
  }
}

export function dataRollUp(datasetFlat, domains, interval) {
  return rollUp({
    domains,
    datasetFlat,
    interval
  })
}
