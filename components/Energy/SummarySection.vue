<template>
  <section>
    <h1>summary section</h1>
    <group-selector />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import GroupSelector from '@/components/ui/FuelTechGroupSelector.vue'

export default {
  components: {
    GroupSelector
  }
}
</script>
