import Vue from 'vue';
import { formatNumberForDisplay } from '@/lib/formatter';

Vue.filter('formatNumber', (value, format) =>
  formatNumberForDisplay(value, format),
);

Vue.filter('facilityFormatNumber', (value) => {
  const f = value < 10 ? '0,0.0' : '0,0';
  return formatNumberForDisplay(value, f);
});
