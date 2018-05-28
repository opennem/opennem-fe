/**
 * Fixed date ranges
 */
export const DateRanges = [
  {
    id: 'last24hrs',
    label: 'Last 24 hours',
    minPeriod: '5mm',
    groupToPeriods: ['5mm'],
    visType: 'power',
    folder: '',
    extension: '',
  },
  {
    id: 'last3days',
    label: 'Last 3 days',
    minPeriod: '5mm',
    groupToPeriods: ['5mm', '30mm'],
    visType: 'power',
    folder: '',
    extension: '',
  },
  {
    id: 'last7days',
    label: 'Last 7 days',
    minPeriod: '5mm',
    groupToPeriods: ['5mm', '30mm'],
    visType: 'power',
    folder: '',
    extension: '',
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
    minPeriod: 'DD',
    groupToPeriods: ['DD'],
    visType: 'energy',
    folder: '/history/daily',
    extension: '',
  },
  {
    id: 'last52weeksWeekly',
    label: 'Last 52 weeks (weekly)',
    minPeriod: 'WW',
    groupToPeriods: ['WW'],
    visType: 'energy',
    folder: '/history/weekly',
    extension: '',
  },
  {
    id: 'last52weeksMonthly',
    label: 'Last 12 months (monthly)',
    minPeriod: 'MM',
    groupToPeriods: ['MM'],
    visType: 'energy',
    folder: '/history/monthly',
    extension: '',
  },
  {
    id: '2017Weekly',
    label: '2017 (weekly)',
    minPeriod: 'WW',
    groupToPeriods: ['WW'],
    visType: 'energy',
    folder: '/history/weekly',
    extension: '_2017',
  },
  {
    id: '2017Monthly',
    label: '2017 (monthly)',
    minPeriod: 'MM',
    groupToPeriods: ['MM'],
    visType: 'energy',
    folder: '/history/monthly',
    extension: '_2017',
  },
];

function findRange(id) {
  return DateRanges.find(r => r.id === id);
}

function getDateRangeLabel(id) {
  const dateRange = DateRanges.find(r => r.id === id);
  return dateRange ? dateRange.label : '';
}

function getDateRangeId(label) {
  const dateRange = DateRanges.find(r => r.label.toLowerCase() === label.toLowerCase());
  return dateRange ? dateRange.id : '';
}

function isLast24Hrs(id) {
  return id === 'last24hrs';
}
function isLast3Days(id) {
  return id === 'last3days';
}

export {
  findRange,
  getDateRangeLabel,
  getDateRangeId,
  isLast24Hrs,
  isLast3Days,
};
