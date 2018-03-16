export const REGIONS = [
  {
    id: 'all',
    label: 'All Regions'
  },
  {
    id: 'nsw',
    label: 'New South Wales'
  },
  {
    id: 'qld',
    label: 'Queensland'
  },
  {
    id: 'sa',
    label: 'South Australia'
  },
  {
    id: 'tas',
    label: 'Tasmania'
  },
  {
    id: 'vic',
    label: 'Victoria'
  }
]

export const FUEL_TECH_GROUPS = [
  {
    id: 'coal',
    label: 'Coal'
  },
  {
    id: 'other',
    label: 'Other (Distillate...)'
  },
  {
    id: 'gas',
    label: 'Gas'
  },
  {
    id: 'Hydro',
    label: 'Hydro (including Pumps)'
  },
  {
    id: 'wind',
    label: 'Wind'
  },
  {
    id: 'solar',
    label: 'Solar'
  }
]

export const FUEL_TECH = {
  'pumps': {
    colour: '#fff',
    type: 'loads',
    label: 'Pumps',
    categoryId: 'hydro',
    unit: 'MW'
  },
  'battery_charging': {
    colour: '#fff',
    type: 'loads',
    label: 'Battery (Charging)',
    categoryId: 'other',
    unit: 'MW'
  },
  'exports': {
    colour: '#fff',
    type: 'loads',
    label: 'Exports',
    unit: 'MW'
  },
  'imports': {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports',
    unit: 'MW'
  },
  'black_coal': {
    colour: '#121212',
    type: 'sources',
    label: 'Black Coal',
    categoryId: 'coal',
    unit: 'MW'
  },
  'brown_coal': {
    colour: '#8B572A',
    type: 'sources',
    label: 'Brown Coal',
    categoryId: 'coal',
    unit: 'MW'
  },
  'biomass': {
    colour: '#A3886F',
    type: 'sources',
    label: 'Biomass',
    categoryId: 'other',
    unit: 'MW'
  },
  'distillate': {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    categoryId: 'other',
    unit: 'MW'
  },
  'battery_discharging': {
    colour: '#00A2FA',
    type: 'sources',
    label: 'Battery (Discharging)',
    categoryId: 'other',
    unit: 'MW'
  },
  'hydro': {
    colour: '#4582B4',
    type: 'sources',
    label: 'Hydro',
    categoryId: 'hydro',
    unit: 'MW'
  },
  'gas_steam': {
    colour: '#F48E1B',
    type: 'sources',
    label: 'Gas (Steam)',
    categoryId: 'gas',
    unit: 'MW'
  },
  'gas_ccgt': {
    colour: '#FDB462',
    type: 'sources',
    label: 'Gas (CCGT)',
    categoryId: 'gas',
    unit: 'MW'
  },
  'gas_ocgt': {
    colour: '#FFCD96',
    type: 'sources',
    label: 'Gas (OCGT)',
    categoryId: 'gas',
    unit: 'MW'
  },
  'gas_recip': {
    colour: '#F9DCBC',
    type: 'sources',
    label: 'Gas (Reciprocating)',
    categoryId: 'gas',
    unit: 'MW'
  },
  'wind': {
    colour: '#417505',
    type: 'sources',
    label: 'Wind',
    categoryId: 'wind',
    unit: 'MW'
  },
  'rooftop_solar': {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Rooftop)',
    categoryId: 'solar',
    unit: 'MW'
  },
  'solar': {
    colour: '#F8E71C',
    type: 'sources',
    label: 'Solar (Utility)',
    categoryId: 'solar',
    unit: 'MW'
  },
  'temperature': {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature',
    unit: 'C'
  },
  'price': {
    colour: '#000',
    type: 'other',
    label: 'Trading Price',
    categoryId: 'price',
    unit: '$/MWh'
  },
  'pricePos': {
    colour: '#000',
    type: 'other',
    label: 'Price (Positive only)',
    categoryId: 'price',
    unit: '$/MWh'
  },
  'priceNeg': {
    colour: '#000',
    type: 'other',
    label: 'Price (Negative only)',
    categoryId: 'price',
    unit: '$/MWh'
  }
}

const headers = {
  'Time': 'date'
}
Object.keys(FUEL_TECH).reverse().forEach(ft => {
  function isValidCsvHeader (name) {
    return name !== 'pricePos' &&
      name !== 'priceNeg'
  }

  if (isValidCsvHeader(ft)) {
    const ftLabel = FUEL_TECH[ft].label
    const ftUnit = FUEL_TECH[ft].unit
    const label = `${ftLabel} - ${ftUnit}`
    headers[label] = ft
  }
})

export const CSV_HEADERS = headers

