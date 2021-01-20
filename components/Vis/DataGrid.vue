<template>
  <div>

  </div>
</template>

<script>
import { format as numFormat } from 'd3-format'

export default {
  props: {
    data: {
      type: Array,
      default: () => null
    },
    singleRegion: {
      type: Boolean,
      default: false
    },
    selectedColumn: {
      type: Object,
      default: () => {
        return {
          label: 'Coal Proportion',
          field: 'coalProportion'
        }
      }
    }
  },

  computed: {
    firstRegion() {
      return this.data && this.data.length > 0 ? this.data[0] : null
    },
    columns() {
      const cols = [
        {
          label: 'Date',
          field: 'date'
        }
      ]
      const selected = {
        label: this.selectedColumn.label,
        field: this.selectedColumn.value
      }
      cols.push(selected)
      return cols
    },
    rows() {
      return this.firstRegion ? this.firstRegion.data : []
    }
  },

  methods: {
    valueFormat(value) {
      const numberFormatString =
        this.selectedColumn.numberFormatString || ',.0f'
      return numFormat(numberFormatString)(value)
    }
  }
}
</script>

<style lang="scss">
table.vgt-table {
  font-size: 11px;
}
</style>
