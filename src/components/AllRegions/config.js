import { getGenerationPanel, getEnergyPanel, getEmissionsPanel, getEmissionIntensityPanel } from '@/lib/chart-panels';

function powerPanel(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}

function energyPanel(listeners, intervalLabel, unit) {
  return [
    getEnergyPanel(listeners, intervalLabel, unit),
    getEmissionsPanel(listeners),
    getEmissionIntensityPanel(listeners, true),
  ];
}

export {
  powerPanel,
  energyPanel,
};
