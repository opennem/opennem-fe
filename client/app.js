import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './components/App'
import router from './router'
import store from './store'

// AmChart imports
import 'amstock3/amcharts/amcharts'
import 'amstock3/amcharts/serial'
import 'amstock3/amcharts/amstock'

sync(store, router)

const app = new Vue({
  router,
  store,
  ...App
})

export { app, router, store }
