<template>
<div>
  <generator-map
    :generatorsData="filteredGenerators"
    :panTo="panTo"
  />
  <input class="input" type="text" placeholder="Filter" v-model="filterString">
  <generator-grid 
    :generatorsData="filteredGenerators"
    :sortBy="sortBy"
    :orderBy="orderBy"
    @orderBy="handleOrderChange"
  />
</div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import { getRegionLocationById } from '@/domains/regions';
import GeneratorGrid from '@/components/Generator/Grid';
import GeneratorMap from '@/components/Generator/Map';

const ASCENDING = 'asc';
const DESCENDING = 'desc';

export default {
  components: {
    GeneratorGrid,
    GeneratorMap,
  },
  data() {
    return {
      filterString: '',
      sortBy: 'stationName',
      orderBy: ASCENDING,
      panTo: null,
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
  },
};
</script>
