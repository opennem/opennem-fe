<template>
  <div class="chart-tips-container" v-show="isPointHovered" :style="{ 
      'left': `${leftValue}px`,
      'top': `${topValue}px`
    }">
    <div class="chart-tips">
      <div class="current">
        <span class="colour-sq" 
          :style="{ 
            backgroundColor: currentSeriesColour,
            border: `1px solid ${currentSeriesColour}`
          }"></span>
        <em>{{currentSeriesLabel}}:</em> <strong>{{currentSeriesValue}} {{currentSeriesUnit}}</strong>
      </div>
      
      <div class="total" v-if="showTotal">
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
      availableFts: 'availableFts',
      disabledSeries: 'disabledSeries',
      groupSelected: 'groupSelected',
      currentHoverSeries: 'currentHoverSeries',
      clientX: 'clientX',
      clientY: 'clientY',
      chartWidth: 'chartWidth',
      chartHeight: 'chartHeight',
    }),

    leftValue() {
      const elWidth = this.$el ? this.$el.offsetWidth : 0;
      const safeZone = this.chartWidth - elWidth;
      return this.clientX < safeZone ? this.clientX + 1 : safeZone;
    },

    topValue() {
      const elHeight = this.$el ? this.$el.offsetHeight : 0;
      const safeZone = this.chartHeight - this.chartHeight / 3;
      const offset = this.showTotal ? 6 : -9;
      const calTop = this.chartHeight - elHeight * 2 + offset;
      return this.clientY > safeZone ? 0 : calTop;
    },

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

    showTotal() {
      const availLength = this.availableFts.length;
      const disabledLength = this.disabledSeries.length;
      return availLength - 1 !== disabledLength;
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
  font-size: 10px;
  position: absolute;
  background-color: #ece9e6;
  padding: 2px 4px;
  text-align: right;
  z-index: 99;
  border: 1px solid #ccc;
}

.chart-tips {
  white-space: nowrap;

  .current {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  em {
    font-style: normal;
    margin-right: .5em;
  }
}

.colour-sq {
  width: 13px;
  height: 13px;
  display: inline-block;
  margin-right: 5px;
}
</style>
