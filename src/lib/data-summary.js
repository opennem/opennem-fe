import _ from 'lodash';
import {
  isValidFuelTech,
  isPrice,
  isFTMarketValue,
  isTemperature,
  isRenewableFuelTech,
  isImports,
  isLoads } from '@/domains/graphs';
import { getKeys, getExtent } from './data-helpers';

// Check if it is a valid fuel tech name
function validFuelTech(name) {
  return name !== 'date' && isValidFuelTech(name);
}

function getLabel(domains, id) {
  const label = domains[id] ? domains[id].label : id;
  return label;
}
function getColour(domains, id) {
  const colour = domains[id] ? domains[id].colour : id;
  return colour;
}

function getSummary(domains, data, isPower) {
  // create a new array with the ft totals
  const dataSum = data.map((d) => {
    let p = 0;
    Object.keys(d).forEach((ft) => {
      if (validFuelTech(ft)) {
        p += d[ft] || 0;
      }
    });
    return p;
  });

  const genDataSum = data.map((d) => {
    let p = 0;
    Object.keys(d).forEach((ft) => {
      if (validFuelTech(ft) && !isLoads(ft) && !isImports(ft)) {
        p += d[ft] || 0;
      }
    });
    return p;
  });

  // create a new array with the ft (renewables only) totals
  const renewablesDataSum = data.map((d) => {
    let p = 0;
    Object.keys(d).forEach((ft) => {
      if (validFuelTech(ft) && isRenewableFuelTech(ft)) {
        p += d[ft] || 0;
      }
    });
    return p;
  });

  // create a new array with the ft (renewables only) percentages of demand
  const renewablesPercentages = renewablesDataSum.map((d, i) => (d / dataSum[i]) * 100);
  // create a new array with the ft (renewables only) percentages of generation
  const renewablesPercentages2 = renewablesDataSum.map((d, i) => (d / genDataSum[i]) * 100);

  // sum up all the ft totals
  const dataSumTotal = dataSum.reduce((a, b) => a + b, 0);

  // calculate the price * total
  const dataSumTotalPrice = dataSum.map((d, i) => {
    // price field can be price or volum_weight_price
    const price = data[i].price;
    const volWeightedPrice = data[i].volume_weighted_price;
    let rrp = 0;

    if (price) {
      rrp = price;
    } else if (volWeightedPrice) {
      rrp = volWeightedPrice;
    }
    return d * rrp;
  });

  // calculate the total average price
  const totalAveragePrice = dataSumTotalPrice.reduce((a, b) => a + b, 0) / dataSumTotal;

  const allData = [];
  const sourcesData = [];
  const loadsData = [];
  let totalNetPower = 0;
  let totalNetEnergy = 0;
  let totalGrossPower = 0;
  let totalGrossEnergy = 0;

  const dataKeys = getKeys(data);

  Object.keys(domains).forEach((domain) => {
    if (_.includes(dataKeys, domain) && validFuelTech(domain)) {
      // sum ft power
      const totalFTPower = data.reduce((a, b) => a + b[domain], 0);
      let dataEnergy;

      if (isPower) {
        // calculate energy (GWh) += power * interval/60/100
        dataEnergy = data.map(d => (d[domain] * 5) / 60 / 1000);
      } else {
        // no need to calculate if returned data is already Energy
        dataEnergy = data.map(d => d[domain]);
      }

      // sum the energy
      const energySum = dataEnergy.reduce((a, b) => a + b, 0);

      // calculate the price * ft total
      const dataFTPrice = data.map((d, i) => {
        const rrp = data[i].price ? data[i].price : 0;
        return d[domain] * rrp;
      });

      // calculate the ft average price
      const averageFTPrice = dataFTPrice.reduce((a, b) => a + b, 0) / totalFTPower;
      const row = {
        id: domain,
        label: getLabel(domains, domain),
        colour: getColour(domains, domain),
        range: {
          power: totalFTPower,
          energy: energySum, // same as totalFTPower / 12000
          averagePrice: averageFTPrice,
        },
      };

      if (isLoads(domain)) {
        loadsData.push(row);
      } else {
        sourcesData.push(row);
        // sum up sources power (gross)
        totalGrossPower += totalFTPower;
        // sum up sources energy (gross)
        totalGrossEnergy += energySum;
      }
      // sum up all power (net)
      totalNetPower += totalFTPower;
      // sum up all energy (net)
      totalNetEnergy += energySum;

      allData.push(row);
    }
  });

  return {
    allData,
    sourcesData: sourcesData.reverse(), // to display from top to bottom in the table.
    loadsData,
    totalNetPower,
    totalNetEnergy,
    totalGrossPower,
    totalGrossEnergy,
    totalAveragePrice,
    demandExtent: getExtent(data, dataSum),
    renewablesExtent: getExtent(data, renewablesPercentages),
    generationExtent: getExtent(data, genDataSum),
    renewablesExtent2: getExtent(data, renewablesPercentages2),
    priceExtent: getExtent(data, data.map(d => d.price || d.volume_weighted_price)),
    temperatureExtent: getExtent(data, data.map(d => d.temperature_mean || d.temperature)),
  };
}

function getPointSummary(domains, date, data) {
  const allData = {};
  let totalNetPower = 0;
  let totalGrossPower = 0;

  Object.keys(domains).forEach((domain) => {
    if (validFuelTech(domain)) {
      const average = data[`${domain}Average`];
      allData[domain] = average;

      if (average !== undefined) {
        totalNetPower += average;

        if (!isLoads(domain)) {
          totalGrossPower += average;
        }
      }
    } else if (isFTMarketValue(domain) || isPrice(domain)) {
      allData[domain] = data[`${domain}Close`];
    } else if (isTemperature(domain)) {
      allData[domain] = data[`${domain}Average`];
    }
  });

  return {
    date,
    allData,
    totalNetPower,
    totalGrossPower,
  };
}

export {
  getSummary,
  getPointSummary,
};
