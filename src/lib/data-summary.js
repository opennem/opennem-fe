import _ from 'lodash';
import {
  isValidFuelTech,
  isPrice,
  isFTMarketValue,
  isTemperature,
  isRenewableFuelTech,
  // isImports,
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
      // if (validFuelTech(ft) && !isLoads(ft) && !isImports(ft)) {
      if (validFuelTech(ft) && !isLoads(ft)) {
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

  // create an array of objects for renewables
  const renewablesPercent = data.map((d, i) => {
    const renewableTotal = renewablesDataSum[i];
    return {
      date: d.date,
      renewableTotal,
      genSum: genDataSum[i],
      demandSum: dataSum[i],
      generation: (renewableTotal / genDataSum[i]) * 100,
      demand: (renewableTotal / dataSum[i]) * 100,
    };
  });

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

  const dataSumMarketValue = data.map((d) => {
    let p = 0;
    Object.keys(d).forEach((ft) => {
      if (isFTMarketValue(ft)) {
        const value = ft === 'imports.market_value' ? -d[ft] : d[ft];
        p += value;
      }
    });
    return p;
  });

  // calculate the total average price
  const totalAveragePrice = isPower ?
    dataSumTotalPrice.reduce((a, b) => a + b, 0) / dataSumTotal :
    dataSumMarketValue.reduce((a, b) => a + b, 0) / dataSumTotal / 1000;

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
      const totalFTValue = data.reduce((a, b) => a + (b[domain] || 0), 0);
      let dataEnergy;

      if (isPower) {
        // calculate energy (GWh) += power * interval/60/100
        dataEnergy = data.map(d => (d[domain] * 5) / 60 / 1000);
      } else {
        // no need to calculate if returned data is already Energy
        dataEnergy = data.map(d => d[domain] || 0);
      }

      // sum the energy
      const energySum = dataEnergy.reduce((a, b) => a + b, 0);

      // calculate the price * ft total
      const dataFTPrice = data.map((d, i) => {
        const rrp = data[i].price ? data[i].price : 0;
        return Math.abs(d[domain]) * rrp;
      });

      // const dataFTMarketValue = data.map((d) => {
      //   return d[domain] * d[`${domain}.market_value`];
      // });

      // energy market value
      const totalFTMarketValue = data.reduce((a, b) => {
        const domainMarketValueKey = `${domain}.market_value`;
        let value = domainMarketValueKey === 'imports.market_value' ?
          -b[domainMarketValueKey] : b[domainMarketValueKey];

        if (!value) value = 0;
        return a + value;
      }, 0);

      // console.log(dataFTMarketValue.reduce((a, b) => a + b, 0) / 1000 / totalFTValue)
      // console.log((totalFTMarketValue / 1000) / totalFTValue)

      // calculate the ft average price
      const averageFTPrice = isPower ?
        dataFTPrice.reduce((a, b) => a + b, 0) / Math.abs(totalFTValue) :
        (totalFTMarketValue / 1000) / Math.abs(totalFTValue);

      const row = {
        id: domain,
        label: getLabel(domains, domain),
        colour: getColour(domains, domain),
        range: {
          power: totalFTValue,
          energy: energySum, // same as totalFTValue / 12000
          averagePrice: averageFTPrice,
        },
      };

      if (isLoads(domain)) {
        loadsData.push(row);
      } else {
        sourcesData.push(row);
        // sum up sources power (gross)
        totalGrossPower += totalFTValue;
        // sum up sources energy (gross)
        totalGrossEnergy += energySum;
      }
      // sum up all power (net)
      totalNetPower += totalFTValue;
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
    renewablesPercent,
    renewablesExtent: getExtent(data, renewablesPercentages),
    generationExtent: getExtent(data, genDataSum),
    renewablesExtent2: getExtent(data, renewablesPercentages2),
    priceExtent: getExtent(data, data.map(d => d.price || d.volume_weighted_price)),
    temperatureExtent: getExtent(data, data.map(d => d.temperature_mean || d.temperature)),
  };
}

function getPointSummary(domains, date, data, visType) {
  const allData = {};
  let totalNetPower = 0;
  let totalGrossPower = 0;
  let totalMarketValue = 0;
  const valueType = visType === 'power' ? 'Average' : 'Sum';

  Object.keys(domains).forEach((domain) => {
    if (validFuelTech(domain)) {
      const average = data[`${domain}${valueType}`];
      allData[domain] = average;

      if (average !== undefined) {
        totalNetPower += average;

        if (!isLoads(domain)) {
          totalGrossPower += average;
        }
      }
    } else if (isPrice(domain)) {
      const price = data[`${domain}Close`];
      allData[domain] = price;
    } else if (isFTMarketValue(domain)) {
      const marketValue = Math.abs(data[`${domain}Close`]);
      allData[domain] = marketValue;

      if (marketValue) {
        totalMarketValue += marketValue;
      }
    } else if (isTemperature(domain)) {
      allData[domain] = data[`${domain}Average`];
    }
  });

  const totalAvValue = totalMarketValue / totalNetPower / 1000;

  return {
    date,
    allData,
    totalNetPower,
    totalGrossPower,
    totalAvValue,
  };
}

function getGroupPointSummary(domains, date, data, visType) {
  const allData = {};
  let totalNetPower = 0;
  let totalGrossPower = 0;
  let totalMarketValue = 0;
  const valueType = visType === 'power' ? 'Average' : 'Sum';

  Object.keys(domains).forEach((domain) => {
    const type = domains[domain].type;

    if (type === 'sources' || type === 'loads') {
      const average = data[`${domain}${valueType}`];
      allData[domain] = average;

      if (average !== undefined) {
        totalNetPower += average;
        if (type !== 'loads') {
          totalGrossPower += average;
        }
      }
    } else if (type === 'price') {
      const price = data[`${domain}Close`];
      allData[domain] = price;
    } else if (type === 'market_value') {
      const marketValue = Math.abs(data[`${domain}Close`]);
      allData[domain] = marketValue;

      if (marketValue) {
        totalMarketValue += marketValue;
      }
    } else if (type === 'temperature') {
      allData[domain] = data[`${domain}Average`];
    }
  });

  const totalAvValue = totalMarketValue / totalNetPower / 1000;

  return {
    date,
    allData,
    totalNetPower,
    totalGrossPower,
    totalAvValue,
  };
}

export {
  getSummary,
  getPointSummary,
  getGroupPointSummary,
};
