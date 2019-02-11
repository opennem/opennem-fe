import Vue from 'vue';
import VueAnalytics from 'vue-analytics';
import router from '@/router';
import analytics from '.';

Vue.use(VueAnalytics, {
  id: 'UA-113446419-2',
  debug: {
    sendHitTask: false,
  },
  router,
});

export default analytics;
