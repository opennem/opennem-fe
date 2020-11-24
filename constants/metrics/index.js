export const periods = [
  {
    label: 'Multi Year / day',
    value: 'multiyear/day'
  },
  {
    label: 'All / Month',
    value: 'all/month'
  }
]

export const metrics = [
  {
    label: 'Carbon Intensity',
    value: 'carbonIntensity',
    divisor: 1000,
    domain: [0, 0.25, 0.55, 1],
    range: ['#2D9B14', '#ffe310', '#803D11', '#000000']
  },
  {
    label: 'Renewables Proportion',
    value: 'renewablesProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5, 1],
    range: ['#000', '#ddd', '#52BCA3', 'darkgreen']
  },
  {
    label: 'Coal Proportion',
    value: 'coalProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5],
    range: ['#52BCA3', '#fff', '#131313']
  },
  {
    label: 'Gas Proportion',
    value: 'gasProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5],
    range: ['#52BCA3', '#fff', '#F48E1B']
  }
]

export const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020']
