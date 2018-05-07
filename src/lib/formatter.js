import * as moment from 'moment';
import numeral from 'numeral';

function formatDateForDisplay(date) {
  let format = 'D MMM, h:mma';

  const d = moment(date);
  /**
   * Uncomment this to enable offset hours
   */
  // const d = offsetHrs ? moment(date).utcOffset(offsetHrs) : moment(date);
  const dYear = d.year();
  const dDayOfYear = d.dayOfYear();

  const today = moment();
  const todayYear = today.year();
  const todayDayOfYear = today.dayOfYear();

  const hr = d.hour();
  const min = d.minute();
  const midnight = hr === 0 && min === 0;

  if (dYear !== todayYear) {
    const timeFormat = midnight ? '' : ', h:mma';
    format = `D MMM YYYY${timeFormat}`;
  } else if (dDayOfYear === todayDayOfYear) {
    const timeFormat = midnight ? ']' : ' at] h:mma';
    format = `[Today${timeFormat}`;
  } else if (midnight) {
    format = 'D MMM';
  }

  /**
   * Uncomment this to enable offset hours
   */
  // if (offsetHrs) {
  //   return moment(date).utcOffset(offsetHrs).format(format);
  // }

  const returnedDate = moment(date).isValid() ? moment(date).format(format) : '';

  return returnedDate;
}

function formatDateForExport(date) {
  return moment(date).format('YYYYMMDD');
}

function formatNumberForDisplay(number, precision) {
  const formatter = precision || '0,0';
  const formatted =
    number === 0 || isNaN(number)
      ? '-'
      : numeral(number).format(formatter);
  return formatted;
}

export {
  formatDateForDisplay,
  formatDateForExport,
  formatNumberForDisplay,
};
