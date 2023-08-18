<template>
  <div class="select is-rounded">
    <select v-model="selected">
      <option 
        v-for="(domain) in domains" 
        :key="domain.id" 
        :value="domain.id">
        {{ domain.label }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      selected: null
    }
  },

  watch: {
    domains(val) {
      this.selected = val[0].id
    },
    selected(val) {
      this.$emit('domainSelect', val)
    }
  },

  mounted() {
    this.selected = this.domains[0].id
  }
}
</script>
