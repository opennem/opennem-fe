import * as moment from 'moment';
import * as _ from 'lodash';

/**
 * filter the data between the start/end dates provided
 * @param {*} data
 * @param {*} start
 * @param {*} end
 */
function dataFilter(data, start, end) {
  return data.filter((item) => {
    const d = moment(item.date);
    return d.isSameOrAfter(start) && d.isSameOrBefore(end);
  });
}

function dataFilterByLastValuePrecision(data, value, precision) {
  const endIndex = data.length - 1;
  const endDate = data[endIndex].date;

  const ago = moment(endDate).subtract(value, precision);

  return data.filter((item) => {
    const d = moment(item.date);
    return d.isSameOrAfter(ago) && d.isSameOrBefore(endDate);
  });
}

function findDataContextByDate(date, aggregatedDataProviders) {
  const dateValue = `${moment(date).valueOf()}`;
  const dataContext = _.find(aggregatedDataProviders, d => d.amCategoryIdField === dateValue);

  return dataContext;
}

/**
 * get start and end dates on the chart data
 */
function getStartEndDates(data) {
  const firstObj = Object.assign({}, data[0]);
  const lastIndex = data.length - 1;

  return {
    start: firstObj.date,
    end: data[lastIndex].date,
  };
}

/**
 * check the difference between start and end time is less than 1 hour
 *  if less, return a new end time that is one hour after start time
 * @param {*} start
 * @param {*} end
 */
function checkDateZoomLessThan1Hour(start, end) {
  const dateCheck = moment(start).add(1, 'hours');

  if (!moment(dateCheck).isSameOrBefore(end)) {
    return dateCheck.toDate();
  }

  return null;
}

/**
 * check the difference between start and end time is less than 1 day
 * @param {*} start
 * @param {*} end
 */
function checkDateZoomLessThan1Day(start, end) {
  const dateCheck = moment(start).add(1, 'days');

  return moment(dateCheck).isSameOrAfter(end);
}

/**
 * check the difference between start and end time is less than 14 days
 * @param {*} start
 * @param {*} end
 */
function checkDateZoomLessThan14Days(start, end) {
  const dateCheck = moment(start).add(14, 'days');

  return moment(dateCheck).isSameOrAfter(end);
}

/**
 * get start and end dates of the last 24 hours based on an end date
 * @param {*} dataEndDate
 */
function getLast24HoursStartEndDates(dataEndDate) {
  const start = moment(dataEndDate).subtract(24, 'hours').toDate();
  return {
    start,
    end: dataEndDate,
  };
}

/**
 * get start and end dates of the last 3 days based on an end date
 * @param {*} dataEndDate
 */
function getLast3DaysStartEndDates(dataEndDate) {
  const start = moment(dataEndDate).subtract(3, 'days').toDate();
  return {
    start,
    end: dataEndDate,
  };
}

/**
 * Parse the date label to get start/end dates
 * @param {*} dateLabel
 * @param {*} dataEndDate
 */
function getZoomDatesOnDateLabel(dateLabel, dataEndDate) {
  let dateString = dateLabel.replace(/\n/g, ' ');
  const length = dateString.length;
  dateString = dateString.substring(length - 6, length);

  const regEx = new RegExp('(.*[a-z]){3}', 'i'); // contains alphabets (month)

  if (regEx.test(dateString)) {
    const today = moment();
    const thisYear = moment().year();
    // TODO (steven): this assumes it's this year. Check also when the year has changed
    let start = moment(`${dateString} ${thisYear}`, 'D MMM YYYY');
    const end = moment(start).add(1, 'days');

    // if date clicked is today, than use 24 hours before dateEndDate
    if (moment(start).isSame(today, 'day')) {
      start = moment(dataEndDate).subtract(24, 'hours');
    }

    return {
      start: start.toDate(),
      end: end.toDate(),
    };
  }

  return null;
}

/**
 * Return the keys used in this data
 * @param {*} data
 */
function getKeys(data) {
  if (data.length > 0) {
    const firstObj = Object.assign({}, data[0]);
    delete firstObj.date;
    return Object.keys(firstObj);
  }
  return [];
}

/**
 * Return the min/max values and dates of dataset
 * @param {*} data
 * @param {*} arr
 */
function getExtent(data, arr) {
  if (arr.length === 0) {
    return -1;
  }

  let min = arr[0];
  let max = arr[0];
  let minIndex = 0;
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }

    if (min === null || arr[i] < min) {
      if (arr[i] !== null) {
        minIndex = i;
        min = arr[i];
      }
    }
  }

  return [{
    value: min,
    date: data[minIndex].date,
  }, {
    value: max,
    date: data[maxIndex].date,
  }];
}

function isMidnight(date) {
  const d = moment(date);
  const hr = d.hour();
  const min = d.minute();
  const midnight = hr === 0 && min === 0;

  return midnight;
}

function getAllNumbersBetween(x, y) {
  const numbers = [];
  for (let i = x; i <= y; i += 1) {
    numbers.push(i);
  }
  return numbers;
}

function getAllWeeksYearsBetween(start, end) {
  const startWeek = moment(start).week();
  const endWeek = moment(end).week();
  const startYear = moment(start).year();

  let weeks = getAllNumbersBetween(startWeek, endWeek);
  let years = weeks.map(() => startYear);

  // if endWeek is smaller than startWeek, need to get across years
  if (endWeek < startWeek) {
    const weeksInStartYear = moment(startYear).weeksInYear();
    const startYearWeeks = getAllNumbersBetween(startWeek, weeksInStartYear);
    const endYearWeeks = getAllNumbersBetween(1, endWeek);
    const endYear = moment(end).year();

    weeks = [...startYearWeeks, ...endYearWeeks];
    years = [...startYearWeeks.map(() => startYear), ...endYearWeeks.map(() => endYear)];
  }

  return {
    weeks: weeks.map(w => (`0${w}`).slice(-2)),
    years,
  };
}

export {
  dataFilter,
  dataFilterByLastValuePrecision,
  findDataContextByDate,
  getStartEndDates,
  checkDateZoomLessThan1Hour,
  checkDateZoomLessThan1Day,
  checkDateZoomLessThan14Days,
  getZoomDatesOnDateLabel,
  getLast24HoursStartEndDates,
  getLast3DaysStartEndDates,
  getKeys,
  getExtent,
  isMidnight,
  getAllWeeksYearsBetween,
};
