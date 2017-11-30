<template>
  <div>
    <header>
      {{region}} — {{ft}}
    </header>

    <Vis></Vis>
  </div>
</template>

<script>
import Vis from '../components/GeneratorsVis'

export default {
  components: {
    Vis
  },
  data() {
    return {
      region: this.$route.params.region,
      ft: this.$route.params.ft
    }
  },
  created() {
    this.$store.dispatch('fetchRegionFtByGeneratorsData', { 
      region: this.region,
      ft: this.ft
    })
  },
  methods: {}
}

</script>

<style>

</style>
