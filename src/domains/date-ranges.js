/**
 * Fixed date ranges
 */
const DateRanges = [
  {
    id: '24hrs',
    label: 'Last 24 hours',
  },
  {
    id: '7days',
    label: 'Last 7 days',
  },
  {
    id: '30days',
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

export {
  dateRanges,
  getDateRangeLabel,
  getDateRangeId,
};
