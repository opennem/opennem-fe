export const REGIONS = [
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
    colour: '#4A90E2',
    type: 'loads',
    label: 'Pumps',
    categoryId: 'hydro'
  },
  'NETINTERCHANGE': {
    colour: '#44146F',
    type: 'loads',
    label: 'Import/Export'
  },
  'exports': {
    colour: '#44146F',
    type: 'loads',
    label: 'Exports'
  },
  'imports': {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports'
  },
  'black_coal': {
    colour: '#000',
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
  'hydro': {
    colour: 'steelblue',
    type: 'sources',
    label: 'Hydro',
    categoryId: 'hydro'
  },
  'distillate': {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    categoryId: 'other'
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
    label: 'Solar',
    categoryId: 'solar'
  },

}
