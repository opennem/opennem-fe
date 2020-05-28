<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option
        v-for="(g, index) in groups"
        :key="index"
        :value="g">
        {{ g }}
      </option>
      <option disabled>——————————</option>
      <option 
        v-if="regionId === 'nem'" 
        value="regions">Regions</option>
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
    },
    isRegionCompareRoute() {
      return this.$route.name === 'energy-region-view-regions'
    }
  },

  watch: {
    selected(newValue, oldValue) {
      if (this.regionId === 'nem' && newValue === 'regions') {
        this.$store.dispatch('fuelTechGroupName', newValue)
        this.$router.push({ path: '/energy/nem/view/regions' })
      } else {
        this.triggerGroupChange()
        if (oldValue === 'regions') {
          this.$router.push({ path: `/energy/${this.regionId}` })
        }
      }
    },
    fuelTechGroupName(group) {
      this.selected = group
    }
  },

  mounted() {
    if (this.fuelTechGroupName === 'regions') {
      if (this.regionId !== 'nem') {
        this.$store.dispatch('fuelTechGroupName', 'Default')
        this.selected = 'Default'
        this.$router.push({ path: `/energy/${this.regionId}` })
      } else {
        this.selected = this.fuelTechGroupName
      }
    } else if (this.isRegionCompareRoute) {
      this.$router.push({ path: `/energy/${this.regionId}` })
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
