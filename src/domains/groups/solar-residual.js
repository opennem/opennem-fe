export default {
  groupSelectionName: 'Solar/Residual',
  groups: [
    {
      id: 'group_solar',
      label: 'Solar',
      type: 'sources',
      colour: '#F8E71C', // F8E71C, ffff99
      fields: ['solar', 'rooftop_solar'],
    },

    {
      id: 'group_demand',
      label: 'Other generation',
      type: 'sources',
      colour: '#5D69B1', // 5D69B1, 386cb0
      fields: ['wind', 'hydro', 'battery_discharging', 'gas_recip',
        'gas_ocgt', 'gas_ccgt', 'gas_steam', 'distillate', 'biomass',
        'black_coal', 'brown_coal'],
    },
  ],
};
