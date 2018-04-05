/* eslint-disable */
import * as moment from 'moment';
import { parseInterval, compareAndGetShortestInterval } from './duration-parser';

/**
 * Find out what datatypes is available in this dataset,
 *  and the start/end time of the generation data
 * @param {*} domains
 * @param {*} data
 */
function getKeysAndStartEndGenerationTime(domains, data) {
  const keys = [];
  let startGenTime = null;
  let endGenTime = null;

  Object.keys(domains).forEach((domain) => {
    const find = data.find(d => d.fuel_tech === domain);
    const hasPrice = data.find(d => d.type === domain);
    const hasTemperature = data.find(d => d.type === domain);

    if (find || hasPrice || hasTemperature) {
      keys.push(domain);

      if (!endGenTime && find) {
        endGenTime = find.history.last;
      }
      if (!startGenTime && find) {
        startGenTime = find.history.start;
      }

      // if there is a price key,
      //   create two more keys to split the positive and negative values of price
      if (hasPrice) {
        keys.push('pricePos');
        keys.push('priceNeg');
      }
    }
  });

  return {
    keys,
    startGenTime,
    endGenTime,
  };
}

function invertValue(d) {
  return d === 'exports' ||
    d === 'imports' ||
    d === 'pumps' ||
    d === 'battery_charging';
}

export default function(domains, data) {
  const keysAndGenTimes = getKeysAndStartEndGenerationTime(domains, data);
  const keys = keysAndGenTimes.keys;
  const genTimes = {
    start: keysAndGenTimes.startGenTime,
    end: keysAndGenTimes.endGenTime,
  };

  const container = [];
  const allIntervals = {};
  let shortestInterval = null;

  function createContainerObj(availableKeys, domain, duration, history) {
    const historyData = history.data;
    const start = moment(history.start, moment.ISO_8601);

    for (let i = 0; i < historyData.length; i += 1) {
      const now = moment(start).add(duration.value * i, duration.key);
      const d = invertValue(domain) ? -historyData[i] : historyData[i];
      const nowISO = moment(now).toISOString();

      if (!container[nowISO]) {
        container[nowISO] = {};

        availableKeys.forEach((key) => {
          container[nowISO][key] = null;
        });
      }
      container[nowISO][domain] = d;
    }
  }

  Object.keys(domains).forEach((domain) => {
    const fuelTechData = data.find(d => d.fuel_tech === domain);
    const priceOrTemperatureData = data.find(d => d.type === domain);
    let history = null;

    if (fuelTechData) {
      history = fuelTechData.history;
    } else if (priceOrTemperatureData) {
      history = priceOrTemperatureData.history;
    }

    if (fuelTechData || priceOrTemperatureData) {
      const duration = parseInterval(history.interval);
      allIntervals[domain] = duration;

      // store the shortest interval
      if (shortestInterval) {
        shortestInterval = compareAndGetShortestInterval(shortestInterval, duration, true);
      } else {
        shortestInterval = duration;
      }

      createContainerObj(keys, domain, duration, history);

      // if fuelTechData contains forecast data, add that to current keys
      if (fuelTechData && fuelTechData.forecast) {
        createContainerObj(keys, domain, duration, fuelTechData.forecast);
      }
    }
  });

  const newChartData = [];
  const longerIntervalSeries = [];

  // Find out the series that has an interval longer than the shortest interval
  Object.keys(allIntervals).forEach((domain) => {
    if (!compareAndGetShortestInterval(allIntervals[domain], shortestInterval, false)) {
      longerIntervalSeries.push({
        key: domain,
        currentValue: null,
      });
    }
  });

  // Create array based on date maps
  Object.keys(container).forEach((dateKey) => {
    const obj = Object.assign({}, container[dateKey]);
    obj.date = moment(dateKey).toDate();

    newChartData.push(obj);
  });

  // sort the array based on the date
  newChartData.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

  // fill in gaps for series that has longer intervals
  // also populate pricePos and priceNeg for log charts
  newChartData.forEach((d) => {
    longerIntervalSeries.forEach((series) => {
      const isPrice = series.key === 'price';

      if (d[series.key] !== null) {
        series.currentValue = d[series.key];
      } else if (d[series.key] === null) {
        if (series.key !== 'temperature') {
          d[series.key] = series.currentValue;
        }
      }

      if (isPrice) {
        d.pricePos = d[series.key] > 300 ? d[series.key] : 0.001;
        d.priceNeg = d[series.key] < 0 ? -d[series.key] : 0.001;
      }
    });
  });

  // only show data within the start and end range of the 5 min FT
  const updatedChartData = newChartData.filter(d =>
    moment(d.date).isSameOrAfter(moment(genTimes.start)) &&
    moment(d.date).isSameOrBefore(moment(genTimes.end)));

  return updatedChartData.slice(0);
}
