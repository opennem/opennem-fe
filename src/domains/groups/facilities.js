export default {
  groupSelectionName: 'Facilities',
  groups: [
    {
      id: 'group_solar',
      label: 'Solar',
      type: 'sources',
      colour: '#F8E71C',
      fields: ['solar', 'rooftop_solar'],
    },

    {
      id: 'group_wind',
      label: 'Wind',
      type: 'sources',
      colour: '#417505',
      fields: ['wind'],
    },

    {
      id: 'group_hydro',
      label: 'Hydro',
      type: 'sources',
      colour: '#4582B4',
      fields: ['hydro'],
    },

    {
      id: 'group_battery_discharging',
      label: 'Battery (Discharging)',
      type: 'sources',
      colour: '#00A2FA',
      fields: ['battery_discharging'],
    },

    {
      id: 'group_gas',
      label: 'Gas',
      type: 'sources',
      colour: '#F48E1B',
      fields: ['gas_recip', 'gas_ocgt', 'gas_ccgt', 'gas_steam', 'gas_wcmg'],
    },

    {
      id: 'group_distillate',
      label: 'Distillate',
      type: 'sources',
      colour: '#F35020',
      fields: ['distillate'],
    },

    {
      id: 'group_bioenergy',
      label: 'Bioenergy',
      type: 'sources',
      colour: '#1D7A7A',
      fields: ['bioenergy_biomass', 'bioenergy_biogas'],
    },

    {
      id: 'group_coal',
      label: 'Coal',
      type: 'sources',
      colour: '#131313',
      fields: ['black_coal', 'brown_coal'],
    },
  ],
};