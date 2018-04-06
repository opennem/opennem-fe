import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Region from '@/components/Region';
import Widget from '@/components/Widget';
import About from '@/components/About';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/regions/:region',
      name: 'regions',
      component: Region,
    },
    {
      path: '/widget',
      name: 'widget',
      component: Widget,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
  ],
});
