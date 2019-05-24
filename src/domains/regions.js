/**
 * Region id and labels
 * - offset in hours
 */

const Australia = {
  latitude: -29.186936,
  longitude: 143.633537,
};

const RegionDomains = [
  {
    id: 'nsw',
    label: 'New South Wales',
    abbr: 'NSW',
    offset: 10,
    location: {
      latitude: -32,
      longitude: 146,
    },
  },
  {
    id: 'qld',
    label: 'Queensland',
    abbr: 'Qld',
    offset: 10,
    location: {
      latitude: -23,
      longitude: 144,
    },
  },
  {
    id: 'sa',
    label: 'South Australia',
    abbr: 'SA',
    offset: 9.5,
    location: {
      latitude: -30,
      longitude: 135,
    },
  },
  {
    id: 'tas',
    label: 'Tasmania',
    abbr: 'Tas',
    offset: 10,
    location: {
      latitude: -42.035067,
      longitude: 146.636689,
    },
  },
  {
    id: 'vic',
    label: 'Victoria',
    abbr: 'Vic',
    offset: 10,
    location: {
      latitude: -36.59861,
      longitude: 144.678005,
    },
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

function getRegionAbbrByCode(code) {
  const id = code.slice(0, code.length - 1);
  const region = RegionDomains.find(r => r.id === id.toLowerCase());
  return region ? region.abbr : code;
}

function getRegionLocationById(id) {
  const region = RegionDomains.find(r => r.id === id.toLowerCase());
  return region ? region.location : Australia;
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
  getRegionAbbrByCode,
  getRegionLocationById,
};
