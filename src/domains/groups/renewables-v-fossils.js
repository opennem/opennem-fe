export default {
  groupSelectionName: 'Renewables/Fossils Fuels',
  groups: [
    {
      id: 'group_renewables',
      label: 'Renewables',
      type: 'sources',
      colour: '#0F8554',
      fields: ['solar', 'rooftop_solar', 'wind', 'hydro'],
    },

    {
      id: 'group_fossils',
      label: 'Fossils',
      type: 'sources',
      colour: '#666666',
      fields: ['battery_discharging', 'gas_recip',
        'gas_ocgt', 'gas_ccgt', 'gas_steam', 'distillate', 'biomass',
        'black_coal', 'brown_coal'],
    },
  ],
};
