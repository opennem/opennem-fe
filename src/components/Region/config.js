import {
  getGenerationPanel,
  getPricePanels,
  getTemperaturePanel,
} from '@/lib/chart-panels';

function getAllPanels(listeners) {
  return [
    getGenerationPanel(listeners),
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
function getGenerationPanels(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

export {
  getAllPanels,
  getGenerationAndPricePanels,
  getGenerationAndTemperaturePanels,
  getGenerationPanels,
};
