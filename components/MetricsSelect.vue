<template>
  <div 
    class="select is-rounded">
    <select v-model="selectedMetric">
      <option 
        v-if="featureEmissions" 
        value="carbonIntensity">
        Carbon intensity
      </option>
            
      <optgroup label="Proportion of demand">
        <option value="netInterconnectorFlow">
          Net imports proportion
        </option>
        <option value="renewablesProportion">
          Renewables proportion
        </option>
        <option value="solarProportion">
          Solar proportion
        </option>
        <option value="windProportion">Wind proportion</option>
        <option value="gasProportion">Gas proportion</option>
        <option value="coalProportion">Coal proportion</option>
      </optgroup>

      <optgroup label="Average spot market value">
        <option value="solarValue">Solar value</option>
        <option value="windValue">Wind value</option>
        <option value="hydroValue">Hydro value</option>
        <option value="gasValue">Gas value</option>
        <option value="coalValue">Coal value</option>
        <option 
          v-if="featureComparePrice" 
          value="price">Volume-weighted price</option>
        <option 
          v-if="featureComparePrice" 
          value="inflatedPrice">
          Volume-weighted price (inflation adjusted)
        </option>
      </optgroup>

      <optgroup label="Temperature">
        <option value="temperature">Average temperature</option>
        <option value="minTemperature">Minimum temperature</option>
        <option value="maxTemperature">Maximum temperature</option>
      </optgroup>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
  export default {
    computed: {
      ...mapGetters({
        featureEmissions: 'feature/emissions',
        featureComparePrice: 'feature/comparePrice'
      }),

      selectedMetric: {
      get() {
        return this.$store.getters['stripes/selectedMetric']
      },

      set(val) {
        this.$store.commit('stripes/selectedMetric', val)
      }
    },
    }
  }
</script>