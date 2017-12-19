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
  'NETINTERCHANGE': {
    colour: '#44146F',
    label: 'Import/Export'
  },
  'pumps': {
    colour: '#4A90E2',
    label: 'Pumps',
    categoryId: 'hydro'
  },
  'black_coal': {
    colour: '#000',
    label: 'Black Coal',
    categoryId: 'coal'
  },
  'brown_coal': {
    colour: '#8B572A',
    label: 'Brown Coal',
    categoryId: 'coal'
  },
  'biomass': {
    colour: '#A3886F',
    label: 'Biomass',
    categoryId: 'other'
  },
  'distillate': {
    colour: '#F35020',
    label: 'Distillate',
    categoryId: 'other'
  },
  'hydro': {
    colour: 'steelblue',
    label: 'Hydro',
    categoryId: 'hydro'
  },
  'gas_steam': {
    colour: '#F48E1B',
    label: 'Gas (Steam)',
    categoryId: 'gas'
  },
  'gas_ccgt': {
    colour: '#FDB462',
    label: 'Gas (CCGT)',
    categoryId: 'gas'
  },
  'gas_ocgt': {
    colour: '#FFCD96',
    label: 'Gas (OCGT)',
    categoryId: 'gas'
  },
  'gas_recip': {
    colour: '#F9DCBC',
    label: 'Gas (Reciprocating)',
    categoryId: 'gas'
  },
  'wind': {
    colour: '#417505',
    label: 'Wind',
    categoryId: 'wind'
  },
  'rooftop_solar': {
    colour: '#DFCF00',
    label: 'Solar (Rooftop)',
    categoryId: 'solar'
  },
  'solar': {
    colour: '#F8E71C',
    label: 'Solar',
    categoryId: 'solar'
  },

}
