<template>
  <div class="chart-tips-container" :style="{ 
      'left': `${leftValue}px`,
      'top': `${topValue}px`
    }">
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
      return this.clientY > safeZone ? 0 : this.chartHeight - elHeight * 2 + 6;
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
  // top: 261px;
  background-color: #ece9e6;
  padding: 2px 4px;
  text-align: right;
  z-index: 99;
  // box-shadow: 1px 1px 1px rgba(10, 10, 10, 0.2);
  border: 1px solid #ccc;
}

.chart-tips {
  // background-color: #fff;
  // display: flex;
  // justify-content: center;
  // align-items: center;
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
