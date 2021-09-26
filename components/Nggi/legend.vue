<template>
  <div class="table">
    <table class="summary-list">
      <tbody>
        <tr
          v-for="(d, i) in domains"
          :key="i"
          :class="{
            'is-hidden-domain': isHidden(d.id)
          }"
          @click.exact="handleRowClick(d.id)"
          @click.shift.exact="handleRowShiftClick(d.id)">
          <td>
            <div
              :style="{ backgroundColor: d.colour}"
              class="colour-square" />
            <span>{{ d.label }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import _includes from 'lodash.includes'

export default {
  props: {
    domains: {
      type: Array,
      default: () => []
    },
    hidden: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    handleRowClick(row) {
      this.$emit('rowClick', row)
    },
    handleRowShiftClick(row) {
      this.$emit('rowShiftClick', row)
    },
    isHidden(id) {
      return _includes(this.hidden, id)
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

.is-hidden-domain {
  .colour-square {
    background-color: white !important;
  }
  .unit-name {
    color: #aaa;
  }
}
.summary-list {
  @include mobile {
    font-size: 0.8em;
  }
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

table {
  font-size: 12px;
  width: 100%;
  table-layout: auto;

  @include desktop {
    table-layout: auto;
  }

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
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
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

  .unit-name {
    white-space: nowrap;
  }
}
</style>
