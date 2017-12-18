<template>
  <div>
    <div class="loader" v-if="!dataReady"></div>
    <ElectricityPriceVis v-show="dataReady" :genData="sourceLoadPriceData"></ElectricityPriceVis>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { getJSON } from '../utils/Firebase'

import ElectricityPriceVis from '../components/ElectricityPriceVis'

export default {
  components: {
    ElectricityPriceVis
  },
  mounted() {
    this.fetchData()
  },
  data() {
    return {
      region: this.$route.params.region,
      dataReady: false,
      sourceLoadPriceData: null,
    }
  },
  watch: {
    '$route': 'fetchData',
    sourceLoadPriceData(newData) {
      this.dataReady = true
    },
    getWeekStarting(newData) {
      this.fetchData()
    },
  },
  computed: {
    ...mapGetters({
      getWeekStarting: 'getWeekStarting',
    })
  },
  methods: {
    fetchData() {
      console.log('fetching generation/dispatch/price data')
      this.dataReady = false
      this.fetchGenerationByRegionData({
        region: this.$route.params.region,
        week: this.$store.state.weekStarting
      })
    },
    fetchGenerationByRegionData(data) {
      const week = data.week
      if (week !== undefined) {
        const interval = '5m'

        const fetchGen = getJSON(`${week}/gen_${interval}_${data.region}1.json`)
        const fetchDispatch = getJSON(`${week}/dispatch_${interval}_${data.region}1.json`)
        const fetchPrice = getJSON(`${week}/price_30m_${data.region}1.json`)

        axios.all([fetchGen, fetchDispatch, fetchPrice])
          .then(axios.spread((gen, dispatch, price) => {
            const data = Object.assign(gen.data, dispatch.data, price.data)
            this.sourceLoadPriceData = data
          })
        )
      }
    }
  }
}
</script>
