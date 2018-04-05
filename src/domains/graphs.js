const GraphDomains = {
  pumps: {
    colour: '#fff',
    type: 'loads',
    label: 'Pumps',
    unit: 'MW',
  },
  battery_charging: {
    colour: '#fff',
    type: 'loads',
    label: 'Battery (Charging)',
    unit: 'MW',
  },
  exports: {
    colour: '#fff',
    type: 'loads',
    label: 'Exports',
    unit: 'MW',
  },
  imports: {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports',
    unit: 'MW',
  },
  black_coal: {
    colour: '#121212',
    type: 'sources',
    label: 'Black Coal',
    unit: 'MW',
  },
  brown_coal: {
    colour: '#8B572A',
    type: 'sources',
    label: 'Brown Coal',
    unit: 'MW',
  },
  biomass: {
    colour: '#A3886F',
    type: 'sources',
    label: 'Biomass',
    unit: 'MW',
  },
  distillate: {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    unit: 'MW',
  },
  battery_discharging: {
    colour: '#00A2FA',
    type: 'sources',
    label: 'Battery (Discharging)',
    unit: 'MW',
  },
  hydro: {
    colour: '#4582B4',
    type: 'sources',
    label: 'Hydro',
    unit: 'MW',
  },
  gas_steam: {
    colour: '#F48E1B',
    type: 'sources',
    label: 'Gas (Steam)',
    unit: 'MW',
  },
  gas_ccgt: {
    colour: '#FDB462',
    type: 'sources',
    label: 'Gas (CCGT)',
    unit: 'MW',
  },
  gas_ocgt: {
    colour: '#FFCD96',
    type: 'sources',
    label: 'Gas (OCGT)',
    unit: 'MW',
  },
  gas_recip: {
    colour: '#F9DCBC',
    type: 'sources',
    label: 'Gas (Reciprocating)',
    unit: 'MW',
  },
  wind: {
    colour: '#417505',
    type: 'sources',
    label: 'Wind',
    unit: 'MW',
  },
  rooftop_solar: {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Rooftop)',
    unit: 'MW',
  },
  solar: {
    colour: '#F8E71C',
    type: 'sources',
    label: 'Solar (Utility)',
    unit: 'MW',
  },
  temperature: {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature',
    unit: 'C',
  },
  price: {
    colour: '#000',
    type: 'other',
    label: 'Trading Price',
    categoryId: 'price',
    unit: '$/MWh',
  },
  pricePos: {
    colour: '#000',
    type: 'other',
    label: 'Price (Positive only)',
    categoryId: 'price',
    unit: '$/MWh',
  },
  priceNeg: {
    colour: '#000',
    type: 'other',
    label: 'Price (Negative only)',
    categoryId: 'price',
    unit: '$/MWh',
  },
};

function getCSVHeaders() {
  const headers = {
    Time: 'date',
  };

  Object.keys(GraphDomains).reverse().forEach((domain) => {
    function isValidCsvHeader(name) {
      return name !== 'pricePos' &&
        name !== 'priceNeg';
    }

    if (isValidCsvHeader(domain)) {
      const ftLabel = GraphDomains[domain].label;
      const ftUnit = GraphDomains[domain].unit;
      const label = `${ftLabel} - ${ftUnit}`;
      headers[label] = domain;
    }
  });

  return headers;
}

export {
  GraphDomains,
  getCSVHeaders,
};
