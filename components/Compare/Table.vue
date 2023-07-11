<template>
  <div class="table-container summary-list">
    <table>
      <thead>
        <tr>
          <th colspan="2">Regions</th>
          <th class="cell-value align-right">
            <span class="unit">{{ selectedMetricUnit }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="domain in domains" 
          :key="domain.id"
          @mouseenter="handleMouseEnter(domain.id)"
          @mouseleave="handleMouseLeave"
          @click.exact="handleRowClick(domain.id)"
          @click.shift.exact="handleRowShiftClicked(domain.id)">
          <td style="width: 50%">
            <div 
              :style="{ backgroundColor: `${domain.colour}${isHidden(domain.id) ? '30' : ''}` }" 
              class="colour-square" />
            {{ domain.label }}
          </td>
          <td style="width: 20px"><a 
            @click.stop="handleLinkClick(domain.id)">
            <i class="fal fa-external-link-square" />
          </a></td>
          <td style="text-align: right;">{{ valueFormat(dataset[domain.id]) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { format as numFormat } from 'd3-format'
import { metrics } from '@/constants/stripes/'

export default {
  props: {
    domains: {
      type: Array,
      required: true,
      default: () => []
    },
    hidden: {
      type: Array,
      default: () => []
    },
    dataset: {
      type: Object,
      required: true,
      default: undefined
    }
  },

  data() {
    return  {
      metrics,
    }
  },

  computed: {
    selectedMetric() {
      return this.$store.getters['stripes/selectedMetric']
    },

    selectedMetricObject() {
      return this.metrics.find((m) => m.value === this.selectedMetric)
    },

    selectedMetricLabel() {
      return this.selectedMetricObject?.label
    },

    selectedMetricUnit() {
      return this.selectedMetricObject?.unit
    },

    selectedMetricFormat() {
      return this.selectedMetricObject?.numberFormatString
    }
  },

  methods: {
    valueFormat(value) {
      if (value !== 0 && !value) return '—'
      const formattedValue = numFormat(this.selectedMetricFormat || ',.0f')(value)
      if (this.selectedMetricLabel === "Carbon intensity") return formattedValue
      return formattedValue + this.selectedMetricUnit
    },
    isHidden(id) {
      return this.hidden.includes(id)
    },
    handleRowClick(id) {
      this.$emit('domain-hide', id)
    },
    handleRowShiftClicked(id) {
      const hide = this.domains.filter((d) => d.id !== id).map((d) => d.id)
      this.$emit('domains-hide', hide)
    },
    handleLinkClick(id) {
      this.$router.push({
        path: `/energy/${id}/?range=7d&interval=30m`
      })
    },

    handleMouseEnter(id) {
      this.$emit('mouse-enter', id)
    },
    handleMouseLeave() {
      this.$emit('mouse-leave')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.summary-list {
  width: 30%;

  table {
    width: 100%;
    font-size: 0.9rem;
  }

  thead th {
    font-family: $header-font-family;
    font-weight: 700;
    font-size: 0.8rem;
    border-bottom: 1px solid #ddd;
    padding: 0.3rem;
    white-space: nowrap;
  }

  th:first-child {
    width: 40%;
  }

  tbody td {
    border-bottom: 1px solid #ddd;
    padding: 0.3rem 0;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    padding: 0.3rem;

    a {
      visibility: hidden;
    }
  }

  tr:hover td {
    background-color: #f5f5f5;

    a {
      visibility: visible;
    }
  }

  .align-right {
    text-align: right;
  }

  .cell-value span {
    display: block; 
  }

  .cell-unit {
    font-size: 0.8rem;
    color: #999;
  }

  .colour-square {
    width: 18px;
    height: 18px;
    float: left;
    margin-right: 5px;
    border-radius: 4px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

    @include mobile {
      display: inline;
      float: none;
    }
  }
}
</style>