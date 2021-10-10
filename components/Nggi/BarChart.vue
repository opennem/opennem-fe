<template>
  <section>
    <div
      v-for="domain in xDomains"
      :key="domain.id"
      :class="{
        'is-hidden-domain': isHidden(domain.id)
      }"
      role="button"
      class="row"
      @click.exact="handleRowClick(domain.id)"
      @click.shift.exact="handleRowShiftClick(domain.id)">
      <div class="row-label">
        <div
          :style="{ backgroundColor: domain.colour}"
          class="colour-square" />
        {{ domain.label }}
      </div>

      <div 
        v-if="!isHidden(domain.id)" 
        class="row-bar-wrapper">
        <div
          :style="{
            'width': `${getWidth(domain.id)}px`,
            'background-color': domain.colour,
            'opacity': getOpacity(domain.id)
          }"
          class="row-bar" />

        <div class="contribution">
          {{ getContribution(domain.id) | percentageFormatNumber }}
        </div>
      </div>
    </div>

    <div
      v-if="showTotalInLegend"
      role="button"
      class="row"
      @click.exact="() => handleTotalClick()"
      @click.shift.exact="() => handleTotalShiftClick()"
    >
      <div class="row-label">
        <div
          :class="{ on: showTotal }"
          class="net-total-line" />
        Net Total
      </div>
    </div>
  </section>
</template>

<script>
import { scaleLinear as d3ScaleLinear } from 'd3-scale'
import _includes from 'lodash.includes'
import _debounce from 'lodash.debounce'

export default {
  props: {
    barWidth: {
      type: Number,
      default: () => 100
    },
    domains: {
      type: Array,
      default: () => []
    },
    hidden: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Array,
      default: () => []
    },
    hoverDate: {
      type: Date,
      default: null
    },
    hoverOn: {
      type: Boolean,
      default: () => false
    },
    focusDate: {
      type: Date,
      default: null
    },
    focusOn: {
      type: Boolean,
      default: () => false
    },
    highlightDomain: {
      type: String,
      default: null
    },
    showTotal: {
      type: Boolean,
      default: true
    },
    showTotalInLegend: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      x: null,
      xDomains: []
    }
  },

  computed: {
    barDataset() {
      const domains = this.xDomains.filter(d => !_includes(this.hidden, d.id))
      const dataset = this.dataset

      if (this.hoverOn && this.hoverData) {
        return domains.map(domain => {
          const id = domain.id
          return {
            name: id,
            value: this.hoverData[id]
          }
        })
      } else if (this.focusOn && this.focusData) {
        return domains.map(domain => {
          const id = domain.id
          return {
            name: id,
            value: this.focusData[id]
          }
        })
      }

      return domains.map(domain => {
        const id = domain.id
        return {
          name: id,
          value: dataset.reduce((a, b) => a + (b[id] || 0), 0)
        }
      })
    },

    total() {
      return this.barDataset.reduce((a, b) => a + b.value, 0)
    },

    hoverData() {
      if (this.hoverDate && this.dataset.length > 0) {
        return this.dataset.find(d => d.time === this.hoverDate.getTime())
      }
      return null
    },

    focusData() {
      if (this.focusDate && this.dataset.length > 0) {
        return this.dataset.find(d => d.time === this.focusDate.getTime())
      }
      return null
    }
  },

  watch: {
    domains(d) {
      this.xDomains = this.domains.slice(0)
    },
    total(d) {
      this.x.domain([0, d])
    },
    barWidth(d) {
      this.x.range([0, this.barWidth])
      this.xDomains = this.domains.slice(0)
    }
  },

  mounted() {
    this.x = d3ScaleLinear().range([0, this.barWidth])
    this.xDomains = this.domains.slice(0)
  },

  methods: {
    getWidth(id) {
      const find = this.barDataset.find(d => d.name === id)
      if (find) {
        this.x.domain([0, this.total])
        return this.x(find.value)
      }
      return 0
    },
    getContribution(id) {
      const find = this.barDataset.find(d => d.name === id)
      if (find) {
        return (find.value / this.total) * 100
      }
      return 0
    },
    getOpacity(domain) {
      if (
        this.highlightDomain === '' ||
        !this.highlightDomain ||
        this.highlightDomain === domain
      ) {
        return 1
      }
      return 0.2
    },
    isHidden(id) {
      return _includes(this.hidden, id)
    },
    handleRowClick(row) {
      this.$emit('rowClick', row)
    },
    handleRowShiftClick(row) {
      this.$emit('rowShiftClick', row)
    },
    handleTotalClick() {
      this.$emit('totalClick')
    },
    handleTotalShiftClick() {
      this.$emit('totalShiftClick')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';

.colour-square {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border-radius: 4px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  @include mobile {
    width: 13px;
    height: 13px;
  }
}

.is-hidden-domain {
  .colour-square {
    background-color: white !important;
  }
  .unit-name {
    color: #aaa;
  }
}

.net-total-line {
  width: 18px;
  height: 5px;
  background: #ddd;
  margin-right: 5px;
  border-radius: 5px;

  &.on {
    background: #c74523;
  }
}

.row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px solid #ddd;

  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */

  .row-label {
    text-align: right;
    font-size: 12px;
    font-weight: 700;
    width: 150px;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 3px 6px;
    border-radius: 6px;

    &:hover {
      background-color: #eee;
    }
  }
  .row-bar-wrapper {
    width: 250px;
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }
  .contribution {
    // width: 10%;
    font-size: 0.9em;
    font-weight: 100;
    margin-left: 0.25rem;
  }
  .row-bar {
    width: 1px;
    height: 15px;
    background-color: red;
  }
}
</style>
