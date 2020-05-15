<template>
  <table class="table is-narrow is-bordered is-fullwidth is-striped is-hoverable">
    <thead>
      <tr>
        <th 
          v-for="(key, i) in keys" 
          :key="i">{{ key }}</th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="(d, i) in dataset" 
        :key="i">
        <td 
          v-for="(key, kIndex) in Object.keys(d)" 
          :key="`${key}-${kIndex}-${i}`">

          <span v-if="key === 'date'">{{ formatDate(d[key]) }}</span>
          <span v-else> {{ d[key] }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import format from 'date-fns/format'

export default {
  props: {
    dataset: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    keys() {
      return this.dataset.length > 0 ? Object.keys(this.dataset[0]) : []
    }
  },
  methods: {
    formatDate(date) {
      return format(date, 'dd MMM yyyy')
    }
  }
}
</script>

<style lang="scss" scoped>
.table {
  font-size: 0.8em;
}
</style>
