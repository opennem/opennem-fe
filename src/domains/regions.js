const RegionDomains = [
  {
    id: 'nsw',
    label: 'New South Wales',
  },
  {
    id: 'qld',
    label: 'Queensland',
  },
  {
    id: 'sa',
    label: 'South Australia',
  },
  {
    id: 'tas',
    label: 'Tasmania',
  },
  {
    id: 'vic',
    label: 'Victoria',
  },
];

function getAllRegions() {
  return RegionDomains;
}

function getRegionLabel(id) {
  const region = RegionDomains.find(r => r.id === id);
  return region ? region.label : '';
}

function getRegionId(label) {
  const region = RegionDomains.find(r => r.label.toLowerCase() === label.toLowerCase());
  return region ? region.id : '';
}

export {
  getAllRegions,
  getRegionLabel,
  getRegionId,
};
