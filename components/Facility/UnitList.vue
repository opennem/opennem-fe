<template>
  <table class="summary-list">
    <thead>
      <tr>
        <th>Unit</th>
        <th>Registered capacity</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(d, i) in units"
        :key="i"
        :class="{ 'is-inactive': !isActive(d.status) }"
        @mouseenter="handleMouseEnter(d.code, d.status)"
        @mouseleave="handleMouseLeave">
        <td 
          v-tooltip.left="isActive(d.status) ? '' : d.status"
        >
          <div 
            :style="{ backgroundColor: d.colour}" 
            class="colour-square" />
          {{ d.code }}
        </td>
        <td>{{ d.registeredCapacity }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    units: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    isActive(status) {
      return status === 'Operating'
    },
    handleMouseEnter(code, status) {
      if (this.isActive(status)) {
        this.$emit('codeHover', code)
      }
    },
    handleMouseLeave() {
      this.$emit('codeHover', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.is-inactive {
  td {
    color: #aaa;
  }
}

.colour-square {
  width: 18px;
  height: 18px;
  float: left;
  margin-right: 5px;
}
</style>
