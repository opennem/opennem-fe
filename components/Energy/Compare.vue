<template>
  <div class="compare-container">
    <h1>Compare</h1>
    <div>
      <span>{{ firstDate | formatDate }}</span> —
      <span>{{ secondDate | formatDate }}</span>
    </div>
    <div>
      <column-vis />
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
    }
  },

  data() {
    return {
      updatedCompareData: []
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
      }
      return null
    }
  },

  watch: {
    compareData(update) {
      if (update.length === 2) {
        let latter = update[0]
        let former = update[1]
        if (update[1].date > latter.date) {
          latter = update[1]
          former = update[0]
        }
        this.updatedCompareData = [former, latter]
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.compare-container {
  background-color: #ddd;
  padding: 1rem;
  margin: 0.5rem;
  height: 300px;
}
</style>
