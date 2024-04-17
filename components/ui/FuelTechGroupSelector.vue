<template>
  <div class="select">
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

<style lang="scss" scoped>
.select:not(.is-multiple):not(.is-loading)::after {
  border-color: #333;
  border-radius: 0;
  border-width: 1px;
}

.select {
  select:active, select:focus {
    border-color: #333;
    box-shadow: none;
  }
}
</style>
