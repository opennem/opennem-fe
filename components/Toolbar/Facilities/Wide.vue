<template>
  <div 
    class="toolbar"
  >

    <!-- <div 
      v-if="ready" 
      class="header-dropdowns">
      <view-dropdown 
        v-if="!tabletBreak" />
      <region-dropdown 
        v-show="!tabletBreak" />
    </div> -->

    <div 
      v-if="ready" 
      class="header-dropdowns">
      <ViewDropdown />
      <RegionDropdown />
    </div>

    <div 
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

      
    </div>

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
import FacilityFilters from '~/components/Facility/Filters.vue'

export default {
  components: {
    ViewDropdown,
    RegionDropdown,
    FacilityFilters
  },

  data() {
    return {
      ready: false,
      viewDropDownActive: false,
      techDropDownActive: false
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
    padding: $toolbar-padding;
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
</style>
