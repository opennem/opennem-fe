<template>
  <div class="table">
    <ul>
      <li
        v-for="(d, i) in domains"
        :key="i"
        :class="{
          'is-hidden-domain': isHidden(d.id)
        }"
        role="button"
        @click.exact="handleRowClick(d.id)"
        @click.shift.exact="handleRowShiftClick(d.id)">
        <div
          :style="{ backgroundColor: d.colour}"
          class="colour-square" />
        <span>{{ d.label }}</span>
      </li>
      <li
        role="button"
        @click.exact="() => handleTotalClick()"
        @click.shift.exact="() => handleTotalShiftClick()">
        <div
          :class="{ on: showTotal }"
          class="net-total-line" />
        Net Total
      </li>
    </ul>
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
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  },

  methods: {
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
  margin-right: 5px;
  border-radius: 4px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);

  @include mobile {
    width: 13px;
    height: 13px;
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

ul {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  max-width: 600px;
  margin: 0 auto;

  -webkit-user-select: none; /* Chrome all / Safari all */
  -moz-user-select: none; /* Firefox all */
  -ms-user-select: none; /* IE 10+ */
  user-select: none; /* Likely future */

  li {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;

    &:hover {
      background-color: #eee;
    }

    @include mobile {
      font-size: 12px;
    }
  }
}
</style>
