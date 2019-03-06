/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import dataRollup from './data-rollup';

function getQuarterStartMonth(quarter) {
  switch (quarter) {
    case 1: return 0;
    case 2: return 3;
    case 3: return 6;
    case 4: return 9;
    default:
  }
  return null;
}

function setStartFY(date, qMonth) {
  const d = moment(date);
  d.set('month', qMonth);
  d.set('date', 1);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  let currentQ = moment(data[0].date).quarter();
  let nestDate = setStartFY(data[0].date, getQuarterStartMonth(currentQ));

  data.forEach((d, i) => {
    const q = moment(d.date).quarter();
    if (currentQ === 2 && q === 3) {
      nestDate = setStartFY(d.date, getQuarterStartMonth(q));
    }
    currentQ = q;
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
