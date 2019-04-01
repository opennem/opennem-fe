import * as PERIODS from '@/constants/periods';
import { formatNumberForDisplay } from '@/lib/formatter';

/**
 * Generation Panel
 */
function getGenerationPanel(listeners) {
  return {
    allLabels: [
      { text: 'Generation', bold: true, x: 5, y: 5 },
      { text: 'MW', x: 70, y: 7, color: '#999', size: 9 },
    ],
    showCategoryAxis: true,
    addClassNames: true,
    chartCursor: {
      enabled: true,
    },
    categoryAxis: {},
    valueAxes: [
      {
        id: 'v1',
        dashLength: 6,
        zeroGridAlpha: 0,
        stackType: 'regular',
        guides: [
          {
            includeGuidesInMinMax: false,
            value: 0,
            dashLength: 0,
            lineColor: '#000',
            lineThickness: 1,
            lineAlpha: 1,
          },
        ],
      },
    ],
    stockGraphs: [],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  };
}

/**
 * Energy Panel
 */
function getEnergyPanel(listeners, intervalLabel, unit) {
  return {
    allLabels: [
      { text: 'Energy', bold: true, x: 5, y: 5 },
      { text: `${unit}/${PERIODS.PERIOD_PER_INTERVAL[intervalLabel]}`, x: 50, y: 7, color: '#999', size: 9 },
    ],
    showCategoryAxis: true,
    addClassNames: true,
    chartCursor: {
      enabled: true,
    },
    categoryAxis: {},
    valueAxes: [
      {
        id: 'v1',
        dashLength: 6,
        zeroGridAlpha: 0,
        stackType: 'regular',
        guides: [
          {
            includeGuidesInMinMax: false,
            value: 0,
            dashLength: 0,
            lineColor: '#000',
            lineThickness: 1,
            lineAlpha: 1,
          },
        ],
      },
    ],
    stockGraphs: [],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  };
}

/**
 * Emissions Panel
 */
function getEmissionsPanel(listeners) {
  return {
    allLabels: [
      { text: 'Emissions', bold: true, x: 5, y: 5 },
      { text: 'tCO2e', x: 67, y: 7, color: '#999', size: 9 },
    ],
    showCategoryAxis: false,
    addClassNames: true,
    chartCursor: {
      enabled: true,
    },
    categoryAxis: {},
    valueAxes: [
      {
        id: 'emissionsPanel',
        dashLength: 6,
        zeroGridAlpha: 0,
        stackType: 'regular',
        minimum: 0,
        guides: [
          {
            includeGuidesInMinMax: false,
            value: 0,
            dashLength: 0,
            lineColor: '#000',
            lineThickness: 1,
            lineAlpha: 1,
          },
        ],
      },
    ],
    stockGraphs: [],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  };
}

/**
 * Emission Intensity Panel
 */
function getEmissionIntensityPanel(listeners) {
  return {
    allLabels: [
      { text: 'Emission Intensity', bold: true, x: 5, y: 5 },
    ],
    showCategoryAxis: false,
    addClassNames: true,
    chartCursor: {
      enabled: true,
    },
    categoryAxis: {},
    valueAxes: [
      {
        id: 'emissionIntensityPanel',
        dashLength: 6,
        zeroGridAlpha: 0,
        guides: [
          {
            includeGuidesInMinMax: false,
            value: 0,
            dashLength: 0,
            lineColor: '#000',
            lineThickness: 1,
            lineAlpha: 1,
          },
        ],
      },
    ],
    stockGraphs: [{
      id: 'emissionIntensityStockGraph',
      valueAxis: 'emissionIntensityValueAxis',
      valueField: 'emission_intensity',
      type: 'smoothedLine',
      lineAlpha: 1,
      lineColor: '#C74523',
      useDataSetColors: false,
      showBalloon: true,
      connect: false,
      balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '0,0.0')}</strong>`,
    }],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  };
}

/**
 * Temperature Panel
 */
function getTemperaturePanel(listeners, temperatureField, hasMinMax, showBullets) {
  function makeGuide(value, colour) {
    return {
      includeGuidesInMinMax: false,
      value,
      label: `${value}`,
      dashLength: 6,
      lineColor: colour || '#ccc',
      lineThickness: 1,
      lineAlpha: 1,
    };
  }

  function temperatureMinMaxStockGraphs() {
    return [
      {
        id: 'temperatureMaxStockGraph',
        valueAxis: 'temperatureValueAxis',
        valueField: 'temperature_min',
        lineAlpha: 0,
        type: 'smoothedLine',
        lineColor: '#C74523',
        useDataSetColors: false,
        showBalloon: true,
        connect: false,
        fillAplhas: 0,
        balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '0,0.0')}°C</strong>`,
      },
      {
        id: 'temperatureMinStockGraph',
        valueAxis: 'temperatureValueAxis',
        valueField: 'temperature_max',
        lineAlpha: 0,
        type: 'smoothedLine',
        lineColor: '#C74523',
        useDataSetColors: false,
        showBalloon: true,
        connect: false,
        fillAlphas: 0.1,
        fillToGraph: 'temperatureMaxStockGraph',
        balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '0,0.0')}°C</strong>`,
      },
    ];
  }

  const bullet = showBullets ? 'round' : 'none';

  const temperatureGraph = {
    id: 'temperatureStockGraph',
    valueAxis: 'temperatureValueAxis',
    valueField: temperatureField,
    type: 'smoothedLine',
    lineAlpha: 1,
    lineColor: '#C74523',
    useDataSetColors: false,
    showBalloon: true,
    connect: false,
    bulletSize: 5,
    bullet,
    balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '0,0.0')}°C</strong>`,
  };
  let stockGraphs = [];

  if (hasMinMax) {
    stockGraphs = [...temperatureMinMaxStockGraphs(), temperatureGraph];
  } else {
    stockGraphs.push(temperatureGraph);
  }

  return {
    allLabels: [
      { text: 'Temperature', bold: true, x: 5, y: 0 },
      { text: '°C', x: 80, y: 2, color: '#999', size: 9 },
    ],
    showCategoryAxis: false,
    addClassNames: true,
    chartCursor: { enabled: true },
    valueAxes: [
      {
        id: 'temperatureValueAxis',
        dashLength: 6,
        labelsEnabled: false,
        guides: [
          makeGuide(0),
          makeGuide(10),
          makeGuide(20),
          makeGuide(30),
          makeGuide(40),
          {
            fillAlpha: 0.3,
            fillColor: '#fff',
            value: 0,
            toValue: 40,
          },
        ],
      },
    ],
    stockGraphs,
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  };
}

/**
 * Price Panels:
 *  1 - Log (300-15000),
 *  2 - Normal (0-100),
 *  3 - Log of neg Prices (0-1000)
 */
function getPricePanels(listeners, priceField) {
  function makePriceGuide(value, label, hasDash, lineColor) {
    return {
      label,
      value,
      dashLength: hasDash ? 6 : 0,
      lineColor: lineColor || '#ccc',
      lineThickness: 1,
      lineAlpha: 1,
      includeGuidesInMinMax: false,
    };
  }

  return [{
    allLabels: [
      { text: 'Price', bold: true, x: 5, y: 0 },
      { text: '$/MWh', x: 35, y: 2, color: '#999', size: 9 },
    ],
    showCategoryAxis: false,
    chartCursor: {},
    valueAxes: [
      {
        id: 'pricePosLogValueAxis',
        logarithmic: true,
        dashLength: 6,
        zeroGridAlpha: 0,
        maximum: 20000,
        minimum: 300,
        labelsEnabled: false,
        gridAlpha: 0,
        guides: [
          makePriceGuide(300, '300', true, '#aaa'),
          makePriceGuide(2000, '', true),
          makePriceGuide(6000, '', true),
          makePriceGuide(10000, '', true),
          makePriceGuide(14000, '', true),
          {
            fillAlpha: 1,
            fillColor: '#ece9e6',
            lineAlpha: 0,
            value: 1,
            toValue: 300,
            above: true,
          },
        ],
      },
    ],
    stockGraphs: [
      {
        id: 'pricePosStockGraph',
        valueAxis: 'pricePosLogValueAxis',
        valueField: 'pricePos',
        type: 'step',
        lineAlpha: 1,
        lineColor: '#C74523',
        dashLength: 1,
        useDataSetColors: false,
        showBalloon: true,
        balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '$0,0.00')}</strong>`,
      },
    ],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  },
  {
    showCategoryAxis: false,
    chartCursor: {},
    valueAxes: [
      {
        id: 'priceValueAxis',
        logarithmic: false,
        dashLength: 6,
        zeroGridAlpha: 0,
        maximum: 300,
        minimum: 0,
        guides: [
          makePriceGuide(0, '', false, '#333'),
          {
            fillAlpha: 0.3,
            fillColor: '#fff',
            value: 0,
            toValue: 300,
          },
        ],
      },
    ],
    stockGraphs: [
      {
        id: 'priceStockGraph',
        valueAxis: 'priceValueAxis',
        valueField: priceField,
        type: 'step',
        lineAlpha: 0.9,
        lineColor: '#C74523',
        useDataSetColors: false,
        showBalloon: true,
        balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '$0,0.00')}</strong>`,
      },
    ],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  },
  {
    showCategoryAxis: false,
    chartCursor: {},
    valueAxes: [
      {
        id: 'priceNegValueAxis',
        reversed: true,
        logarithmic: true,
        dashLength: 7,
        zeroGridAlpha: 0,
        labelsEnabled: false,
        maximum: 1000,
        minimum: 1,
        gridAlpha: 0,
        guides: [
          makePriceGuide(60, '', true),
          makePriceGuide(400, '', true),
        ],
      },
    ],
    stockGraphs: [
      {
        id: 'priceNegStockGraph',
        valueAxis: 'priceNegValueAxis',
        valueField: 'priceNeg',
        type: 'step',
        lineAlpha: 1,
        lineColor: '#C74523',
        dashLength: 1,
        useDataSetColors: false,
        showBalloon: true,
        balloonFunction: item => `<strong>${formatNumberForDisplay(item.values.value, '$0,0.00')}</strong>`,
      },
    ],
    guides: [],
    listeners,
    stockLegend: { enabled: false },
  }];
}

export {
  getGenerationPanel,
  getEnergyPanel,
  getEmissionsPanel,
  getEmissionIntensityPanel,
  getTemperaturePanel,
  getPricePanels,
};
