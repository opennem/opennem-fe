<template>
  <div>
    <header>
      <h2>
      <select class="region-selector" v-model="selectedRegion" v-on:change="onRegionChange">
        <option v-for="region in regions" :value="region.regionId">
          {{ region.label }}
        </option>
      </select>
      </h2>
      <div class="date-range">
        <select class="week-selector" v-on:change="onWeekRangeChange">
          <option value="2017-11-04">Week starting 04 Nov 2017</option>
          <option value="2017-10-28">Week starting 28 Oct 2017</option>
          <option value="2017-10-21">Week starting 21 Oct 2017</option>
          <option value="2017-10-14">Week starting 14 Oct 2017</option>
          <option value="2017-10-02">Week starting 02 Oct 2017</option>
        </select>
      </div>
    </header>
    <div class="loader" v-if="!dataReady"></div>
    <Vis v-show="dataReady" :genData="genData" :priceData="priceData"></Vis>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vis from '../components/ElectricityPriceVis'

const regions = [
  {
    regionId: 'nsw',
    label: 'New South Wales'
  },
  {
    regionId: 'qld',
    label: 'Queensland'
  },
  {
    regionId: 'sa',
    label: 'South Australia'
  },
  {
    regionId: 'tas',
    label: 'Tasmania'
  },
  {
    regionId: 'vic',
    label: 'Victoria'
  }
]

export default {
  components: {
    Vis
  },
  data() {
    return {
      regions,
      selectedRegion: this.$route.params.region,
      weekStarting: '2017-10-14',
      dataReady: false
    }
  },
  mounted() {
    this.fetchData()
  },
  watch: {
    // call again the method if the route changes
    '$route': 'fetchData',
    genData() {
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
      this.$router.replace({ name: 'regions', params: { region: event.target.value } })
    },
    onWeekRangeChange(event) {
      this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', event.target.value)
      this.fetchData()
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
