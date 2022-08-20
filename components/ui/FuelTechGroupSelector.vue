<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option v-for="(g, index) in groups" :key="index" :value="g">
        {{ g }}
      </option>
      <option v-if="showRegionCompareOption" disabled>——————————</option>
      <option v-if="showRegionCompareOption" value="regions">Regions</option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ftGroups, GROUP_DEFAULT } from '@/constants/energy-fuel-techs/'

export default {
  data() {
    return {
      groups: ftGroups,
      selected: ftGroups[0]
    }
  },

  computed: {
    ...mapGetters({
      featureRegionCompare: 'feature/regionCompare',
      fuelTechGroupName: 'fuelTechGroupName'
    }),
    regionId() {
      return this.$route.params.region
    },
    isRegionCompareRoute() {
      return this.$route.name === 'energy-region-view-regions'
    },
    showRegionCompareOption() {
      return this.regionId === 'nem' && this.featureRegionCompare
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
        this.$store.dispatch('fuelTechGroupName', GROUP_DEFAULT)
        this.selected = GROUP_DEFAULT
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
