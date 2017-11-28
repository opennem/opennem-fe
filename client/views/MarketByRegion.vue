<template>
  <div>
    <header>
      <h2>
      <select class="region-selector" v-on:change="onRegionSelectorChange">
        <option value="nsw1" v-bind:checked="checked">New South Wales</option>
        <option value="qld1">Queensland</option>
        <option value="sa1">South Australia</option>
        <option value="tas1">Tasmania</option>
        <option value="vic1">Victoria</option>
      </select>
      <!-- <select class="region-selector" v-model="selectedRegion">
        <option v-repeat="regions" :value="regionId">{{label}}</option>
      </select> -->
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
    <Vis></Vis>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vis from '../components/ElectricityPriceVis'

const regions = [
  {
    regionId: 'nsw1',
    label: 'New South Wales'
  },
  {
    regionId: 'qld1',
    label: 'Queensland'
  },
  {
    regionId: 'sa1',
    label: 'South Australia'
  },
  {
    regionId: 'tas1',
    label: 'Tasmania'
  },
  {
    regionId: 'vic1',
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
      selectedRegion: this.$route.params.region + '1',
      weekStarting: '2017-10-14'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    onRegionSelectorChange(event) {
      this.selectedRegion = event.target.value
      this.fetchData()
    },
    onWeekRangeChange(event) {
      this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', event.target.value)
      this.fetchData()
    },
    fetchData() {
      this.$store.dispatch('fetchData', { region: this.selectedRegion })
    },
    checked(val) {
      console.log(val)
    }
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
