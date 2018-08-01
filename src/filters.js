import Vue from 'vue';
import { formatNumberForDisplay } from '@/lib/formatter';

Vue.filter('formatNumber', (value, format) =>
  formatNumberForDisplay(value, format),
);
