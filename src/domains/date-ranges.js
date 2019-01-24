import * as VisTypes from '@/constants/vis-types';
import * as Periods from '@/constants/periods';
import { isMobileWidth } from '@/lib/browser';

/**
 * Fixed date ranges
 */
export const DateRanges = [
  {
    id: 'last24hrs',
    label: '1D',
    minPeriod: Periods.PERIOD_5_MINS,
    groupToPeriods: [Periods.PERIOD_5_MINS],
    visType: VisTypes.VIS_TYPE_POWER,
    folder: '',
    extension: '',
    periodFolders: {
      '5mm': '',
    },
  },
  {
    id: 'last3days',
    label: '3D',
    minPeriod: Periods.PERIOD_5_MINS,
    groupToPeriods: [Periods.PERIOD_5_MINS, Periods.PERIOD_30_MINS],
    visType: 'power',
    folder: '',
    extension: '',
    periodFolders: {
      '5mm': '',
      '30mm': '',
    },
  },
  {
    id: 'last7days',
    label: '7D',
    minPeriod: Periods.PERIOD_5_MINS,
    groupToPeriods: [Periods.PERIOD_5_MINS, Periods.PERIOD_30_MINS],
    visType: VisTypes.VIS_TYPE_POWER,
    folder: '',
    extension: '',
    periodFolders: {
      '5mm': '',
      '30mm': '',
    },
  },
  {
    id: 'last30days',
    label: '30D',
    minPeriod: Periods.PERIOD_1_DAY,
    groupToPeriods: [Periods.PERIOD_1_DAY],
    visType: VisTypes.VIS_TYPE_ENERGY,
    folder: '/history/daily',
    extension: '',
    periodFolders: {
      DD: '/history/daily',
    },
  },
  {
    id: 'lastYear',
    label: '1Y',
    minPeriod: Periods.PERIOD_1_WEEK,
    groupToPeriods: [Periods.PERIOD_1_WEEK],
    visType: VisTypes.VIS_TYPE_ENERGY,
    folder: '/history/weekly',
    extension: '',
    periodFolders: {
      WW: '/history/weekly',
      MM: '/history/weekly',
      '3MM': '/history/weekly',
    },
  },
  {
    id: 'allMonthly',
    label: 'ALL',
    minPeriod: Periods.PERIOD_1_MONTH,
    groupToPeriods: [Periods.PERIOD_1_MONTH],
    visType: VisTypes.VIS_TYPE_ENERGY,
    folder: '/history/monthly',
    extension: '_all',
    periodFolders: {
      WW: '/history/weekly',
      MM: '/history/monthly',
      S3MM: '/history/monthly',
      '3MM': '/history/monthly',
      YYYY: '/history/monthly',
      FY: '/history/monthly',
    },
  },
  // {
  //   id: 'last52weeksMonthly',
  //   label: 'Last 12 months (monthly)',
  //   minPeriod: Periods.PERIOD_1_MONTH,
  //   groupToPeriods: [Periods.PERIOD_1_MONTH],
  //   visType: VisTypes.VIS_TYPE_ENERGY,
  //   folder: '/history/monthly',
  //   extension: '',
  // },
  // {
  //   id: '2017Weekly',
  //   label: '2017 (weekly)',
  //   minPeriod: Periods.PERIOD_1_WEEK,
  //   groupToPeriods: [Periods.PERIOD_1_WEEK],
  //   visType: VisTypes.VIS_TYPE_ENERGY,
  //   folder: '/history/weekly',
  //   extension: '_2017',
  // },
  // {
  //   id: '2017Monthly',
  //   label: '2017 (monthly)',
  //   minPeriod: Periods.PERIOD_1_MONTH,
  //   groupToPeriods: [Periods.PERIOD_1_MONTH],
  //   visType: VisTypes.VIS_TYPE_ENERGY,
  //   folder: '/history/monthly',
  //   extension: '_2017',
  // },
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

function getDefaultRange() {
  return isMobileWidth() ? DateRanges[1].id : DateRanges[2].id;
}

function getPeriod(id) {
  let period = '';

  switch (id) {
    case 'last30days':
      period = 'day';
      break;
    case 'last52weeksWeekly':
    case '2017Weekly':
      period = 'week';
      break;
    case 'last52weeksMonthly':
    case '2017Monthly':
    case 'allMonthly':
      period = 'month';
      break;
    default:
      period = '';
  }
  return period;
}

function getPeriodAxisLabel(id) {
  const interval = getPeriod(id);
  return interval !== '' ? `/${interval}` : '';
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
  getDefaultRange,
  getPeriod,
  getPeriodAxisLabel,
  isLast24Hrs,
  isLast3Days,
};
