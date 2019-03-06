/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import dataRollup from './data-rollup';

function setStartMonth(date, currentMonth) {
  const d = moment(date);
  d.set('month', currentMonth);
  d.set('date', 1);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  let currentMonth = moment(data[0].date).month();
  let nestDate = setStartMonth(data[0].date, currentMonth);

  data.forEach((d, i) => {
    const q = moment(d.date).month()
    nestDate = setStartMonth(d.date, q);
    cloneData[i].nestDate = nestDate.toDate();
  });

  const entries = d3Collection.nest()
    .key(d => d.nestDate)
    .rollup((d) => dataRollup(d))
    .entries(cloneData);
    
  return entries.map((e) => {
    delete e.value.nestDate;
    return e.value;
  });
}
