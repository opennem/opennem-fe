import simplified from './simplified';
import detailed from './detailed';
import flexibilityGroup from './flexibility';
import renewableFossil from './renewable-fossil';
import solarResidual from './solar-residual';

const additionalDomains = [
  {
    id: 'imports',
    label: 'Imports',
    type: 'sources',
    colour: '#44146F',
    fields: ['imports'],
  },

  {
    id: 'exports',
    label: 'Exports',
    type: 'loads',
    colour: '#977AB1',
    fields: ['exports'],
  },

  {
    id: 'battery_charging',
    label: 'Battery (Charging)',
    type: 'loads',
    colour: '#B2DAEF',
    fields: ['battery_charging'],
  },

  {
    id: 'pumps',
    label: 'Pumps',
    type: 'loads',
    colour: '#88AFD0',
    fields: ['pumps'],
  },
];
const temperatureDomains = [
  {
    id: 'temperature',
    label: 'Temperature',
    type: 'temperature',
    colour: '#000',
    fields: ['temperature'],
  },
  {
    id: 'temperature_mean',
    label: 'Temperature',
    type: 'temperature',
    colour: '#000',
    fields: ['temperature_mean'],
  },
  {
    id: 'temperature_min',
    label: 'Temperature',
    type: 'temperature',
    colour: '#000',
    fields: ['temperature_min'],
  },
  {
    id: 'temperature_max',
    label: 'Temperature',
    type: 'temperature',
    colour: '#000',
    fields: ['temperature_max'],
  },
];
const priceDomains = [
  {
    id: 'price',
    label: 'Trading Price',
    type: 'price',
    colour: '#000',
    fields: ['price'],
  },
  {
    id: 'pricePos',
    label: 'Price (Positive only)',
    type: 'price',
    colour: '#000',
    fields: ['pricePos'],
  },
  {
    id: 'priceNeg',
    label: 'Price (Negative only)',
    type: 'price',
    colour: '#000',
    fields: ['priceNeg'],
  },
  {
    id: 'volume_weighted_price',
    label: 'Volume Weighted Price',
    type: 'price',
    colour: '#000',
    fields: ['volume_weighted_price'],
  },
];
const marketValueDomains = [
  {
    id: 'rooftop_solar.market_value',
    label: 'Solar (Rooftop) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['rooftop_solar.market_value'],
  },

  {
    id: 'solar.market_value',
    label: 'Solar (Utility) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['solar.market_value'],
  },

  {
    id: 'wind.market_value',
    label: 'Wind Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['wind.market_value'],
  },

  {
    id: 'hydro.market_value',
    label: 'Hydro Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['hydro.market_value'],
  },

  {
    id: 'battery_discharging.market_value',
    label: 'Battery (Discharging) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['battery_discharging.market_value'],
  },

  {
    id: 'gas_recip.market_value',
    label: 'Gas (Reciprocating) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['gas_recip.market_value'],
  },

  {
    id: 'gas_ocgt.market_value',
    label: 'Gas (OCGT) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['gas_ocgt.market_value'],
  },

  {
    id: 'gas_ccgt.market_value',
    label: 'Gas (CCGT) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['gas_ccgt.market_value'],
  },

  {
    id: 'gas_steam.market_value',
    label: 'Gas (Steam) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['gas_steam.market_value'],
  },

  {
    id: 'distillate.market_value',
    label: 'Distillate Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['distillate.market_value'],
  },

  {
    id: 'biomass.market_value',
    label: 'Biomass Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['biomass.market_value'],
  },

  {
    id: 'black_coal.market_value',
    label: 'Black Coal Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['black_coal.market_value'],
  },

  {
    id: 'brown_coal.market_value',
    label: 'Brown Coal Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['brown_coal.market_value'],
  },

  {
    id: 'imports.market_value',
    label: 'Imports Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['imports.market_value'],
  },

  {
    id: 'exports.market_value',
    label: 'Exports Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['exports.market_value'],
  },

  {
    id: 'battery_charging.market_value',
    label: 'Battery (Charging) Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['battery_charging.market_value'],
  },

  {
    id: 'pumps.market_value',
    label: 'Pumps Market Value',
    type: 'market_value',
    colour: '#000',
    fields: ['pumps.market_value'],
  },
];
const emissionsVolDomains = [
  {
    id: 'brown_coal.emissions',
    label: 'Brown Coal Emissions',
    type: 'emissions',
    colour: '#8B572A',
    fields: ['brown_coal.emissions'],
  },

  {
    id: 'black_coal.emissions',
    label: 'Black Coal Emissions',
    type: 'emissions',
    colour: '#121212',
    fields: ['black_coal.emissions'],
  },

  {
    id: 'distillate.emissions',
    label: 'Distillate Emissions',
    type: 'emissions',
    colour: '#F35020',
    fields: ['distillate.emissions'],
  },

  {
    id: 'gas_steam.emissions',
    label: 'Gas (Steam) Emissions',
    type: 'emissions',
    colour: '#F48E1B',
    fields: ['gas_steam.emissions'],
  },

  {
    id: 'gas_ccgt.emissions',
    label: 'Gas (CCGT) Emissions',
    type: 'emissions',
    colour: '#FDB462',
    fields: ['gas_ccgt.emissions'],
  },

  {
    id: 'gas_ocgt.emissions',
    label: 'Gas (OCGT) Emissions',
    type: 'emissions',
    colour: '#FFCD96',
    fields: ['gas_ocgt.emissions'],
  },

  {
    id: 'gas_recip.emissions',
    label: 'Gas (Reciprocating) Emissions',
    type: 'emissions',
    colour: '#F9DCBC',
    fields: ['gas_recip.emissions'],
  },

  {
    id: 'emission_intensity',
    label: 'Emission Intensity',
    type: 'emission_intensity',
    colour: '#F9DCBC',
    fields: ['emission_intensity'],
  },
];

function appendGroups(groups) {
  const groupMarketValues = [];
  groups.forEach((g) => {
    const fieldsMVArr = [];
    g.fields.forEach((f) => {
      fieldsMVArr.push(`${f}.market_value`);
    });
    groupMarketValues.push({
      id: `${g.id}.market_value`,
      label: `${g.label} Market Value`,
      type: 'market_value',
      colour: '#000',
      fields: fieldsMVArr,
    });
  });
  return [
    ...groups,
    ...groupMarketValues,
    ...additionalDomains,
    ...marketValueDomains,
    ...temperatureDomains,
    ...priceDomains,
    ...emissionsVolDomains,
  ];
}

simplified.groups = appendGroups(simplified.groups);
detailed.groups = appendGroups(detailed.groups);
flexibilityGroup.groups = appendGroups(flexibilityGroup.groups);
renewableFossil.groups = appendGroups(renewableFossil.groups);
solarResidual.groups = appendGroups(solarResidual.groups);

simplified.groups.reverse();
detailed.groups.reverse();
flexibilityGroup.groups.reverse();
renewableFossil.groups.reverse();
solarResidual.groups.reverse();

// create .market_value for each ft
// create emissionsIntensity, price/priceNeg/pricePos,
// temperature /_min/_max/_mean, volume_weighted_price

const SourceGroups = [
  detailed,
  simplified,
  flexibilityGroup,
  renewableFossil,
  solarResidual,
];

export default SourceGroups;
