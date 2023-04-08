<template>
  <div class="table-container summary-list">
    <table>
      <thead>
        <tr>
          <th>Regions</th>
          <th class="cell-value align-right">
            <span>{{ selectedMetricLabel }}</span>
            <!-- <span class="unit">{{ selectedMetricUnit }}</span> -->
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="domain in domains" 
          :key="domain.id">
          <td>
            <div 
              :style="{ backgroundColor: domain.colour }" 
              class="colour-square" />
            {{ domain.label }}</td>
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
      console.log(value)
      if (value !== 0 && !value) return '—'
      return numFormat(this.selectedMetricFormat || ',.0f')(value) + this.selectedMetricUnit
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
    padding: 0.3rem 0;
    white-space: nowrap;
  }

  th:first-child {
    width: 40%;
  }

  tbody td {
    border-bottom: 1px solid #ddd;
    padding: 0.3rem 0;
    white-space: nowrap;
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