<template>
  <div>
    <AllRegionsWidget :genData="chartData" :refreshing="refreshing"></AllRegionsWidget>
  </div>
</template>

<script>
import * as moment from 'moment'
import { mapGetters } from 'vuex'
import axios from 'axios'
import { getJSON } from '../utils/Firebase'
import { generateChartData } from '../utils/DataHelpers'
import AllRegionsWidget from '../components/AllRegionsWidget'

export default {
  components: {
    AllRegionsWidget
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
        const resData = generateChartData(response.data)
        const threeDaysAgo = moment().subtract(72, 'hours')
        const trim = resData.filter(d => {
          return moment(d.date).isSameOrAfter(threeDaysAgo)
        })

        this.chartData = trim
      })
    },
  }
}
</script>
