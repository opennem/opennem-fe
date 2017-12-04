<template>
  <div>
    <header>
      {{getFTLabel(ft)}}
    </header>

    <GeneratorsVis :genData="generatorsData"></GeneratorsVis>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getJSON } from '../utils/Firebase'

import { FUEL_TECH } from "../utils/FuelTechConfig";
import GeneratorsVis from '../components/GeneratorsVis'

export default {
  components: {
    GeneratorsVis
  },
  data() {
    return {
      region: this.$route.params.region,
      ft: this.$route.params.ft,
      generatorsData: null
    }
  },
  created() {
    // this.$store.dispatch('fetchRegionFtByGeneratorsData', { 
    //   region: this.region,
    //   ft: this.ft
    // })

    this.fetchRegionFtByGeneratorsData({
      region: this.region,
      ft: this.ft
    })
  },
  computed: {
    ...mapGetters({
      weekStarting: "getWeekStarting"
    })
  },
  methods: {
    fetchRegionFtByGeneratorsData(data) {
      const week = this.weekStarting  
      const getGenerators = getJSON(`${week}/gen_5m_${data.region}1_${data.ft}.json`)

      getGenerators.then(generators => {
        let res = generators.data
        if (typeof generators.data === 'string') {
          res = generators.data.replace(/NaN/g, 'null')
          res = JSON.parse(res)
        }
        this.generatorsData = res
      })
    },
    getFTLabel(ft) {
      return FUEL_TECH[ft].label
    }
  }
}

</script>

<style>

</style>
