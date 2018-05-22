import { getGenerationPanel, getEnergyPanel } from '@/lib/chart-panels';

function powerPanel(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

function energyPanel(listeners) {
  return [
    getEnergyPanel(listeners),
  ];
}

export {
  powerPanel,
  energyPanel,
};
