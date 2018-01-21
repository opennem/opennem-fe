import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home'
import Max from '../views/Max'
import MarketByRegion from '../views/MarketByRegion'
import RegionByFT from '../views/RegionByFT'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home
    },
    {
      name: 'max',
      path: '/max/:region',
      component: Max
    },
    {
      name: 'regions',
      path: '/regions/:region',
      component: MarketByRegion
    },
    {
      name: 'generators',
      path: '/regions/:region/:ft',
      component: RegionByFT
    }
  ]
})
