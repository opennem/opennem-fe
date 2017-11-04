<template>
  <div>
    <header>
      <h2>Electricity Production</h2>
      <div class="date-range">
        <time>2 Mar '17</time> — <time>7 Mar '17</time>    
      </div>
    </header>

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

<style>
  .date-range {
    color: #666;
    position: absolute;
    right: 2rem;
    top: 2rem;
    margin-right: 1rem;
    margin-top: 1rem;
  }
</style>
