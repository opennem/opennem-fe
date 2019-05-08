<template>
<div>
  <div class="columns is-multiline is-gapless map-detail-container">    
    <div class="column is-half">
      <div class="filter-bar-column">
        <filter-bar
          :sortBy="sortBy"
          :orderBy="orderBy"
          :status="status"
          :selectedStatuses="selectedStatuses"
          @orderChanged="handleOrderChange"
          @sortChanged="handleSortChange"
          @statusChanged="handleStatusChange"
          @selected="handleFilterSelected"
          @selectedStatuses="handleStatusesSelected"
        />
      </div>
      
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

      <div class="totals">
        <span>Facilities: <strong>{{totalFacilities}}</strong></span>
        <span>Capacity: <strong>{{ totalCap | formatNumber }}</strong> </span>
      </div>
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
      shouldZoomWhenSelected: true,
    };
  },
  computed: {
    ...mapGetters({
      facilityData: 'facilityData',
      facilitySelectedTechs: 'facilitySelectedTechs',
    }),
    facilityData() {
      const data = this.$store.getters.facilityData;
      const sortBy = this.sortBy;
      return _.orderBy(data, [sortBy], [this.orderBy]);
    },
    regionId() {
      return this.$route.params.region || '';
    },
    isRegionView() {
      return this.$route.params.region !== undefined;
    },
    filteredFacilities() {
      const filtered = this.selectedTechs.length > 0
        ? this.facilityData.filter(g => g.fuelTechs.some(r => this.selectedTechs.includes(r)))
        : this.facilityData;

      return filtered.filter(g =>
        g.displayName.toLowerCase().includes(this.filterString.toLowerCase()) &&
        g.regionId.toLowerCase().includes(this.regionId) &&
        (this.selectedStatuses.length <= 0 || _.includes(this.selectedStatuses, g.status)),
      );
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
    totalFacilities() {
      return this.filteredFacilities.length;
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
    top: 50px;
  }
  @include mobile {
    display: none;
  }
}
.totals {
  position: sticky;
  margin-bottom: -3px;
  bottom: 0;
  right: 0;
  z-index: 89;
  background-color: #C74523;
  color: #fff;
  padding: 3px 6px;
  border-radius: 3px 3px 0 0;
  font-size: 10px;
  box-shadow: 0 -2px 5px rgba(100, 100, 100, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  strong {
    color: #fff;
    font-size: 13px;
  }

  @include desktop {
    margin-bottom: -3px;
    bottom: 29px;
  }
}
</style>
