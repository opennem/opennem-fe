/* eslint-disable import/no-extraneous-dependencies */
import Vue from 'vue'
import { MglMap, MglMarker } from 'vue-mapbox'
import Mapbox from 'mapbox-gl'

Vue.component('MglMap', MglMap)
Vue.component('MglMarker', MglMarker)

Vue.prototype.$mapbox = Mapbox
