<template>
  <div style="padding: 0 1rem">
    <AllRegionsChart :genData="chartData" :refreshing="refreshing"></AllRegionsChart>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { getJSON } from '../utils/Firebase'
import { generateChartData } from '../utils/DataHelpers'
import AllRegionsChart from '../components/AllRegionsChart'

export default {
  components: {
    AllRegionsChart
  },
  data() {
    return {
      chartData: [],
      refreshing: false
    }
  },
  created() {
    this.refreshing = true
    this.fetch()
  },
  computed: {
    ...mapGetters({
      weekStarting: "getWeekStarting"
    })
  },
  watch: {
    weekStarting() {
      this.refreshing = true
      this.fetch()
    },
    chartData() {
      this.refreshing = false
    }
  },
  methods: {
    fetch(data) {
      const fetchData =  getJSON(`data/nem.json`)

      // TODO: handle error
      fetchData.then((response) => {
        this.chartData = generateChartData(response.data)
      })
    },
  }
}
</script>
