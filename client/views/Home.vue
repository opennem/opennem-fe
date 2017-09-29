<template>
  <div>
    <h2>Electricity Production</h2>

    <FuelTechChart :genData="genData"></FuelTechChart>
    <PriceChart :priceData="priceData"></PriceChart>
  </div>
</template>

<script>
import * as d3 from 'd3'

import FuelTechChart from 'components/FuelTechChart'
import PriceChart from 'components/PriceChart'

export default {
  components: {
    FuelTechChart,
    PriceChart
  },
  data() {
    return {
      genData: null,
      priceData: null,
    }
  },
  mounted() {
    const self = this;

    d3.json('/samples/combined_sample.json', function(error, data) {
      self.genData = data
    });
    d3.json('/samples/price_sample.json', function(error, data) {
      self.priceData = data
    });
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Raleway:700');
h2 {
  font-family: 'Raleway', sans-serif;
  font-weight: 900;
  margin: 0;
  padding: 0 0 10px;
  border-bottom: 1px solid #000;

}
</style>
