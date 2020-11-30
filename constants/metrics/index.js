export const periods = [
  {
    label: 'Multi Year / day',
    value: 'multiyear/day',
    dateFormatString: 'd MMM y'
  },
  {
    label: 'All / Month',
    value: 'all/month',
    dateFormatString: 'MMM y'
  }
]

export const metrics = [
  {
    label: 'Carbon Intensity (kgCO₂e/MWh)',
    value: 'carbonIntensity',
    divisor: 1000,
    domain: [0, 0.25, 0.55, 1],
    range: ['#2D9B14', '#ffe310', '#803D11', '#000000'],
    unit: ' kgCO₂e/MWh',
    legendType: 'ramp'
  },
  {
    label: 'Renewables Proportion (of demand)',
    value: 'renewablesProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5, 1],
    range: ['#000', '#ddd', '#52BCA3', 'darkgreen'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Coal Proportion (of demand)',
    value: 'coalProportion',
    divisor: 100,
    domain: [0, 0.001, 0.9],
    range: ['#52BCA3', '#ccc', '#131313'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Gas Proportion (of demand)',
    value: 'gasProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5],
    range: ['#52BCA3', '#ccc', '#F48E1B'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Net Exports/Imports',
    value: 'importsExports',
    valueProp: 'sumImportsExports',
    divisor: 'importsExports',
    domain: [0, 1],
    domainLabel: ['Net exports', 'Net imports'],
    range: ['#977AB1', '#44146F'],
    unit: ' GWh',
    legendType: 'swatch'
  },
  {
    label: 'Temperature',
    value: 'temperature',
    divisor: 50, // -10 to 50, offset 10 (0 to 40)
    domain: [0, 0.3, 0.6, 1],
    range: ['#08306B', '#9ECAE1', '#FD9272', '#67000D'],
    unit: '°C',
    legendType: 'ramp'
  }
]

export const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020']
