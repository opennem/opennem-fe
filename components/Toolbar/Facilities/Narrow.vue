<template>
  <div 
    class="toolbar">

    <div 
      v-if="ready" 
      class="header-dropdowns">
      <ViewDropdown />
      <RegionDropdown />
    </div>

    <div class="options">
      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button"
            @click="() => showFilters = true">
            <i class="fal fa-fw fa-sliders-h" />
          </button>
        </div>
      </div>
    </div>

    <div 
      v-if="showFilters" 
      class="options-panel">
      <div class="options-header">
        <span>Filters</span>

        <!-- <button>Clear</button> -->
      </div>

      <div class="options-wrapper">
        <!-- <label>
          <span>Region:</span>
          <RegionDropdown :full-width="true" />
        </label> -->

        <!-- <EnergyDataOptions :mobile="true" /> -->
        <FacilityFilters
          :selected-techs="selectedTechs"
          :selected-statuses="selectedStatuses"
          :selected-sizes="selectedSizes"
          :mobile="true"
          @techsSelect="(d) => selectedTechs = d"
          @selectedStatuses="(d) => selectedStatuses = d"
          @selectedSizes="(d) => selectedSizes = d"
          @facilityNameFilter="(d) => filterString = d"
          @dropdownActive="(val) => techDropDownActive = val"
        />

        <!-- <ConsumptionGenerationToggle :mobile="true" /> -->
      </div>

      <div class="options-footer">
        <button 
          class="button cta" 
          @click="() => showFilters = false">Close</button>
      </div>
    </div>

    <!-- <div 
      v-if="ready"
      class="data-options-bar">

      <div>
        <FacilityFilters
          :selected-techs="selectedTechs"
          :selected-statuses="selectedStatuses"
          :selected-sizes="selectedSizes"
          @techsSelect="(d) => selectedTechs = d"
          @selectedStatuses="(d) => selectedStatuses = d"
          @selectedSizes="(d) => selectedSizes = d"
          @facilityNameFilter="(d) => filterString = d"
          @dropdownActive="(val) => techDropDownActive = val"
        />
      </div>

      
    </div> -->

    <!-- <div 
      class="export-bar" 
      v-if="ready">
      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small">
            <i class="fal fa-fw fa-download" />
          </button>
        </div>
      </div>

      <div class="button-group has-addons">
        <div class="buttons">
          <button 
            class="button is-small">
            <i class="fal fa-fw fa-share-alt" />
          </button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ViewDropdown from '~/components/ui/ViewDropdown'
import RegionDropdown from '~/components/ui/RegionDropdown'
import FacilityFilters from '~/components/Facility/FiltersPanel.vue'

export default {
  components: {
    ViewDropdown,
    RegionDropdown,
    FacilityFilters
  },

  data() {
    return {
      ready: false,
      showFilters: false
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak'
    }),

    filterString: {
      get() {
        return this.$store.getters['facility/filterString']
      },
      set(val) {
        this.$store.commit('facility/filterString', val)
      }
    },

    selectedSizes: {
      get() {
        return this.$store.getters['facility/selectedSizes']
      },
      set(val) {
        this.$store.commit('facility/selectedSizes', val)
      }
    },

    selectedStatuses: {
      get() {
        return this.$store.getters['facility/selectedStatuses']
      },
      set(val) {
        this.$store.commit('facility/selectedStatuses', val)
      }
    },

    selectedTechs: {
      get() {
        return this.$store.getters['facility/selectedTechs']
      },
      set(val) {
        this.$store.commit('facility/selectedTechs', val)
      }
    }
  },

  mounted() {
    this.ready = true
  },

  methods: {
   
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables.scss';
@import '~/assets/scss/responsive-mixins.scss';

.toolbar {
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 998;
  border-bottom: 1px solid $border-colour;
  height: 56px;
  background-color: #fff;
  

  .header-dropdowns {
    display: flex;
    align-items: center;
    padding: 10px;

    .dropdown {
      font-size: 1rem;
    }
  }

  .options {
    padding: 10px;
    display: flex;
    gap: 10px;
  }

  .data-options-bar {
    width: 100%;
    height: 100%;
    border-left: 1px solid $border-colour;
    border-right: 1px solid $border-colour;
    padding: $toolbar-padding / 2 $toolbar-padding;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .export-bar {
    padding: $toolbar-padding / 2 $toolbar-padding;
    display: flex;
    gap: 4px;

    .buttons {
      background-color: transparent;
      border-radius: 0;
    }

    button {
      background-color: #000;
      color: #fff;
    }
  }
  
}

.options-panel {
  $padding: 18px;

  position: fixed;
  top: 70px;
  bottom: 20px;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  z-index: 9999;

  label {
    span {
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 500;
      display: block;
      color: #353535;
      margin-bottom: 4px;
    }
  }

  .options-header {
    padding: $padding;
    font-weight: bold;
    font-size: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    button {
      border: 0;
      text-decoration: underline;
      background: transparent;
      cursor: pointer;
      color: #353535;
      font-weight: bold;
      font-size: 16px;
    }
  }

  .options-wrapper {
    padding: $padding;
    border-bottom: 1px solid #e0e0e0;
    border-top: 1px solid #e0e0e0;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .options-footer {
    padding: $padding;
    display: flex;
    justify-content: space-evenly;
    gap: 8px;
    
    button {
      width: 100%;
      padding: 8px;
      border: 1px solid #353535;
      color: #000;
      font-weight: bold;

      &.cta {
        background-color: #353535;
        color: #fff;
      }
    }
  }
}
</style>
