import { checkHistoryObject } from '@/services/DataCheck.js'
import createEmptyDatasets from '@/modules/dataTransform/helpers/createEmptyDatasets.js'

export default function(data, range) {
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
  const type = units.length > 0 ? units[0].type : ''

  units.forEach(u => {
    checkHistoryObject(u)

    const updateDataset = () => {
      const historyData = [...u.history.data]
      dataset.forEach((h, i) => {
        h[u.code] = historyData[i]
      })
    }

    updateDataset()
  })

  return {
    domains: units,
    dataset,
    type
  }
}
