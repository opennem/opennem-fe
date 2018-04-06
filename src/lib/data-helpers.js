import * as moment from 'moment';

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

export {
  dataFilter,
  getStartEndDates,
  checkDateZoomLessThan1Hour,
  checkDateZoomLessThan1Day,
  getZoomDatesOnDateLabel,
  getLast24HoursStartEndDates,
  getLast3DaysStartEndDates,
  getKeys,
};
