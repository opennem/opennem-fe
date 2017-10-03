<template>
  <div>
    <h2>Electricity Production</h2>

    <EPVisualisation :genData="genData"></EPVisualisation>
  </div>
</template>

<script>
import axios from 'axios'
import EPVisualisation from 'components/ElectricityProduction/Visualisation'

export default {
  components: {
    EPVisualisation
  },
  data() {
    return {
      genData: null
    }
  },
  mounted() {
    axios.get('/samples/combined_sample.json')
      .then(function(response) {
        this.genData = response.data
      }.bind(this))
  }
}
</script>
