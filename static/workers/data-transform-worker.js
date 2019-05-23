/* eslint-disable */
importScripts(
  'lodash.js',
  'moment.js',
  'graphs.js',
  'duration-parser.js'
);

class History {
  constructor({
    start,
    last,
    interval,
    data,
  }) {
    this.start = start;
    this.last = last;
    this.interval = interval;
    this.data = data;
  }
}

function shouldInvertValue(id) {
  return isImports(id) || isLoads(id);
}

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
    const fuelTech = data.find(d => d.fuel_tech === domain);
    const priceOrTemperatureData = data.find(d => d.type === domain);
    const fuelTechMarketValueAndEmissions = data.find(
      d => (d.type === 'market_value' || d.type === 'emissions') && d.id.includes(`fuel_tech.${domain}`)
    );

    if (fuelTech || priceOrTemperatureData || fuelTechMarketValueAndEmissions) {
      keys.push(domain);

      if (!endGenTime && fuelTech) {
        endGenTime = fuelTech.history.last;
      }
      if (!startGenTime && fuelTech) {
        startGenTime = fuelTech.history.start;
      }

      // if there is a price key,
      //   create two more keys to split the positive and negative values of price
      if (isPrice(domain)) {
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

function dataTransform(domains, data, interpolate) {
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
      const d = shouldInvertValue(domain) ? -historyData[i] : historyData[i];
      const nowDate = now.date();
      const nowMonth = now.month() + 1;
      const nowYear = now.year();
      const nowHour = ('0' + now.hour()).slice(-2);
      const nowMin = ('0' + now.minute()).slice(-2);
      const nowString = duration.key === 'm' ?
        `${nowYear}-${nowMonth}-${nowDate} ${nowHour}:${nowMin}` :
        `${nowYear}-${nowMonth}-${nowDate}`;
      const nowFormat = duration.key === 'm' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD'
      const nowUnix = moment(nowString, nowFormat).unix();

      if (!container[nowUnix]) {
        container[nowUnix] = {};

        availableKeys.forEach((key) => {
          container[nowUnix][key] = null;
        });
      }
      container[nowUnix][domain] = d;

      if (isPrice(domain)) {
        container[nowUnix]['pricePos'] = d > 300 ? d : 0.001;
        container[nowUnix]['priceNeg'] = d < 0 ? -d : 0.001;
      }
    }
  }
  Object.keys(domains).forEach((domain) => {
    const fuelTechData = data.find(d => d.fuel_tech === domain);
    const fuelTechMarketValueOrEmissions = data.find(
      d => (d.type === 'market_value' || d.type === 'emissions') && d.id.includes(`fuel_tech.${domain}`)
    );
    const priceOrTemperatureData = data.find(d => d.type === domain);
    let history = null;

    if (fuelTechData) {
      if (fuelTechData.history) {
        history = new History(fuelTechData.history);
      } else if (fuelTechData.forecast) {
        history = new History(fuelTechData.forecast);
      }
    } else if (priceOrTemperatureData) {
      history = new History(priceOrTemperatureData.history);
    } else if (fuelTechMarketValueOrEmissions) {
      history = new History(fuelTechMarketValueOrEmissions.history);
    }

    if (fuelTechData || priceOrTemperatureData || fuelTechMarketValueOrEmissions) {
      const duration = parseInterval(history.interval);
      allIntervals[domain] = duration;

      // store the shortest interval
      if (shortestInterval) {
        shortestInterval = compareAndGetShortestInterval(shortestInterval, duration, true);
      } else {
        shortestInterval = duration;
      }

      createContainerObj(keys, domain, duration, history);

      // if fuelTechData contains both history and forecast data, add forecast data to the same key
      if (fuelTechData && fuelTechData.history && fuelTechData.forecast) {
        createContainerObj(keys, domain, duration, fuelTechData.forecast);
      }
    }
  });

  const newChartData = [];
  const longerIntervalSeries = [];

  // Find out the series that has an interval longer than the shortest interval
  Object.keys(allIntervals).forEach((domain) => {
    if (!compareAndGetShortestInterval(allIntervals[domain], shortestInterval, false)) {
      let interpolation = 'step'; // none, step, linear
      if (isRooftopSolar(domain)) interpolation = 'linear';
      if (isTemperature(domain)) interpolation = 'none';

      longerIntervalSeries.push({
        key: domain,
        interpolation,
        currentValue: null,
        startIndex: -1,
      });
    }
  });

  // Create array based on date maps
  Object.keys(container).forEach((dateKey) => {
    const obj = Object.assign({}, container[dateKey]);
    obj.date = moment.unix(dateKey).toDate();
    newChartData.push(obj);
  });

  // sort the array based on the date
  newChartData.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

  // fill in gaps for series that has longer intervals
  // also populate pricePos and priceNeg for log charts
  if (interpolate) {
    newChartData.forEach((d, i) => {
      longerIntervalSeries.forEach((series) => {
        if (d[series.key] !== null) {
          
          if (series.interpolation === 'linear') {
            if (series.startIndex === -1) {
              series.startIndex = i;
            } else {
              const count = i - series.startIndex;
              const addValue = (d[series.key] - series.currentValue) / count;
              for (let x = series.startIndex + 1; x <= i; x += 1) {
                newChartData[x][series.key] = series.currentValue + addValue;
                series.currentValue = newChartData[x][series.key];
              }
              series.startIndex = i;
            }
          }
  
          series.currentValue = d[series.key];
  
        } else if (d[series.key] === null) {

          if (series.interpolation === 'step') {
            d[series.key] = series.currentValue;
          }

        }
      });
    });
  }

  // kgCO₂e/MWh - intensity
  // MtCO₂e - emissions
  if (newChartData.length > 0) {
    const ftWithEmissions = [];
    const demandFt = [];
    Object.keys(newChartData[0]).forEach(key => {
      if (key.includes('.emissions')) {
        const lastIndex = key.indexOf('.');
        ftWithEmissions.push(key.substring(0, lastIndex));
      }
      if (isValidFuelTech(key)) {
        demandFt.push(key);
      }
    });

    let demand = 0;
    let emissions = 0;
    newChartData.forEach((d, i) => {
      ftWithEmissions.forEach(ftE => {
        emissions += d[`${ftE}.emissions`] * 1000;
        d[`${ftE}.emissions`] = d[`${ftE}.emissions`] / 1e6;
      });
      demandFt.forEach(ft => {
        demand += d[ft];
      });
      // console.log(emissions, demand, emissions / demand * 1000)
      newChartData[i].emission_intensity = emissions / (demand * 1000);
    });
  }

  // only show data within the start and end range of the 5 min FT Or before today
  const today = moment();
  const genStart = moment(genTimes.start);
  const genEnd = moment(genTimes.end).subtract(shortestInterval.value, shortestInterval.key);
  const updatedChartData = (shortestInterval.key === 'm') ? 
    newChartData.filter(d =>
      moment(d.date).isSameOrAfter(genStart) && moment(d.date).isSameOrBefore(genEnd)) :
    newChartData.filter(d => moment(d.date).isSameOrBefore(today));
  
  return updatedChartData.slice(0);
}

// Setup an event listener that will handle messages sent to the worker.
self.addEventListener('message', function(e) {
  const request = JSON.parse(e.data);
  const updated = dataTransform(request.domains, request.data, request.interpolate);
  self.postMessage(JSON.stringify(updated));
  self.close();
}, false);
