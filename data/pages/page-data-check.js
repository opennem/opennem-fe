export function getTableData({
  dataset,
  selectedMetricObject,
  dateFormatString
}) {
  const selectedMetric = selectedMetricObject.value
  const columns = [
    {
      label: 'Date',
      field: 'date',
      type: 'date',
      formatString: dateFormatString
    },
    ...dataset.map(d => {
      return {
        label: d.region,
        field: d.regionId,
        formatString: selectedMetricObject.numberFormatString
      }
    })
  ]
  const rows = dataset[0].data.map(d => {
    return {
      date: d.date,
      time: d.time
    }
  })

  dataset.forEach(regionData => {
    rows.forEach((d, i) => {
      d[regionData.regionId] = regionData.data[i][selectedMetric]
    })
  })

  return {
    rows,
    columns
  }
}
