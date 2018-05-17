/**
 * Fixed date ranges
 */
const DateRanges = [
  {
    id: 'last24hrs',
    label: 'Last 24 hours',
    minPeriod: '5mm',
    groupToPeriods: ['5mm'],
  },
  {
    id: 'last7days',
    label: 'Last 7 days',
    minPeriod: '5mm',
    groupToPeriods: ['5mm', '30mm'],
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
    minPeriod: 'DD',
    groupToPeriods: ['DD'],
  },
];

function dateRanges() {
  return DateRanges;
}

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
  dateRanges,
  findRange,
  getDateRangeLabel,
  getDateRangeId,
  isLast24Hrs,
};
