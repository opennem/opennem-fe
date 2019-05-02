<template>
<div>
  <!-- <div class="filter-bar-column column is-full">
    <filter-bar
      :sortBy="sortBy"
      :orderBy="orderBy"
      :status="status"
      @orderChanged="handleOrderChange"
      @sortChanged="handleSortChange"
      @statusChanged="handleStatusChange"
      @selected="handleFilterSelected"
    />
  </div> -->
  <div class="columns is-multiline is-gapless map-detail-container">    
    <div class="column is-half">
      <div class="filter-bar-column">
        <filter-bar
          :sortBy="sortBy"
          :orderBy="orderBy"
          :status="status"
          @orderChanged="handleOrderChange"
          @sortChanged="handleSortChange"
          @statusChanged="handleStatusChange"
          @selected="handleFilterSelected"
        />
      </div>
      
      <generator-list 
        :generatorsData="filteredGenerators"
        :selectedGenerator="selectedGenerator"
        :hoveredGenerator="hoveredGenerator"
        :sortBy="sortBy"
        :orderBy="orderBy"
        :hideRegionColumn="isRegionView"
        @orderChanged="handleOrderChange"
        @generatorSelected="handleGeneratorSelect"
        @generatorHover="handleGeneratorHover"
        @generatorMouseout="handleGeneratorOut"
        style="margin-top: 0.5rem;"
      />

      <div class="totals">
        <span>Stations: <strong>{{totalGenerators}}</strong></span>
        <span>Capacity: <strong>{{ totalCap | formatNumber }}</strong> </span>
      </div>
    </div>

    <div class="column">
      <div class="sticky-detail">
        <generator-map
          :generatorsData="filteredGenerators"
          :selectedGenerator="selectedGenerator"
          :hoveredGenerator="hoveredGenerator"
          :shouldZoomWhenSelected="shouldZoomWhenSelected"
          @generatorSelected="handleGeneratorSelect"
        />
        <!-- <generator-detail
          :generator="selectedGenerator"
          @closeGeneratorDetail="handleCloseDetail"
        /> -->
      </div>
    </div>

  </div>
  
  <!-- <div class="grid-container">
    <generator-grid 
      :generatorsData="filteredGenerators"
      :selectedGenerator="selectedGenerator"
      :sortBy="sortBy"
      :orderBy="orderBy"
      @orderChanged="handleOrderChange"
      @generatorSelected="handleGeneratorSelect"
    />
  </div> -->
</div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import EventBus from '@/lib/event-bus';
import GeneratorList from '@/components/Generator/List';
import GeneratorMap from '@/components/Generator/Map';
import GeneratorDetail from '@/components/Generator/Detail';
import FilterBar from '@/components/Generator/FilterBar';

const ASCENDING = 'asc';
const DESCENDING = 'desc';

export default {
  components: {
    GeneratorList,
    GeneratorMap,
    GeneratorDetail,
    FilterBar,
  },
  data() {
    return {
      filterString: '',
      sortBy: 'stationName',
      orderBy: ASCENDING,
      status: 'Commissioned',
      panTo: null,
      selectedTechs: [],
      selectedGenerator: null,
      hoveredGenerator: null,
      shouldZoomWhenSelected: true,
    };
  },
  computed: {
    ...mapGetters({
      generatorsData: 'generatorsData',
    }),
    generatorsData() {
      const data = this.$store.getters.generatorsData;
      const sortBy = this.sortBy;
      return _.orderBy(data, [sortBy], [this.orderBy]);
    },
    regionId() {
      return this.$route.params.region || '';
    },
    isRegionView() {
      return this.$route.params.region !== undefined;
    },
    filteredGenerators() {
      const filtered = this.selectedTechs.length > 0
        ? this.generatorsData.filter(g => g.fuelTechs.some(r => this.selectedTechs.includes(r)))
        : this.generatorsData;
      
      console.log(this.status)
      return filtered.filter(g =>
        g.displayName.toLowerCase().includes(this.filterString.toLowerCase()) &&
        g.regionId.toLowerCase().includes(this.regionId) &&
        (this.status === 'any' || g.status === this.status),
      );
    },
    hasSelectedGenerator() {
      return this.selectedGenerator;
    },
    totalCap() {
      let total = 0;
      this.filteredGenerators.forEach((d) => {
        total += d.generatorCap;
      });
      return total;
    },
    totalGenerators() {
      return this.filteredGenerators.length;
    },
  },
  created() {
    this.selectedTechs = this.$store.getters.generatorsSelectedTechs;
  },

  mounted() {
    EventBus.$on('generators.name.filter', this.setFilterString);
    this.$store.dispatch('fetchGeneratorsData');
  },

  beforeDestroy() {
    EventBus.$off('generators.name.filter');
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
    handleGeneratorSelect(generator, shouldZoom) {
      this.selectedGenerator = generator;
      this.shouldZoomWhenSelected = shouldZoom;
    },
    handleGeneratorHover(generator, shouldZoom) {
      this.hoveredGenerator = generator;
      this.shouldZoomWhenSelected = shouldZoom;
    },
    handleGeneratorOut() {
      this.hoveredGenerator = null;
    },
    handleCloseDetail() {
      this.selectedGenerator = null;
    },
    setFilterString(string) {
      this.filterString = string;
    },
    handleFilterSelected(selectedTechs) {
      this.selectedTechs = selectedTechs;
    },
    handleStatusChange(status) {
      console.log(status)
      this.status = status;
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
  top: 44px;
  z-index: 90;
  background-color: #ece9e6;
}

.sticky-detail {
  margin-left: 10px;

  @include tablet {
    position: sticky;
    top: 50px;
  }
  @include mobile {
    display: none;
    // position: fixed;
    // bottom: 20px;
    // left: 10px;
    // right: 10px;
    // z-index: 99;
  }
}
.totals {
  position: sticky;
  margin-bottom: -3px;
  bottom: 29px;
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
}
</style>
