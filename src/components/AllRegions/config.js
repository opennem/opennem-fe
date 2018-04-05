import { getGenerationPanel } from '@/lib/chart-panels';

export default function getPanels(listeners) {
  return [
    getGenerationPanel(listeners),
  ];
}
