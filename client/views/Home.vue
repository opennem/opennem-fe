<template>
  <div>
    <AllRegionsChart :genData="chartData" :refreshing="refreshing"></AllRegionsChart>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { getJSON } from '../utils/Firebase'
import { generateChartData, sumRegionsFuelTech } from '../utils/DataHelpers'
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
      const week = this.weekStarting
      const interval = '5m'

      const fetchNsw = getJSON(`${week}/gen_${interval}_nsw1.json`)
      const fetchQld = getJSON(`${week}/gen_${interval}_qld1.json`)
      const fetchSa = getJSON(`${week}/gen_${interval}_sa1.json`)
      const fetchTas = getJSON(`${week}/gen_${interval}_tas1.json`)
      const fetchVic = getJSON(`${week}/gen_${interval}_vic1.json`)

      axios.all([fetchNsw, fetchQld, fetchSa, fetchTas, fetchVic])
        .then(axios.spread((nsw, qld, sa, tas, vic) => {
          const data = sumRegionsFuelTech({
            'nsw': nsw.data,
            'qld': qld.data,
            'sa': sa.data,
            'tas': tas.data,
            'vic': vic.data
          })

          // !! Take out Pumps since it is classified as a load, not source
          delete data.pumps
          delete data.NETINTERCHANGE

          this.chartData = generateChartData(data)
        })
      )
    },
  }
}
</script>
