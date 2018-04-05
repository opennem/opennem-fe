import * as _ from 'lodash';
import * as moment from 'moment';
import { formatNumberForDisplay } from './formatter';
import { getStartEndDates } from './data-helpers';
import { isTouchDevice } from './device';

/**
 * Default amCharts config
 */
function getChartConfig(config) {
  let pan = false;
  let zoomable = true;

  if (isTouchDevice()) {
    pan = true;
    zoomable = false;
  }

  const defaultConfig = {
    type: 'stock',
    addClassNames: true,
    mouseWheelZoomEnabled: true,
    // mouseWheelScrollEnabled: true,
    export: {
      enabled: false,
    },
    balloon: {
      adjustBorderColor: true,
      borderAlpha: 0,
      borderThickness: 1,
      animationDuration: 0,
      pointerWidth: 6,
      fillAlpha: 1,
      fillColor: '#ece9e6',
      shadowAlpha: 0.4,
    },
    categoryAxesSettings: {
      autoGridCount: true,
      minPeriod: '5mm',
      labelOffset: -35,
      axisAlpha: 1,
      tickLength: 30,
      axisHeight: 28,
      axisThickness: 1,
      axisColor: '#ccc',
      color: '#666',
      dashLength: 7,
      equalSpacing: true,
      centerLabelOnFullPeriod: false,
      groupToPeriods: ['5mm', '30mm'],
      boldPeriodBeginning: true,
      parseDates: true,
      startOnAxis: true,
      dateFormats: [
        { period: 'fff', format: ' JJ:NN' },
        { period: 'ss', format: ' JJ:NN\n D MMM' },
        { period: 'mm', format: ' JJ:NN' },
        { period: 'hh', format: ' JJ:NN' },
        { period: 'DD', format: ' EEE\n D MMM' },
        { period: 'WW', format: ' EEE\n D MMM' },
        { period: 'MM', format: ' EEE\n D MMM' },
        { period: 'YYYY', format: ' YYYY' },
      ],
    },
    chartCursorSettings: {
      pan, // If pan is set to true, zoomable is switched to false automatically.
      zoomable,
      categoryBalloonColor: '#C74523',
      cursorColor: '#C74523',
      showNextAvailable: true,
      valueBalloonsEnabled: true,
      animationDuration: 0,
      leaveAfterTouch: false,
    },
    panelsSettings: {
      fontFamily: 'IBM Plex Serif',
    },
    chartScrollbarSettings: {
      enabled: false,
    },
  };

  return _.assign(defaultConfig, config);
}

/**
 * amCharts Field Mappings
 */
function getFieldMappings(keys) {
  const mappings = [];

  keys.forEach((key) => {
    mappings.push({
      fromField: key,
      toField: key,
    });
  });

  return mappings;
}

/**
 * amCharts Stock graphs
 */
function getStockGraphs(domains, keys, showBalloon) {
  const graphs = [];

  function hideNegativeAlphas(key) {
    return key === 'exports' ||
      key === 'imports' ||
      key === 'pumps' ||
      key === 'battery_charging';
  }

  function validFT(key) {
    return key !== 'price' &&
      key !== 'pricePos' &&
      key !== 'priceNeg' &&
      key !== 'temperature';
  }

  function isLoad(key) {
    return key === 'exports' ||
      key === 'pumps' ||
      key === 'battery_charging';
  }

  keys.forEach((ftKey) => {
    if (validFT(ftKey)) {
      const colour = domains[ftKey].colour;
      const negativeFillAlphas = hideNegativeAlphas(ftKey) ? 0 : 0.8;
      const fillAlphas = 0.8;
      const lineAlpha = 0.1;
      const type = 'line';

      const graph = {
        id: ftKey,
        valueField: ftKey,
        type,
        fillAlphas,
        negativeFillAlphas,
        negativeFillColors: colour,
        lineAlpha,
        lineColor: colour,
        useDataSetColors: false,
        showBalloon,
        balloonFunction: (item) => {
          let balloonTxt = '';

          if (!isLoad(graph.id) && item.values.value > 0) {
            const value = formatNumberForDisplay(item.dataContext[`${graph.id}Average`]);
            const ftLabel = domains[graph.id].label;

            const displayValue = `${value} MW`;

            balloonTxt = `
              <div style="font-size: 1.1em;">
                <span 
                  style="display: inline-block; width: 13px; 
                    height: 13px; position: relative; top: 2px; 
                    margin-right: 5px; background: ${colour};"></span>
                ${ftLabel}: <strong> ${displayValue}</strong>
              </div>
            `;
          }
          return balloonTxt;
        },
      };
      graphs.push(graph);
    }
  });
  return graphs;
}

/**
 * amCharts NEM Guides
    - shade between 10pm to 7am
 */
function getNemGuides(data) {
  const startEndDates = getStartEndDates(data);
  const startDate = moment(startEndDates.start);
  const endDate = moment(startEndDates.end);
  endDate.add(1, 'days');
  const guides = [];

  while (moment(startDate).isBefore(endDate)) {
    const dayBefore = startDate.clone();
    dayBefore.subtract(1, 'days');

    guides.push({
      fillColor: '#999',
      fillAlpha: 0.1,
      lineAlpha: 0,
      tickLength: 0,
      date: dayBefore.set({ hour: 22, minute: 0, second: 0 }).toDate(),
      toDate: startDate.set({ hour: 7, minute: 0, second: 0 }).toDate(),
    });

    startDate.add(1, 'days');
  }

  return guides;
}

export {
  getChartConfig,
  getFieldMappings,
  getStockGraphs,
  getNemGuides,
};
