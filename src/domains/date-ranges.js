/**
 * Fixed date ranges
 */
const DateRanges = [
  {
    id: 'last24hrs',
    label: 'Last 24 hours',
  },
  {
    id: 'last7days',
    label: 'Last 7 days',
  },
  {
    id: 'last30days',
    label: 'Last 30 days',
  },
];

function dateRanges() {
  return DateRanges;
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
  getDateRangeLabel,
  getDateRangeId,
  isLast24Hrs,
};
