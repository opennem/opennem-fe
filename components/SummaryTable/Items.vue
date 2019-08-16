<template>
  <!-- <draggable
    v-model="order"
    :options="{ 
      group: group,
      direction: 'horizontal',
      ghostClass: 'drag-placeholder',
      animation: 150
    }"
    class="summary-list"
    @start="drag=true"
    @end="drag=false"> -->
  <div
    :class="{ 'click-disable': !domainToggleable }"
    class="summary-list">
    <div
      v-for="(ft, index) in order"
      :key="ft.id"
      class="item summary-row"
      @click.exact="handleRowClick(ft)"
      @click.shift.exact="handleRowShiftClicked(ft)">

      <div
        v-tooltip.auto="fuelTechList(ft)"
        class="summary-col-label">
        <div
          :style="{
            'background-color': ft.hidden ? 'transparent' : ft.colour,
            'border-color': ft.hidden ? '#bbb' : ft.colour,
          }"
          class="colour-square" />

        <div class="ft-label">{{ ft.label }}</div>
      </div>

      <div class="summary-col-energy">
        {{ getValue(ft.id) | formatValue }}
      </div>

      <div class="summary-col-contribution">
        <span v-show="showPercentColumn">
          {{ getContribution(ft.id) | percentageFormatNumber }}
        </span>
      </div>

      <div class="summary-col-contribution">
        {{ getAverageValue(index) | formatCurrency }}
      </div>
    </div>
  </div>
  <!-- </draggable> -->
</template>

<script>
import _isEmpty from 'lodash.isempty'
import _includes from 'lodash.includes'
import _remove from 'lodash.remove'
import _cloneDeep from 'lodash.clonedeep'
// import Draggable from 'vuedraggable'

export default {
  // components: {
  //   Draggable
  // },

  props: {
    energyDomains: {
      type: Array,
      default: () => []
    },
    originalOrder: {
      type: Array,
      default: () => []
    },
    marketValueOrder: {
      type: Array,
      default: () => []
    },
    hiddenFuelTechs: {
      type: Array,
      default: () => []
    },
    group: {
      type: String,
      default: () => ''
    },
    pointSummary: {
      type: Object,
      default: () => {}
    },
    pointSummaryTotal: {
      type: Number,
      default: () => 0
    },
    summary: {
      type: Object,
      default: () => {}
    },
    summaryTotal: {
      type: Number,
      default: () => 0
    },
    showPointSummary: {
      type: Boolean,
      default: () => false
    },
    showPercentColumn: {
      type: Boolean,
      default: () => true
    },
    domainToggleable: {
      type: Boolean,
      default: () => true
    }
  },

  data() {
    return {
      order: []
    }
  },

  computed: {
    // order: {
    //   get() {
    //     return this.originalOrder
    //   },
    //   set(newOrder) {
    //     this.$emit('update', newOrder)
    //   }
    // },

    hasPointSummary() {
      return !_isEmpty(this.pointSummary)
    },

    hasMarketValueOrder() {
      return this.marketValueOrder.length > 0
    }
  },

  watch: {
    originalOrder(newOrder) {
      this.order = this.updateOrder(newOrder)
    },
    hiddenFuelTechs(fts) {
      this.order = this.updateOrder(this.originalOrder)
    }
  },

  created() {
    this.order = this.updateOrder(this.originalOrder)
  },

  methods: {
    fuelTechList(ft) {
      const domainIds = _cloneDeep(ft.domainIds)
      if (domainIds && domainIds.length > 1) {
        let list = ''
        domainIds.sort()
        domainIds.forEach(id => {
          const find = this.energyDomains.find(eDomain => eDomain.id === id)
          if (find) {
            list += `${find.label}<br>`
          }
        })
        return list
      }
      return ''
    },

    handleRowClick(ft) {
      if (this.domainToggleable) {
        const fuelTech = ft.fuelTech || ft.id
        const hidden = _cloneDeep(this.hiddenFuelTechs)
        if (_includes(hidden, fuelTech)) {
          _remove(hidden, d => d === fuelTech)
        } else {
          hidden.push(fuelTech)
        }
        this.order = this.updateOrder(this.originalOrder)
        this.$emit('fuelTechsHidden', hidden, false)
      }
    },

    handleRowShiftClicked(ft) {
      if (this.domainToggleable) {
        const property = ft.fuelTech ? 'fuelTech' : 'id'
        const hiddenObjs = this.order.filter(d => d[property] !== ft[property])
        const hidden = hiddenObjs.map(d => d[property])
        this.order = this.updateOrder(this.originalOrder)
        this.$emit('fuelTechsHidden', hidden, true)
      }
    },

    updateOrder(order) {
      return order.map(d => {
        return {
          category: d.category,
          colour: d.colour,
          domainIds: d.domainIds,
          fuelTech: d.fuelTech,
          id: d.id,
          label: d.label,
          type: d.type,
          hidden: this.isHidden(d)
        }
      })
    },

    isHidden(ft) {
      const fuelTech = ft.fuelTech || ft.id
      return _includes(this.hiddenFuelTechs, fuelTech)
    },

    getValue(key) {
      return this.showPointSummary
        ? this.pointSummary[key] || ''
        : this.summary[key] || ''
    },

    getContribution(key) {
      const rowValue = this.showPointSummary
        ? this.pointSummary[key]
        : this.summary[key] || 0
      const total = this.showPointSummary
        ? this.pointSummaryTotal
        : this.summaryTotal

      return (rowValue / total) * 100
    },

    getAverageValue(index) {
      const id = this.hasMarketValueOrder
        ? this.marketValueOrder[index].id
        : null
      // console.log(this.summary, id)
      return this.showPointSummary
        ? this.pointSummary[id] || ''
        : this.summary[id] || ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.summary-list {
  .item {
    // cursor: move;
    cursor: pointer;
    user-select: none;

    &.drag-placeholder {
      opacity: 0.1;
    }

    &:hover {
      background-color: $row-hover;
    }
  }

  .summary-col-label {
    display: flex;
    align-items: center;
    .ft-label {
      padding-left: 5px;
    }
  }

  .colour-square {
    border: 1px solid transparent;
    width: 15px;
    height: 15px;
  }

  &.click-disable {
    .item {
      cursor: auto;
      user-select: auto;

      &:hover {
        background-color: transparent;
      }
    }
  }
}
</style>
