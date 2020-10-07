<template>
  <table class="summary-list">
    <thead>
      <tr>
        <th>Unit</th>
        <th class="align-right">Registered capacity</th>
        <th class="data-col date-col align-right hover-cell">
          <span v-if="hoverOn">
            {{ hoverDisplayDate }}
          </span>
        </th>
        <th class="data-col align-right hover-cell">
          <span v-if="hoverOn">
            Capacity factor
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
          <span>{{ d.code }}</span>
        </td>
        <td class="align-right">{{ d.registeredCapacity }}</td>
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            {{ getValue(d.code) | formatValue }}
          </span>
        </td>
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            {{ calculateCapacityFactor(getValue(d.code), d.registeredCapacity) | percentageFormatNumber }}
          </span>
        </td>
      </tr>

      
    </tbody>

    <tfoot v-if="units.length > 1">
      <tr>
        <td>&nbsp;</td>
        <td />
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            Total: {{ hoverTotal | formatValue }}
          </span>
        </td>
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            Av.: {{ calculateCapacityFactor(hoverTotal, operatingUnitsTotalCapacity) | percentageFormatNumber }}
          </span>
        </td>
      </tr>
    </tfoot>
    
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
    },
    operatingUnits() {
      return this.units.filter(u => u.status === 'Operating')
    },
    operatingUnitsTotalCapacity() {
      let total = null
      this.operatingUnits.forEach(u => {
        const value = u.registeredCapacity
        if (value || value === 0) {
          total += value
        }
      })
      return total
    },
    hoverTotal() {
      if (!this.hoverData) {
        return null
      }
      let total = null
      this.operatingUnits.forEach(u => {
        const value = this.hoverData[u.code]
        if (value || value === 0) {
          total += value
        }
      })
      return total
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
    },
    calculateCapacityFactor(value, capacity) {
      return value && value === 0 ? (value / capacity) * 100 : null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

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

  @include mobile {
    display: inline;
    float: none;
  }
}

.align-right {
  text-align: right;
}

.data-col {
  width: 25%;
}

.summary-list {
  font-size: 1em;

  @include mobile {
    font-size: 0.8em;
  }
}

table th {
  font-family: $header-font-family;
  border-bottom: 1px solid #000;

  &.date-col {
    font-family: $family-primary;
  }
}

table td.hover-cell,
table th.hover-cell {
  background-color: #efefef;
}
table td.hover-cell {
  border-bottom: 1px solid #dfdfdf;
}
table th.hover-cell {
  border-bottom: 1px solid #000;
}

table tfoot {
  td.hover-cell {
    font-weight: 700;
  }
}
</style>
