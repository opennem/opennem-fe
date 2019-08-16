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
    }
  },

  watch: {
    selected(newValue) {
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
