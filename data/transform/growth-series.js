import _cloneDeep from 'lodash.clonedeep'

export default function(originalDataset, domains, compareIndex) {
  const dataset = []
  const ds = _cloneDeep(originalDataset)

  ds.forEach((d, i) => {
    const obj = {
      date: d.date,
      time: d.time,
      _isIncompleteBucket: d._isIncompleteBucket
    }

    domains.forEach((domain) => {
      const ftId = domain.id

      if (i === 0) {
        obj[ftId] = 0
      } else {
        const compareData = ds[i - compareIndex]
        if (compareData) {
          obj[ftId] = d[ftId] - compareData[ftId]
        }
      }
    })

    dataset.push(obj)
  })

  return  dataset
}