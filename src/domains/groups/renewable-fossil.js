export default {
  groupSelectionName: 'Renewable/Fossil',
  groups: [
    {
      id: 'group_renewables',
      label: 'Renewables',
      type: 'sources',
      colour: '#52BCA3', // 52BCA3, 0F8554
      fields: ['solar', 'rooftop_solar', 'wind', 'hydro', 'biomass'],
    },

    {
      id: 'group_fossils',
      label: 'Fossils',
      type: 'sources',
      colour: '#333',
      fields: ['battery_discharging', 'gas_recip',
        'gas_ocgt', 'gas_ccgt', 'gas_steam', 'gas_lfg', 'distillate',
        'black_coal', 'brown_coal'],
    },
  ],
};
