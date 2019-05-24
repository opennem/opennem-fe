<template>
  <div class="chart-tips-container" v-show="isPointHovered" :style="{ 
      'left': `${leftValue}px`,
      'top': `${topValue}px`
    }">
    <div class="chart-tips">
      <div class="current" v-if="mainPanelHover">
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
import * as _ from 'lodash';
import { mapGetters } from 'vuex';
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
      tera: 'tera',
      mainPanelHover: 'mainPanelHover',
    }),

    leftValue() {
      const elWidth = this.$el && this.$el.offsetWidth > 0 ? this.$el.offsetWidth : 150;
      const safeZone = this.chartWidth - elWidth;
      return this.clientX && this.clientX < safeZone ? this.clientX + 1 : safeZone;
    },

    topValue() {
      if (this.mainPanelHover) {
        const elHeightOffset = this.showTotal ? 40 : 24;
        const elHeight = this.$el && this.$el.offsetHeight > 0 ?
          this.$el.offsetHeight : elHeightOffset;
        const safeZone = this.chartHeight - (this.chartHeight / 3);
        const offset = this.showTotal ? 9 : -6;
        const calTop = (this.chartHeight - (elHeight * 2)) + offset;
        return this.clientY > safeZone ? 0 : calTop;
      }
      return this.chartHeight - 55;
    },

    currentHoverGroup() {
      const series = this.currentHoverSeries;
      const group = this.groupSelected ?
        this.groupSelected.groups.find(g => series === g.id) : null;

      return group;
    },

    currentSeriesLabel() {
      const currentHoverGroup = this.currentHoverGroup;

      if (currentHoverGroup) {
        return currentHoverGroup.label;
      }

      return '';
    },

    currentSeriesColour() {
      const currentHoverGroup = this.currentHoverGroup;

      if (currentHoverGroup) {
        return currentHoverGroup.colour;
      }

      return '#000';
    },

    currentSeriesValue() {
      const summary = this.pointSummary;
      const series = this.currentHoverSeries;
      const available = summary && summary.allData && series;
      return available ? formatNumberForDisplay(summary.allData[series], this.precision) : 0;
    },

    currentSeriesUnit() {
      const energyUnit = this.tera ? 'TWh' : 'GWh';
      return this.isPower ? 'MW' : energyUnit;
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
};
</script>
<style lang="scss" scoped>
.chart-tips-container {
  font-size: 11px;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 4px 6px;
  border-radius: 2px;
  text-align: right;
  z-index: 9;
  box-shadow: 0 0 20px rgba(50, 50, 50, 0.1);
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
