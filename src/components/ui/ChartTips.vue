<template>
  <div class="chart-tips-container">
    <div class="chart-tips" v-show="isPointHovered">
      <div class="current">
        <span class="colour-sq" 
          :style="{ 
            backgroundColor: currentSeriesColour,
            border: `1px solid ${currentSeriesColour}`
          }"></span>
        <em>{{currentSeriesLabel}}:</em> <strong>{{currentSeriesValue}} {{currentSeriesUnit}}</strong>
      </div>
      
      <div class="total">
        <em>Total:</em><strong>{{visibleSeriesTotal}} {{currentSeriesUnit}}</strong>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import { formatNumberForDisplay } from '@/lib/formatter';

export default {
  computed: {
    ...mapGetters({
      isPointHovered: 'isPointHovered',
      pointSummary: 'getPointSummary',
      isPower: 'isPower',
      // contributionType: 'contributionType',
      disabledSeries: 'disabledSeries',
      groupSelected: 'groupSelected',
      currentHoverSeries: 'currentHoverSeries',
    }),

    currentSeriesLabel() {
      const series = this.currentHoverSeries;
      const group = this.groupSelected ? this.groupSelected.groups.find(g => series === g.id) : null;

      if (group) {
        return group.label;
      }

      return '';
    },

    currentSeriesColour() {
      const series = this.currentHoverSeries;
      const group = this.groupSelected ? this.groupSelected.groups.find(g => series === g.id) : null;

      if (group) {
        return group.colour;
      }

      return '#000';
    },

    currentSeriesValue() {
      const summary = this.pointSummary;
      const series = this.currentHoverSeries;
      return summary && summary.allData && series ? formatNumberForDisplay(summary.allData[series], this.precision) : 0;
    },

    currentSeriesUnit() {
      return this.isPower ? 'MW' : 'GWh';
    },

    precision() {
      return this.isPower ? '0,0' : '0,0.0';
    },

    visibleSeriesTotal() {
      const domains = this.groupSelected.groups;
      const summary = this.pointSummary;
      let total = 0;
      if (summary && summary.allData) {
        domains.forEach((d) => {
          const domainType = d.type;
          const domainId = d.id;
          if (domainType === 'sources' || domainType === 'loads') {
            if (!_.includes(this.disabledSeries, domainId)) {
              total += summary.allData[domainId];
            }
          }
        });
      }

      return formatNumberForDisplay(total, this.precision);
    },
  },
}
</script>
<style lang="scss" scoped>
.chart-tips-container {
  font-size: 12px;
  height: 40px;
  padding-top: 12px;
  border-bottom: 1px solid #ddd;
  border-top: 1px solid #000;
}

.chart-tips {
  // background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;

  .current {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-right: 20px;
  }

  em {
    font-style: normal;
    margin-right: .5em;
  }
}

.colour-sq {
  width: 15px;
  height: 15px;
  display: inline-block;
  margin-right: 5px;
}
</style>
