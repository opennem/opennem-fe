import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home'
import MarketByRegion from '../views/MarketByRegion'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/amcharts',
      component: MarketByRegion
    }
  ]
})
