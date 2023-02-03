<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option 
        v-for="(g, index) in groups" 
        :key="index" 
        :value="g">
        {{ g }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ftGroups } from '@/constants/energy-fuel-techs/'

export default {
  data() {
    return {
      groups: ftGroups,
      selected: ftGroups[0]
    }
  },

  computed: {
    ...mapGetters({
      fuelTechGroupName: 'fuelTechGroupName'
    }),
    regionId() {
      return this.$route.params.region
    }
  },

  watch: {
    selected() {
      this.triggerGroupChange()
    },
    fuelTechGroupName(group) {
      this.selected = group
    }
  },

  mounted() {
    this.selected = this.fuelTechGroupName
  },

  methods: {
    triggerGroupChange() {
      this.$store.dispatch('fuelTechGroupName', this.selected)
    }
  }
}
</script>
