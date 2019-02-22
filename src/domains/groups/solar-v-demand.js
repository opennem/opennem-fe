export default {
  groupSelectionName: 'Solar/Residual Demand',
  groups: [
    {
      id: 'group_solar',
      label: 'Solar',
      type: 'sources',
      colour: '#ffff99',
      fields: ['solar', 'rooftop_solar'],
    },

    {
      id: 'group_demand',
      label: 'Demand',
      type: 'sources',
      colour: '#386cb0',
      fields: ['wind', 'hydro', 'battery_discharging', 'gas_recip',
        'gas_ocgt', 'gas_ccgt', 'gas_steam', 'distillate', 'biomass',
        'black_coal', 'brown_coal'],
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
