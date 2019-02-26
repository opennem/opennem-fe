<template>
<div>
  <div class="columns is-gapless map-detail-container">
    
    <div class="column is-two-thirds">
      <generator-grid 
        :generatorsData="filteredGenerators"
        :selectedGenerator="selectedGenerator"
        :sortBy="sortBy"
        :orderBy="orderBy"
        :hideRegionColumn="isRegionView"
        @orderChanged="handleOrderChange"
        @generatorSelected="handleGeneratorSelect"
      />
    </div>

    <div class="column">
      <div class="sticky-detail">
        <generator-map
          :generatorsData="filteredGenerators"
          :selectedGenerator="selectedGenerator"
          :shouldZoomWhenSelected="shouldZoomWhenSelected"
          @generatorSelected="handleGeneratorSelect"
        />
        <generator-detail
          :generator="selectedGenerator"
          @closeGeneratorDetail="handleCloseDetail"
        />
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
import GeneratorGrid from '@/components/Generator/Grid';
import GeneratorMap from '@/components/Generator/Map';
import GeneratorDetail from '@/components/Generator/Detail';

const ASCENDING = 'asc';
const DESCENDING = 'desc';

export default {
  components: {
    GeneratorGrid,
    GeneratorMap,
    GeneratorDetail,
  },
  data() {
    return {
      filterString: '',
      sortBy: 'stationName',
      orderBy: ASCENDING,
      panTo: null,
      selectedGenerator: null,
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
      return this.$route.params.region ? true : false;
    },
    filteredGenerators() {
      return this.generatorsData.filter(g =>
        g.stationName.toLowerCase().includes(this.filterString.toLowerCase()) &&
        g.regionId.toLowerCase().includes(this.regionId),
      );
    },
    hasSelectedGenerator() {
      return this.selectedGenerator;
    },
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
    handleOrderChange(orderName) {
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
    handleCloseDetail() {
      this.selectedGenerator = null;
    },
    setFilterString(string) {
      this.filterString = string;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../node_modules/bulma/sass/utilities/mixins.sass";

.map-detail-container {
  @include desktop {
    position: sticky;
    top: 60px;
  }
}
.grid-container {
  @include desktop {
    padding: 0 40px;
  }
}
.sticky-detail {
  margin-left: 10px;

  @include tablet {
    position: sticky;
    top: 60px;
  }
  @include mobile {
    position: fixed;
    bottom: 20px;
    left: 10px;
    right: 10px;
    z-index: 99;
  }
}
</style>
