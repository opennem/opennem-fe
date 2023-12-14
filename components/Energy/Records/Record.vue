<template>
  <tr
    :class="{
      divider: divider,
      'has-date-focus': recordSelectDate
    }"
  >
    <th>
      {{ rowLabel }}
      <small>{{ rowUnit }}</small>
    </th>

    <td
      :class="{ on: minOn }"
      class="has-text-right"
      @click="handleMinClick(minDate)"
      @mouseenter="handleMouseEnter(minDate)"
      @mouseleave="handleMouseLeave"
    >
      <div v-if="isCurrency">{{ minValue | formatCurrency }}</div>
      <div v-else-if="rowUnit === '%'">
        {{ minValue | percentageFormatNumber2 }}
      </div>
      <div v-else-if="rowUnit === ' TWh'">
        {{ minValue | customFormatValue }}{{ rowUnit }}
      </div>
      <div v-else>{{ minValue | formatValue }}{{ rowUnit }}</div>
      <time 
        v-show="minDate" 
        datetime="minDate">
        {{
          minDate
            | customFormatDate({ range, interval, showIntervalRange: true })
        }}
      </time>
    </td>

    <td
      :class="{ on: maxOn }"
      class="has-text-right"
      @click="handleMaxClick(maxDate)"
      @mouseenter="handleMouseEnter(maxDate)"
      @mouseleave="handleMouseLeave"
    >
      <div v-if="isCurrency">{{ maxValue | formatCurrency }}</div>
      <div v-else-if="rowUnit === '%'">
        {{ maxValue | percentageFormatNumber2 }}
      </div>
      <div v-else-if="rowUnit === ' TWh'">
        {{ maxValue | customFormatValue }}{{ rowUnit }}
      </div>
      <div v-else>{{ maxValue | formatValue }}{{ rowUnit }}</div>
      <time 
        v-show="maxDate" 
        datetime="maxDate">
        {{
          maxDate
            | customFormatDate({ range, interval, showIntervalRange: true })
        }}
      </time>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    rowLabel: {
      type: String,
      default: () => ''
    },
    rowUnit: {
      type: String,
      default: () => ''
    },
    minDate: {
      type: Number,
      default: () => 0
    },
    minValue: {
      type: Number,
      default: () => 0
    },
    maxDate: {
      type: Number,
      default: () => 0
    },
    maxValue: {
      type: Number,
      default: () => 0
    },
    isCurrency: {
      type: Boolean,
      default: () => false
    },
    range: {
      type: String,
      default: () => ''
    },
    interval: {
      type: String,
      default: () => ''
    },
    divider: {
      type: Boolean,
      default: () => false
    },
    recordSelectDate: {
      type: Number,
      default: () => null
    }
  },

  computed: {
    minOn() {
      return this.minDate && this.minDate === this.recordSelectDate
    },

    maxOn() {
      return this.maxDate && this.maxDate === this.recordSelectDate
    }
  },

  methods: {
    handleMouseEnter(date) {
      this.$emit('recordMouseEnter', date)
    },

    handleMouseLeave() {
      this.$emit('recordMouseLeave')
    },

    handleMinClick(date) {
      if (this.minOn) {
        this.$emit('recordDeselect')
      } else {
        this.$emit('recordSelect', date)
      }
    },

    handleMaxClick(date) {
      if (this.maxOn) {
        this.$emit('recordDeselect')
      } else {
        this.$emit('recordSelect', date)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

th {
  font-family: $header-font-family;

  small {
    color: #888;
  }
}

td {
  cursor: pointer;
  &:hover {
    background-color: rgba(199, 69, 35, 0.1);
  }

  &.on {
    background-color: rgba(199, 69, 35, 0.1);
    border-color: rgba(199, 69, 35, 1) !important;
  }
}

tr.has-date-focus {
  td:not(.on) {
    cursor: default;
    &:hover {
      background-color: inherit;
    }
  }
}

.table tbody tr:last-child td,
.table tbody tr:last-child th {
  border-bottom-width: 0;
}

time {
  color: #888;
  font-size: 0.9em;
}
</style>
