<template>
  <table class="summary-list">
    <thead>
      <tr>
        <th>Unit</th>
        <th class="align-right">Registered capacity</th>
        <th class="data-col align-right">
          <span v-if="hoverOn">
            {{ hoverDisplayDate }}
          </span>
        </th>
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
        <td class="align-right">{{ d.registeredCapacity }}</td>
        <td class="align-right">
          <span v-if="hoverOn">
            {{ getValue(d.code) | formatValue }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import DateDisplay from '@/services/DateDisplay.js'

export default {
  props: {
    units: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hoverOn: {
      type: Boolean,
      default: false
    },
    hoverDate: {
      type: Date,
      default: null
    }
  },

  computed: {
    hoverData() {
      return this.hoverDate && this.dataset.length > 0
        ? this.dataset.find(d => d.time === this.hoverDate.getTime())
        : null
    },
    hoverDisplayDate() {
      if (!this.hoverDate) {
        return ''
      }
      return DateDisplay.defaultDisplayDate(this.hoverDate.getTime())
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
    },
    getValue(code) {
      return this.hoverData ? this.hoverData[code] : ''
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

.align-right {
  text-align: right;
}

.data-col {
  width: 150px;
}
</style>
