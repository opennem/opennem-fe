<template>
  <table class="summary-list">
    <caption>
      <dates-display
        :is-hovering="hoverOn"
        :focus-on="focusOn"
        :hovered-date="hoverDate ? hoverDate.getTime() : null"
        :focus-date="focusDate ? focusDate.getTime() : null"
        :start-date="startTime"
        :end-date="endTime"
        :range="range"
        :interval="interval"
        class="date-display"
      />
    </caption>

    <thead class="unit-header-row">
      <tr>
        <th>
          Unit
          <small v-if="areAllUnitsOfSameFuelTech">{{ getFirstUnitFuelTech }}</small>
        </th>
        <th class="align-right">
          Registered capacity
          <small>MW</small>
        </th>
        <th class="data-col date-col align-right hover-cell">
          <span v-if="(isEnergyType && !isYAxisAveragePower) || (!isEnergyType && !(hoverOn || focusOn))">
            Energy
            <small>MWh</small>
          </span>

          <span v-if="isEnergyType && isYAxisAveragePower">
            Av. Power
            <small>MW</small>
          </span>

          <span v-if="!isEnergyType && (hoverOn || focusOn)">
            Power
            <small>MW</small>
          </span>
        </th>
        <th class="data-col align-right hover-cell">
          Capacity factor
          <small>%</small>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(d, i) in filteredUnits"
        :key="i"
        :class="{
          'is-inactive': !isActive(d.status),
          'is-hidden-unit': d.isHidden
        }"
        @click="handleRowClick(d.code)"
        @mouseenter="handleMouseEnter(d.code, d.status)"
        @mouseleave="handleMouseLeave">
        <td
          v-tooltip.left="isActive(d.status) ? '' : d.status"
          class="unit-name"
        >
          <div
            :style="{ backgroundColor: d.colour}"
            class="colour-square" />
          <span>{{ d.code }}</span>
          <span v-if="!areAllUnitsOfSameFuelTech">— {{ d.fuelTechLabel }}</span>
        </td>
        <td class="align-right">{{ d.registeredCapacity }}</td>
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            {{ getHoverValue(d.id) | formatValue }}
          </span>
          <span v-if="!hoverOn && focusOn">
            {{ getFocusValue(d.id) | formatValue }}
          </span>
          <span v-if="!hoverOn && !focusOn && !isYAxisAveragePower">
            {{ summary[d.id].energy | formatValue }}
          </span>
          <span v-if="!hoverOn && !focusOn && isYAxisAveragePower">
            {{ summary[d.id].avPower | formatValue }}
          </span>
        </td>
        <td class="align-right hover-cell">
          <span v-if="hoverOn">
            {{ calculateCapacityFactor(getHoverPowerValue(d.id), d.registeredCapacity) | percentageFormatNumber }}
          </span>
          <span v-if="!hoverOn && focusOn">
            {{ calculateCapacityFactor(getFocusPowerValue(d.id), d.registeredCapacity) | percentageFormatNumber }}
          </span>
          <span v-if="!hoverOn && !focusOn">
            {{ summary[d.id].capFactor | percentageFormatNumber }}
          </span>
        </td>
      </tr>
    </tbody>

    <tfoot v-if="units.length > 1">
      <tr>
        <th>Total</th>
        <th class="align-right cell-value">{{ operatingUnitsTotalCapacity }}</th>
        <th class="align-right hover-cell cell-value">
          <span v-if="hoverOn">
            {{ hoverTotal | formatValue }}
          </span>
          <span v-if="!hoverOn && focusOn">
            {{ focusTotal | formatValue }}
          </span>
          <span v-if="!hoverOn && !focusOn && !isYAxisAveragePower">
            {{ summary.totalEnergy | formatValue }}
          </span>
          <span v-if="!hoverOn && !focusOn && isYAxisAveragePower">
            {{ summary.totalAvPower | formatValue }}
          </span>
        </th>
        <th class="align-right hover-cell cell-value">
          Av.
          <span v-if="hoverOn">
            {{ calculateCapacityFactor(isEnergyType ? hoverAveragePowerTotal : hoverTotal, operatingUnitsTotalCapacity) | percentageFormatNumber }}
          </span>
          <span v-if="!hoverOn && focusOn">
            {{ calculateCapacityFactor(isEnergyType ? focusAveragePowerTotal : focusTotal, operatingUnitsTotalCapacity) | percentageFormatNumber }}
          </span>
          <span v-if="!hoverOn && !focusOn">
            {{ summary.capFactor | percentageFormatNumber }}
          </span>
        </th>
      </tr>
    </tfoot>

  </table>
</template>

<script>
import _cloneDeep from 'lodash.clonedeep'

import DateDisplay from '@/services/DateDisplay.js'
import { FACILITY_OPERATING } from '@/constants/facility-status.js'
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
    isYAxisAveragePower: {
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
    hiddenCodes: {
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
    focusOn: {
      type: Boolean,
      default: false
    },
    focusDate: {
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
    filteredUnits() {
      const units = _cloneDeep(this.units)
      units.forEach(u => {
        const isHidden = this.hiddenCodes.find(d => d === u.code)
        u.isHidden = isHidden ? true : false
      })
      return units
    },
    operatingUnits() {
      return this.filteredUnits.filter(u => u.status === FACILITY_OPERATING)
    },
    operatingUnitsTotalCapacity() {
      return this.calculateTotalRegisteredCapacity(this.operatingUnits)
    },
    areAllUnitsOfSameFuelTech() {
      let same = true,
        currentFuelTech =
          this.units.length > 0 ? this.units[0].fuelTechLabel : null

      this.units.forEach(u => {
        if (u.fuelTechLabel !== currentFuelTech) {
          same = false
        }
      })
      return same
    },
    getFirstUnitFuelTech() {
      return this.units.length > 0 ? this.units[0].fuelTechLabel : null
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
    summary() {
      // dataset length not including undefined or null values
      const ds = this.dataset.filter(d => {
        let allNulls = true
        this.units.forEach(u => {
          const id = u.id
          if (d[id] || d[id] === 0) {
            allNulls = false
          }
        })
        return !allNulls
      })

      const summary = {}
      const unitNonNullLength = {}
      let totalOperatingRegCap = 0,
        totalPower = null,
        totalEnergy = null

      // setup and calculate total Registered capacity
      this.units.forEach(u => {
        const id = u.id
        summary[id] = {
          power: null,
          avPower: null,
          energy: null,
          capFactor: null
        }
        unitNonNullLength[id] = 0
        if (u.status === FACILITY_OPERATING) {
          totalOperatingRegCap += u.registeredCapacity
        }
      })

      const getEnergy = value => {
        if (this.isEnergyType) {
          return value
        } else {
          // calculate energy (MWh) += power * 5mins/60
          const mins = this.interval === '30m' ? 30 : 5
          return (value * mins) / 60
        }
      }

      const getPower = (obj, id) => {
        if (this.isEnergyType) {
          // get power from average power dataset
          const find = this.averagePowerDataset.find(d => d.time === obj.time)
          return find ? find[id] : null
        } else {
          return obj[id]
        }
      }

      // sum power / energy for each Unit
      ds.forEach(d => {
        this.units.forEach(u => {
          const id = u.id
          if (d[id] || d[id] === 0) {
            summary[id].power += getPower(d, id)
            summary[id].energy += getEnergy(d[id])
            unitNonNullLength[id]++
          }
        })
      })

      this.units.forEach(u => {
        const id = u.id

        // calculate capacity factor - av power / registered capacity
        // - average power is calculated using non null length
        summary[id].capFactor = unitNonNullLength[id]
          ? (summary[id].power / unitNonNullLength[id] / u.registeredCapacity) *
            100
          : null

        summary[id].avPower = unitNonNullLength[id]
          ? summary[id].power / unitNonNullLength[id]
          : null

        totalPower += summary[id].power
        totalEnergy += summary[id].energy
      })

      summary.totalPower = totalPower
      summary.totalAvPower = totalPower / ds.length
      summary.totalEnergy = totalEnergy
      summary.avPower = totalPower / ds.length
      summary.capFactor =
        summary.avPower === 0
          ? 0
          : (summary.avPower / totalOperatingRegCap) * 100

      return summary
    },

    hoverData() {
      return this.getData(this.hoverDate)
    },
    hoverAveragePowerData() {
      return this.getAveragePowerData(this.hoverDate)
    },
    hoverTotal() {
      return this.getTotal(this.hoverData)
    },
    hoverAveragePowerTotal() {
      return this.getTotal(this.hoverAveragePowerData)
    },

    focusData() {
      return this.getData(this.focusDate)
    },
    focusAveragePowerData() {
      return this.getAveragePowerData(this.focusDate)
    },
    focusTotal() {
      return this.getTotal(this.focusData)
    },
    focusAveragePowerTotal() {
      return this.getTotal(this.focusAveragePowerData)
    }
  },

  methods: {
    isActive(status) {
      return status === FACILITY_OPERATING
    },
    isHidden(code) {
      console.log(code)
      return false
    },

    getData(date) {
      return date && this.dataset.length > 0
        ? this.dataset.find(d => d.time === date.getTime())
        : null
    },
    getAveragePowerData(date) {
      return date && this.averagePowerDataset.length > 0
        ? this.averagePowerDataset.find(d => d.time === date.getTime())
        : null
    },
    getTotal(data) {
      if (!data) {
        return null
      }
      let total = null
      this.operatingUnits.forEach(u => {
        const value = data[u.id]
        if (value || value === 0) {
          total += value
        }
      })
      return total
    },

    handleMouseEnter(code, status) {
      if (this.isActive(status)) {
        this.$emit('codeHover', code)
      }
    },
    handleMouseLeave() {
      this.$emit('codeHover', '')
    },
    handleRowClick(code) {
      this.$emit('codeClick', code)
    },

    getHoverValue(code) {
      return this.hoverData ? this.hoverData[code] : ''
    },
    getFocusValue(code) {
      return this.focusData ? this.focusData[code] : ''
    },
    getHoverPowerValue(code) {
      const hover = this.isEnergyType
        ? this.hoverAveragePowerData
        : this.hoverData
      return hover ? hover[code] : ''
    },
    getFocusPowerValue(code) {
      const focus = this.isEnergyType
        ? this.focusAveragePowerData
        : this.focusData
      return focus ? focus[code] : ''
    },
    calculateCapacityFactor(value, capacity) {
      return value ? (value / capacity) * 100 : 0
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

.is-hidden-unit {
  .colour-square {
    background-color: white !important;
  }
  .unit-name {
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

.date-display {
  text-align: left;
}

table {
  font-size: 12px;
  width: 100%;

  .cell-value {
    font-family: $family-primary;
  }

  tr:hover td {
    background-color: #eee;
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
    cursor: pointer;
  }

  tfoot {
  }
}
</style>
