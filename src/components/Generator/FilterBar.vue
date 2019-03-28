<template>
  <div class="filter-bar">
    <input 
      class="input is-small is-rounded filter-station-input"
      type="text"
      placeholder="Filter By Station Name"
      v-model="filterGeneratorName"
    />

    <div class="dropdown" :class="{'is-active': techDropdownActive}" v-on-clickaway="onClickAway">
      <button
        class="dropdown-trigger button is-rounded is-small is-primary"
        :class="{ 'is-inverted': selectedTechs.length === 0 }"
        @click="techDropdownActive = true"
      >
        <div class="dropdown-label">
          <span>Technology</span>
          <strong v-if="selectedTechs.length > 0">({{selectedTechs.length}})</strong>
        </div>
        <font-awesome-icon class="fal" :icon="iconDown" />
      </button>

      <transition name="slide-down-fade">
        <div v-if="techDropdownActive" class="dropdown-menu">
          <div class="dropdown-content">
            <a class="dropdown-item" v-for="(d, i) in allTechs" :key="i" @click="handleTechClick(d.id)">
              <span class="source-colour"
                :style="{ 
                  backgroundColor: isSelected(d.id) ? d.colour : '#fff',
                  'border-color': d.colour
                }"><font-awesome-icon class="checkmark-icon fal" :icon="iconCheckmark" /></span>
              {{d.label}}
            </a>

            <div class="buttons">
              <a class="button is-rounded is-small is-inverted" @click="clearSelectedTechs">Clear</a>
              <a class="button is-rounded is-small is-primary is-outlined" @click="techDropdownActive = false">Close</a>
            </div>
          </div>
        </div>
      </transition> 
    </div>

    <button class="button is-rounded is-small is-primary is-inverted">Status</button>
  </div>  
</template>

<script>
import _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import { faAngleDown, faCheck } from '@fortawesome/fontawesome-pro-light';
import { mixin as clickaway } from 'vue-clickaway';
import EventBus from '@/lib/event-bus';
import { GraphDomains } from '@/domains/graphs';

export default {
  mixins: [clickaway],
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      filterGeneratorName: '',
      techDropdownActive: false,
      allTechs: [],
      selectedTechs: [],
    }
  },
  computed: {
    iconDown() {
      return faAngleDown;
    },
    iconCheckmark() {
      return faCheck;
    },
  },
  watch: {
    filterGeneratorName(string) {
      EventBus.$emit('generators.name.filter', string);
    },
  },
  created() {
    this.selectedTechs = this.$store.getters.generatorsSelectedTechs;
  },
  mounted() {
    EventBus.$on('generators.filter.clear', this.clearFilter);

    Object.keys(GraphDomains).forEach(d => {
      if (GraphDomains[d].type === 'sources' && d !== 'imports') {
        const source = GraphDomains[d];
        source.id = d;
        this.allTechs.push(source);
      }
    });
    this.allTechs.reverse();
  },
  beforeDestroy() {
    EventBus.$off('generators.filter.clear');
  },
  methods: {
    onClickAway() {
      this.techDropdownActive = false;
    },
    isSelected(techId) {
      return _.includes(this.selectedTechs, techId);
    },
    emitSelectedTechs() {
      this.$emit('selected', this.selectedTechs);
      this.$store.dispatch('generatorsSelectedTechs', this.selectedTechs);
    },
    handleTechClick(techId) {
      const isIncluded = _.includes(this.selectedTechs, techId);
      if (isIncluded) {
        this.selectedTechs = this.selectedTechs.filter(d => d !== techId);
      } else {
        this.selectedTechs.push(techId);
      }

      this.emitSelectedTechs();
    },
    clearSelectedTechs() {
      this.selectedTechs = [];
      this.emitSelectedTechs();
    },
    clearFilter() {
      this.filterGeneratorName = '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.dropdown-menu {
  font-family: $primary-font-family;
  margin-left: 0.75rem;
  margin-top: 0.1rem;

  .dropdown-content {
    padding: 0.3rem 0;
  }

  .dropdown-item {
    font-size: 11px;
    padding: 0.25rem 0.6rem
  }
}
.filter-bar {
  padding: 1rem 1rem 0;
  display: flex;

  .filter-station-input {
    width: 200px;
  }
  .button {
    margin-left: 0.7rem;
  }
  .dropdown-label {
    margin-right: 0.5rem;
    strong {
      font-size: 11px;
      font-weight: 400;
    }
  }
}
.source-colour {
  width: 15px;
  height: 15px;
  background-color: rgba(255,255,255,.8);
  display: inline-block;
  vertical-align: text-bottom;
  margin-right: 0.4rem;
  position: relative;
  top: 1px;
  border: 1px solid #000;
  border-radius: 1px;

  .checkmark-icon {
    position: relative;
    left: 2px;
    bottom: 1px;
    color: #fff;
  }
}
.buttons {
  border-top: 1px solid #eee;
  padding: 0.4rem 0.5rem 0.1rem;
  margin-top: 0.3rem;
  display: flex;
  justify-content: space-between;
  text-align: right;

  .button {
    font-size: 10px;
    margin-left: 0;
  }
}
</style>
