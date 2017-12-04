<template>
  <div>
    
    <div class="loader" v-if="!dataReady"></div>
    <Vis v-show="dataReady" :genData="genData" :priceData="priceData"></Vis>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vis from '../components/ElectricityPriceVis'



export default {
  components: {
    Vis
  },
  data() {
    return {
      selectedRegion: this.$route.params.region,
      weekStarting: '2017-10-14',
      dataReady: false
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    // call again the method if the route changes
    // '$route': 'fetchData',
    genData(newData) {
      console.log(newData)
      this.dataReady = true
    }
  },
  computed: {
    ...mapGetters({
       genData: 'getGenerationData',
       priceData: 'getPriceData'
    })
  },
  methods: {
    onRegionChange(event) {
      this.selectedRegion =  event.target.value
      this.$router.push({ name: 'regions', params: { region: this.selectedRegion } })
    },
    onWeekRangeChange(event) {
      this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', event.target.value)
      // this.fetchData()
    },
    fetchData() {
      this.dataReady = false
      this.$store.dispatch('fetchData', { region: this.selectedRegion })
    },
  }
}

</script>

<style>

.region-selector {
  background: none;
  font-size: 1.5rem;
  border: none;
  padding: 0 1rem;
  -webkit-appearance: none;
}
.week-selector {
  position: relative;
  top: -10px;
}

.date-range {
  color: #666;
  position: absolute;
  right: 2rem;
  top: 2rem;
  margin-right: 1rem;
  margin-top: 1rem;
}
</style>
