import Vue from 'vue'
import * as Vue2Leaflet from 'vue2-leaflet'

const VueLeaflet = {
  install(Vue, options) {
    Vue.component('l-map', Vue2Leaflet.LMap)
    Vue.component('l-marker', Vue2Leaflet.LMarker)
    Vue.component('l-tile-layer', Vue2Leaflet.LTileLayer)
    Vue.component('l-icon', Vue2Leaflet.LIcon)
    Vue.component('l-feature-group', Vue2Leaflet.LFeatureGroup)
    Vue.component('l-control', Vue2Leaflet.LControl)
    Vue.component('l-circle', Vue2Leaflet.LCircle)
    Vue.component('l-popup', Vue2Leaflet.LPopup)
  }
}

Vue.use(VueLeaflet)
export default VueLeaflet
