/* eslint-disable */
import { isValidFuelTech, isFTMarketValue, isFTEmissions } from '@/domains/graphs';

export default function (d) {
  const newD = {};

  let tempMeanNum = 0;
  let priceNum = 0;

  const ftWithEmissions = [];
  const demandFt = [];
  let demand = 0;
  let emissions = 0;
  
  Object.keys(d[0]).forEach(key => {
    if (key.includes('.emissions')) {
      const lastIndex = key.indexOf('.');
      ftWithEmissions.push(key.substring(0, lastIndex));
    }
    if (isValidFuelTech(key)) {
      demandFt.push(key);
    }
  });

  d.forEach((e) => {
    ftWithEmissions.forEach(ftE => {
      emissions += e[`${ftE}.emissions`];
    });
    demandFt.forEach(ft => {
      demand += e[ft];
    });
    
    Object.keys(e).forEach((f) => {
      let isNew = false;
      if (!newD[f]) { 
        newD[f] = 0;
        isNew = true;
      }

      if (f === 'nestDate') {
        newD.date = e[f];
      }

      if (isValidFuelTech(f)) {
        newD[f] += e[f];
      }

      if (isFTMarketValue(f)) {
        newD[f] += e[f] || 0;
      }

      if (isFTEmissions(f)) {
        newD[f] += e[f] || 0;
      }

      if (f === 'volume_weighted_price') {
        newD[f] += e[f];
        priceNum += 1;
      }
      if (f === 'temperature_min' && e[f]) {
        if (isNew) {
          newD[f] = e[f];
        }

        if (e[f] < newD[f]) {
          newD[f] = e[f];
        }
      }
      if (f === 'temperature_mean' && e[f]) {
        newD[f] += e[f];
        tempMeanNum += 1;
      }
      if (f === 'temperature_max' && e[f]) {
        if (e[f] > newD[f]) {
          newD[f] = e[f];
        }
      }
    });
  });

  newD.emission_intensity = (emissions * 1e6 * 1000) / (demand * 1000);
  newD.volume_weighted_price = newD.volume_weighted_price / priceNum;
  
  const newPrice = newD.volume_weighted_price;
  const pricePosKey = 'pricePos';
  const priceNegKey = 'priceNeg';
  if (!newD[pricePosKey]) newD[pricePosKey] = 0.001;
  if (!newD[priceNegKey]) newD[priceNegKey] = 0.001;

  newD[pricePosKey] = newPrice > 300 ? newPrice : 0.001;
  newD[priceNegKey] = newPrice < 0 ? -newPrice : 0.001;

  newD.temperature_mean = newD.temperature_mean / tempMeanNum;

  console.log(newD.emission_intensity)

  return newD;
}