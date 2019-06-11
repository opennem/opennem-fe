<template>
<div>
  <div class="filter-bar-column">
    <filter-bar
      :selectedStatuses="selectedStatuses"
      @selected="handleFilterSelected"
      @selectedStatuses="handleStatusesSelected"
    />
  </div>

  <facility-view-toggle
    class="facility-view-toggle"
    v-if="widthBreak"
    :view="facilityView"
    @viewSelect="handleViewSelect"
  />

  <div class="columns is-multiline is-gapless map-detail-container"> 
    <div 
      class="column is-two-thirds-tablet is-half-desktop"
      v-if="!widthBreak || (widthBreak && selectedView === 'list')"
    >
      <facility-list
        :filteredFacilities="filteredFacilities"
        :selectedFacility="selectedFacility"
        :sortBy="sortBy"
        :orderBy="orderBy"
        :hideRegionColumn="isRegionView"
        @orderChanged="handleOrderChange"
        @facilitySelect="handleFacilitySelect"
        @facilityHover="handleFacilityHover"
        @facilityMouseout="handleFacilityOut"
      />
    </div>

    <div
      class="column is-one-third-tablet is-half-desktop"
      v-if="!widthBreak || (widthBreak && selectedView === 'map')"
    >
      <div class="map-wrapper" :class="{ 'sticky-detail': !widthBreak }">
        <facility-map
          :data="filteredFacilities"
          :selectedFacility="selectedFacility"
          :hoveredFacility="hoveredFacility"
          :shouldZoomWhenSelected="shouldZoomWhenSelected"
          @facilitySelect="handleFacilitySelect"
        />

        <transition name="slide-up-fade">
          <facility-card
            v-if="hasSelectedFacility && widthBreak"
            :facility="selectedFacility"
            @close="handleCloseDetail"
          />
        </transition>
        
        <!-- <generator-detail
          :generator="selectedGenerator"
          @closeGeneratorDetail="handleCloseDetail"
        /> -->
      </div>
    </div>
  </div>
</div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import { GraphDomains } from '@/domains/graphs';
import { getRegionLabelByCode } from '@/domains/regions';
import FacilityList from '@/components/Facility/List';
import FacilityMap from '@/components/Facility/Map';
import FacilityDetail from '@/components/Facility/Detail';
import FilterBar from '@/components/Facility/FilterBar';
import FacilityViewToggle from '@/components/Facility/ViewToggle';
import FacilityCard from '@/components/Facility/Card';

const ASCENDING = 'asc';
const DESCENDING = 'desc';

export default {
  components: {
    FacilityList,
    FacilityMap,
    FacilityDetail,
    FilterBar,
    FacilityViewToggle,
    FacilityCard,
  },
  data() {
    return {
      filterString: '',
      sortBy: 'displayName',
      orderBy: ASCENDING,
      status: 'Commissioned',
      panTo: null,
      selectedTechs: [],
      selectedStatuses: ['Commissioned'],
      selectedFacility: null,
      hoveredFacility: null,
      selectedView: '',
      shouldZoomWhenSelected: true,
      filteredFacilities: [],
      totalFacilities: 0,
      windowWidth: window.innerWidth,
    };
  },
  computed: {
    ...mapGetters({
      facilityData: 'facilityData',
      facilitySelectedTechs: 'facilitySelectedTechs',
      facilityView: 'facilityView',
    }),
    widthBreak() {
      return this.windowWidth < 769;
    },
    regionId() {
      return this.$route.params.region || '';
    },
    isRegionView() {
      return this.$route.params.region !== undefined;
    },
    hasSelectedFacility() {
      return this.selectedFacility;
    },
    totalCap() {
      let total = 0;
      this.filteredFacilities.forEach((facility) => {
        if (this.facilitySelectedTechs.length === 0) {
          total += facility.generatorCap;
        } else {
          this.facilitySelectedTechs.forEach((ft) => {
            if (facility.fuelTechRegisteredCap[ft]) {
              total += facility.fuelTechRegisteredCap[ft];
            }
          });
        }
      });
      return total;
    },
  },

  watch: {
    facilityData() {
      this.updateFacilitiesData();
    },
    selectedTechs() {
      this.updateFacilitiesData();
    },
    selectedStatuses() {
      this.updateFacilitiesData();
    },
    sortBy() {
      this.updateFacilitiesData();
    },
    orderBy() {
      this.updateFacilitiesData();
    },
    regionId() {
      this.updateFacilitiesData();
    },
    facilityView(view) {
      this.selectedView = view;
    },
  },

  created() {
    this.selectedView = this.facilityView;
    this.selectedTechs = this.$store.getters.facilitySelectedTechs;
    // throttle the resize event
    window.addEventListener('resize', _.debounce(() => {
      this.windowWidth = window.innerWidth;
      // 769 tablet and up
    }, 200));
  },

  mounted() {
    EventBus.$on('facilities.name.filter', this.setFilterString);
    this.$store.dispatch('fetchFacilityData');
  },

  beforeDestroy() {
    EventBus.$off('facilities.name.filter');
  },

  methods: {
    updateFacilitiesData() {
      const sortedData = _.orderBy(this.facilityData, [(d) => {
        if (this.selectedTechs.length === 0) {
          return d[this.sortBy];
        }
        if (this.sortBy !== 'generatorCap') {
          return d[this.sortBy];
        }
        let totals = 0;
        this.selectedTechs.forEach((ft) => {
          totals += d.fuelTechRegisteredCap[ft] || 0;
        });
        return totals;
      }], [this.orderBy]);

      const filtered = this.selectedTechs.length > 0
        ? sortedData.filter(g => g.fuelTechs.some(r => this.selectedTechs.includes(r)))
        : sortedData;

      const that = this;
      async function updateFilter() {
        return filtered.filter(g =>
          g.displayName.toLowerCase().includes(that.filterString.toLowerCase()) &&
          g.regionId.toLowerCase().includes(that.regionId) &&
          (that.selectedStatuses.length <= 0 || _.includes(that.selectedStatuses, g.status)),
        );
      }

      updateFilter().then((facilities) => {
        that.filteredFacilities = facilities;
        that.totalFacilities = facilities.length;

        const exportData = facilities.map((d) => { // eslint-disable-line
          return {
            'Facility Name': d.displayName,
            Status: d.status,
            Region: getRegionLabelByCode(d.regionId),
            Technology: d.fuelTechs.map(ft => GraphDomains[ft].label),
            'Generator Capacity (MW)': d.generatorCap,
            Latitude: d.location.latitude,
            Longitude: d.location.longitude,
          };
        });
        that.$store.dispatch('facilityExportData', exportData);
      });
    },
    toggleOrder(order) {
      return order === ASCENDING ? DESCENDING : ASCENDING;
    },
    handleSortChange(sort) {
      // if (this.sortBy === sort) {
      //   this.orderBy = this.toggleOrder(this.orderBy);
      // } else {
      //   this.orderBy = ASCENDING;
      // }
      this.sortBy = sort;
    },
    handleOrderChange(orderName) {
      // this.orderBy = order;
      if (this.sortBy === orderName) {
        this.orderBy = this.toggleOrder(this.orderBy);
      } else {
        this.orderBy = ASCENDING;
      }
      this.sortBy = orderName;
    },
    handleFacilitySelect(facility, shouldZoom) {
      this.selectedFacility = facility;
      this.shouldZoomWhenSelected = shouldZoom;
    },
    handleFacilityHover(facility, shouldZoom) {
      this.hoveredFacility = facility;
      this.shouldZoomWhenSelected = shouldZoom;
    },
    handleFacilityOut() {
      this.hoveredFacility = null;
    },
    handleCloseDetail() {
      this.selectedFacility = null;
    },
    setFilterString(string) {
      this.filterString = string;
      this.updateFacilitiesData();
    },
    handleFilterSelected(selectedTechs) {
      this.selectedTechs = selectedTechs;
    },
    handleStatusChange(status) {
      this.status = status;
    },
    handleStatusesSelected(statuses) {
      this.selectedStatuses = statuses;
    },
    handleViewSelect(view) {
      this.$store.dispatch('facilityView', view);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";

.map-detail-container {
  position: relative;
}
.grid-container {
  @include desktop {
    padding: 0;
  }
}

.filter-bar-column {
  padding: 0;
  display: flex;
  background-color: #ece9e6;
}

.facility-view-toggle {
  position: absolute;
  right: 15px;
  top: 5px;
}

.map-wrapper {
  margin-top: 10px;

  @include tablet {
    margin-top: 0;
  }
}

.sticky-detail {
  margin-left: 10px;

  @include tablet {
    position: sticky;
    top: 87px;
  }
}
</style>
