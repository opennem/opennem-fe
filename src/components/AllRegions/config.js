import { getGenerationPanel, getEnergyPanel } from '@/lib/chart-panels';

function powerPanel(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

function energyPanel(listeners, intervalLabel) {
  return [
    getEnergyPanel(listeners, intervalLabel),
  ];
}

export {
  powerPanel,
  energyPanel,
};
