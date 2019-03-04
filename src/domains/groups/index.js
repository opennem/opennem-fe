import defaultGroup from './default';
import expandedGroup from './expanded';
import flexibilityGroup from './flexibility';
import renewablesVFossilsGroup from './renewables-v-fossils';
import solarVDemandGroup from './solar-v-demand';

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
  ];
}

defaultGroup.groups = appendGroups(defaultGroup.groups);
expandedGroup.groups = appendGroups(expandedGroup.groups);
flexibilityGroup.groups = appendGroups(flexibilityGroup.groups);
renewablesVFossilsGroup.groups = appendGroups(renewablesVFossilsGroup.groups);
solarVDemandGroup.groups = appendGroups(solarVDemandGroup.groups);

defaultGroup.groups.reverse();
expandedGroup.groups.reverse();
flexibilityGroup.groups.reverse();
renewablesVFossilsGroup.groups.reverse();
solarVDemandGroup.groups.reverse();

// create .market_value for each ft
// create emissionsIntensity, price/priceNeg/pricePos,
// temperature /_min/_max/_mean, volume_weighted_price

const SourceGroups = [
  expandedGroup,
  defaultGroup,
  flexibilityGroup,
  renewablesVFossilsGroup,
  solarVDemandGroup,
];

export default SourceGroups;
