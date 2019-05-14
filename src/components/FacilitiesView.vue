<template>
<div>
  <div class="filter-bar-column">
    <filter-bar
      :selectedStatuses="selectedStatuses"
      @selected="handleFilterSelected"
      @selectedStatuses="handleStatusesSelected"
      @viewSelect="handleViewSelect"
    />
  </div>

  <div class="columns is-multiline is-gapless map-detail-container"> 
    <div class="column">
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

    <div class="column">
      <div class="sticky-detail">
        <facility-map
          :facilitiesData="filteredFacilities"
          :selectedFacility="selectedFacility"
          :hoveredFacility="hoveredFacility"
          :shouldZoomWhenSelected="shouldZoomWhenSelected"
          @facilitySelect="handleFacilitySelect"
        />
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
import FacilityList from '@/components/Facility/List';
import FacilityMap from '@/components/Facility/Map';
import FacilityDetail from '@/components/Facility/Detail';
import FilterBar from '@/components/Facility/FilterBar';

const ASCENDING = 'asc';
const DESCENDING = 'desc';

export default {
  components: {
    FacilityList,
    FacilityMap,
    FacilityDetail,
    FilterBar,
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
      selectedView: 'list', // list, map
      shouldZoomWhenSelected: true,
      filteredFacilities: [],
      totalFacilities: 0,
    };
  },
  computed: {
    ...mapGetters({
      facilityData: 'facilityData',
      facilitySelectedTechs: 'facilitySelectedTechs',
    }),
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
  },

  created() {
    this.selectedTechs = this.$store.getters.facilitySelectedTechs;
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

      updateFilter().then(d => {
        that.filteredFacilities = d;
        that.totalFacilities = d.length;
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
      this.selectedView = view;
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
    padding: 0 0;
  }
}

.filter-bar-column {
  padding: 0;
  position: sticky;
  display: flex;
  top: 38px;
  z-index: 90;
  background-color: #ece9e6;

  @include tablet {
    top: 44px;
  }
}

.sticky-detail {
  margin-left: 10px;

  @include tablet {
    position: sticky;
    top: 123px;
  }
  @include mobile {
    display: none;
  }
}
</style>
