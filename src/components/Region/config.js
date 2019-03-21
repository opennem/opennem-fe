import {
  getGenerationPanel,
  getEnergyPanel,
  getPricePanels,
  getTemperaturePanel,
} from '@/lib/chart-panels';

function getAllPanelsGeneration(listeners, priceField, temperatureField, hasMinMax, showBullets) {
  return [
    getGenerationPanel(listeners),
    ...getPricePanels(listeners, priceField), // 3 panels in price
    getTemperaturePanel(listeners, temperatureField, hasMinMax, showBullets),
  ];
}

function getAllPanelsEnergy(
  listeners, priceField, temperatureField,
  hasMinMax, showBullets, intervalLabel, unit) {
  return [
    getEnergyPanel(listeners, intervalLabel, unit),
    ...getPricePanels(listeners, priceField), // 3 panels in price
    getTemperaturePanel(listeners, temperatureField, hasMinMax, showBullets),
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
    getTemperaturePanel(listeners),
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
};
