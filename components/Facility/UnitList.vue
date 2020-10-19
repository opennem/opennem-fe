<template>
  <table class="summary-list">
    <caption>
      <dates-display
        :is-hovering="hoverOn"
        :start-date="startTime"
        :end-date="endTime"
        :hovered-date="hoverDate ? hoverDate.getTime() : null"
        :range="range"
        :interval="interval"
      />
    </caption>
    <thead class="unit-header-row">
      <tr>
        <th>Unit</th>
        <th class="align-right">
          Registered capacity
          <small>MW</small>
        </th>
        <th class="data-col date-col align-right hover-cell">
          Power
          <small>MW</small>
        </th>
        <th class="data-col align-right hover-cell">
          Capacity factor
          <small>%</small>
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
            {{ calculateCapacityFactor(getPowerValue(d.code), d.registeredCapacity) | percentageFormatNumber }}
          </span>
        </td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <th>Total</th>
        <th class="align-right cell-value">{{ unitsTotalCapacity }}</th>
        <th class="align-right hover-cell cell-value">
          <span v-if="hoverOn">
            {{ hoverTotal | formatValue }}
          </span>
        </th>
        <th class="align-right hover-cell cell-value">
          <span v-if="hoverOn">
            Av. {{ calculateCapacityFactor(isEnergyType ? hoverAveragePowerTotal : hoverTotal, operatingUnitsTotalCapacity) | percentageFormatNumber }}
          </span>
        </th>
      </tr>
    </tfoot>
    
  </table>
</template>

<script>
import DateDisplay from '@/services/DateDisplay.js'
import DatesDisplay from '@/components/SummaryTable/DatesDisplay'

export default {
  components: {
    DatesDisplay
  },
  props: {
    isEnergyType: {
      type: Boolean,
      default: false
    },
    units: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    averagePowerDataset: {
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
    },
    range: {
      type: String,
      default: null
    },
    interval: {
      type: String,
      default: null
    }
  },

  computed: {
    operatingUnits() {
      return this.units.filter(u => u.status === 'Operating')
    },
    operatingUnitsTotalCapacity() {
      return this.calculateTotalRegisteredCapacity(this.operatingUnits)
    },
    unitsTotalCapacity() {
      return this.calculateTotalRegisteredCapacity(this.units)
    },
    startTime() {
      if (this.dataset.length > 0) {
        return this.dataset[0].time
      }
      return null
    },
    endTime() {
      if (this.dataset.length > 0) {
        return this.dataset[this.dataset.length - 1].time
      }
      return null
    },

    hoverData() {
      return this.hoverDate && this.dataset.length > 0
        ? this.dataset.find(d => d.time === this.hoverDate.getTime())
        : null
    },
    hoverAveragePowerData() {
      return this.hoverDate && this.averagePowerDataset.length > 0
        ? this.averagePowerDataset.find(
            d => d.time === this.hoverDate.getTime()
          )
        : null
    },
    hoverDisplayDate() {
      if (!this.hoverDate) {
        return ''
      }
      return DateDisplay.defaultDisplayDate(this.hoverDate.getTime())
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
    },
    hoverAveragePowerTotal() {
      if (!this.hoverAveragePowerData) {
        return null
      }
      let total = null
      this.operatingUnits.forEach(u => {
        const value = this.hoverAveragePowerData[u.code]
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
    getPowerValue(code) {
      const hover = this.isEnergyType
        ? this.hoverAveragePowerData
        : this.hoverData
      return hover ? hover[code] : ''
    },
    calculateCapacityFactor(value, capacity) {
      return value || value === 0 ? (value / capacity) * 100 : null
    },
    calculateTotalRegisteredCapacity(units) {
      let total = null
      units.forEach(u => {
        const value = u.registeredCapacity
        if (value || value === 0) {
          total += value
        }
      })
      return total
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
  @include mobile {
    font-size: 0.8em;
  }
}

table {
  font-size: 12px;
  width: 100%;

  .cell-value {
    font-family: $family-primary;
  }

  td,
  th {
    padding: 3px 6px;
    border-bottom: 1px solid #ddd;
  }
  th {
    font-family: $family-secondary;
    font-weight: 700;
    // border-bottom: 1px solid #000;
    vertical-align: bottom;
  }

  .unit-header-row {
    th {
      font-weight: 700;
      small {
        display: block;
        color: #999;
      }
    }
  }

  td {
    border-bottom: 1px solid #ddd;
  }

  tfoot {
  }
}
</style>
