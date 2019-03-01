export default {
  groupSelectionName: 'All fuel technologies',
  groups: [
    {
      id: 'rooftop_solar',
      label: 'Solar (Rooftop)',
      type: 'sources',
      colour: '#F8E71C',
      fields: ['rooftop_solar'],
    },
    {
      id: 'solar',
      label: 'Solar (Utility)',
      type: 'sources',
      colour: '#DFCF00',
      fields: ['solar'],
    },

    {
      id: 'wind',
      label: 'Wind',
      type: 'sources',
      colour: '#417505',
      fields: ['wind'],
    },

    {
      id: 'hydro',
      label: 'Hydro',
      type: 'sources',
      colour: '#4582B4',
      fields: ['hydro'],
    },

    {
      id: 'battery_discharging',
      label: 'Battery (Discharging)',
      type: 'sources',
      colour: '#00A2FA',
      fields: ['battery_discharging'],
    },

    {
      id: 'gas_recip',
      label: 'Gas (Reciprocating)',
      type: 'sources',
      colour: '#F9DCBC',
      fields: ['gas_recip'],
    },
    {
      id: 'gas_ocgt',
      label: 'Gas (OCGT)',
      type: 'sources',
      colour: '#FFCD96',
      fields: ['gas_ocgt'],
    },
    {
      id: 'gas_ccgt',
      label: 'Gas (CCGT)',
      type: 'sources',
      colour: '#FDB462',
      fields: ['gas_ccgt'],
    },
    {
      id: 'gas_steam',
      label: 'Gas (Steam)',
      type: 'sources',
      colour: '#F48E1B',
      fields: ['gas_steam'],
    },

    {
      id: 'distillate',
      label: 'Distillate',
      type: 'sources',
      colour: '#F35020',
      fields: ['distillate'],
    },

    {
      id: 'biomass',
      label: 'Biomass',
      type: 'sources',
      colour: '#A3886F',
      fields: ['biomass'],
    },

    {
      id: 'black_coal',
      label: 'Black Coal',
      type: 'sources',
      colour: '#121212',
      fields: ['black_coal'],
    },
    {
      id: 'brown_coal',
      label: 'Brown Coal',
      type: 'sources',
      colour: '#8B572A',
      fields: ['brown_coal'],
    },
  ],
};
