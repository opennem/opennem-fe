import {
  getGenerationPanel,
  getPricePanels,
  getTemperaturePanel,
} from '@/lib/chart-panels';

export default function getPanels(listeners) {
  return [
    getGenerationPanel(listeners),
    ...getPricePanels(listeners), // 3 panels in price
    getTemperaturePanel(listeners),
  ];
}
