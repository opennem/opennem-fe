import createEmptyDatasets from '@/modules/dataTransform/helpers/createEmptyDatasets.js'

export function dataProcess(data) {
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
  const interval = data.length > 0 ? data[0].history.interval : null

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
    dataset,
    interval
  }
}
