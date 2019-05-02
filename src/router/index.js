import Vue from 'vue';
import Router from 'vue-router';
import HomeView from '@/components/HomeView';
import RegionView from '@/components/RegionView';
import EnergyView from '@/components/EnergyView';
import GeneratorsView from '@/components/GeneratorsView';
import GeneratorsView2 from '@/components/GeneratorsView2';
import StationView from '@/components/StationView';
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
          path: 'facilities2',
          name: 'home-generators2',
          component: GeneratorsView,
        },
        {
          path: 'facilities',
          name: 'home-generators',
          component: GeneratorsView2,
        },
      ],
    },
    {
      path: '/regions/:region',
      props: true,
      name: 'region',
      component: RegionView,
      redirect: 'regions/:region/energy',
      children: [
        {
          path: 'energy',
          name: 'region-energy',
          component: Region,
        },
        {
          path: 'facilities',
          name: 'region-generators',
          component: GeneratorsView2,
        },
      ],
    },
    {
      path: '/station/:stationId',
      props: true,
      name: 'station',
      component: StationView,
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
