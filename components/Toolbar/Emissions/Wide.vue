<template>
  <div 
    class="toolbar">

    <div 
      v-if="ready" 
      class="header-dropdowns">
      <ViewDropdown />
      <EmissionsRegionDropdown />

    </div>

    <div 
      v-if="ready"
      class="data-options-bar"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ViewDropdown from '~/components/ui/ViewDropdown'
import EmissionsRegionDropdown from '~/components/Emissions/EmissionsRegionDropdown'

export default {
  components: {
    ViewDropdown,
    EmissionsRegionDropdown
  },

  data() {
    return {
      ready: false,
    }
  },

  computed: {
    ...mapGetters({
      tabletBreak: 'app/tabletBreak'
    }),
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

  
}
</style>
