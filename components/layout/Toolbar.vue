<template>
  <div>
    <div v-if="isEnergyView">
      <ToolbarEnergyNarrow v-show="toolbarBreak" />
      <ToolbarEnergyWide v-show="!toolbarBreak" />
    </div>

    <div v-if="isFacilitiesView">
      <ToolbarFacilitiesWide />
    </div>
    
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ToolbarEnergyWide from '@/components/Toolbar/Energy/Wide'
import ToolbarEnergyNarrow from '@/components/Toolbar/Energy/Narrow'
import ToolbarFacilitiesWide from '@/components/Toolbar/Facilities/Wide'

export default {
  components: {
    ToolbarEnergyWide,
    ToolbarEnergyNarrow,
    ToolbarFacilitiesWide
  },

  computed: {
    ...mapGetters({
      isEnergyView: 'isEnergyView',
      isFacilitiesView: 'isFacilitiesView',
      toolbarBreak: 'app/toolbarBreak'
    })
  }
}
</script>