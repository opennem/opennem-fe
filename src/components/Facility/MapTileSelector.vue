<template>
  <div class="dropdown" :class="{'is-active': dropdownActive}" v-on-clickaway="onClickAway">
    <button
      class="dropdown-trigger button is-rounded is-small is-primary is-inverted"
      @click="dropdownActive = !dropdownActive"
    >
      <div class="dropdown-label">
        {{ selectedLabel }}
      </div>
      <font-awesome-icon class="fal" :icon="iconDown" />
    </button>

    <transition name="slide-down-fade">
      <div v-if="dropdownActive" class="dropdown-menu">
        <div class="dropdown-content">
          <a
            v-for="(d, index) in tiles"
            :key="index"
            class="dropdown-item"
            :class="{ 'is-active': selectedTile === d.id }"
            @click="handleClick(d.id)"
          >
            {{d.label}}
          </a>
        </div>
      </div>
    </transition> 
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown, faCheck } from '@fortawesome/fontawesome-pro-light';

const tiles = [
  {
    id: 'toner-lite',
    label: 'Standard',
  },
  {
    id: 'terrain',
    label: 'Terrain',
  },
];

export default {
  mixins: [clickaway],

  components: {
    FontAwesomeIcon,
  },

  props: {
    tile: String,
  },

  data() {
    return {
      tiles,
      selectedTile: '',
      dropdownActive: false,
    };
  },

  computed: {
    iconDown() {
      return faAngleDown;
    },
    iconCheckmark() {
      return faCheck;
    },
    selectedLabel() {
      return this.tiles.find(t => t.id === this.tile).label;
    },
  },

  watch: {
    tile(newValue) {
      this.selectedTile = newValue;
    },
  },

  mounted() {
    this.selectedTile = this.tile;
  },

  methods: {
    onClickAway() {
      this.dropdownActive = false;
    },
    handleClick(tile) {
      this.selectedTile = tile;
      this.$emit('tileSelect', tile);
      this.dropdownActive = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.button {
  border: 1px solid $opennem-primary;
  &:hover {
    border: 1px solid $opennem-primary;
  }
  &.is-small {
    font-size: 0.85rem;
  }
}
.dropdown-menu {
  min-width: 100px;
}
.dropdown-label {
  margin-right: 0.5rem;
  strong {
    font-size: 11px;
    font-weight: 400;
  }
}
.dropdown-content {
  font-family: $primary-font-family;

  .dropdown-item {
    font-size: 12px;
    padding-right: 1rem;
  }
}
</style>

