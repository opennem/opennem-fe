// Amcharts
import '@/lib/amcharts/amcharts';
import '@/lib/amcharts/serial';
import '@/lib/amcharts/amstock';

import { sync } from 'vuex-router-sync';
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';
import analytics from './analytics';

Vue.config.productionTip = false;
sync(store, router);

/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  store,
  router,
  analytics,
  render: h => h(App),
});

export { app, router, store, analytics };
