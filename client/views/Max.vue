<template>
  <div>
    <AllRegionsChart 
      :genData="chartData" 
      :noGuides="true" 
      :refreshing="refreshing"
      :chartType="'column'">
    </AllRegionsChart>
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
  mounted() {
    // currently only have SA data
    this.$store.commit('updateWeekStarting', 'all')
    this.$store.commit('updateRegionId', 'sa')
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
      const week = this.weekStarting
      const interval = '1M'

      const get = getJSON(`all/gen_1M_sa1.json`)

      get.then(generation => {
        console.log(generation)
        let res = generation.data
        this.chartData = generateChartData(res)
        console.log(this.chartData)
      })
    },
  }
}
</script>
