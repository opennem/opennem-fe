<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option
        v-for="(g, index) in groups"
        :key="index"
        :value="g">
        {{ g }}
      </option>
      <option 
        v-if="regionId === 'nem'" 
        value="regions">Region compare</option>
    </select>
  </div>
</template>

<script>
const groups = [
  'Default',
  'Simplified',
  'Flexibility',
  'Renewable/Fossil',
  'Solar/Residual'
]

export default {
  data() {
    return {
      groups,
      selected: groups[0]
    }
  },

  computed: {
    fuelTechGroupName() {
      return this.$store.getters.fuelTechGroupName
    },
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    selected(newValue) {
      if (this.regionId === 'nem' && newValue === 'regions') {
        this.$store.dispatch('fuelTechGroupName', newValue)
        this.$router.push({ path: '/energy/nem/view/regions' })
      } else {
        this.triggerGroupChange()
      }
    },
    fuelTechGroupName(group) {
      this.selected = group
    }
  },

  mounted() {
    if (this.regionId !== 'nem' && this.fuelTechGroupName === 'regions') {
      this.$store.dispatch('fuelTechGroupName', 'Default')
      this.selected = 'Default'
    } else {
      this.selected = this.fuelTechGroupName
    }
  },

  methods: {
    triggerGroupChange() {
      this.$store.dispatch('fuelTechGroupName', this.selected)
    }
  }
}
</script>
