import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './components/App'
import router from './router'
import store from './store'
import AmCharts from 'amstock3/amcharts/amcharts'
import AmSerial from 'amstock3/amcharts/serial'
import AmStock from 'amstock3/amcharts/amstock'

sync(store, router)

const app = new Vue({
  router,
  store,
  ...App
})

export { app, router, store }
