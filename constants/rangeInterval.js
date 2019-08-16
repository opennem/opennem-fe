export default [
  {
    range: '1D',
    intervals: ['5m']
  },
  {
    range: '3D',
    intervals: ['5m', '30m']
  },
  {
    range: '7D',
    intervals: ['5m', '30m']
  },
  {
    range: '30D',
    intervals: ['Day']
  },
  {
    range: '1Y',
    intervals: ['Day', 'Week', 'Month']
  },
  {
    range: 'ALL',
    intervals: ['Month', 'Season', 'Quarter', 'Fin Year', 'Year']
  }
]
