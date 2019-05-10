const GraphDomains = {
  pumps: {
    colour: '#88AFD0',
    type: 'loads',
    label: 'Pumps',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'pumps.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Pumps Market Value',
    categoryId: 'price',
    unit: '$',
  },
  battery_charging: {
    colour: '#B2DAEF',
    type: 'loads',
    label: 'Battery (Charging)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'battery_charging.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Battery (Charging) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  exports: {
    colour: '#977AB1',
    type: 'loads',
    label: 'Exports',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'exports.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Exports Market Value',
    categoryId: 'price',
    unit: '$',
  },
  imports: {
    colour: '#44146F',
    type: 'sources',
    label: 'Imports',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'imports.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Imports Market Value',
    categoryId: 'price',
    unit: '$',
  },
  brown_coal: {
    colour: '#8B572A',
    type: 'sources',
    label: 'Brown Coal',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'brown_coal.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Brown Coal Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'brown_coal.emissions': {
    colour: '#8B572A',
    type: 'emissions',
    label: 'Brown Coal Emissions',
    unit: '',
  },
  black_coal: {
    colour: '#121212',
    type: 'sources',
    label: 'Black Coal',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'black_coal.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Black Coal Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'black_coal.emissions': {
    colour: '#121212',
    type: 'emissions',
    label: 'Black Coal Emissions',
    unit: '',
  },
  biomass: {
    colour: '#A3886F',
    type: 'sources',
    label: 'Biomass',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'biomass.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Biomass Market Value',
    categoryId: 'price',
    unit: '$',
  },
  distillate: {
    colour: '#F35020',
    type: 'sources',
    label: 'Distillate',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'distillate.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Distillate Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'distillate.emissions': {
    colour: '#F35020',
    type: 'emissions',
    label: 'Distillate Emissions',
    unit: '',
  },
  gas_steam: {
    colour: '#F48E1B',
    type: 'sources',
    label: 'Gas (Steam)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'gas_steam.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Gas (Steam) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'gas_steam.emissions': {
    colour: '#F48E1B',
    type: 'emissions',
    label: 'Gas (Steam) Emissions',
    unit: '',
  },
  gas_ccgt: {
    colour: '#FDB462',
    type: 'sources',
    label: 'Gas (CCGT)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'gas_ccgt.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Gas (CCGT) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'gas_ccgt.emissions': {
    colour: '#FDB462',
    type: 'emissions',
    label: 'Gas (CCGT) Emissions',
    unit: '',
  },
  gas_ocgt: {
    colour: '#FFCD96',
    type: 'sources',
    label: 'Gas (OCGT)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'gas_ocgt.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Gas (OCGT) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'gas_ocgt.emissions': {
    colour: '#FFCD96',
    type: 'emissions',
    label: 'Gas (OCGT) Emissions',
    unit: '',
  },
  gas_recip: {
    colour: '#F9DCBC',
    type: 'sources',
    label: 'Gas (Reciprocating)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'gas_recip.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Gas (Reciprocating) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'gas_recip.emissions': {
    colour: '#F9DCBC',
    type: 'emissions',
    label: 'Gas (Reciprocating) Emissions',
    unit: '',
  },
  gas_lfg: {
    colour: '#DD8018',
    type: 'sources',
    label: 'Gas (Landfill)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'gas_lfg.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Gas (Landfill) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  'gas_lfg.emissions': {
    colour: '#DD8018',
    type: 'emissions',
    label: 'Gas (Landfill) Emissions',
    unit: '',
  },
  battery_discharging: {
    colour: '#00A2FA',
    type: 'sources',
    label: 'Battery (Discharging)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'battery_discharging.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Battery (Discharging) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  hydro: {
    colour: '#4582B4',
    type: 'sources',
    label: 'Hydro',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'hydro.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Hydro Market Value',
    categoryId: 'price',
    unit: '$',
  },
  wind: {
    colour: '#417505',
    type: 'sources',
    label: 'Wind',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'wind.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Wind Market Value',
    categoryId: 'price',
    unit: '$',
  },
  solar: {
    colour: '#DFCF00',
    type: 'sources',
    label: 'Solar (Utility)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'solar.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Solar (Utility) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  rooftop_solar: {
    colour: '#F8E71C',
    type: 'sources',
    label: 'Solar (Rooftop)',
    powerUnit: 'MW',
    energyUnit: 'GWh',
  },
  'rooftop_solar.market_value': {
    colour: '#000',
    type: 'market_value',
    label: 'Solar (Rooftop) Market Value',
    categoryId: 'price',
    unit: '$',
  },
  temperature: {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature',
    unit: 'C',
  },
  temperature_mean: {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature',
    unit: 'C',
  },
  temperature_min: {
    colour: '#000',
    type: 'other',
    label: 'Temperature',
    categoryId: 'temperature',
    unit: 'C',
  },
  temperature_max: {
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
  volume_weighted_price: {
    colour: '#000',
    type: 'other',
    label: 'Volume Weighted Price',
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
  emission_intensity: {
    colour: '#000',
    type: 'emission_intensity',
    label: 'Emission Intensity',
    unit: '',
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

function isValidFuelTech(id) {
  const domain = GraphDomains[id];
  return domain && (domain.type === 'sources' || domain.type === 'loads');
}

function isRenewableFuelTech(id) {
  return id === 'wind' ||
    id === 'biomass' ||
    id === 'hydro' ||
    id === 'rooftop_solar' ||
    id === 'solar';
}

function isPrice(id) {
  return id === 'price' || id === 'volume_weighted_price';
}

function isFTMarketValue(id) {
  const domain = GraphDomains[id];
  return domain && domain.type === 'market_value';
}

function isFTEmissions(id) {
  const domain = GraphDomains[id];
  return domain && domain.type === 'emissions';
}

function isTemperature(id) {
  return id === 'temperature' ||
  id === 'temperature_mean' ||
  id === 'temperature_min' ||
  id === 'temperature_max';
}

function isRooftopSolar(id) {
  return id === 'rooftop_solar';
}

function isLoads(id) {
  const domain = GraphDomains[id];
  return domain.type === 'loads';
}

function isImports(id) {
  return id === 'imports';
}

function getCSVHeaders(visType) {
  // const headers = {
  //   Time: 'date',
  // };
  const headers = {
    date: 'Time',
  };

  Object.keys(GraphDomains).reverse().forEach((domain) => {
    function isValidCsvHeader(name) {
      return name !== 'pricePos' && name !== 'priceNeg';
    }

    if (isValidCsvHeader(domain)) {
      const ftLabel = GraphDomains[domain].label;
      const ftUnit = getUnit(domain, visType);
      const label = `${ftLabel} - ${ftUnit}`;
      headers[domain] = label;
    }
  });

  return headers;
}

export {
  GraphDomains,
  getCSVHeaders,
  isLoads,
  isImports,
  isValidFuelTech,
  isRenewableFuelTech,
  isPrice,
  isFTMarketValue,
  isFTEmissions,
  isTemperature,
  isRooftopSolar,
};
