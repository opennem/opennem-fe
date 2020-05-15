<template>
  <section class="container">
    <!-- <regions-table /> -->
    <datatable :dataset="datasetEnergy"/>
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import RegionsTable from '@/components/Energy/RegionsTable.vue'
import Datatable from '@/components/Vis/Datatable.vue'

export default {
  layout: 'main',
  components: {
    RegionsTable,
    Datatable
  },
  computed: {
    ...mapGetters({
      datasetEnergy: 'region/datasetEnergy'
    })
  },
  created() {
    this.doGetAllRegions()
  },
  methods: {
    ...mapActions({
      doGetAllRegions: 'region/doGetAllRegions'
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin-top: 3rem;
}
</style>
