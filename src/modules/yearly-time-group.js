/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import dataRollup from './data-rollup';

function setStartYear(date) {
  const d = moment(date);
  d.set('month', 0);
  d.set('date', 1);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  let nestDate = setStartYear(data[0].date);

  data.forEach((d, i) => {
    nestDate = setStartYear(d.date);
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
