import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import { sync } from 'vuex-router-sync'
import App from './components/App'
import router from './router'
import store from './store'

// AmChart imports
import 'amstock3/amcharts/amcharts'
import 'amstock3/amcharts/serial'
import 'amstock3/amcharts/amstock'

sync(store, router)

Vue.use(VueAnalytics, {
  id: 'UA-113446419-2', // UA-113446419-1
  router,
  autoTracking: {
    pageviewOnLoad: false
  }
})

const app = new Vue({
  router,
  store,
  ...App
})

export { app, router, store }
