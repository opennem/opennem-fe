/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import dataRollup from './data-rollup';

function setStartMonday(whichMonday) {
  const d = moment(whichMonday);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  let monday = moment(data[0].date).day('Monday');
  let nestDate = setStartMonday(monday);

  data.forEach((d, i) => {
    const q = moment(d.date).day('Monday');
    nestDate = setStartMonday(q);
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
