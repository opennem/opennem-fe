export default {
  groupSelectionName: 'Flexibility',
  groups: [
    {
      id: 'group_variable',
      label: 'Variable',
      type: 'sources',
      colour: '#52BCA3',
      fields: ['solar', 'rooftop_solar', 'wind'],
    },

    {
      id: 'group_fastflex',
      label: 'Fast flexible',
      type: 'sources',
      colour: '#5D69B1',
      fields: ['hydro', 'gas_recip', 'gas_ocgt', 'gas_ccgt', 'gas_lfg', 'distillate', 'battery_discharging'],
    },

    {
      id: 'group_slowflex',
      label: 'Slow flexible',
      type: 'sources',
      colour: '#E58606',
      fields: ['black_coal', 'brown_coal', 'biomass', 'gas_steam'],
    },
  ],
};
