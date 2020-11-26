export const periods = [
  {
    label: 'Multi Year / day',
    value: 'multiyear/day',
    dateFormatString: 'd MMM'
  },
  {
    label: 'All / Month',
    value: 'all/month',
    dateFormatString: 'd MMM y'
  }
]

export const metrics = [
  {
    label: 'Carbon Intensity',
    value: 'carbonIntensity',
    divisor: 1000,
    domain: [0, 0.25, 0.55, 1],
    range: ['#2D9B14', '#ffe310', '#803D11', '#000000'],
    unit: ' kgCO₂e/MWh'
  },
  {
    label: 'Renewables Proportion',
    value: 'renewablesProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5, 1],
    range: ['#000', '#ddd', '#52BCA3', 'darkgreen'],
    unit: '%'
  },
  {
    label: 'Coal Proportion',
    value: 'coalProportion',
    divisor: 100,
    domain: [0, 0.001, 0.9],
    range: ['#52BCA3', '#ccc', '#131313'],
    unit: '%'
  },
  {
    label: 'Gas Proportion',
    value: 'gasProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5],
    range: ['#52BCA3', '#fff', '#F48E1B'],
    unit: '%'
  },
  // {
  //   label: 'Imports/Exports',
  //   value: 'importsExports',
  //   divisor: 1,
  //   domain: [0, 1],
  //   range: ['#977AB1', '#44146F'],
  //   unit: ''
  // },
  {
    label: 'Temperature',
    value: 'temperature',
    divisor: 50, // -10 to 50, offset 10 (0 to 40)
    domain: [0, 0.3, 0.6, 1],
    range: ['#08306B', '#9ECAE1', '#FD9272', '#67000D'],
    unit: '°C'
  }
]

export const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020']
