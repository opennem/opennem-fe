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
  },
  {
    id: 'last7days',
    label: 'Last 7 days',
    minPeriod: '5mm',
    groupToPeriods: ['5mm', '30mm'],
    visType: 'power',
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
    minPeriod: 'DD',
    groupToPeriods: ['DD'],
    visType: 'energy',
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
  return id === DateRanges[0].id;
}

export {
  findRange,
  getDateRangeLabel,
  getDateRangeId,
  isLast24Hrs,
};
