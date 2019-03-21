/* eslint-disable */
import { isValidFuelTech, isFTMarketValue } from '@/domains/graphs';

export default function (d) {
  const newD = {};

  let tempNum = 0;
  let priceNum = 0;
  let ftNum = {}

  d.forEach((e) => {
    Object.keys(e).forEach((f) => {
      if (!newD[f]) newD[f] = 0;

      if (f === 'nestDate') {
        newD.date = e[f];
      }

      if (isValidFuelTech(f)) {
        newD[f] += e[f];

        if (!ftNum[f]) ftNum[f] = 0
        ftNum[f] += 1
      }

      if (isFTMarketValue(f)) {
        newD[f] += e[f] || 0;
      }

      if (f === 'price') {
        newD[f] += e[f];
        priceNum += 1;
      }
      if (f === 'temperature' && e[f]) {
        newD[f] += e[f];
        tempNum += 1;
      }
    });
  });

  Object.keys(ftNum).forEach((ft) => {
    newD[ft] = newD[ft] / ftNum[ft];
  })

  newD.price = newD.price / priceNum;
  
  const newPrice = newD.price;
  const pricePosKey = 'pricePos';
  const priceNegKey = 'priceNeg';
  if (!newD[pricePosKey]) newD[pricePosKey] = 0.001;
  if (!newD[priceNegKey]) newD[priceNegKey] = 0.001;

  newD[pricePosKey] = newPrice > 300 ? newPrice : 0.001;
  newD[priceNegKey] = newPrice < 0 ? -newPrice : 0.001;

  newD.temperature = newD.temperature / tempNum;

  return newD;
}