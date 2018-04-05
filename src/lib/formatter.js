import * as moment from 'moment';
import numeral from 'numeral';

function formatDate(date) {
  let format = 'D MMM, h:mma';

  const d = moment(date);
  const dYear = d.year();
  const dDayOfYear = d.dayOfYear();

  const today = moment();
  const todayYear = today.year();
  const todayDayOfYear = today.dayOfYear();

  if (dYear !== todayYear) {
    format = 'D MMM YYYY, h:mma';
  } if (dDayOfYear === todayDayOfYear) {
    format = '[Today at] h:mma';
  }

  return moment(date).format(format);
}

function formatNumber(number, precision) {
  const formatter = precision || '0,0';
  const formatted =
    number === 0 || isNaN(number)
      ? '--'
      : numeral(number).format(formatter);
  return formatted;
}

export {
  formatDate,
  formatNumber,
};
