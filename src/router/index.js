import Vue from 'vue';
import Router from 'vue-router';
import HomeView from '@/components/HomeView';
import RegionView from '@/components/RegionView';
import EnergyView from '@/components/EnergyView';
import FacilitiesView from '@/components/FacilitiesView';
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
          path: 'facilities',
          name: 'home-facilities',
          component: FacilitiesView,
        },
      ],
    },
    {
      path: '/regions/:region',
      props: true,
      name: 'region-prev',
      component: RegionView,
      redirect: 'region/:region/energy',
    },
    {
      path: '/region/:region',
      props: true,
      name: 'region',
      component: RegionView,
      redirect: 'region/:region/energy',
      children: [
        {
          path: 'energy',
          name: 'region-energy',
          component: Region,
        },
        {
          path: 'facilities',
          name: 'region-facilities',
          component: FacilitiesView,
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
