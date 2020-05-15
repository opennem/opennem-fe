<template>
  <section class="container">
    <regions-table />

  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import RegionsTable from '@/components/Energy/RegionsTable.vue'

export default {
  layout: 'main',
  components: {
    RegionsTable
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
