<template>
  <div>
    <h5>Electricity production in
      [region]
      for the week of
      [date selector]
    </h5>

    <FuelTechChart :genData="genData"></FuelTechChart>
    <PriceChart :priceData="priceData"></PriceChart>
  </div>
</template>

<script>
import * as d3 from 'd3'
import * as moment from 'moment'

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

    d3.json('/samples/gen_sample.json', function(error, data) {
      self.genData = data
    });
    d3.json('/samples/price_sample.json', function(error, data) {
      self.priceData = data
    });

  }
}
</script>

<style>
  h5 {
    text-align: center;
  }
</style>
