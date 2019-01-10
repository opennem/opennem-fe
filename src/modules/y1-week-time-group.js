/* eslint-disable */
import * as d3Collection from 'd3-collection';
import * as moment from 'moment';
import { isValidFuelTech, isFTMarketValue, isPrice } from '@/domains/graphs';

function setStartMonday(whichMonday) {
  const d = moment(whichMonday);
  d.set('hour', 0);
  d.set('minute', 0);
  d.set('second', 0);
  return d;
}

export default function (data) {
  const cloneData = data;
  const marketValueKeys = Object.keys(data[0]).filter(k => isFTMarketValue(k));
  let monday = moment(data[0].date).day('Monday');
  let nestDate = setStartMonday(monday);

  data.forEach((d, i) => {
    const q = moment(d.date).day('Monday');
    nestDate = setStartMonday(q);
    cloneData[i].nestDate = nestDate.toDate();
  });

  const entries = d3Collection.nest()
    .key(d => d.nestDate)
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

          if (f === 'nestDate') {
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
  
  console.log(entries)

  return entries.map((e) => {
    delete e.value.nestDate;
    return e.value;
  });
}
