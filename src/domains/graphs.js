const GraphDomains = {
  pumps: {
    colour: '#fff',
    type: 'loads',
    label: 'Pumps',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  battery_charging: {
    colour: '#fff',
    type: 'loads',
    label: 'Battery (Charging)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  exports: {
    colour: '#fff',
    type: 'loads',
    label: 'Exports',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  imports: {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  black_coal: {
    colour: '#121212',
    type: 'sources',
    label: 'Black Coal',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  brown_coal: {
    colour: '#8B572A',
    type: 'sources',
    label: 'Brown Coal',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  biomass: {
    colour: '#A3886F',
    type: 'sources',
    label: 'Biomass',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  distillate: {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  battery_discharging: {
    colour: '#00A2FA',
    type: 'sources',
    label: 'Battery (Discharging)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  hydro: {
    colour: '#4582B4',
    type: 'sources',
    label: 'Hydro',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  gas_steam: {
    colour: '#F48E1B',
    type: 'sources',
    label: 'Gas (Steam)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  gas_ccgt: {
    colour: '#FDB462',
    type: 'sources',
    label: 'Gas (CCGT)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  gas_ocgt: {
    colour: '#FFCD96',
    type: 'sources',
    label: 'Gas (OCGT)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  gas_recip: {
    colour: '#F9DCBC',
    type: 'sources',
    label: 'Gas (Reciprocating)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  wind: {
    colour: '#417505',
    type: 'sources',
    label: 'Wind',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  solar: {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Utility)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  rooftop_solar: {
    colour: '#F8E71C',
    type: 'sources',
    label: 'Solar (Rooftop)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
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

function getUnit(domain, visType) {
  let unit = GraphDomains[domain].unit;
  if (!unit) {
    const type = visType || 'power';
    unit = GraphDomains[domain][`${type}Unit`];
  }
  return unit;
}

function getCSVHeaders(visType) {
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
      const ftUnit = getUnit(domain, visType);
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
