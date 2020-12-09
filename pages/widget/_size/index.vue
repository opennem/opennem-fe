<template>
  <div class="energy-region widget-region">
    <transition name="fade">
      <div
        v-if="!ready"
        class="vis-table-container loading-containers">
        <div
          class="vis-container"
          style="width: 100%">
          <div
            class="loader-block"
            style="height: 30px" />
          <div
            class="loader-block"
            style="height: 400px" />
        </div>
      </div>
    </transition>

    <div
      v-if="ready"
      class="vis-legend-container"
    >
      <div class="vis-table-container">
        <vis-section
          :date-hover="hoverDate"
          :on-hover="isHovering"
          class="vis-container"
          @dateHover="handleDateHover"
          @isHovering="handleIsHovering" />
        <summary-section
          v-if="isLargeSize"
          :show-records="false"
          :show-donut-bar="false"
          :hover-date="hoverDate"
          :is-hovering="isHovering"
          class="table-container"
        />
      </div>
    </div>

    <div class="widget-footer">
      <div>
        <a
          href="https://opennem.org.au/"
          target="opennem_related">OpenNEM</a> is a project of the
        <a
          href="https://www.energy-transition-hub.org/"
          target="opennem_related">Energy Transition Hub</a>
      </div>

      <div>
        <a
          class="icon-link"
          href="https://opennem.org.au/"
          target="opennem_related">
          <i class="fal fa-fw fa-info-circle" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import VisSection from '@/components/Energy/VisSection.vue'
import SummarySection from '@/components/Energy/SummarySection.vue'

export default {
  layout: 'widget',
  components: {
    VisSection,
    SummarySection
  },

  data() {
    return {
      isHovering: false,
      hoverDate: null
    }
  },

  computed: {
    ...mapGetters({
      range: 'range',
      interval: 'interval',
      filterPeriod: 'filterPeriod',
      fuelTechGroupName: 'fuelTechGroupName',
      ready: 'regionEnergy/ready',
      currentDataset: 'regionEnergy/currentDataset'
    }),
    size() {
      return this.$route.params.size || 'small'
    },
    isLargeSize() {
      return this.size === 'large'
    }
  },

  watch: {
    fuelTechGroupName(groupName) {
      this.doUpdateDatasetByGroup({ groupName })
    },
    currentDataset(dataset) {
      if (dataset.length > 0) {
        this.doUpdateXGuides({
          interval: this.interval,
          start: dataset[0].time,
          end: dataset[dataset.length - 1].time
        })
      }
    }
  },

  created() {
    this.$store.dispatch('currentView', 'energy')
    this.doGetRegionData({
      region: 'nem',
      range: this.isLargeSize ? '7D' : '3D',
      interval: '30m',
      period: this.filterPeriod,
      groupName: this.fuelTechGroupName
    })
    this.doUpdateTickFormats({ range: this.range, interval: this.interval })
  },

  methods: {
    ...mapActions({
      doGetRegionData: 'regionEnergy/doGetRegionData',
      doUpdateDatasetByGroup: 'regionEnergy/doUpdateDatasetByGroup',
      doUpdateXGuides: 'visInteract/doUpdateXGuides',
      doUpdateTickFormats: 'visInteract/doUpdateTickFormats'
    }),
    handleDateHover(date) {
      this.hoverDate = date
    },
    handleIsHovering(hover) {
      this.isHovering = hover
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';

.widget-region {
  .vis-table-container {
    display: block;
  }
  .vis-container,
  .table-container {
    width: 100%;
    padding-right: 0;
  }
}

.widget-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 8px;
  border-top: 1px solid #ddd;

  a {
    border-bottom: 1px dashed $opennem-link-color;

    &.icon-link {
      border-bottom: none;
      font-size: 16px;
    }
  }
}
</style>
