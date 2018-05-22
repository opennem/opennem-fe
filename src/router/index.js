import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';
import Region from '@/components/Region';
import Widget from '@/components/Widget';
import About from '@/components/About';
import FeatureToggle from '@/components/FeatureToggle';
import NotFound from '@/components/NotFound';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: 'all-regions',
    },
    {
      path: '/all-regions',
      name: 'home',
      component: Home,
    },
    {
      path: '/regions/:region',
      props: true,
      name: 'regions',
      component: Region,
    },
    {
      path: '/widget/:size',
      props: true,
      name: 'widget',
      component: Widget,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/features',
      name: 'features',
      component: FeatureToggle,
    },
    {
      path: '/404',
      name: '404',
      component: NotFound,
    },
    {
      path: '*',
      redirect: '404',
    },
  ],
});
