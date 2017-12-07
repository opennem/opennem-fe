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
    onRegionChange(event) {
      this.region =  event.target.value
      this.$router.push({ name: 'regions', params: { region: this.region } })
    },
    onWeekRangeChange(event) {
      this.weekStarting = event.target.value
      this.$store.commit('updateWeekStarting', event.target.value)
    },
    fetchData() {
      this.dataReady = false
      this.fetchGenerationByRegionData({
        region: this.region
      })
    },
    fetchGenerationByRegionData(data) {
      const week = this.weekStarting
      const fetchGen = getJSON(`${week}/gen_5m_${data.region}1.json`)
      const fetchDispatch = getJSON(`${week}/dispatch_5m_${data.region}1.json`)
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
