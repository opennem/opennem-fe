export default {
  groupSelectionName: 'All fuel technologies',
  groups: [
    {
      id: 'group_rooftop_solar',
      label: 'Solar (Rooftop)',
      type: 'sources',
      colour: '#F8E71C',
      fields: ['rooftop_solar'],
    },
    {
      id: 'group_solar',
      label: 'Solar (Utility)',
      type: 'sources',
      colour: '#DFCF00',
      fields: ['solar'],
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
      id: 'group_gas_recip',
      label: 'Gas (Reciprocating)',
      type: 'sources',
      colour: '#F9DCBC',
      fields: ['gas_recip'],
    },
    {
      id: 'group_gas_ocgt',
      label: 'Gas (OCGT)',
      type: 'sources',
      colour: '#FFCD96',
      fields: ['gas_ocgt'],
    },
    {
      id: 'group_gas_ccgt',
      label: 'Gas (CCGT)',
      type: 'sources',
      colour: '#FDB462',
      fields: ['gas_ccgt'],
    },
    {
      id: 'group_gas_steam',
      label: 'Gas (Steam)',
      type: 'sources',
      colour: '#F48E1B',
      fields: ['gas_steam'],
    },

    {
      id: 'group_distillate',
      label: 'Distillate',
      type: 'sources',
      colour: '#F35020',
      fields: ['distillate'],
    },

    {
      id: 'group_biomass',
      label: 'Biomass',
      type: 'sources',
      colour: '#A3886F',
      fields: ['biomass'],
    },

    {
      id: 'group_black_coal',
      label: 'Black Coal',
      type: 'sources',
      colour: '#121212',
      fields: ['black_coal'],
    },
    {
      id: 'group_brown_coal',
      label: 'Brown Coal',
      type: 'sources',
      colour: '#8B572A',
      fields: ['brown_coal'],
    },
    {
      id: 'group_imports',
      label: 'Imports',
      type: 'sources',
      colour: '#44146F',
      fields: ['imports'],
    },
  ],
};
