/**
 * Region id and labels
 * - offset in hours
 */
const RegionDomains = [
  {
    id: 'nsw',
    label: 'New South Wales',
    offset: 10,
  },
  {
    id: 'qld',
    label: 'Queensland',
    offset: 10,
  },
  {
    id: 'sa',
    label: 'South Australia',
    offset: 9.5,
  },
  {
    id: 'tas',
    label: 'Tasmania',
    offset: 10,
  },
  {
    id: 'vic',
    label: 'Victoria',
    offset: 10,
  },
];

function getAllRegions() {
  return RegionDomains;
}

function getRegionLabel(id) {
  const region = RegionDomains.find(r => r.id === id);
  return region ? region.label : '';
}

function getRegionLabelByCode(code) {
  const id = code.slice(0, code.length - 1);
  const region = RegionDomains.find(r => r.id === id.toLowerCase());
  return region ? region.label : code;
}

function getRegionId(label) {
  const region = RegionDomains.find(r => r.label.toLowerCase() === label.toLowerCase());
  return region ? region.id : '';
}

function getRegionOffset(id) {
  const region = RegionDomains.find(r => r.id === id);
  return region ? region.offset : undefined;
}

export {
  getAllRegions,
  getRegionLabel,
  getRegionId,
  getRegionOffset,
  getRegionLabelByCode,
};
