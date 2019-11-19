<template>
  <div class="compare-container">
    <div class="compare-legend">
      <div
        v-for="(domain, index) in domains"
        :key="`domain-${index}`"
        class="legend-item">
        <span
          :style="{
            'background-color': domain.colour
          }"
          class="colour-square" />
        {{ domain.label }}
      </div>
    </div>
    <div class="compare-chart">
      <column-vis
        v-if="hasCompareData"
        :domains="domains"
        :dataset="dataset"
        :vis-height="visHeight" />
    </div>
  </div>
</template>

<script>
import ColumnVis from '~/components/Vis/Column.vue'
export default {
  components: {
    ColumnVis
  },

  props: {
    compareData: {
      type: Array,
      default: () => []
    },
    domains: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      updatedCompareData: [],
      visHeight: 200
    }
  },

  computed: {
    hasCompareData() {
      return this.updatedCompareData.length === 2
    },
    firstDate() {
      return this.hasCompareData ? this.updatedCompareData[0].date : null
    },
    secondDate() {
      return this.hasCompareData ? this.updatedCompareData[1].date : null
    },
    dataset() {
      if (this.hasCompareData) {
        const change = {}
        const former = this.updatedCompareData[0]
        const latter = this.updatedCompareData[1]
        Object.keys(latter).forEach(d => {
          if (d !== 'date' && d.length > 0) {
            change[d] = latter[d] - former[d]
          }
        })
        return change
      }
      return null
    }
  },

  watch: {
    compareData(update) {
      if (update.length === 2 && update[0]) {
        let latter = update[0]
        let former = update[1]
        if (update[1].date > latter.date) {
          latter = update[1]
          former = update[0]
        }
        this.updatedCompareData = [former, latter]
      } else {
        this.updatedCompareData = []
      }
    }
  },

  mounted() {
    const $height = this.$el.offsetHeight < 200 ? 200 : this.$el.offsetHeight
    this.visHeight = $height
  }
}
</script>

<style lang="scss" scoped>
.compare-container {
  padding: 0.5rem 1rem;
  margin: 0 0.5rem 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  box-shadow: inset 0 1px 10px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  display: flex;
  align-items: center;

  .compare-legend {
    width: 20%;
    font-size: 9px;

    .legend-item {
      display: flex;
      align-items: center;
      padding: 0.1rem;
    }
  }
  .compare-chart {
    width: 80%;
  }
}
.colour-square {
  display: inline-block;
  border: 1px solid transparent;
  width: 15px;
  height: 15px;
  margin-right: 0.2rem;
}
</style>
