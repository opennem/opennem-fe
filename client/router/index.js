import Vue from 'vue'
import Router from 'vue-router'
import Home from '../views/Home'
import Home2 from '../views/Home2'

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
      component: Home2
    }
  ]
})
