/* eslint-disable */
import { isValidFuelTech, isFTMarketValue } from '@/domains/graphs';

export default function (d) {
  const newD = {};

  let tempMinNum = 0;
  let tempMeanNum = 0;
  let tempMaxNum = 0;
  let priceNum = 0;
  let pricePosNum = 0;
  let priceNegNum = 0;

  d.forEach((e) => {
    Object.keys(e).forEach((f) => {
      if (!newD[f]) newD[f] = 0;

      if (f === 'nestDate') {
        newD.date = e[f];
      }

      if (isValidFuelTech(f)) {
        newD[f] += e[f];
      }

      if (isFTMarketValue(f)) {
        newD[f] += e[f] || 0;
      }

      if (f === 'volume_weighted_price') {
        newD[f] += e[f];
        priceNum += 1;
      }
      if (f === 'temperature_min' && e[f]) {
        newD[f] += e[f];
        tempMinNum += 1;
      }
      if (f === 'temperature_mean' && e[f]) {
        newD[f] += e[f];
        tempMeanNum += 1;
      }
      if (f === 'temperature_max' && e[f]) {
        newD[f] += e[f];
        tempMaxNum += 1;
      }
    });
  });

  newD.volume_weighted_price = newD.volume_weighted_price / priceNum;
  
  const newPrice = newD.volume_weighted_price;
  const pricePosKey = 'pricePos';
  const priceNegKey = 'priceNeg';
  if (!newD[pricePosKey]) newD[pricePosKey] = 0.001;
  if (!newD[priceNegKey]) newD[priceNegKey] = 0.001;

  newD[pricePosKey] = newPrice > 300 ? newPrice : 0.001;
  newD[priceNegKey] = newPrice < 0 ? -newPrice : 0.001;

  newD.temperature_min = newD.temperature_min / tempMinNum;
  newD.temperature_mean = newD.temperature_mean / tempMeanNum;
  newD.temperature_max = newD.temperature_max / tempMaxNum;

  return newD;
}