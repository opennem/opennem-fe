import {
  getGenerationPanel,
  getEnergyPanel,
  getPricePanels,
  getTemperaturePanel,
  getEmissionsPanel,
  getEmissionIntensityPanel,
} from '@/lib/chart-panels';

function getAllPanelsGeneration(listeners, priceField, temperatureField, hasMinMax, showBullets) {
  return [
    getGenerationPanel(listeners),
    ...getPricePanels(listeners, priceField), // 3 panels in price
    getTemperaturePanel(listeners, temperatureField, hasMinMax, showBullets, false),
  ];
}

function getAllPanelsEnergy(
  listeners, priceField, temperatureField,
  hasMinMax, showBullets, intervalLabel, unit, panelsSelectedId) {
  const panels = panelsSelectedId === 'priceTemperature'
    ? [
      ...getPricePanels(listeners, priceField), // 3 panels in price
      getTemperaturePanel(listeners, temperatureField, hasMinMax, showBullets, true),
    ]
    : [
      getEmissionsPanel(listeners),
      getEmissionIntensityPanel(listeners, true),
    ];
  return [
    getEnergyPanel(listeners, intervalLabel, unit),
    ...panels,
  ];
}

function getGenerationAndPricePanels(listeners) {
  return [
    getGenerationPanel(listeners),
    ...getPricePanels(listeners), // 3 panels in price
  ];
}

function getGenerationAndTemperaturePanels(listeners) {
  return [
    getGenerationPanel(listeners),
    getTemperaturePanel(listeners, false),
  ];
}

function generationPanel(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

function energyPanel(listeners, intervalLabel, unit) {
  return [
    getEnergyPanel(listeners, intervalLabel, unit),
  ];
}

function getAllPanelsPercentHeight() {
  return [50, 7, 13, 5, 15];
}

function getGenerationOnlyPanelPercentHeight() {
  return [100, 0, 0, 0, 0];
}

function getGenerationPricePanelPercentHeight() {
  return [60, 10, 18, 7, 0];
}

function getGenerationTemperaturePanelPercentHeight() {
  return [70, 0, 0, 0, 30];
}

const panelHeights = {
  energy: [100, 0, 0, 0, 0, 0, 0],
  priceTemperature: [50, 7, 13, 5, 15],
  emissionVolIntensity: [50, 25, 15],
  price: [65, 10, 18, 7, 0, 0, 0],
  temperature: [70, 0, 0, 0, 30, 0, 0],
  emissionVolume: [65, 0, 0, 0, 0, 35, 0],
  emissionIntensity: [70, 0, 0, 0, 0, 0, 30],
};

export {
  getAllPanelsGeneration,
  getAllPanelsEnergy,
  getGenerationAndPricePanels,
  getGenerationAndTemperaturePanels,
  generationPanel,
  energyPanel,
  getAllPanelsPercentHeight,
  getGenerationOnlyPanelPercentHeight,
  getGenerationPricePanelPercentHeight,
  getGenerationTemperaturePanelPercentHeight,
  panelHeights,
};
