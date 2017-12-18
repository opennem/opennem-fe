<template>
  <div>
    <div class="loader" v-if="!dataReady"></div>
    <ElectricityPriceVis v-show="dataReady" :genData="generatorsData" :priceData="pData"></ElectricityPriceVis>
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
  data() {
    return {
      region: this.$route.params.region,
      dataReady: false,
      generatorsData: null,
      pData: null
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    generatorsData(newData) {
      this.dataReady = true
    },
    regionId(newData) {
      this.region = newData
      this.fetchData()
    },
    weekStarting(newData) {
      this.fetchData()
    }
  },
  computed: {
    ...mapGetters({
      regionId: 'getRegionId',
      weekStarting: "getWeekStarting"
    })
  },
  methods: {
    fetchData() {
      this.dataReady = false
      this.fetchGenerationByRegionData({
        region: this.region
      })
    },
    fetchGenerationByRegionData(data) {
      const week = this.weekStarting
      const interval = '5m'

      const fetchGen = getJSON(`${week}/gen_${interval}_${data.region}1.json`)
      const fetchDispatch = getJSON(`${week}/dispatch_${interval}_${data.region}1.json`)
      const fetchPrice = getJSON(`${week}/price_30m_${data.region}1.json`)

      axios.all([fetchGen, fetchDispatch, fetchPrice])
        .then(axios.spread((gen, dispatch, price) => {
          const data = Object.assign(gen.data, dispatch.data)
          this.generatorsData = data
          this.pData = price.data
        })
      )
    }
  }
}
</script>
