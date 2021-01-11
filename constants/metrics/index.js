import eachYearOfInterval from 'date-fns/eachYearOfInterval'
import eachMonthOfInterval from 'date-fns/eachMonthOfInterval'
import eachDayOfInterval from 'date-fns/eachDayOfInterval'

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
    domain: [0, 0.1, 0.55, 1],
    range: ['#2D9B14', '#ffe310', '#803D11', '#000000'],
    unit: ' kgCO₂e/MWh',
    legendType: 'ramp'
  },
  {
    label: 'Renewables Proportion (of demand)',
    value: 'renewablesProportion',
    divisor: 100,
    domain: [0, 0.5, 1],
    range: ['#fff', '#52BCA3', 'darkgreen'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Wind Proportion (of demand)',
    value: 'windProportion',
    divisor: 100,
    domain: [0, 0.5, 1],
    range: ['#fff', '#88B653', '#417505'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Solar Proportion (of demand)',
    value: 'solarProportion',
    divisor: 100,
    domain: [0, 0.5, 1],
    range: ['#fff', '#F3E13E', '#F0D800'],
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
    legendType: 'ramp',
    showZeroBlock: true
  },
  {
    label: 'Gas Proportion (of demand)',
    value: 'gasProportion',
    divisor: 100,
    domain: [0, 0.001, 0.5],
    range: ['#52BCA3', '#ccc', '#F48E1B'],
    unit: '%',
    legendType: 'ramp',
    showZeroBlock: true
  },
  // {
  //   label: 'Net Exports/Imports',
  //   value: 'importsExports',
  //   valueProp: 'sumImportsExports',
  //   divisor: 'importsExports',
  //   domain: [0, 1],
  //   domainLabel: ['Net exports', 'Net imports'],
  //   range: ['#977AB1', '#44146F'],
  //   unit: ' GWh',
  //   legendType: 'swatch'
  // },
  {
    label: 'Net Interconnector Flow (of demand)',
    value: 'netInterconnectorFlow',
    divisor: 50, // -25 to 25.
    offset: 25,
    domain: [0, 0.5, 1],
    range: ['#2E69A3', '#fff', '#AC3837'], // F5EDE9
    domainLabel: ['Export', 'Import'],
    unit: '%',
    legendType: 'ramp'
  },
  {
    label: 'Volume-weighted Price',
    value: 'price',
    divisor: 16000, // -1000 to 15000
    offset: 1000,
    domain: [0, 0.0625, 0.0656, 0.0688, 0.0813, 0.125, 0.375, 1],
    domainLabel: ['-$1k', '$0', '$50', '$100', '$300', '$1k', '$5k', '$15k'],
    range: [
      '#613C9E',
      '#28609A',
      '#76ACCE',
      '#F0BA9F',
      '#DF8E73',
      '#C5594C',
      '#99292F',
      '#621020'
    ],
    unit: '',
    numberFormatString: '$,.2f',
    legendType: 'swatch'
  },
  {
    label: 'Volume-weighted Price (inflation adjusted)',
    value: 'inflatedPrice',
    divisor: 16000, // -1000 to 15000
    offset: 1000,
    domain: [0, 0.0625, 0.0656, 0.0688, 0.0813, 0.125, 0.375, 1],
    domainLabel: ['-$1k', '$0', '$50', '$100', '$300', '$1k', '$5k', '$15k'],
    range: [
      '#613C9E',
      '#28609A',
      '#76ACCE',
      '#F0BA9F',
      '#DF8E73',
      '#C5594C',
      '#99292F',
      '#621020'
    ],
    unit: '',
    numberFormatString: '$,.2f',
    legendType: 'swatch'
  },
  {
    label: 'Average Temperature',
    value: 'temperature',
    divisor: 60, // -10 to 50
    offset: 10,
    domain: [0, 0.3, 0.6, 1],
    range: ['#08306B', '#9ECAE1', '#FD9272', '#67000D'],
    unit: '°C',
    numberFormatString: ',.1f',
    legendType: 'ramp'
  },
  {
    label: 'Max Temperature',
    value: 'maxTemperature',
    divisor: 60, // -10 to 50
    offset: 10,
    domain: [0, 0.3, 0.6, 1],
    range: ['#08306B', '#9ECAE1', '#FD9272', '#67000D'],
    unit: '°C',
    numberFormatString: ',.1f',
    legendType: 'ramp'
  }
]

const dataStartYear = 2010
const dataStartMonth = 10 // 0 - Jan, 11 - Dec

export const yearsBucket = eachYearOfInterval({
  start: new Date(dataStartYear, 0, 1),
  end: new Date()
}).map(d => d.getFullYear())

export const yearDailyRangeBucket = year => {
  return eachDayOfInterval({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31)
  }).map(d => {
    return {
      date: d,
      time: d.getTime()
    }
  })
}

export const allRangeBucket = () => {
  return eachMonthOfInterval({
    start: new Date(dataStartYear, dataStartMonth, 1),
    end: new Date() // to Now
  }).map(d => {
    return {
      date: d,
      time: d.getTime()
    }
  })
}
