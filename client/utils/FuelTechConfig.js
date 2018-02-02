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
    categoryId: 'hydro'
  },
  'battery_charging': {
    colour: '#fff',
    type: 'loads',
    label: 'Battery (Charging)',
    categoryId: 'other'
  },
  'exports': {
    colour: '#fff',
    type: 'loads',
    label: 'Exports'
  },
  'imports': {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports'
  },
  'black_coal': {
    colour: '#121212',
    type: 'sources',
    label: 'Black Coal',
    categoryId: 'coal'
  },
  'brown_coal': {
    colour: '#8B572A',
    type: 'sources',
    label: 'Brown Coal',
    categoryId: 'coal'
  },
  'biomass': {
    colour: '#A3886F',
    type: 'sources',
    label: 'Biomass',
    categoryId: 'other'
  },
  'distillate': {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    categoryId: 'other'
  },
  'battery_discharging': {
    colour: '#00A2FA',
    type: 'sources',
    label: 'Battery (Discharging)',
    categoryId: 'other'
  },
  'hydro': {
    colour: '#4582B4',
    type: 'sources',
    label: 'Hydro',
    categoryId: 'hydro'
  },
  'gas_steam': {
    colour: '#F48E1B',
    type: 'sources',
    label: 'Gas (Steam)',
    categoryId: 'gas'
  },
  'gas_ccgt': {
    colour: '#FDB462',
    type: 'sources',
    label: 'Gas (CCGT)',
    categoryId: 'gas'
  },
  'gas_ocgt': {
    colour: '#FFCD96',
    type: 'sources',
    label: 'Gas (OCGT)',
    categoryId: 'gas'
  },
  'gas_recip': {
    colour: '#F9DCBC',
    type: 'sources',
    label: 'Gas (Reciprocating)',
    categoryId: 'gas'
  },
  'wind': {
    colour: '#417505',
    type: 'sources',
    label: 'Wind',
    categoryId: 'wind'
  },
  'rooftop_solar': {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Rooftop)',
    categoryId: 'solar'
  },
  'rooftop_forecast': {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Rooftop) — Forecast',
    categoryId: 'solar'
  },
  'solar': {
    colour: '#F8E71C',
    type: 'sources',
    label: 'Solar (Utility)',
    categoryId: 'solar'
  },
  'price': {
    colour: '#000',
    type: 'other',
    label: 'Price',
    categoryId: 'price'
  },
  'pricePos': {
    colour: '#000',
    type: 'other',
    label: 'Price (Positive only)',
    categoryId: 'price'
  },
  'priceNeg': {
    colour: '#000',
    type: 'other',
    label: 'Price (Negative only)',
    categoryId: 'price'
  },
  'temperature': {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature'
  },
}
