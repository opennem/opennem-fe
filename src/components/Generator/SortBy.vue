<template>
  <div class="dropdown" :class="{'is-active': dropdownActive}" v-on-clickaway="onClickAway">
    <button
      class="dropdown-trigger button is-rounded is-small is-primary"
      :class="{ 'is-inverted': true }"
      @click="dropdownActive = true"
    >
      <div class="dropdown-label">
        <span>Sort by:</span>
        <strong>{{ selectedSortLabel }}</strong>
      </div>
      <font-awesome-icon class="fal" :icon="iconDown" />
    </button>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a
            v-for="(s, index) in sorts"
            :key="index"
            :class="{ selected: sortBy === s.id }"
            class="dropdown-item"
            @click="handleClick(s.id)"
          >
            {{s.label}}
          </a>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown } from '@fortawesome/fontawesome-pro-light';

const sorts = [
  {
    id: 'stationName',
    label: 'Name',
  },
  {
    id: 'regionId',
    label: 'Region',
  },
  {
    id: 'fuelTechs',
    label: 'Technology',
  },
  {
    id: 'generatorCap',
    label: 'Capacity',
  },
];

export default {
  mixins: [clickaway],

  components: {
    FontAwesomeIcon,
  },

  props: {
    sortBy: String,
  },

  data() {
    return {
      sorts,
      sort: '',
      dropdownActive: false,
    }
  },

  computed: {
    iconDown() {
      return faAngleDown;
    },
    selectedSortLabel() {
      return this.sorts.find(s => s.id === this.sortBy).label;
    },
  },

  watch: {
    sortBy(newValue) {
      this.sort = newValue;
    },
  },

  mounted() {
    this.sort = this.sortBy;
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    handleClick(sort) {
      this.dropdownActive = false;
      this.$emit('sortChanged', sort);
    },
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.dropdown-label {
  margin-right: 0.5rem;
}
.dropdown-content {
  font-family: $primary-font-family;

  .dropdown-item {
    font-size: 12px;
  }
}
</style>

