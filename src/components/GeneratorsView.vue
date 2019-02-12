<template>
<div>
  <!-- <input 
    class="input is-rounded filter-station-input"
    type="text"
    placeholder="Filter By Station Name"
    v-model="filterString"
  /> -->

  <div class="columns is-gapless">
    <div class="column"
      :class="{
        'is-three-quarters': hasSelectedGenerator,
        'is-full': !hasSelectedGenerator,
      }">
      <generator-map
        :generatorsData="filteredGenerators"
        :selectedGenerator="selectedGenerator"
        :shouldZoomWhenSelected="shouldZoomWhenSelected"
        @generatorSelected="handleGeneratorSelect"
      />
    </div>
    <div class="column" v-if="hasSelectedGenerator">
      <generator-detail
        :generator="selectedGenerator"
        @closeGeneratorDetail="handleCloseDetail"
      />
    </div>
  </div>
  
  <generator-grid 
    :generatorsData="filteredGenerators"
    :sortBy="sortBy"
    :orderBy="orderBy"
    @orderChanged="handleOrderChange"
    @generatorSelected="handleGeneratorSelect"
  />
</div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { getRegionLocationById } from '@/domains/regions';
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
    this.$store.dispatch('fetchGeneratorsData');
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
  },
};
</script>

<style lang="scss" scoped>
.filter-station-input {
  width: 20vw;
  position: sticky;
  right: 10px;
  z-index: 99;
}
</style>
