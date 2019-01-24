/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import { isValidFuelTech, isFTMarketValue, isPrice } from '@/domains/graphs';

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
  const marketValueKeys = Object.keys(data[0]).filter(k => isFTMarketValue(k));
  let currentQ = moment(data[0].date).quarter();
  let fyDate = setStartFY(data[0].date, getQuarterStartMonth(currentQ));

  data.forEach((d, i) => {
    const q = moment(d.date).quarter();
    if (currentQ === 2 && q === 3) {
      fyDate = setStartFY(d.date, getQuarterStartMonth(q));
    }
    currentQ = q;
    cloneData[i].fyDate = fyDate.toDate();
  });

  const entries = d3Collection.nest()
    .key(d => d.fyDate)
    .rollup((d) => {
      const newD = {};

      let tempMinNum = 0;
      let tempMeanNum = 0;
      let tempMaxNum = 0;

      d.forEach((e) => {
        Object.keys(e).forEach((f) => {
          if (isValidFuelTech(f)) {
            if (!newD[f]) newD[f] = 0;
            newD[f] += e[f];
          }

          if (isFTMarketValue(f)) {
            if (!newD[f]) newD[f] = 0;
            newD[f] += e[f] || 0  ;
          }

          if (f === 'fyDate') {
            newD.date = e[f];
          }

          if (f === 'temperature_min' && e[f]) tempMinNum += 1;
          if (f === 'temperature_mean' && e[f]) tempMeanNum += 1;
          if (f === 'temperature_max' && e[f]) tempMaxNum += 1;
        });
      });


      marketValueKeys.forEach(key => {
        const mvKey = `${key}.market_value`;
        const sumMarketValue = newD[mvKey];
        newD[mvKey] = sumMarketValue / newD[key];
      })

      newD.temperature_min = newD.temperature_min / tempMinNum;
      newD.temperature_mean = newD.temperature_mean / tempMeanNum;
      newD.temperature_max = newD.temperature_max / tempMaxNum;

      return newD;
    })
    .entries(cloneData);

  return entries.map((e) => {
    delete e.value.fyDate;
    return e.value;
  });
}
