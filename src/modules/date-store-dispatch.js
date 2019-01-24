export default function (store, start, end, urls, currentRange, period) {
  store.dispatch('datePeriodTransition', true);
  store.dispatch('nemUrls', urls);
  store.dispatch('nemTrim', true);
  store.dispatch('nemDataTrim', { start, end });
  store.dispatch('fetchingData', true);
  store.dispatch('setChartZoomed', false);
  store.dispatch('setVisType', 'energy');
  store.dispatch('currentRange', currentRange);
  store.dispatch('groupToPeriods', [period]);
  store.dispatch('chartTypeTransition', false);
  store.dispatch('currentInterval', period);
}
