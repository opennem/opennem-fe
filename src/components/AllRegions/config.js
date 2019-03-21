import { getGenerationPanel, getEnergyPanel } from '@/lib/chart-panels';

function powerPanel(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

function energyPanel(listeners, intervalLabel, unit) {
  return [
    getEnergyPanel(listeners, intervalLabel, unit),
  ];
}

export {
  powerPanel,
  energyPanel,
};
