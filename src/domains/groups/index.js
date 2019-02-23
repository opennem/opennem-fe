import defaultGroup from './default';
import expandedGroup from './expanded';
import flexibilityGroup from './flexibility';
import renewablesVFossilsGroup from './renewables-v-fossils';
import solarVDemandGroup from './solar-v-demand';

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

defaultGroup.groups = [...defaultGroup.groups, ...temperatureDomains, ...priceDomains];
expandedGroup.groups = [...expandedGroup.groups, ...temperatureDomains, ...priceDomains];
flexibilityGroup.groups = [...flexibilityGroup.groups, ...temperatureDomains, ...priceDomains];
renewablesVFossilsGroup.groups = [...renewablesVFossilsGroup.groups,
  ...temperatureDomains, ...priceDomains];
solarVDemandGroup.groups = [...solarVDemandGroup.groups, ...temperatureDomains, ...priceDomains];

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
