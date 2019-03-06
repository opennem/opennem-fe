/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import dataRollup from './data-rollup-power';

function setStartMonday(whichMonday) {
  const d = moment(whichMonday);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  const coeff = 1000 * 60 * 30;

  data.forEach((d, i) => {
    const nestDate = Math.round(moment(d.date).valueOf() / coeff) * coeff;
    cloneData[i].nestDate = moment(nestDate).toDate();
  });

  const entries = d3Collection.nest()
    .key(d => d.nestDate)
    .rollup((d) => dataRollup(d))
    .entries(cloneData)
  
  return entries.map((e) => {
    return e.value;
  });
}
