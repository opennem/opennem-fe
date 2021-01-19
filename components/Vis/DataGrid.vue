<template>
  <div>
    <vue-good-table
      v-if="!singleRegion"
      :columns="columns"
      :rows="rows"
      :fixed-header="true"
      :sort-options="{
        enabled: false
      }"
      max-height="600px"
      theme="nocturnal"
      style-class="vgt-table"
    >
      <template
        slot="table-row"
        slot-scope="props">
        <span v-if="props.column.field == 'date'">
          {{ props.row.date | formatDate }}
        </span>
        <span v-else>
          {{ valueFormat(props.formattedRow[props.column.field]) }}
        </span>
      </template>
    </vue-good-table>
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
