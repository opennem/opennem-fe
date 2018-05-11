import {
  getGenerationPanel,
  getEnergyPanel,
  getPricePanels,
  getTemperaturePanel,
} from '@/lib/chart-panels';

function getAllPanelsGeneration(listeners) {
  return [
    getGenerationPanel(listeners),
    ...getPricePanels(listeners), // 3 panels in price
    getTemperaturePanel(listeners),
  ];
}

function getAllPanelsEnergy(listeners) {
  return [
    getEnergyPanel(listeners),
    ...getPricePanels(listeners), // 3 panels in price
    getTemperaturePanel(listeners),
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

function energyPanel(listeners) {
  return [
    getEnergyPanel(listeners),
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
