import Vue from 'vue';
import Router from 'vue-router';
import HomeView from '@/components/HomeView';
import EnergyView from '@/components/EnergyView';
import GeneratorsView from '@/components/GeneratorsView';
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
      component: HomeView,
      redirect: 'all-regions/energy',
      children: [
        {
          path: 'energy',
          name: 'home-energy',
          component: EnergyView,
        },
        {
          path: 'generators',
          name: 'home-generators',
          component: GeneratorsView,
        },
      ],
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
