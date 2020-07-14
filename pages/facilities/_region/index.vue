<template>
  <div>
    <facility-filters
      :selected-view="selectedView"
      :selected-techs="selectedTechs"
      :selected-statuses="selectedStatuses"
      class="facility-filters"
      @techsSelect="handleTechsSelected"
      @selectedStatuses="handleStatusesSelected"
      @facilityNameFilter="handleFacilityNameFilter"
      @viewSelect="handleViewSelect"
    />

    <div class="facility-list-map-container">
      <facility-list
        v-if="!widthBreak || (widthBreak && selectedView === 'list')"
        :filtered-facilities="filteredFacilities"
        :selected-facility="selectedFacility"
        :selected-techs="selectedTechs"
        :sort-by="sortBy"
        :order-by="orderBy"
        :hide-region-column="!isNemRegion && !isAllRegion"
        class="facility-list"
        @orderChanged="handleOrderChange"
        @facilitySelect="handleFacilitySelect"
        @facilityHover="handleFacilityHover"
        @facilityMouseout="handleFacilityOut"
      />

      <facility-map
        v-if="!widthBreak || (widthBreak && selectedView === 'map')"
        :data="filteredFacilities"
        :selected-facility="selectedFacility"
        :hovered-facility="hoveredFacility"
        :show-zoom-when-selected="shouldZoomWhenSelected"
        class="facility-map"
        @facilitySelect="handleFacilitySelect"
      />

      <transition name="slide-up-fade">
        <facility-card
          v-if="selectedFacility && widthBreak"
          :selected-techs="selectedTechs"
          :facility="selectedFacility"
          @close="handleCloseDetail"
        />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _debounce from 'lodash.debounce'
import _includes from 'lodash.includes'
import _orderBy from 'lodash.orderby'
import * as FUEL_TECHS from '~/constants/fuel-tech.js'
import { FACILITY_OPERATING } from '~/constants/facility-status.js'
import REGIONS from '~/constants/regions.js'
import Http from '~/services/Http.js'
import FacilityDataTransformService from '~/services/dataTransform/Facility.js'
import FacilityFilters from '~/components/Facility/Filters.vue'
import FacilityList from '~/components/Facility/List.vue'
import FacilityMap from '~/components/Facility/Map.vue'
import FacilityCard from '~/components/Facility/Card.vue'

const ASCENDING = 'asc'
const DESCENDING = 'desc'

export default {
  layout: 'main',

  components: {
    FacilityFilters,
    FacilityList,
    FacilityMap,
    FacilityCard
  },

  data() {
    return {
      filterString: '',
      facilityData: [],
      filteredFacilities: [],
      selectedFacility: null,
      hoveredFacility: null,
      selectedStatuses: [FACILITY_OPERATING],
      selectedTechs: [],
      selectedView: 'list',
      sortBy: 'displayName',
      orderBy: ASCENDING,
      totalFacilities: 0,
      shouldZoomWhenSelected: false,
      windowWidth: 0
    }
  },

  computed: {
    ...mapGetters(['hostEnv']),
    regionId() {
      return this.$route.params.region
    },
    isNemRegion() {
      return this.$route.params.region === 'nem'
    },
    isAllRegion() {
      return this.$route.params.region === 'all'
    },
    widthBreak() {
      return this.windowWidth < 769
    },
    facilitySortBy() {
      return this.$store.getters['facility/sortBy']
    },
    facilityOrderBy() {
      return this.$store.getters['facility/orderBy']
    },
    facilitySelectedStatuses() {
      return this.$store.getters['facility/selectedStatuses']
    },
    facilitySelectedTechs() {
      return this.$store.getters['facility/selectedTechs']
    },
    facilitySelectedView() {
      return this.$store.getters['facility/selectedView']
    }
  },

  watch: {
    facilityData() {
      this.updateFacilitiesData()
    },
    selectedTechs() {
      this.updateFacilitiesData()
    },
    selectedStatuses() {
      this.updateFacilitiesData()
    },
    sortBy() {
      this.updateFacilitiesData()
    },
    orderBy() {
      this.updateFacilitiesData()
    },
    filterString() {
      this.updateFacilitiesData()
    }
  },

  created() {
    this.$store.dispatch('currentView', 'facilities')
    this.sortBy = this.facilitySortBy
    this.orderBy = this.facilityOrderBy
    this.selectedStatuses = this.facilitySelectedStatuses
    this.selectedTechs = this.facilitySelectedTechs
    this.selectedView = this.facilitySelectedView
  },

  mounted() {
    this.windowWidth = window.innerWidth
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        _debounce(() => {
          this.windowWidth = window.innerWidth
        }, 200)
      )
    })
    this.fetchData()
  },

  methods: {
    fetchData() {
      const urls = []

      if (this.hostEnv === 'prod') {
        urls.push('/facility/facility_registry.json')
      } else {
        urls.push('/v3/geo/wem_facilities.geojson')
        urls.push('/v3/geo/nem_facilities.geojson')
      }

      if (urls.length > 0) {
        Http(urls)
          .then(responses => {
            this.handleResponses(responses)
          })
          .catch(e => {
            console.error(e)
          })
      } else {
        console.warn('fetchData', 'No urls provided')
      }
    },

    handleResponses(responses) {
      if (this.hostEnv === 'prod') {
        FacilityDataTransformService.flatten(responses[0]).then(res => {
          this.facilityData = res
        })
      } else {
        if (responses.length === 2) {
          const combined = [...responses[0].features, ...responses[1].features]
          FacilityDataTransformService.flattenV3(combined).then(res => {
            this.facilityData = res
          })
        } else {
          console.warn(
            'One or more of the facilities responses were not returned.'
          )
        }
      }
    },

    updateFacilitiesData() {
      const sortedData = _orderBy(
        this.facilityData,
        [
          d => {
            if (this.selectedTechs.length === 0) {
              return d[this.sortBy]
            }
            if (this.sortBy !== 'generatorCap') {
              return d[this.sortBy]
            }
            let totals = 0
            this.selectedTechs.forEach(ft => {
              totals += d.fuelTechRegisteredCap[ft] || 0
            })
            return totals
          }
        ],
        [this.orderBy]
      )

      const filtered =
        this.selectedTechs.length > 0
          ? sortedData.filter(g =>
              g.fuelTechs.some(r => this.selectedTechs.includes(r))
            )
          : sortedData

      const that = this
      let regionIds = [this.regionId]
      if (this.regionId === 'all') {
        regionIds = ['nsw1', 'qld1', 'sa1', 'tas1', 'vic1', 'wem']
      } else if (this.regionId === 'nem') {
        regionIds = ['nsw1', 'qld1', 'sa1', 'tas1', 'vic1']
      }
      async function updateFilter() {
        return filtered.filter(
          g =>
            g.displayName
              .toLowerCase()
              .includes(that.filterString.toLowerCase()) &&
            _includes(regionIds, g.regionId.toLowerCase()) &&
            (that.selectedStatuses.length <= 0 ||
              _includes(that.selectedStatuses, g.status))
        )
      }

      updateFilter().then(facilities => {
        that.filteredFacilities = facilities
        that.totalFacilities = facilities.length

        const exportData = facilities.map(d => {
          // eslint-disable-line
          const region = REGIONS.find(r => r.id === d.regionId)
          return {
            'Facility Name': d.displayName,
            Status: d.status,
            Region: region.label,
            Technology: d.fuelTechs.map(ft => FUEL_TECHS.FUEL_TECH_LABEL[ft]),
            'Generator Capacity (MW)': d.generatorCap,
            Latitude: d.location.latitude,
            Longitude: d.location.longitude
          }
        })
        that.$store.dispatch('facilityExportData', exportData)
      })
    },

    toggleOrder(order) {
      return order === ASCENDING ? DESCENDING : ASCENDING
    },

    setFilterString(string) {
      this.filterString = string
      this.updateFacilitiesData()
    },

    handleFacilityNameFilter(string) {
      this.filterString = string
    },
    handleOrderChange(orderName) {
      if (this.sortBy === orderName) {
        this.orderBy = this.toggleOrder(this.orderBy)
      } else {
        this.orderBy = ASCENDING
      }
      this.sortBy = orderName

      this.$store.dispatch('facility/sortBy', this.sortBy)
      this.$store.dispatch('facility/orderBy', this.orderBy)
    },
    handleFacilitySelect(facility, shouldZoom) {
      this.selectedFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
    },
    handleFacilityHover(facility, shouldZoom) {
      this.hoveredFacility = facility
      this.shouldZoomWhenSelected = shouldZoom
    },
    handleFacilityOut() {
      this.hoveredFacility = null
    },
    handleTechsSelected(techs) {
      this.selectedTechs = techs
      this.$store.dispatch('facility/selectedTechs', this.selectedTechs)
    },
    handleStatusesSelected(statuses) {
      this.selectedStatuses = statuses
      this.$store.dispatch('facility/selectedStatuses', this.selectedStatuses)
    },
    handleViewSelect(view) {
      this.selectedView = view
      this.$store.dispatch('facility/selectedView', this.selectedView)
    },
    handleCloseDetail() {
      this.selectedFacility = null
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/responsive-mixins.scss';
@import '~/assets/scss/variables.scss';

.facility-filters {
  position: sticky;
  top: 0;
  background-color: $beige-lighter;
  z-index: 99;
}

.facility-list-map-container {
  @include tablet {
    padding: 1rem;
    display: flex;
  }

  .facility-list {
    @include tablet {
      width: 50%;
      padding: 0 1rem;
      padding-left: 0;
    }
  }
  .facility-map {
    padding-top: 1rem;
    @include tablet {
      width: 50%;
      position: fixed;
      right: 0;
      top: 100px;
      padding: 0 1rem 0 0;
    }
  }
}
</style>
